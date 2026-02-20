import React, { useState, useEffect } from 'react';

interface TranslationProgressProps {
  t: any;
  hasTurnitin?: boolean;
}

const TranslationProgress: React.FC<TranslationProgressProps> = ({ t, hasTurnitin }) => {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const messages = [
    t.analyzing,
    t.identifying,
    t.applying,
    t.polishing,
    ...(hasTurnitin ? [t.generatingReport] : [])
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 4000);
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        return prev + 1;
      });
    }, 200);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [messages.length]);

  return (
    <div className="p-16 flex flex-col items-center justify-center min-h-[450px]">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-10"></div>
        <div className="w-28 h-28 bg-white rounded-[2rem] flex items-center justify-center relative shadow-2xl border border-indigo-50">
          <i className="fa-solid fa-book-journal-whills text-5xl text-indigo-600"></i>
        </div>
      </div>
      
      <h2 className="text-2xl font-black text-slate-900 mb-2">{t.translating}</h2>
      <p className="text-slate-500 mb-12 h-6 text-center font-medium">
        {messages[msgIdx]}
      </p>

      <div className="w-full max-w-sm">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <span>Processing Manuscript</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default TranslationProgress;