import React, { useState } from 'react';

interface HelpPageProps {
  t: any;
  onBack: () => void;
}

const HelpPage: React.FC<HelpPageProps> = ({ t, onBack }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
    { q: t.faq4Q, a: t.faq4A },
  ];

  return (
    <div className="p-8 md:p-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <i className="fa-solid fa-circle-question text-3xl text-indigo-600"></i>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{t.helpTitle}</h2>
          <p className="text-slate-500 max-w-xl mx-auto leading-relaxed font-medium">
            {t.helpDesc}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <i className="fa-solid fa-list-check text-indigo-600"></i>
              {t.faqTitle}
            </h3>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className={`border rounded-3xl transition-all ${openFaq === idx ? 'border-indigo-200 bg-white shadow-xl shadow-indigo-500/5' : 'border-slate-100 bg-slate-50/50 hover:bg-white'}`}
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left px-8 py-6 flex items-center justify-between gap-4"
                  >
                    <span className="font-bold text-slate-900 leading-tight">{faq.q}</span>
                    <i className={`fa-solid fa-chevron-down text-xs transition-transform ${openFaq === idx ? 'rotate-180 text-indigo-600' : 'text-slate-300'}`}></i>
                  </button>
                  {openFaq === idx && (
                    <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-headset text-5xl"></i>
              </div>
              <h4 className="font-black text-lg mb-4 relative z-10">{t.contactSupport}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-8 relative z-10">
                {t.contactDesc}
              </p>
              <a 
                href="mailto:support@jurnallingua.com"
                className="block w-full py-4 bg-indigo-600 rounded-2xl text-center text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
              >
                {t.emailSupport}
              </a>
            </div>

            <div className="p-8 border border-slate-100 rounded-[2.5rem] bg-white">
               <h4 className="font-black text-slate-900 text-sm mb-4">{t.serviceStandards}</h4>
               <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <i className="fa-solid fa-circle-check text-emerald-500 mt-0.5 text-xs"></i>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.scopusReady}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fa-solid fa-circle-check text-emerald-500 mt-0.5 text-xs"></i>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.sintaFormatting}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <i className="fa-solid fa-circle-check text-emerald-500 mt-0.5 text-xs"></i>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.turnitinAudit}</span>
                  </li>
               </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onBack}
            className="px-10 py-4 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;