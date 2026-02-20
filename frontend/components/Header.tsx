import React from 'react';
import { UILanguage, User } from '../types';

interface HeaderProps {
  onLogoClick: () => void;
  onHowItWorksClick: () => void;
  onPricingClick: () => void;
  onSearchClick: () => void;
  onAccountClick?: () => void;
  onLoginClick: () => void;
  onHelpClick: () => void;
  currentUiLang: UILanguage;
  onSwitchUiLang: (lang: UILanguage) => void;
  isLoggedIn: boolean;
  user?: User | null;
  t: any;
}

const Header: React.FC<HeaderProps> = ({ 
  onLogoClick, 
  onHowItWorksClick, 
  onPricingClick,
  onSearchClick,
  onAccountClick,
  onLoginClick,
  onHelpClick,
  currentUiLang, 
  onSwitchUiLang, 
  isLoggedIn,
  user,
  t 
}) => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/50 px-6 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <button onClick={onLogoClick} className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors shadow-sm">
            <i className="fa-solid fa-book-journal-whills text-white text-lg"></i>
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">
            Jurnal<span className="text-indigo-600">Lingua</span>
          </span>
        </button>

        <div className="hidden lg:flex items-center gap-8">
          <button 
            onClick={onPricingClick} 
            className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            {t.pricing}
          </button>
          <button 
            onClick={onHowItWorksClick} 
            className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            {t.howItWorks}
          </button>
          <button 
            onClick={onSearchClick} 
            className="flex items-center gap-2 text-sm font-bold text-indigo-600 px-4 py-2 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-all"
          >
            <i className="fa-solid fa-magnifying-glass text-[10px]"></i>
            {t.journalSearch}
          </button>
          <button 
            onClick={onHelpClick}
            className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            {t.support}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-full mr-4 border border-slate-200 shadow-inner">
            <button 
              onClick={() => onSwitchUiLang('en')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${currentUiLang === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              EN
            </button>
            <button 
              onClick={() => onSwitchUiLang('id')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${currentUiLang === 'id' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              ID
            </button>
          </div>
          
          {isLoggedIn ? (
            <button 
              onClick={onAccountClick}
              className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 transition-all group"
            >
              <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-black group-hover:scale-110 transition-transform">
                {user?.name.charAt(0)}
              </div>
              <span className="text-xs font-bold text-slate-700 hidden sm:block">{t.myAccount}</span>
            </button>
          ) : (
            <>
              <button 
                onClick={onLoginClick}
                className="hidden sm:block text-sm font-bold text-slate-700 px-4 py-2 hover:text-indigo-600 transition-colors"
              >
                {t.login}
              </button>
              <button 
                onClick={onLogoClick}
                className="text-sm font-bold bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-indigo-600 transition-all shadow-md active:scale-95"
              >
                {t.getStarted}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;