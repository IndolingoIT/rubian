import React from 'react';

interface FooterProps {
  t: any;
  onTermsClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ t, onTermsClick }) => {
  return (
    <footer className="bg-slate-50 text-slate-400 py-16 border-t border-slate-200">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-book-journal-whills text-white text-sm"></i>
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                JurnalLingua
              </span>
            </div>
            <p className="max-w-xs mb-8 text-sm leading-relaxed text-slate-500">
              {t.footerDesc}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 transition-all"><i className="fa-brands fa-twitter text-sm"></i></a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 transition-all"><i className="fa-brands fa-linkedin-in text-sm"></i></a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 transition-all"><i className="fa-brands fa-researchgate text-sm"></i></a>
            </div>
          </div>
          <div>
            <h4 className="text-slate-900 font-bold mb-6 text-sm">Product</h4>
            <ul className="space-y-4 text-xs font-medium">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Scopus Standards</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">SINTA Guidelines</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Expert API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 font-bold mb-6 text-sm">Legal</h4>
            <ul className="space-y-4 text-xs font-medium">
              <li><button onClick={onTermsClick} className="hover:text-indigo-600 transition-colors text-left">{t.termsTitle}</button></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Publication</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 mt-16 pt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} JurnalLingua AI. Powered by Gemini 3.
        </div>
      </div>
    </footer>
  );
};

export default Footer;