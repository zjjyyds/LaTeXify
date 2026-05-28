import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { TranslationKey } from '../lib/i18n';

interface UploadZoneProps {
  onUpload: (imageBase64: string, mimeType: string) => void;
  isLoading: boolean;
  t: (key: TranslationKey) => string;
}

export function UploadZone({ onUpload, isLoading, t }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64 without the data URL prefix
      const base64Data = result.split(',')[1];
      onUpload(base64Data, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) handleFile(file);
        break;
      }
    }
  }, []);

  // Set up global paste listener
  React.useEffect(() => {
    const globalPaste = (e: ClipboardEvent) => {
      if (isLoading) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    };
    window.addEventListener('paste', globalPaste);
    return () => window.removeEventListener('paste', globalPaste);
  }, [isLoading]);


  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center w-full min-h-[300px] border border-dashed rounded-xl transition-all overflow-hidden bg-slate-50 dark:bg-zinc-950 flex-1 group",
        isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-slate-300 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-900/50",
        isLoading && "opacity-80 pointer-events-none"
      )}
    >
      {/* Target background grid pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:20px_20px]"></div>

      <input
        type="file"
        id="file-upload"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
        className="hidden"
        disabled={isLoading}
      />
      
      {isLoading ? (
        <div className="z-10 flex flex-col items-center text-center p-8 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xl">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500 dark:text-indigo-400" />
          <div className="mb-2 text-slate-700 dark:text-zinc-400 text-sm font-medium tracking-wide shadow-black/10 dark:shadow-black drop-shadow-md">{t('analyzing')}</div>
          <div className="text-xs italic text-indigo-500 dark:text-indigo-300">{t('extracting')}</div>
        </div>
      ) : (
        <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer w-full h-full justify-center p-6 text-center z-10 transition-transform group-hover:scale-[1.02]">
          <div className="p-4 bg-white/90 dark:bg-zinc-900/80 border border-slate-200/50 dark:border-zinc-700/50 rounded-full mb-4 shadow-lg pb-4 pt-4 px-4">
            <UploadCloud className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          </div>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-zinc-200 mb-1 drop-shadow-md">
            {t('clickUpload')}
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-500">
            {t('paste')}
          </p>
          <div className="flex items-center gap-2 mt-6 text-[10px] uppercase tracking-widest font-semibold text-slate-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 py-1.5 px-3 rounded-md backdrop-blur-sm shadow-sm">
            <ImageIcon className="w-3.5 h-3.5" />
            {t('supported')}
          </div>
        </label>
      )}
    </div>
  );
}
