import React from 'react';

interface HowItWorksProps {
  t: any;
  onBack: () => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ t, onBack }) => {
  const steps = [
    { icon: 'fa-file-arrow-up', title: t.hiwStep1Title, desc: t.hiwStep1Desc },
    { icon: 'fa-eye', title: t.hiwStep2Title, desc: t.hiwStep2Desc },
    { icon: 'fa-file-shield', title: "Official Turnitin® Scan", desc: "Choose to verify manuscript originality with our integrated Turnitin scanning service." },
    { icon: 'fa-download', title: t.hiwStep4Title, desc: t.hiwStep4Desc },
  ];

  return (
    <div className="p-8 md:p-16">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-slate-900 mb-4">{t.howItWorksTitle}</h2>
        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">{t.howItWorksDesc}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {steps.map((step, idx) => (
          <div key={idx} className="relative group">
            {idx < steps.length - 1 && (
              <div className="hidden lg:block absolute top-10 -right-4 w-8 h-0.5 bg-slate-100 z-0"></div>
            )}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm group-hover:shadow-xl group-hover:shadow-indigo-500/5 transition-all relative z-10 h-full">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-inner">
                <i className={`fa-solid ${step.icon} text-xl`}></i>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-widest">Step 0{idx + 1}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 leading-tight">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-900 rounded-[3rem] p-12 text-white flex flex-col lg:flex-row items-center gap-12 mb-16 overflow-hidden relative">
         <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <i className="fa-solid fa-shield-halved text-[120px]"></i>
         </div>
         <div className="lg:w-2/3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-white/20">
               <i className="fa-solid fa-lock text-indigo-300"></i>
               Built-in Integrity
            </div>
            <h3 className="text-3xl font-black mb-6 leading-tight">Advanced Plagiarism Prevention with Turnitin®</h3>
            <p className="text-indigo-100/80 leading-relaxed font-medium mb-8">
               Our scholarly ecosystem is designed for ethical research. By integrating Turnitin directly into the translation workflow, we provide researchers with the tools to ensure global compliance and publication-ready originality.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
                    <i className="fa-solid fa-check text-[10px]"></i>
                  </div>
                  <span className="text-xs font-bold text-indigo-50">Official API Integration</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
                    <i className="fa-solid fa-check text-[10px]"></i>
                  </div>
                  <span className="text-xs font-bold text-indigo-50">Similarity Percentile Analysis</span>
               </div>
            </div>
         </div>
         <div className="lg:w-1/3 flex justify-center relative z-10">
            <div className="w-48 h-48 rounded-full border-[10px] border-white/10 flex flex-col items-center justify-center bg-indigo-800 shadow-2xl">
               <span className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-1">Index</span>
               <span className="text-5xl font-black tracking-tighter">03%</span>
               <span className="text-[10px] font-bold text-emerald-400 mt-2">Verified</span>
            </div>
         </div>
      </div>

      <div className="text-center">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
        >
          {t.backToHome}
        </button>
      </div>
    </div>
  );
};

export default HowItWorks;