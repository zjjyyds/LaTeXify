import React, { useState, useEffect } from 'react';
import { Sigma, Sun, Moon, Languages, Settings, Activity, Blocks } from 'lucide-react';
import { UploadZone } from './components/UploadZone';
import { ResultSection } from './components/ResultSection';
import { translations, TranslationKey, Language } from './lib/i18n';
import { SettingsModal } from './components/SettingsModal';
import { DashboardModal } from './components/DashboardModal';
import { CalloutBuilderModal } from './components/CalloutBuilderModal';
import 'katex/dist/katex.min.css';

export interface UsageStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  calls: number;
}

const DEFAULT_STATS: UsageStats = { promptTokens: 0, completionTokens: 0, totalTokens: 0, calls: 0 };

export default function App() {
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lang, setLang] = useState<Language>('zh');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const t = (key: TranslationKey) => translations[lang][key];

  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isCalloutBuilderOpen, setIsCalloutBuilderOpen] = useState(false);
  
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('latexify_apiKey') || '');
  const [model, setModel] = useState(() => localStorage.getItem('latexify_model') || 'gemini-3.1-pro-preview');
  const [provider, setProvider] = useState(() => localStorage.getItem('latexify_provider') || 'gemini');
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem('latexify_baseUrl') || '');
  
  const [stats, setStats] = useState<UsageStats>(() => {
    const saved = localStorage.getItem('latexify_stats');
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('latexify_apiKey', apiKey);
    localStorage.setItem('latexify_model', model);
    localStorage.setItem('latexify_provider', provider);
    localStorage.setItem('latexify_baseUrl', baseUrl);
  }, [apiKey, model, provider, baseUrl]);

  // Persist stats
  useEffect(() => {
    localStorage.setItem('latexify_stats', JSON.stringify(stats));
  }, [stats]);

  const handleUpload = async (imageBase64: string, mimeType: string) => {
    setIsLoading(true);
    setError(null);
    setResult("");

    try {
      const response = await fetch('/api/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageBase64, 
          mimeType,
          customApiKey: apiKey.trim() !== '' ? apiKey.trim() : undefined,
          customModel: model,
          provider: provider,
          customBaseUrl: baseUrl.trim() !== '' ? baseUrl.trim() : undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      setResult(data.result);
      
      if (data.usage) {
        setStats(prev => ({
          promptTokens: prev.promptTokens + (data.usage.promptTokenCount || 0),
          completionTokens: prev.completionTokens + (data.usage.candidatesTokenCount || 0),
          totalTokens: prev.totalTokens + (data.usage.totalTokenCount || 0),
          calls: prev.calls + 1
        }));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearStats = () => {
    setStats(DEFAULT_STATS);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 transition-colors duration-200">
      <CalloutBuilderModal 
        isOpen={isCalloutBuilderOpen} 
        onClose={() => setIsCalloutBuilderOpen(false)} 
        initialContent={result}
      />
      <div className="max-w-[1280px] mx-auto p-4 md:p-6 flex flex-col min-h-screen space-y-6">
        
        <header className="flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sigma className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">{t('title')} <span className="text-slate-500 dark:text-zinc-500 font-normal">{t('subtitle')}</span></h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex items-center space-x-1 sm:space-x-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full p-1 shadow-sm">
              <button 
                onClick={() => setIsCalloutBuilderOpen(true)}
                className="flex items-center justify-center space-x-1.5 px-3 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-medium text-xs transition-colors"
                title="Obsidian Callout 构建器"
              >
                <Blocks className="w-4 h-4" />
                <span className="hidden sm:inline">构建 Callout</span>
              </button>
              <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1"></div>
              <button 
                onClick={() => setIsDashboardOpen(true)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-green-50 dark:hover:bg-green-500/10 text-green-600 dark:text-green-500 transition-colors"
                title="Usage Dashboard"
              >
                <Activity className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1"></div>
              <button 
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors"
                title="Toggle Language"
              >
                <Languages className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column - Input File */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 md:p-5 flex flex-col flex-1 shadow-sm">
              <div className="flex flex-col mb-4">
                <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">{t('sourceImg')}</h2>
                {!result && !isLoading && (
                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    {t('uploadDesc')}
                  </p>
                )}
              </div>

              <UploadZone onUpload={handleUpload} isLoading={isLoading} t={t} />

              {error && (
                <div className="w-full mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm font-medium">
                  {t('error')} {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="lg:col-span-7 flex flex-col min-h-[400px]">
            <ResultSection content={result} setContent={setResult} t={t} />
          </div>

        </main>
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKey={apiKey}
        setApiKey={setApiKey}
        model={model}
        setModel={setModel}
        provider={provider}
        setProvider={setProvider}
        baseUrl={baseUrl}
        setBaseUrl={setBaseUrl}
        t={t}
      />

      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        stats={stats}
        onClear={handleClearStats}
        t={t}
      />
    </div>
  );
}
