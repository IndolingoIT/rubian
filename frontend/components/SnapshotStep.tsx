import React from 'react';
import { RATE_PER_1000_WORDS, TURNITIN_FLAT_FEE } from '../types';

interface SnapshotStepProps {
  wordCount: number;
  snapshotText: string;
  onPay: (includeProofreading: boolean, includeTurnitin: boolean) => void;
  uiLang: 'en' | 'id';
  t: any;
}

const SnapshotStep: React.FC<SnapshotStepProps> = ({ wordCount, snapshotText, onPay, uiLang, t }) => {
  const [includeProofreading, setIncludeProofreading] = React.useState(false);
  const [includeTurnitin, setIncludeTurnitin] = React.useState(false);
  
  const basePrice = Math.max((wordCount / 1000) * RATE_PER_1000_WORDS, 10000);
  const proofreadingPrice = Math.round((wordCount / 300) * 20000);
  const turnitinPrice = TURNITIN_FLAT_FEE;
  const totalPrice = basePrice + (includeProofreading ? proofreadingPrice : 0) + (includeTurnitin ? turnitinPrice : 0);
  
  const formatCurrency = (amount: number) => {
    return uiLang === 'id' 
      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
      : `$${(amount / 15500).toFixed(2)}`;
  };

  const displayRate = uiLang === 'id' 
    ? `Rp ${new Intl.NumberFormat('id-ID').format(RATE_PER_1000_WORDS)}`
    : `$${(RATE_PER_1000_WORDS / 15500).toFixed(2)}`;

  return (
    <div className="p-8 md:p-12">
      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-black text-slate-900 mb-6">{t.quoteTitle}</h2>
          
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-500 font-medium">{t.wordCount}</span>
                <span className="font-bold text-slate-900">{wordCount} words</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-500 font-medium">{t.pricePer1k}</span>
                <span className="font-bold text-slate-900">{displayRate}</span>
              </div>
              
              {includeProofreading && (
                <div className="flex justify-between items-center mb-4 animate-in fade-in slide-in-from-top-1">
                  <span className="text-sm text-indigo-500 font-medium">{t.proofreadingTitle}</span>
                  <span className="font-bold text-indigo-600">+{formatCurrency(proofreadingPrice)}</span>
                </div>
              )}

              {includeTurnitin && (
                <div className="flex justify-between items-center mb-4 animate-in fade-in slide-in-from-top-1">
                  <span className="text-sm text-indigo-500 font-medium">{t.turnitinTitle}</span>
                  <span className="font-bold text-indigo-600">+{formatCurrency(turnitinPrice)}</span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">{t.totalPrice}</span>
                  <span className="text-2xl font-black text-indigo-600">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Additional Services */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.additionalServices}</h4>
              
              {/* Proofreading Card */}
              <button 
                onClick={() => setIncludeProofreading(!includeProofreading)}
                className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all flex items-start gap-4 ${
                  includeProofreading 
                    ? 'border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-100' 
                    : 'border-slate-100 bg-white hover:border-indigo-200'
                }`}
              >
                <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  includeProofreading ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'
                }`}>
                  {includeProofreading && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-slate-900 text-sm">{t.proofreadingTitle}</span>
                    <span className="text-[10px] font-black text-indigo-600">{formatCurrency(proofreadingPrice)}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-3">{t.proofreadingDesc}</p>
                </div>
              </button>

              {/* Turnitin Card */}
              <button 
                onClick={() => setIncludeTurnitin(!includeTurnitin)}
                className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all flex items-start gap-4 relative overflow-hidden group ${
                  includeTurnitin 
                    ? 'border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-100' 
                    : 'border-slate-100 bg-white hover:border-indigo-200'
                }`}
              >
                {includeTurnitin && (
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                    <i className="fa-solid fa-file-shield text-5xl"></i>
                  </div>
                )}
                <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  includeTurnitin ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'
                }`}>
                  {includeTurnitin && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                </div>
                <div className="flex-grow relative z-10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-slate-900 text-sm">{t.turnitinTitle}</span>
                    <span className="text-[10px] font-black text-indigo-600">{formatCurrency(turnitinPrice)}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-3">{t.turnitinDesc}</p>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white border border-slate-100 rounded text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      <i className="fa-solid fa-shield-halved text-indigo-400"></i>
                      Official Turnitin Scan
                    </div>
                    {includeTurnitin && (
                      <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">
                        Selected
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </div>

            <button 
              onClick={() => onPay(includeProofreading, includeTurnitin)}
              className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-bold text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all group"
            >
              {t.payNow}
              <i className="fa-solid fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] border-2 border-indigo-100 overflow-hidden h-full flex flex-col shadow-lg">
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-bolt-lightning text-indigo-600 text-xs"></i>
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">{t.preview}</span>
              </div>
              <span className="text-[10px] bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full font-bold">Free Sample</span>
            </div>
            <div className="p-8 flex-grow overflow-y-auto bg-slate-50/50 custom-scrollbar">
              <div className="prose prose-slate prose-sm font-serif italic text-slate-700 leading-relaxed whitespace-pre-wrap">
                {snapshotText}...
              </div>
              <div className="mt-8 pt-8 border-t border-slate-200 text-center opacity-40 select-none">
                <i className="fa-solid fa-lock text-4xl mb-4 text-slate-300"></i>
                <p className="text-xs font-bold uppercase tracking-[0.3em]">Full Translation Locked</p>
                <p className="text-[10px] mt-2">Make payment to unlock the remaining {wordCount - 250} words.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapshotStep;