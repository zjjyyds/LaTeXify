import React, { useState, useEffect } from 'react';
import { X, Plus, ChevronUp, ChevronDown, ArrowRight, ArrowLeft, Trash2, Copy, Check, Blocks } from 'lucide-react';

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

export function CalloutBuilderModal({ isOpen, onClose, initialContent = '' }: { isOpen: boolean; onClose: () => void; initialContent?: string; }) {
  const [blocks, setBlocks] = useState<CalloutBlock[]>([]);
  const [copied, setCopied] = useState(false);
  const [generatedMd, setGeneratedMd] = useState('');

  // Initialize form
  useEffect(() => {
    if (isOpen) {
      if (blocks.length === 0) {
        setBlocks([
          {
            id: Math.random().toString(36).substring(7),
            type: "example",
            title: "题目",
            foldable: "-",
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
    await navigator.clipboard.writeText(generatedMd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-6xl h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-slate-200 dark:border-zinc-800">
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
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <select 
                        value={block.type}
                        onChange={(e) => updateBlock(block.id, { type: e.target.value })}
                        className="col-span-1 text-xs py-1 pl-2 pr-6 truncate rounded bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500"
                      >
                        {CALLOUT_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      
                      <select 
                        value={block.foldable}
                        onChange={(e) => updateBlock(block.id, { foldable: e.target.value })}
                        className="col-span-1 text-xs py-1 pl-2 pr-6 truncate rounded bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">不可折叠 (默认展开)</option>
                        <option value="-">默认折叠 (-)</option>
                        <option value="+">默认展开 (+)</option>
                      </select>

                      <input 
                        type="text" 
                        placeholder="自定义标题 (可选)"
                        value={block.title}
                        onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                        className="col-span-1 text-xs py-1 px-2 rounded bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500"
                      />
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
               <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400">输出结果</h3>
               <button
                  onClick={handleCopy}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '已复制!' : '复制全选'}</span>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="text-sm font-mono text-slate-700 dark:text-zinc-300 whitespace-pre-wrap break-words bg-white dark:bg-zinc-900/80 p-4 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm min-h-full">
                {generatedMd}
              </pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
