import React, { useState } from 'react';
import { X, Save, Settings } from 'lucide-react';
import { TranslationKey } from '../lib/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
  provider: string;
  setProvider: (provider: string) => void;
  baseUrl: string;
  setBaseUrl: (url: string) => void;
  t: (key: TranslationKey) => string;
}

const GEMINI_MODELS = [
  "gemini-3.1-pro-preview",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.0-pro-exp",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite-preview-02-05",
  "gemini-1.5-pro",
  "gemini-1.5-flash"
];

const XIAOMI_MODELS = [
  "mimo-v2.5",
  "mimo-v2.5-pro",
  "mimo-v2-omni",
  "mimo-v2-pro",
  "mimo-v2-flash"
];

const DEEPSEEK_MODELS = [
  "deepseek-chat",
  "deepseek-reasoner"
];

export function SettingsModal({ isOpen, onClose, apiKey, setApiKey, model, setModel, provider, setProvider, baseUrl, setBaseUrl, t }: SettingsModalProps) {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempModel, setTempModel] = useState(model);
  const [tempProvider, setTempProvider] = useState(provider);
  const [tempBaseUrl, setTempBaseUrl] = useState(baseUrl);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(tempKey);
    setModel(tempModel);
    setProvider(tempProvider);
    setBaseUrl(tempBaseUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold">
            <Settings className="w-5 h-5 text-indigo-500" />
            {t('settings')}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">{t('provider')}</label>
            <select 
              value={tempProvider} 
              onChange={(e) => {
                const val = e.target.value;
                setTempProvider(val);
                if (val === 'gemini') {
                  setTempModel('gemini-3.1-pro-preview');
                  setTempBaseUrl('');
                } else if (val === 'deepseek') {
                  setTempModel('deepseek-chat');
                  setTempBaseUrl('https://api.deepseek.com/v1');
                } else if (val === 'xiaomi') {
                  setTempModel('mimo-v2.5');
                  setTempBaseUrl('https://api.xiaomimimo.com/v1');
                } else {
                  setTempModel('');
                  setTempBaseUrl('');
                }
              }}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="gemini">{t('gemini')}</option>
              <option value="deepseek">{t('deepseek')}</option>
              <option value="xiaomi">{t('xiaomi')}</option>
              <option value="custom">{t('customProvider')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">{t('model')}</label>
            {tempProvider === 'custom' ? (
              <input 
                type="text" 
                value={tempModel}
                onChange={(e) => setTempModel(e.target.value)}
                placeholder={t('modelPlaceholder') || ''}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-400 dark:placeholder:text-zinc-600"
              />
            ) : (
              <div className="flex flex-col gap-2">
                <select 
                  value={
                    (tempProvider === 'gemini' && GEMINI_MODELS.includes(tempModel)) ||
                    (tempProvider === 'xiaomi' && XIAOMI_MODELS.includes(tempModel)) ||
                    (tempProvider === 'deepseek' && DEEPSEEK_MODELS.includes(tempModel))
                      ? tempModel : "custom_input"
                  }
                  onChange={(e) => {
                    if (e.target.value === "custom_input") {
                      setTempModel('');
                    } else {
                      setTempModel(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {tempProvider === 'gemini' && GEMINI_MODELS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  {tempProvider === 'xiaomi' && XIAOMI_MODELS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  {tempProvider === 'deepseek' && DEEPSEEK_MODELS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="custom_input">Other (Type Model ID)...</option>
                </select>

                {!((tempProvider === 'gemini' && GEMINI_MODELS.includes(tempModel)) ||
                   (tempProvider === 'xiaomi' && XIAOMI_MODELS.includes(tempModel)) ||
                   (tempProvider === 'deepseek' && DEEPSEEK_MODELS.includes(tempModel))) && (
                  <input 
                    type="text" 
                    value={tempModel}
                    onChange={(e) => setTempModel(e.target.value)}
                    placeholder="Enter custom model ID"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                    autoFocus
                  />
                )}
              </div>
            )}
          </div>

          {tempProvider !== 'gemini' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">{t('baseUrl')}</label>
              <input 
                type="text" 
                value={tempBaseUrl}
                onChange={(e) => setTempBaseUrl(e.target.value)}
                placeholder={t('baseUrlPlaceholder') || ''}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-400 dark:placeholder:text-zinc-600"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
              {tempProvider === 'gemini' ? t('customApiKey') : 'API Key'}
            </label>
            <input 
              type="password" 
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder={tempProvider === 'gemini' ? t('apiKeyPlaceholder') : ''}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-400 dark:placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {t('close')}
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
