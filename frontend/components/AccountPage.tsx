import React, { useState, useEffect } from 'react';
import { User, TranslationHistory, DownloadedJournal } from '../types';

interface AccountPageProps {
  user: User;
  t: any;
  onLogout: () => void;
  onNewTranslation: () => void;
  onTopUp: (amount: number) => void;
  onTranslateJournal: (journal: DownloadedJournal) => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ user, t, onLogout, onNewTranslation, onTopUp, onTranslateJournal }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'profile' | 'settings' | 'library'>('history');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedTopUp, setSelectedTopUp] = useState<number | null>(null);
  
  // Simulated local state for history entries to allow for admin-simulation
  const [history, setHistory] = useState<TranslationHistory[]>([
    { 
      id: '1', 
      fileName: 'Molecular_Analysis_Final.docx', 
      date: '2024-03-15', 
      words: 4250, 
      status: 'completed', 
      targetLang: 'English',
      hasProofreading: true,
      hasTurnitin: true,
      proofreadingStatus: 'ready',
      assets: {
        cleanUrl: '#',
        uncleanUrl: '#',
        certificateUrl: '#',
        turnitinReportUrl: '#'
      }
    },
    { 
      id: '2', 
      fileName: 'Indonesian_Social_Constructs.pdf', 
      date: '2024-03-20', 
      words: 1800, 
      status: 'completed', 
      targetLang: 'English',
      hasProofreading: true,
      hasTurnitin: false,
      proofreadingStatus: 'awaiting_upload',
    }
  ]);

  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  const handleTopUpConfirm = () => {
    if (selectedTopUp) {
      onTopUp(selectedTopUp);
      setShowTopUpModal(false);
    }
  };

  const simulateAdminUpload = (id: string) => {
    setSimulatingId(id);
    setTimeout(() => {
      setHistory(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            proofreadingStatus: 'ready',
            assets: {
              cleanUrl: '#',
              uncleanUrl: '#',
              certificateUrl: '#'
            }
          };
        }
        return item;
      }));
      setSimulatingId(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[600px] overflow-hidden relative">
      {/* Sidebar */}
      <div className="w-full lg:w-72 border-r border-slate-100 bg-slate-50/50 p-8 flex flex-col">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-black text-slate-900 truncate text-sm">{user.name}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.academicRole}</p>
          </div>
        </div>

        <nav className="space-y-2 flex-grow">
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <i className="fa-solid fa-clock-rotate-left w-5"></i>
            {t.history}
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'library' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <i className="fa-solid fa-book-bookmark w-5"></i>
            {t.library}
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <i className="fa-solid fa-user-circle w-5"></i>
            {t.profile}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <i className="fa-solid fa-sliders w-5"></i>
            {t.settings}
          </button>
        </nav>

        <button 
          onClick={onLogout}
          className="mt-8 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-50 transition-all"
        >
          <i className="fa-solid fa-right-from-bracket w-5"></i>
          {t.logout}
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-grow p-8 lg:p-12 bg-white overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {activeTab === 'history' && t.history}
            {activeTab === 'library' && t.library}
            {activeTab === 'profile' && t.profile}
            {activeTab === 'settings' && t.settings}
          </h2>
          {activeTab === 'history' && (
            <button 
              onClick={onNewTranslation}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
              {t.translateAnother}
            </button>
          )}
        </div>

        {activeTab === 'history' && (
          <div className="space-y-6">
            {history.length > 0 ? history.map((item) => (
              <div key={item.id} className="group p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <i className={`fa-solid ${item.fileName.endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-word'} text-xl`}></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors text-lg">{item.fileName}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <span>{item.date}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span>{item.words} {t.words}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className="text-indigo-500">{item.targetLang}</span>
                        {item.hasTurnitin && (
                           <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[8px]">Turnitin®</span>
                        )}
                        {item.hasProofreading && (
                           <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[8px]">Sworn®</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'completed' ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full">Completed</span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                        Processing
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-slate-100">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:text-indigo-600 transition-all">
                    <i className="fa-solid fa-download"></i>
                    {t.download}
                  </button>
                  
                  {item.hasTurnitin && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-slate-800 transition-all">
                      <i className="fa-solid fa-file-shield"></i>
                      {t.downloadTurnitin}
                    </button>
                  )}

                  {item.hasProofreading && item.proofreadingStatus === 'ready' && (
                    <>
                      <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold hover:bg-indigo-700 transition-all">
                        <i className="fa-solid fa-award"></i>
                        {t.downloadCertificate}
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold hover:bg-indigo-100 transition-all">
                        <i className="fa-solid fa-pen-nib"></i>
                        {t.downloadTracked}
                      </button>
                    </>
                  )}

                  {item.hasProofreading && item.proofreadingStatus === 'awaiting_upload' && (
                    <div className="flex-grow flex items-center justify-between bg-indigo-50/50 p-4 rounded-2xl border border-dashed border-indigo-200">
                      <div className="flex items-center gap-3 text-indigo-600">
                        <i className="fa-solid fa-hourglass-half animate-pulse"></i>
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.awaitingAdmin}</span>
                      </div>
                      
                      {/* Simulation Action for Demo */}
                      <button 
                        onClick={() => simulateAdminUpload(item.id)}
                        disabled={simulatingId === item.id}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:bg-slate-300"
                      >
                        {simulatingId === item.id ? (
                          <>
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                            {t.simulatingAdmin}
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-upload"></i>
                            {t.adminUpload}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                <i className="fa-solid fa-folder-open text-4xl text-slate-200 mb-4"></i>
                <p className="text-slate-400 font-bold text-sm">{t.noHistory}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'library' && (
          <div className="grid sm:grid-cols-2 gap-6">
            {user.downloadedJournals.length > 0 ? user.downloadedJournals.map((journal) => (
              <div key={journal.id} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all flex flex-col h-full group">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                  <i className="fa-solid fa-scroll text-xl"></i>
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2 leading-tight flex-grow">{journal.title}</h4>
                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6">
                   <span>{journal.dateAdded}</span>
                   <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                   <span>{journal.wordCount} {t.words}</span>
                </div>
                <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                   <a 
                    href={journal.uri} 
                    target="_blank" 
                    className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white hover:text-indigo-600 transition-all"
                   >
                     {t.downloadPdf}
                   </a>
                   <button 
                    onClick={() => onTranslateJournal(journal)}
                    className="flex-grow px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                   >
                     <i className="fa-solid fa-language text-[12px]"></i>
                     {t.translateFromLib}
                   </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                <i className="fa-solid fa-book-open-reader text-4xl text-slate-200 mb-4"></i>
                <p className="text-slate-400 font-bold text-sm">{t.noHistory}</p>
                <button 
                  onClick={onNewTranslation}
                  className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold shadow-lg"
                >
                  {t.journalSearch}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl space-y-8">
            <div className="grid sm:grid-cols-2 gap-8">
               <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.activePlan}</p>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-4xl font-black text-slate-900">{user.credits.toLocaleString()}</span>
                    <span className="text-xs font-bold text-slate-400 mb-1">{t.words} Left</span>
                  </div>
                  <button 
                    onClick={() => setShowTopUpModal(true)}
                    className="w-full py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-xs font-black shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all uppercase tracking-widest"
                  >
                    {t.manageSubs}
                  </button>
               </div>
               <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">{t.memberSince}</p>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-2xl font-black text-slate-900">{user.joinedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase">
                    <i className="fa-solid fa-shield-halved"></i>
                    Verified Academic
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
           <div className="max-w-2xl space-y-6">
              <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                 <div>
                    <h4 className="font-bold text-slate-900">Email Notifications</h4>
                    <p className="text-xs text-slate-400">Receive alerts when translation is complete.</p>
                 </div>
                 <div className="w-12 h-6 bg-indigo-600 rounded-full relative p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                 </div>
              </div>
           </div>
        )}
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in duration-300">
            <div className="bg-slate-50 p-8 border-b border-slate-100 flex justify-between items-center">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t.topUpTitle}</h3>
               <button onClick={() => setShowTopUpModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                 <i className="fa-solid fa-times text-xl"></i>
               </button>
            </div>
            <div className="p-8">
              <p className="text-slate-500 text-sm mb-8 font-medium">{t.topUpDesc}</p>
              
              <div className="space-y-4 mb-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.selectAmount}</p>
                <div className="grid grid-cols-2 gap-4">
                   <button 
                    onClick={() => setSelectedTopUp(100000)}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${selectedTopUp === 100000 ? 'bg-indigo-50 border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                   >
                     <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Silver Pack</span>
                     <span className="text-xl font-black text-slate-900">Rp 100k</span>
                     <span className="text-[9px] font-bold text-slate-400">10,000 Words</span>
                   </button>
                   <button 
                    onClick={() => setSelectedTopUp(300000)}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${selectedTopUp === 300000 ? 'bg-indigo-50 border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                   >
                     <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Gold Pack</span>
                     <span className="text-xl font-black text-slate-900">Rp 300k</span>
                     <span className="text-[9px] font-bold text-slate-400">35,000 Words</span>
                   </button>
                </div>
              </div>

              <button 
                onClick={handleTopUpConfirm}
                disabled={!selectedTopUp}
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:bg-slate-200 disabled:shadow-none"
              >
                {t.confirmTopUp}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;