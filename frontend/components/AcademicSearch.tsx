import React, { useState, useEffect } from 'react';
import { AcademicSearchResult, DownloadedJournal } from '../types';
import { searchAcademicJournals } from '../services/geminiService';

interface AcademicSearchProps {
  t: any;
  onBack: () => void;
  isLoggedIn: boolean;
  onSaveToLibrary: (source: { title: string; uri: string; snippet?: string }) => void;
  onLoginRequired: () => void;
}

const AcademicSearch: React.FC<AcademicSearchProps> = ({ 
  t, 
  onBack, 
  isLoggedIn, 
  onSaveToLibrary, 
  onLoginRequired 
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AcademicSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localSearchCount, setLocalSearchCount] = useState(0);
  const [savedUris, setSavedUris] = useState<Set<string>>(new Set());

  useEffect(() => {
    const count = localStorage.getItem('guestSearchCount');
    if (count) setLocalSearchCount(parseInt(count));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!isLoggedIn && localSearchCount >= 1) {
      onLoginRequired();
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSavedUris(new Set());

    try {
      const data = await searchAcademicJournals(query);
      setResult(data);
      
      if (!isLoggedIn) {
        const newCount = localSearchCount + 1;
        setLocalSearchCount(newCount);
        localStorage.setItem('guestSearchCount', newCount.toString());
      }
    } catch (err: any) {
      setError(err.message || "Failed to search journals.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = (source: { title: string; uri: string; snippet?: string }) => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    onSaveToLibrary(source);
    setSavedUris(prev => new Set(prev).add(source.uri));
  };

  return (
    <div className="p-8 md:p-16 flex flex-col min-h-[600px] animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto w-full mb-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <i className="fa-solid fa-magnifying-glass-chart text-3xl text-indigo-600"></i>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{t.searchTitle}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">{t.searchDesc}</p>
          {!isLoggedIn && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
               <i className="fa-solid fa-gift"></i>
               {localSearchCount === 0 ? "1 Free Global Search Remaining" : "Guest Search Limit Reached"}
            </div>
          )}
        </div>

        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
            <i className="fa-solid fa-search text-xl"></i>
          </div>
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-16 pr-48 py-6 bg-white rounded-[2rem] border-2 border-slate-100 focus:border-indigo-600 outline-none shadow-2xl shadow-indigo-500/5 transition-all font-medium text-slate-700"
          />
          <button 
            type="submit"
            disabled={loading || (!isLoggedIn && localSearchCount >= 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:bg-slate-200"
          >
            {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : t.searchBtn}
          </button>
        </form>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-grow">
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center animate-pulse">
            <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.searching}</p>
          </div>
        )}

        {error && (
          <div className="p-8 bg-red-50 border border-red-100 rounded-[2.5rem] text-center">
            <i className="fa-solid fa-circle-exclamation text-red-400 text-2xl mb-4"></i>
            <p className="text-red-600 font-bold">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <i className="fa-solid fa-quote-right text-6xl"></i>
              </div>
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-serif italic text-lg whitespace-pre-wrap">
                {result.answer}
              </div>
            </div>

            {result.sources.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                  {t.trustedSources}
                </h3>
                <div className="grid sm:grid-cols-1 gap-6">
                  {result.sources.map((source, idx) => (
                    <div 
                      key={idx} 
                      className="group p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="flex items-start gap-5 flex-grow">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-sm border border-slate-100 flex-shrink-0">
                          <i className="fa-solid fa-file-pdf text-xl"></i>
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors leading-tight text-lg">{source.title}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-md">{source.uri}</p>
                        </div>
                      </div>
                      
                      {/* Search Result Toolbar */}
                      <div className="flex items-center gap-2 bg-slate-100/50 p-2 rounded-2xl border border-slate-100/50 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all self-end lg:self-auto">
                        <a 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 hover:shadow-md transition-all border border-slate-100"
                        >
                          <i className="fa-solid fa-external-link text-[10px]"></i>
                          {t.downloadPdf}
                        </a>
                        
                        <button 
                          onClick={() => handleSaveClick(source)}
                          disabled={savedUris.has(source.uri)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                            savedUris.has(source.uri) 
                            ? 'bg-emerald-500 text-white shadow-emerald-100 cursor-default' 
                            : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 active:scale-95'
                          }`}
                        >
                          <i className={`fa-solid ${savedUris.has(source.uri) ? 'fa-check-circle' : 'fa-bookmark'}`}></i>
                          {savedUris.has(source.uri) ? t.addedToLibrary : t.saveToLibrary}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {result.sources.length === 0 && !loading && (
              <div className="text-center py-10 opacity-40">
                <p className="text-xs font-bold uppercase tracking-widest">{t.noSearchResults}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-16 text-center">
        <button
          onClick={onBack}
          className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors flex items-center gap-2 mx-auto"
        >
          <i className="fa-solid fa-arrow-left text-[8px]"></i>
          {t.backToHome}
        </button>
      </div>
    </div>
  );
};

export default AcademicSearch;