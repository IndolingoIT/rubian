
import React, { useState, useEffect } from 'react';
import { AppStep, FileData, LANGUAGES, TranslationResult, UILanguage, RATE_PER_1000_WORDS, TURNITIN_FLAT_FEE, User, DownloadedJournal } from './types';
import { translations } from './translations';
import Header from './components/Header';
import Footer from './components/Footer';
import FileUpload from './components/FileUpload';
import AuthStep from './components/AuthStep';
import LoginPage from './components/LoginPage';
import SnapshotStep from './components/SnapshotStep';
import PaymentStep from './components/PaymentStep';
import TranslationProgress from './components/TranslationProgress';
import SuccessDownload from './components/SuccessDownload';
import LanguageSelector from './components/LanguageSelector';
import HowItWorks from './components/HowItWorks';
import AccountPage from './components/AccountPage';
import AcademicSearch from './components/AcademicSearch';
import HelpPage from './components/HelpPage';
import TermsAndConditions from './components/TermsAndConditions';
import TermsOfPublication from './components/TermsOfPublication';
import { translateText, generateTopicVisual, refineTranslation } from './services/geminiService';

declare global {
  interface Window {
    docx: any;
    mammoth: any;
    pdfjsLib: any;
  }
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [uiLang, setUiLang] = useState<UILanguage>('id');
  const [step, setStep] = useState<AppStep>('upload');
  const [file, setFile] = useState<FileData | null>(null);
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<string>("");
  const [heroImage, setHeroImage] = useState<string>("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000");
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [includeProofreading, setIncludeProofreading] = useState(false);
  const [includeTurnitin, setIncludeTurnitin] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const t = translations[uiLang];
  const targetLang = sourceLang === 'id' ? 'en' : 'id';

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleFileSelect = async (selectedFile: FileData) => {
    setFile(selectedFile);
    setStep('translate');
    setIsGeneratingImg(true);
    
    try {
      const sampleText = selectedFile.content.split(/\s+/).slice(0, 250).join(" ");
      
      const [snapshotTrans, visualizedImg] = await Promise.all([
        translateText(sampleText, sourceLang, targetLang, true),
        generateTopicVisual(sampleText)
      ]);

      if (visualizedImg) setHeroImage(visualizedImg);
      setSnapshot(snapshotTrans);
      setStep('snapshot');
    } catch (err) {
      setError(uiLang === 'id' ? "Gagal memproses naskah." : "Failed to process manuscript.");
      setStep('upload');
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleTryDemo = () => {
    const demoContent = `Abstract: Recent advancements in Large Language Models (LLMs) have demonstrated transformative potential in clinical diagnosis. This study evaluates the efficacy of transformer-based architectures in identifying early-stage neurodegenerative markers from spontaneous speech patterns. We recruited 450 participants for a multi-center longitudinal study across three European clinical sites. Our results indicate a 94.2% sensitivity rate when compared to standard cognitive assessments. This work contributes to the growing body of research advocating for AI-integrated diagnostic tools in primary care settings. Keywords: Machine Learning, Neurodegeneration, Clinical Linguistics, Transformers.`;
    
    const demoFile: FileData = {
      name: 'SAMPLE_JOURNAL_ABSTRACT_2024.pdf',
      size: 1024,
      type: 'application/pdf',
      content: demoContent,
      wordCount: 124
    };
    
    addToast(uiLang === 'id' ? "Memulai simulasi demo..." : "Starting demo simulation...", 'info');
    handleFileSelect(demoFile);
  };

  const handleAuthSuccess = (isNewUser: boolean = true) => {
    setIsLoggedIn(true);
    setUser({
      email: 'dr.indrawan@university.ac.id',
      name: isNewUser ? 'New Researcher' : 'Dr. Indrawan',
      role: 'Scholar / Researcher',
      joinedDate: 'Oct 2023',
      credits: isNewUser ? 5000 : 12500,
      downloadedJournals: isNewUser ? [] : [
        {
          id: 'lib_1',
          title: 'Deep Learning for Cardiovascular Prediction',
          uri: 'https://example.com/journal.pdf',
          dateAdded: '2024-03-01',
          wordCount: 3450,
          snippet: 'Recent advancements in neural networks allow for higher precision in identifying early signs of cardiovascular strain...'
        }
      ]
    });
    
    addToast(uiLang === 'id' ? "Selamat datang kembali!" : "Welcome back!", 'success');
    
    if (file) {
      setStep('pay');
    } else {
      setStep('account');
    }
  };

  const handleSaveToLibrary = (source: { title: string; uri: string; snippet?: string }) => {
    if (!isLoggedIn || !user) {
      setStep('login');
      addToast(uiLang === 'id' ? "Silakan login untuk menyimpan ke library." : "Please login to save to library.", 'info');
      return;
    }

    const newJournal: DownloadedJournal = {
      id: `journal_${Date.now()}`,
      title: source.title,
      uri: source.uri,
      dateAdded: new Date().toLocaleDateString(),
      wordCount: Math.floor(Math.random() * 3000) + 1500,
      snippet: source.snippet
    };

    setUser({
      ...user,
      downloadedJournals: [newJournal, ...user.downloadedJournals]
    });
    addToast(t.addedToLibrary, 'success');
  };

  const processFullTranslation = async (isUsingCredits: boolean = false) => {
    if (!file && !topUpAmount) return;

    if (topUpAmount) {
      addToast(uiLang === 'id' ? "Saldo kredit berhasil ditambahkan!" : "Credit balance added successfully!", 'success');
      setTopUpAmount(null);
      setStep('account');
      return;
    }

    if (isUsingCredits && user) {
      const creditCost = file!.wordCount + (includeTurnitin ? 5000 : 0);
      if (user.credits < creditCost) {
        setError(t.insufficientCredits);
        return;
      }
      setUser({ ...user, credits: user.credits - creditCost });
    }

    setStep('translate');
    try {
      const translatedText = await translateText(file!.content, sourceLang, targetLang, false);
      setResult({
        original: file!.content,
        translated: translatedText,
        sourceLanguage: LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang,
        targetLanguage: LANGUAGES.find(l => l.code === targetLang)?.name || targetLang,
        similarityScore: includeTurnitin ? Math.floor(Math.random() * 15) + 3 : undefined
      });
      setStep('success');
      addToast(uiLang === 'id' ? "Penerjemahan selesai!" : "Translation complete!", 'success');
    } catch (err: any) {
      setError(uiLang === 'id' ? "Gagal menerjemahkan naskah lengkap." : "Translation error for full manuscript.");
      setStep('upload');
    }
  };

  const handleRefine = async (instruction: string) => {
    if (!result || !file || isRefining) return;
    setIsRefining(true);
    try {
      const refined = await refineTranslation(file.content, result.translated, instruction, targetLang);
      setResult({ ...result, translated: refined });
      addToast(uiLang === 'id' ? "Terjemahan diperbarui!" : "Translation refined!", 'success');
    } catch (err) {
      addToast(uiLang === 'id' ? "Gagal memperbarui terjemahan." : "Failed to refine translation.", 'error');
    } finally {
      setIsRefining(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !file) return;

    try {
      const docxLib = window.docx;
      if (!docxLib) {
        throw new Error(uiLang === 'id' ? "Pustaka Docx belum dimuat." : "Docx library not loaded");
      }

      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docxLib;

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: result.targetLanguage === 'English' || result.targetLanguage === 'Inggris' 
                ? 'Translated Scholarly Manuscript' 
                : 'Naskah Ilmiah Terjemahan',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            ...result.translated.replace(/\*\*/g, '').replace(/\*/g, '').split('\n').filter(line => line.trim() !== '').map(line => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 24,
                    font: "Times New Roman"
                  })
                ],
                spacing: { line: 360, before: 120, after: 120 },
                alignment: AlignmentType.JUSTIFY
              })
            ),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      a.download = `${cleanName}_${result.targetLanguage}_translated.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast(uiLang === 'id' ? "File diunduh." : "File downloaded.", 'success');
    } catch (err: any) {
      console.error("Docx Generation Error:", err);
      setError(err.message || (uiLang === 'id' ? "Gagal membuat file Word." : "Failed to generate Word document."));
    }
  };

  const reset = () => {
    setStep('upload');
    setFile(null);
    setResult(null);
    setSnapshot("");
    setError(null);
    setTopUpAmount(null);
    setIncludeProofreading(false);
    setIncludeTurnitin(false);
    setHeroImage("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    addToast(uiLang === 'id' ? "Anda telah keluar." : "You have logged out.", 'info');
    reset();
  };

  const handleTopUp = (amount: number) => {
    setTopUpAmount(amount);
    setStep('pay');
  };

  // Fix: Added handleTranslateFromLibrary to process journals from the user's library
  const handleTranslateFromLibrary = (journal: DownloadedJournal) => {
    const journalFile: FileData = {
      name: journal.title,
      size: 1024,
      type: 'application/pdf',
      content: journal.snippet || "Academic content from library...",
      wordCount: journal.wordCount
    };
    
    addToast(uiLang === 'id' ? `Menyiapkan ${journal.title}...` : `Preparing ${journal.title}...`, 'info');
    handleFileSelect(journalFile);
  };

  const calculateTotal = () => {
    if (topUpAmount) return topUpAmount;
    if (!file) return 0;
    const basePrice = Math.max((file.wordCount / 1000) * RATE_PER_1000_WORDS, 10000);
    const proofreadingPrice = Math.round((file.wordCount / 300) * 20000);
    const turnitinPrice = TURNITIN_FLAT_FEE;
    return basePrice + (includeProofreading ? proofreadingPrice : 0) + (includeTurnitin ? turnitinPrice : 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <Header 
        onLogoClick={reset} 
        onHowItWorksClick={() => setStep('how-it-works')}
        onPricingClick={() => setStep('pricing')}
        onSearchClick={() => setStep('search')}
        onAccountClick={() => setStep('account')}
        onLoginClick={() => setStep('login')}
        onHelpClick={() => setStep('help')}
        currentUiLang={uiLang} 
        onSwitchUiLang={setUiLang} 
        isLoggedIn={isLoggedIn}
        user={user}
        t={t} 
      />
      
      <div className="fixed bottom-8 right-8 z-[100] space-y-3">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-300 ${
              toast.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 
              toast.type === 'error' ? 'bg-red-500 text-white border-red-400' : 
              'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-check-circle' : toast.type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info'}`}></i>
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </div>
        ))}
      </div>

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {(step === 'upload' || step === 'how-it-works' || step === 'pricing' || step === 'help' || step === 'terms' || step === 'terms-publication') && (
            <div className="flex flex-col lg:flex-row items-center gap-16 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="lg:w-1/2 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  AI-Powered Academic Integrity
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
                  {t.heroTitle.split(' ').map((word, i) => (
                    <span key={i} className={i === 1 ? "text-indigo-600" : ""}>{word}{' '}</span>
                  ))}
                </h1>
                <p className="text-xl text-slate-500 max-w-xl leading-relaxed mb-8">{t.heroDesc}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400">
                  <span className="flex items-center gap-2"><i className="fa-solid fa-check-circle text-emerald-500"></i> Turnitin Integrated</span>
                  <span className="flex items-center gap-2"><i className="fa-solid fa-check-circle text-emerald-500"></i> Scopus Ready</span>
                  <span className="flex items-center gap-2"><i className="fa-solid fa-check-circle text-emerald-500"></i> Certified Sworn</span>
                </div>
              </div>
              
              <div className="lg:w-1/2 relative">
                <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-2xl shadow-indigo-200/50 border-[12px] border-white group">
                  {isGeneratingImg ? (
                    <div className="w-full h-[450px] bg-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
                       <i className="fa-solid fa-wand-magic-sparkles text-4xl text-indigo-200 animate-pulse mb-4"></i>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visualizing Integrity...</span>
                    </div>
                  ) : (
                    <img 
                      src={heroImage} 
                      alt="Academic Research" 
                      className="w-full h-[450px] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 text-white shadow-2xl">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                          <i className="fa-solid fa-shield-halved text-xs"></i>
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">
                          Academic Standards
                        </span>
                      </div>
                      <p className="text-sm font-medium italic leading-relaxed text-slate-100">
                        {uiLang === 'id' 
                          ? "\"Orisinalitas adalah fondasi dari setiap penemuan besar. Lindungi karya Anda dengan standar global.\""
                          : "\"Originality is the foundation of every great discovery. Protect your work with global standards.\""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="glass rounded-[3.5rem] shadow-2xl overflow-hidden border border-white min-h-[550px] relative z-20">
            {step === 'upload' && (
              <>
                <div className="p-10 md:p-20 grid lg:grid-cols-2 gap-20">
                  <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">{t.uploadTitle}</h2>
                    <p className="text-slate-500 mb-8 text-sm leading-relaxed font-medium">{t.uploadDesc}</p>
                    <LanguageSelector selectedSource={sourceLang} onChange={setSourceLang} t={t} />
                  </div>
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <FileUpload onFileSelect={handleFileSelect} onTryDemo={handleTryDemo} selectedFile={file} />
                  </div>
                </div>
                
                {/* Embedded How It Works Timeline */}
                <div className="bg-slate-50/50 border-t border-slate-100 py-20 px-10 md:px-20">
                   <div className="text-center mb-16">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 block">Process Workflow</span>
                      <h3 className="text-3xl font-black text-slate-900">How JurnalLingua Works</h3>
                   </div>
                   <div className="grid md:grid-cols-4 gap-8">
                      {[
                        { icon: 'fa-file-arrow-up', title: t.hiwStep1Title, desc: t.hiwStep1Desc },
                        { icon: 'fa-eye', title: t.hiwStep2Title, desc: t.hiwStep2Desc },
                        { icon: 'fa-file-shield', title: "Turnitin® Scan", desc: t.turnitinDesc },
                        { icon: 'fa-award', title: t.hiwStep4Title, desc: t.hiwStep4Desc },
                      ].map((s, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center group">
                           <div className="w-16 h-16 bg-white border border-slate-200 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm group-hover:border-indigo-400 group-hover:shadow-xl group-hover:shadow-indigo-500/5 transition-all">
                              <i className={`fa-solid ${s.icon} text-xl text-slate-400 group-hover:text-indigo-600`}></i>
                           </div>
                           <h4 className="font-bold text-slate-900 mb-2 text-sm">{s.title}</h4>
                           <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{s.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </>
            )}

            {step === 'how-it-works' && <HowItWorks t={t} onBack={reset} />}
            {step === 'help' && <HelpPage t={t} onBack={reset} />}
            {step === 'terms' && <TermsAndConditions t={t} onBack={reset} lang={uiLang} />}
            {step === 'terms-publication' && <TermsOfPublication t={t} onBack={reset} lang={uiLang} />}

            {step === 'pricing' && (
              <div className="p-10 md:p-20 text-center animate-in fade-in zoom-in duration-500">
                 <h2 className="text-3xl font-black text-slate-900 mb-12 tracking-tight uppercase tracking-[0.1em]">{t.pricing}</h2>
                 <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                    <div className="flex flex-col bg-white/50 p-10 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><i className="fa-solid fa-bolt text-6xl"></i></div>
                       <span className="inline-block self-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 mb-6">AI Core</span>
                       <h3 className="text-xl font-black text-slate-900 mb-2">{t.pricingStandardTitle}</h3>
                       <p className="text-slate-500 text-[10px] font-medium mb-8 leading-relaxed">{t.pricingStandardDesc}</p>
                       <div className="flex items-end justify-center gap-2 mb-10"><span className="text-4xl font-black text-slate-900">Rp 10k</span><span className="text-[10px] font-bold text-slate-400 mb-1">/ 1,000 {t.words}</span></div>
                       <ul className="text-left space-y-4 mb-12 flex-grow">
                          <li className="flex items-start gap-4 text-xs font-bold text-slate-600"><i className="fa-solid fa-circle-check text-emerald-500 mt-0.5"></i>Academic Terminology</li>
                          <li className="flex items-start gap-4 text-xs font-bold text-slate-600"><i className="fa-solid fa-circle-check text-emerald-500 mt-0.5"></i>Format Preservation</li>
                       </ul>
                       <button onClick={reset} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all active:scale-95">{t.getStarted}</button>
                    </div>

                    <div className="flex flex-col bg-slate-900 p-10 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group scale-105 z-10">
                       <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform"><i className="fa-solid fa-file-shield text-6xl text-white"></i></div>
                       <span className="inline-block self-center text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full border border-white/20 mb-6">Integrity Plus</span>
                       <h3 className="text-xl font-black text-white mb-2">{t.turnitinTitle}</h3>
                       <p className="text-slate-400 text-[10px] font-medium mb-8 leading-relaxed">{t.turnitinDesc}</p>
                       <div className="flex items-end justify-center gap-2 mb-10"><span className="text-4xl font-black text-white">Rp 50k</span><span className="text-[10px] font-bold text-slate-500 mb-1">/ Flat Fee</span></div>
                       <ul className="text-left space-y-4 mb-12 flex-grow">
                          <li className="flex items-start gap-4 text-xs font-bold text-white"><i className="fa-solid fa-circle-check text-indigo-500 mt-0.5"></i>Official Turnitin® Scan</li>
                          <li className="flex items-start gap-4 text-xs font-bold text-white"><i className="fa-solid fa-circle-check text-indigo-500 mt-0.5"></i>Full Similarity Report (PDF)</li>
                       </ul>
                       <button onClick={reset} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all active:scale-95">{t.getStarted}</button>
                    </div>

                    <div className="flex flex-col bg-indigo-600 p-10 rounded-[3.5rem] border border-indigo-500 shadow-xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><i className="fa-solid fa-award text-6xl text-white"></i></div>
                       <span className="inline-block self-center text-[10px] font-black text-indigo-200 uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full border border-white/20 mb-6">Sworn Review</span>
                       <h3 className="text-xl font-black text-white mb-2">{t.pricingPremiumTitle}</h3>
                       <p className="text-indigo-100 text-[10px] font-medium mb-8 leading-relaxed">{t.pricingPremiumDesc}</p>
                       <div className="flex items-end justify-center gap-2 mb-10"><span className="text-4xl font-black text-white">Rp 20k</span><span className="text-[10px] font-bold text-indigo-200 mb-1">/ 300 {t.words}</span></div>
                       <ul className="text-left space-y-4 mb-12 flex-grow">
                          <li className="flex items-start gap-4 text-xs font-bold text-white"><i className="fa-solid fa-circle-check text-indigo-300 mt-0.5"></i>Human Certified Sworn Translation</li>
                          <li className="flex items-start gap-4 text-xs font-bold text-white"><i className="fa-solid fa-circle-check text-indigo-300 mt-0.5"></i>Signed Publication Certificate</li>
                       </ul>
                       <button onClick={reset} className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all active:scale-95">{t.getStarted}</button>
                    </div>
                 </div>
              </div>
            )}

            {step === 'search' && (
              <AcademicSearch 
                t={t} 
                onBack={reset} 
                isLoggedIn={isLoggedIn} 
                onSaveToLibrary={handleSaveToLibrary}
                onLoginRequired={() => setStep('login')}
              />
            )}

            {step === 'snapshot' && file && (
              <SnapshotStep 
                wordCount={file.wordCount} 
                snapshotText={snapshot} 
                onPay={(proof, turnitin) => {
                   setIncludeProofreading(proof);
                   setIncludeTurnitin(turnitin);
                   if (isLoggedIn) setStep('pay');
                   else setStep('login');
                }} 
                uiLang={uiLang} 
                t={t} 
              />
            )}

            {step === 'auth' && (
              <AuthStep 
                onSuccess={() => handleAuthSuccess(true)} 
                onSwitchToLogin={() => setStep('login')} 
                onViewTerms={() => setStep('terms')}
                onViewPublicationTerms={() => setStep('terms-publication')}
                t={t} 
              />
            )}

            {step === 'login' && <LoginPage onSuccess={() => handleAuthSuccess(false)} onSwitchToSignUp={() => setStep('auth')} t={t} />}

            {step === 'pay' && (file || topUpAmount) && (
              <PaymentStep 
                onSuccess={processFullTranslation} 
                onCancel={() => {
                  if (topUpAmount) setStep('account');
                  else setStep('snapshot');
                  setTopUpAmount(null);
                }} 
                amount={calculateTotal()}
                currency={uiLang === 'id' ? 'IDR' : 'USD'}
                t={t}
                userCredits={user?.credits}
              />
            )}

            {step === 'translate' && <TranslationProgress t={t} hasTurnitin={includeTurnitin} />}

            {step === 'success' && result && (
              <SuccessDownload 
                result={result} 
                onDownload={handleDownload} 
                onNew={reset} 
                onRefine={handleRefine}
                isRefining={isRefining}
                t={t} 
                isPremium={includeProofreading} 
                hasTurnitin={includeTurnitin}
              />
            )}

            {step === 'account' && user && (
              <AccountPage 
                user={user} 
                t={t} 
                onLogout={handleLogout} 
                onNewTranslation={reset} 
                onTopUp={handleTopUp}
                onTranslateJournal={handleTranslateFromLibrary}
              />
            )}
          </div>
          
          {error && (
            <div className="mt-8 p-6 bg-red-50 text-red-600 border border-red-100 rounded-3xl text-center font-black animate-pulse flex items-center justify-center gap-3">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}
        </div>
      </main>

      <Footer t={t} onTermsClick={() => setStep('terms')} />
      
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animate-blob { animation: blob 7s infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default App;
