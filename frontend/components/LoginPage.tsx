import React, { useState } from 'react';

interface LoginPageProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
  t: any;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onSwitchToSignUp, t }) => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 1200);
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="p-8 md:p-16 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
          <i className="fa-solid fa-right-to-bracket text-3xl text-indigo-600"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">{t.login}</h2>
        <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">Access your translations and journal history.</p>
      </div>

      <div className="space-y-4 mb-8">
        <button 
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full py-4 border border-slate-200 bg-white rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm shadow-sm disabled:opacity-50"
        >
          {googleLoading ? (
            <i className="fa-solid fa-circle-notch fa-spin text-indigo-600"></i>
          ) : (
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          )}
          {t.googleLogin}
        </button>
        
        <div className="flex items-center gap-4 py-2">
          <div className="h-[1px] bg-slate-100 flex-grow"></div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or</span>
          <div className="h-[1px] bg-slate-100 flex-grow"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
            {t.email}
          </label>
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
              <i className="fa-solid fa-envelope"></i>
            </div>
            <input 
              type="email" 
              required 
              placeholder="scholar@university.ac.id"
              className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-white text-slate-700 placeholder:text-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              {t.password}
            </label>
            <button type="button" className="text-[10px] font-bold text-indigo-600 hover:underline">Forgot?</button>
          </div>
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
              <i className="fa-solid fa-lock"></i>
            </div>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-white text-slate-700 placeholder:text-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none shadow-sm"
            />
          </div>
        </div>

        <button 
          disabled={loading || googleLoading}
          className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
        >
          {loading ? (
            <i className="fa-solid fa-circle-notch fa-spin"></i>
          ) : (
            <>
              {t.signIn}
              <i className="fa-solid fa-paper-plane text-sm opacity-50"></i>
            </>
          )}
        </button>
      </form>
      
      <div className="mt-10 pt-10 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-400 font-medium">
          New to JurnalLingua? <button onClick={onSwitchToSignUp} className="text-indigo-600 font-black cursor-pointer hover:underline">{t.signUp}</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;