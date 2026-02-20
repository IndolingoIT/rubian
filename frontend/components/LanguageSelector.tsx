import React from 'react';
import { LANGUAGES } from '../types';

interface LanguageSelectorProps {
  selectedSource: string;
  onChange: (code: string) => void;
  t: any;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedSource, onChange, t }) => {
  const targetLang = selectedSource === 'id' ? 'en' : 'id';
  const targetName = t[`lang_${targetLang}`];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-end mb-4">
          <label className="block text-sm font-bold text-slate-900">{t.translateFrom}</label>
          <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
            {selectedSource === 'id' ? 'Export Mode' : 'Import Mode'}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onChange(lang.code)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all group ${
                selectedSource === lang.code
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
              }`}
            >
              <span className="text-[11px] font-black uppercase tracking-wider">{t[`lang_${lang.code}`]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
           <div className="flex flex-col">
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.targeting}</span>
             <span className="text-xs font-black text-slate-700">{targetName}</span>
           </div>
           <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black shadow-sm">
              <i className="fa-solid fa-lock text-[10px] opacity-50"></i>
              <i className="fa-solid fa-arrow-right-long"></i>
              <span>{targetName}</span>
           </div>
        </div>
        <p className="mt-3 text-[10px] text-slate-400 italic">
          {selectedSource === 'id' 
            ? "Indonesian manuscripts are translated to Academic English for global publication."
            : `International manuscripts (${LANGUAGES.find(l => l.code === selectedSource)?.name}) are localized to Formal Indonesian.`}
        </p>
      </div>
    </div>
  );
};

export default LanguageSelector;