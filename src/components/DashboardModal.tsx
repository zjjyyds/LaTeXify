import React from 'react';
import { X, Activity, BarChart3, Database } from 'lucide-react';
import { TranslationKey } from '../lib/i18n';
import { UsageStats } from '../App';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UsageStats;
  onClear: () => void;
  t: (key: TranslationKey) => string;
}

export function DashboardModal({ isOpen, onClose, stats, onClear, t }: DashboardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold">
            <Activity className="w-5 h-5 text-green-500" />
            {t('dashboard')}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-500 dark:text-zinc-400">
            <Database className="w-4 h-4" />
            {t('sessionUsage')}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-500 dark:text-zinc-500 mb-1">{t('totalTokens')}</span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalTokens.toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-500 dark:text-zinc-500 mb-1">{t('callsMade')}</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.calls}</span>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-3 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-500 dark:text-zinc-500 mb-1">{t('promptTokens')}</span>
              <span className="text-lg font-bold text-slate-700 dark:text-zinc-300">{stats.promptTokens.toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-3 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-500 dark:text-zinc-500 mb-1">{t('completionTokens')}</span>
              <span className="text-lg font-bold text-slate-700 dark:text-zinc-300">{stats.completionTokens.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
            <BarChart3 className="w-4 h-4 inline-block mr-1.5 -translate-y-0.5" />
            {t('freeTierNotice')}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50 flex justify-between gap-2">
          <button 
            onClick={onClear}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900"
          >
            {t('clearUsage')}
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
