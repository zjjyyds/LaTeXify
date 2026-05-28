import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Download, Check, Type, Eye } from 'lucide-react';
import { cn } from '../lib/utils';
import { TranslationKey } from '../lib/i18n';

interface ResultSectionProps {
  content: string;
  setContent?: (content: string) => void;
  t: (key: TranslationKey) => string;
}

export function ResultSection({ content, setContent, t }: ResultSectionProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'math_problem.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 md:p-5 flex flex-col flex-1 h-full shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider shrink-0">{t('latexEditor')}</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('preview')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                viewMode === 'preview' ? "bg-white text-slate-800 shadow-sm dark:bg-zinc-800 dark:text-zinc-100" : "text-slate-500 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              {t('preview')}
            </button>
            <button
              onClick={() => setViewMode('source')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                viewMode === 'source' ? "bg-white text-slate-800 shadow-sm dark:bg-zinc-800 dark:text-zinc-100" : "text-slate-500 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300"
              )}
            >
              <Type className="w-3.5 h-3.5" />
              {t('latexSource')}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              disabled={!content}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 h-[36px] bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 transition-colors"
              title="Copy text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="sm:hidden">{copied ? t('copied') : t('copy')}</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={!content}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 h-[36px] text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('exportMd')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 font-mono text-sm leading-relaxed overflow-hidden flex flex-col relative h-full">
        {!content ? (
          <div className="bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 w-full h-full min-h-[300px] flex flex-col items-center justify-center text-slate-500 dark:text-zinc-600 p-8 text-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:20px_20px]">
            <div className="p-4 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 mb-4 inline-flex shadow-sm">
              <Type className="w-6 h-6 text-slate-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1 tracking-wide">{t('awaiting')}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500">{t('awaitingDesc')}</p>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 w-full h-full min-h-[400px] flex flex-col relative overflow-hidden">
            <div className="p-5 overflow-y-auto flex-1 h-full absolute inset-0">
              {viewMode === 'preview' ? (
                <div className="prose prose-slate dark:prose-invert dark:prose-zinc prose-pre:bg-slate-100 dark:prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-zinc-800 max-w-none text-sm prose-p:leading-relaxed prose-headings:text-indigo-600 dark:prose-headings:text-indigo-400">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {content}
                  </ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent?.(e.target.value)}
                  className="w-full h-full bg-transparent resize-none outline-none text-[13px] font-mono text-indigo-700/90 dark:text-indigo-300/90 whitespace-pre-wrap break-words"
                  spellCheck={false}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
