import React, { useState, useEffect } from 'react';
import { X, Plus, ChevronUp, ChevronDown, ArrowRight, ArrowLeft, Trash2, Copy, Check, Blocks } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

interface CalloutBlock {
  id: string;
  type: string;
  title: string;
  foldable: string;
  content: string;
  level: number;
}

const CALLOUT_TYPES = [
  { value: 'example', label: 'Example (例题/示例)', color: 'purple' },
  { value: 'success', label: 'Success (正确/解析)', color: 'green' },
  { value: 'tip', label: 'Tip (技巧/结论)', color: 'teal' },
  { value: 'note', label: 'Note (普通笔记)', color: 'blue' },
  { value: 'info', label: 'Info (信息提示)', color: 'blue' },
  { value: 'warning', label: 'Warning (注意警告)', color: 'orange' },
  { value: 'danger', label: 'Danger (错误/危险)', color: 'red' },
  { value: 'question', label: 'Question (疑问)', color: 'yellow' },
  { value: 'quote', label: 'Quote (引用)', color: 'gray' },
  { value: 'todo', label: 'Todo (待办)', color: 'blue' },
];

interface BlockNode {
  block: CalloutBlock;
  children: BlockNode[];
}

function buildHtmlTree(blocks: CalloutBlock[]): BlockNode[] {
   const roots: BlockNode[] = [];
   const stack: { node: BlockNode; level: number }[] = [];

   for (const block of blocks) {
      const node = { block, children: [] };
      while (stack.length > 0 && stack[stack.length - 1].level >= block.level) {
         stack.pop();
      }
      if (stack.length > 0) {
         stack[stack.length - 1].node.children.push(node);
      } else {
         roots.push(node);
      }
      stack.push({ node, level: block.level });
   }
   return roots;
}

function CalloutPreviewBlock({ node }: { node: BlockNode }) {
   const { block, children } = node;
   
   const btype = block.type.toLowerCase();
   let colorClasses = 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300';
   if (btype === 'example') colorClasses = 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-900/10 text-purple-800 dark:text-purple-300';
   else if (btype === 'success' || btype === 'check') colorClasses = 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10 text-green-800 dark:text-green-300';
   else if (btype === 'tip' || btype === 'hint') colorClasses = 'border-l-teal-500 bg-teal-50/50 dark:bg-teal-900/10 text-teal-800 dark:text-teal-300';
   else if (btype === 'warning' || btype === 'caution') colorClasses = 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10 text-orange-800 dark:text-orange-300';
   else if (btype === 'danger' || btype === 'error' || btype === 'bug') colorClasses = 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10 text-red-800 dark:text-red-300';
   else if (btype === 'question' || btype === 'faq') colorClasses = 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-300';
   else if (btype === 'quote' || btype === 'cite') colorClasses = 'border-l-gray-500 bg-gray-50/50 dark:bg-gray-900/10 text-gray-800 dark:text-gray-300';
   
   const [isOpen, setIsOpen] = useState(block.foldable !== '-');

   useEffect(() => {
     setIsOpen(block.foldable !== '-');
   }, [block.foldable]);

   const titleText = block.title || block.type.charAt(0).toUpperCase() + block.type.slice(1);
   const isFoldable = block.foldable === '+' || block.foldable === '-';

   return (
      <div className={`my-3 border-l-4 rounded-r-lg border border-slate-200 dark:border-zinc-800 shadow-sm ${colorClasses} p-4 opacity-90 transition-all`}>
         <div 
           className={`flex items-center gap-2 font-semibold ${isFoldable ? 'cursor-pointer hover:opacity-80' : ''}`}
           onClick={() => isFoldable && setIsOpen(!isOpen)}
         >
            {isFoldable && (
               <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
            )}
            <span>{titleText}</span>
         </div>
         {isOpen && (
            <div className="mt-2 text-sm text-slate-700 dark:text-zinc-300 space-y-3">
               {block.content && (
                  <div className="markdown-body text-[13px] leading-relaxed">
                     <ReactMarkdown remarkPlugins={[remarkMath, remarkBreaks, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                       {block.content}
                     </ReactMarkdown>
                  </div>
               )}
               {children.length > 0 && (
                  <div className="mt-2 space-y-2">
                     {children.map(child => <CalloutPreviewBlock key={child.block.id} node={child} />)}
                  </div>
               )}
            </div>
         )}
      </div>
   );
}

export function CalloutBuilderModal({ isOpen, onClose, initialContent = '' }: { isOpen: boolean; onClose: () => void; initialContent?: string; }) {
  const [blocks, setBlocks] = useState<CalloutBlock[]>([]);
  const [copied, setCopied] = useState(false);
  const [generatedMd, setGeneratedMd] = useState('');
  const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview');

  const [qnum, setQnum] = useState(() => localStorage.getItem('latexify_callout_qnum') || '');
  const [topic, setTopic] = useState(() => localStorage.getItem('latexify_callout_topic') || '');
  const [source, setSource] = useState(() => localStorage.getItem('latexify_callout_source') || '');

  const [topicHistory, setTopicHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('latexify_callout_topic_his') || '[]'); } catch { return []; }
  });
  const [sourceHistory, setSourceHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('latexify_callout_source_his') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('latexify_callout_qnum', qnum);
    localStorage.setItem('latexify_callout_topic', topic);
    localStorage.setItem('latexify_callout_source', source);
  }, [qnum, topic, source]);

  // Sync computed title into the first block
  useEffect(() => {
    if (blocks.length > 0) {
      const parts = [qnum, topic, source].filter(Boolean);
      const computedTitle = parts.join(' | ');
      if (blocks[0].title !== computedTitle) {
        setBlocks(prev => {
          if (!prev[0] || prev[0].title === computedTitle) return prev;
          const newBlocks = [...prev];
          newBlocks[0].title = computedTitle;
          return newBlocks;
        });
      }
    }
  }, [qnum, topic, source, blocks]);

  // Initialize form
  useEffect(() => {
    if (isOpen) {
      if (blocks.length === 0) {
        setBlocks([
          {
            id: Math.random().toString(36).substring(7),
            type: "example",
            title: [qnum, topic, source].filter(Boolean).join(' | ') || "题目",
            foldable: "+",
            content: initialContent || "",
            level: 0
          },
          {
            id: Math.random().toString(36).substring(7),
            type: "success",
            title: "解析",
            foldable: "-",
            content: "",
            level: 1
          }
        ]);
      } else if (initialContent && blocks.length > 0 && !blocks[0].content) {
        // Update first block content if empty and new initialContent provided
        const newBlocks = [...blocks];
        newBlocks[0].content = initialContent;
        setBlocks(newBlocks);
      }
    }
  }, [isOpen, initialContent]);

  useEffect(() => {
    // Generate markdown on every block change
    let lines: string[] = [];
    
    // 自动在外部添加一个标签，使用方向
    if (blocks.length > 0) {
      const tagContent = topic ? topic.replace(/\s+/g, '_') : (blocks[0].title ? blocks[0].title.replace(/\s+/g, '_') : '');
      if (tagContent) {
        lines.push(`#${tagContent}`);
        lines.push(''); // 空行分隔
      }
    }
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const pfxArray = Array(block.level + 1).fill('>');
      const pfx = pfxArray.join(' ') + ' ';
      
      if (i > 0) {
         const prevLevel = blocks[i-1].level;
         const emptyPrefixLevel = Math.min(block.level, prevLevel);
         // if nesting directly under parent, parent empty line prefix is level
         const parentPfxArray = Array(emptyPrefixLevel + 1).fill('>');
         let emptyPfx = parentPfxArray.join(' ');
         lines.push(emptyPfx);
      }

      const titleSuffix = block.title ? ` ${block.title}` : '';
      lines.push(`${pfx}[!${block.type}]${block.foldable}${titleSuffix}`);
      
      if (block.content) {
        lines.push(pfx.trimEnd());
        const contentLines = block.content.split('\n');
        for (const line of contentLines) {
          lines.push(`${pfx}${line}`.trimEnd());
        }
      }
    }
    
    setGeneratedMd(lines.join('\n'));
  }, [blocks]);

  const addBlock = (index = blocks.length - 1) => {
    const parentLevel = index >= 0 ? blocks[index].level : 0;
    const newBlock: CalloutBlock = {
      id: Math.random().toString(36).substring(7),
      type: "note",
      title: "新模块",
      foldable: "",
      content: "",
      level: parentLevel
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const updateBlock = (id: string, updates: Partial<CalloutBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const adjustLevel = (index: number, direction: 'in' | 'out') => {
    const block = blocks[index];
    if (direction === 'out' && block.level > 0) {
      updateBlock(block.id, { level: block.level - 1 });
    } else if (direction === 'in' && block.level < 4) { // max deep 4
      updateBlock(block.id, { level: block.level + 1 });
    }
  };

  const handleCopy = async () => {
    if (topic && !topicHistory.includes(topic)) {
      const newHis = [topic, ...topicHistory].slice(0, 10);
      setTopicHistory(newHis);
      localStorage.setItem('latexify_callout_topic_his', JSON.stringify(newHis));
    }
    if (source && !sourceHistory.includes(source)) {
      const newHis = [source, ...sourceHistory].slice(0, 10);
      setSourceHistory(newHis);
      localStorage.setItem('latexify_callout_source_his', JSON.stringify(newHis));
    }
    
    await navigator.clipboard.writeText(generatedMd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-6xl h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-slate-200 dark:border-zinc-800">
        <datalist id="topic-history">
          {topicHistory.map((t, i) => <option key={i} value={t} />)}
        </datalist>
        <datalist id="source-history">
          {sourceHistory.map((s, i) => <option key={i} value={s} />)}
        </datalist>
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
              <Blocks className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Obsidian Callout 构建器</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left panel - Block Builder */}
          <div className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/50 block shrink-0">
               <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400">积木块配置</h3>
               <button 
                 onClick={() => addBlock()}
                 className="text-xs flex items-center gap-1 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
               >
                 <Plus className="w-3.5 h-3.5" /> 添加一层
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {blocks.map((block, index) => (
                <div 
                  key={block.id} 
                  className={`relative flex flex-col bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/50 rounded-xl overflow-hidden transition-all`}
                  style={{ marginLeft: `${block.level * 1.5}rem` }}
                >
                  <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700/50 shrink-0">
                    <div className="flex-1 flex flex-wrap gap-2">
                      <select 
                        value={block.type}
                        onChange={(e) => updateBlock(block.id, { type: e.target.value })}
                        className="flex-1 min-w-[110px] text-xs py-1 pl-2 pr-6 truncate rounded bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_8px] bg-[position:right_8px_center] bg-no-repeat"
                      >
                        {CALLOUT_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      
                      <select 
                        value={block.foldable}
                        onChange={(e) => updateBlock(block.id, { foldable: e.target.value })}
                        className="flex-[1.2] min-w-[130px] text-xs py-1 pl-2 pr-6 truncate rounded bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_8px] bg-[position:right_8px_center] bg-no-repeat"
                      >
                        <option value="">不可折叠 (默认展开)</option>
                        <option value="-">默认折叠 (-)</option>
                        <option value="+">默认展开 (+)</option>
                      </select>

                      {index === 0 ? (
                        <>
                           <input 
                              type="text" 
                              placeholder="题号"
                              value={qnum}
                              onChange={(e) => setQnum(e.target.value)}
                              className="flex-[0.5] min-w-[50px] text-xs py-1 px-2 rounded bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500"
                           />
                           <input 
                              type="text" 
                              placeholder="方向"
                              list="topic-history"
                              value={topic}
                              onChange={(e) => setTopic(e.target.value)}
                              className="flex-1 min-w-[70px] text-xs py-1 px-2 rounded bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500"
                           />
                           <input 
                              type="text" 
                              placeholder="来源"
                              list="source-history"
                              value={source}
                              onChange={(e) => setSource(e.target.value)}
                              className="flex-[0.8] min-w-[60px] text-xs py-1 px-2 rounded bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500"
                           />
                        </>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="自定义标题 (可选)"
                          value={block.title}
                          onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                          className="flex-1 min-w-[90px] text-xs py-1 px-2 rounded bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500"
                        />
                      )}
                    </div>
                    
                    <div className="flex items-center self-start gap-1 p-1 bg-white dark:bg-zinc-950 rounded-md border border-slate-200 dark:border-zinc-700">
                      <button onClick={() => adjustLevel(index, 'out')} disabled={block.level === 0} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded disabled:opacity-30"><ArrowLeft className="w-3.5 h-3.5" /></button>
                      <button onClick={() => adjustLevel(index, 'in')} disabled={block.level >= 4} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded disabled:opacity-30"><ArrowRight className="w-3.5 h-3.5" /></button>
                      <div className="w-px h-3 bg-slate-200 dark:bg-zinc-700 mx-1"></div>
                      <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                      <div className="w-px h-3 bg-slate-200 dark:bg-zinc-700 mx-1"></div>
                      <button onClick={() => removeBlock(block.id)} disabled={blocks.length === 1} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded disabled:opacity-30"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  
                  <div className="p-2 w-full">
                    <textarea 
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                      placeholder="在此处输入 Markdown 内容或 LaTeX 公式..."
                      spellCheck={false}
                      className="w-full h-28 text-sm bg-transparent border-0 focus:ring-0 resize-y p-1"
                    />
                  </div>
                  <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                     <button onClick={() => addBlock(index)} className="p-1.5 bg-indigo-500 text-white rounded shadow-sm hover:bg-indigo-600 transition-colors"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel - Preview & Export */}
          <div className="w-full md:w-1/2 flex flex-col bg-slate-50 dark:bg-zinc-950 relative">
             <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/50 block shrink-0 bg-white dark:bg-zinc-900">
               <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
                 <button
                   onClick={() => setViewMode('preview')}
                   className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                     viewMode === 'preview' 
                       ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-sm' 
                       : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                   }`}
                 >
                   视觉预览
                 </button>
                 <button
                   onClick={() => setViewMode('source')}
                   className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                     viewMode === 'source' 
                       ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-sm' 
                       : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                   }`}
                 >
                   Markdown 源码
                 </button>
               </div>
               
               <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '已复制' : '复制全选'}</span>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {viewMode === 'preview' ? (
                <div className="w-full min-h-full bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm p-4 overflow-hidden">
                   {blocks.length > 0 && (topic || blocks[0].title) && (
                     <div className="mb-2 text-sm font-semibold text-indigo-500 font-mono">
                       #{topic ? topic.replace(/\s+/g, '_') : blocks[0].title.replace(/\s+/g, '_')}
                     </div>
                   )}
                   {buildHtmlTree(blocks).map(root => (
                      <CalloutPreviewBlock key={root.block.id} node={root} />
                   ))}
                </div>
              ) : (
                <pre className="text-sm font-mono text-slate-700 dark:text-zinc-300 whitespace-pre-wrap break-words bg-white dark:bg-zinc-900/80 p-4 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm min-h-full">
                  {generatedMd}
                </pre>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
