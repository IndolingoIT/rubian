import React, { useState } from 'react';
import { TranslationResult } from '../types';

interface SuccessDownloadProps {
  result: TranslationResult;
  onDownload: () => void;
  onNew: () => void;
  onRefine: (instruction: string) => Promise<void>;
  isRefining: boolean;
  t: any;
  isPremium?: boolean;
  hasTurnitin?: boolean;
}

const SuccessDownload: React.FC<SuccessDownloadProps> = ({ 
  result, 
  onDownload, 
  onNew, 
  onRefine,
  isRefining,
  t, 
  isPremium, 
  hasTurnitin 
}) => {
  const [copyStatus, setCopyStatus] = useState(t.copy);
  const [refineText, setRefineText] = useState('');

  const handleCopy = () => {
    // Remove markdown marks for plain text clipboard
    const plainText = result.translated.replace(/\*\*/g, '').replace(/\*/g, '');
    navigator.clipboard.writeText(plainText);
    setCopyStatus(t.copied);
    setTimeout(() => setCopyStatus(t.copy), 2000);
  };

  const handleRefineSubmit = async () => {
    if (!refineText.trim()) return;
    await onRefine(refineText);
    setRefineText('');
  };

  // Basic Markdown-ish rendering function
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      
      // Removed unused variable 'parts' which caused 'Cannot find namespace JSX' error
      
      // Simple regex based processing for demo-grade markdown rendering
      const boldRegex = /\*\*(.*?)\*\*/g;
      const italicRegex = /\*(.*?)\*/g;
      
      let processedLine = line.split(boldRegex).map((part, index) => 
        index % 2 === 1 ? <strong key={index} className="text-slate-900 font-black">{part}</strong> : part
      );

      return (
        <p key={i} className="mb-4 text-justify">
          {processedLine}
        </p>
      );
    });
  };

  return (
    <div className="p-6 md:p-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="w-full lg:w-[35%] overflow-y-auto custom-scrollbar h-[650px] pr-2">
          <div className="mb-10">
            <div className="w-16 h-16 bg-emerald-500 border border-emerald-400 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-100 animate-bounce">
              <i className="fa-solid fa-check text-2xl text-white"></i>
            </div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">{t.complete}</h2>
            <p className="text-slate-500 mt-4 leading-relaxed text-sm font-medium" dangerouslySetInnerHTML={{ __html: t.completeDesc.replace('{lang}', result.targetLanguage) }} />
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Translation Resources</h4>
            
            <button
              onClick={onDownload}
              aria-label="Download manuscript as Word document"
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-4 active:scale-95 group"
            >
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <i className="fa-solid fa-file-word text-sm"></i>
              </div>
              {t.download}
            </button>

            {hasTurnitin && result.similarityScore !== undefined && (
              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-file-shield text-5xl"></i>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t.turnitinTitle}</span>
                  </div>
                  <div className="flex items-center gap-6 mb-6">
                     <div className="w-20 h-20 rounded-full border-[6px] border-emerald-500/20 flex items-center justify-center relative">
                        <div className="absolute inset-0 border-[6px] border-emerald-500 rounded-full border-t-transparent animate-spin-slow"></div>
                        <span className="text-2xl font-black">{result.similarityScore}%</span>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-slate-400 mb-1">{t.similarityIndex}</p>
                        <p className={`text-sm font-black uppercase tracking-widest ${result.similarityScore < 15 ? 'text-emerald-400' : 'text-amber-400'}`}>
                           {result.similarityScore < 15 ? t.acceptable : t.concerning}
                        </p>
                     </div>
                  </div>
                  <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <i className="fa-solid fa-download text-[10px]"></i>
                    {t.downloadTurnitin}
                  </button>
                </div>
              </div>
            )}

            {isPremium && (
               <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-600/5 rounded-full"></div>
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-indigo-100">
                        <i className="fa-solid fa-award text-indigo-600 text-lg"></i>
                     </div>
                     <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t.proofreadingTitle}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-indigo-600 mb-6 bg-white/60 p-4 rounded-2xl border border-indigo-100">
                    <i className="fa-solid fa-hourglass-half animate-spin-slow"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.awaitingAdmin}</span>
                  </div>
               </div>
            )}

            {/* Refine Section */}
            <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-wand-magic-sparkles text-indigo-500"></i>
                  {t.refine}
               </h3>
               <textarea 
                  value={refineText}
                  onChange={(e) => setRefineText(e.target.value)}
                  placeholder={t.refinePlaceholder}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all h-24 resize-none mb-4"
               />
               <button 
                  onClick={handleRefineSubmit}
                  disabled={isRefining || !refineText.trim()}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
               >
                  {isRefining ? (
                    <><i className="fa-solid fa-circle-notch fa-spin"></i> {t.refining}</>
                  ) : (
                    <><i className="fa-solid fa-rotate"></i> {t.refineBtn}</>
                  )}
               </button>
            </div>

            <div className="pt-6">
              <button
                onClick={onNew}
                className="w-full py-4 bg-white border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-plus-circle opacity-50"></i>
                {t.translateAnother}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[65%] h-[650px] flex flex-col bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl relative">
          <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-magnifying-glass text-slate-300 text-xs"></i>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.preview}</span>
            </div>
            <div className="flex items-center gap-4">
               <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
               >
                 <i className={`fa-solid ${copyStatus === t.copied ? 'fa-check text-emerald-500' : 'fa-copy'}`}></i>
                 {copyStatus}
               </button>
               <span className="text-[9px] font-bold text-slate-400 uppercase">Times New Roman</span>
            </div>
          </div>
          <div className="p-8 md:p-16 overflow-y-auto flex-grow custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div className={`max-w-2xl mx-auto bg-white p-12 md:p-20 shadow-2xl border border-slate-100 min-h-full rounded-sm relative transition-opacity duration-300 ${isRefining ? 'opacity-50' : 'opacity-100'}`}>
               <h1 className="text-2xl font-black mb-12 text-slate-900 border-b-2 border-slate-100 pb-8 text-center italic leading-tight">
                 {result.targetLanguage === 'English' || result.targetLanguage === 'Inggris' ? 'Translated Scholarly Manuscript' : 'Naskah Ilmiah Terjemahan'}
               </h1>
               <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-[1.8] font-serif">
                 {renderFormattedText(result.translated)}
               </div>
               <div className="mt-20 pt-8 border-t border-slate-100 opacity-20 text-center">
                  <p className="text-[8px] font-black uppercase tracking-[0.5em]">JurnalLingua AI Certified Translation</p>
               </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
         @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
         .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}</style>
    </div>
  );
};

export default SuccessDownload;