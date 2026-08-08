import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, 
  Phone, 
  Lock, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { authService } from '../../services/authService';

/**
 * LoginPage Component
 * Mobile-first authentication screen for kitchen staff, managers, and business owners.
 */
export const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      setError(t('auth.errorEmpty'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.login({
        phone: phone.trim(),
        password: password.trim(),
      });

      const userRole = response.user?.role || 'STAFF';
      
      if (userRole === 'MANAGER' || userRole === 'OWNER') {
        navigate('/manager/dashboard', { replace: true });
      } else {
        navigate('/staff/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const serverMessage = err.response?.data?.message;
      if (Array.isArray(serverMessage)) {
        setError(serverMessage.join('. '));
      } else if (typeof serverMessage === 'string') {
        setError(serverMessage);
      } else if (err.response?.status === 401) {
        setError(t('auth.errorInvalid'));
      } else {
        setError(t('auth.errorConnection'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (presetPhone: string, presetPin: string) => {
    setPhone(presetPhone);
    setPassword(presetPin);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 select-none antialiased relative">
      {/* Top Bar Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold border border-slate-800 transition-all cursor-pointer shadow-md"
        >
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>{i18n.language === 'am' ? 'AM (ՀԱՅ)' : 'EN'}</span>
        </button>
      </div>

      {/* Top Brand Header */}
      <header className="pt-6 sm:pt-8 text-center max-w-sm mx-auto w-full">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-4 border border-emerald-400/30">
          <ShieldCheck className="w-9 h-9 text-slate-950 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          SafeKitchen <span className="text-emerald-400">HACCP</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
          {t('common.subtitle')}
        </p>
      </header>

      {/* Main Login Card */}
      <main className="my-auto max-w-sm mx-auto w-full bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-100">{t('auth.signInTitle')}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('auth.signInSub')}
          </p>
        </div>

        {/* Error Notification Banner */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertTriangleIcon />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Number Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
              {t('auth.phoneLabel')}
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('auth.phonePlaceholder')}
                autoComplete="tel"
                required
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-11 pr-4 min-h-[48px] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono"
              />
            </div>
          </div>

          {/* PIN / Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
              {t('auth.pinLabel')}
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.pinPlaceholder')}
                maxLength={20}
                required
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-11 pr-4 min-h-[48px] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono tracking-widest"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[50px] mt-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                <span>{t('auth.authenticating')}</span>
              </>
            ) : (
              <>
                <span>{t('auth.signInButton')}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Local QA Quick Fill Presets */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('auth.presetsTitle')}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset('099222222', '1234')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-left border border-slate-800 transition-colors group cursor-pointer"
            >
              <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {t('auth.staffUser')}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">099222222</p>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset('099111111', '1234')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-left border border-slate-800 transition-colors group cursor-pointer"
            >
              <p className="text-[11px] font-bold text-teal-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {t('auth.managerUser')}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">099111111</p>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-4 text-center text-xs text-slate-500">
        SafeKitchen Digital Compliance System • HACCP & FDA Compliant
      </footer>
    </div>
  );
};

const AlertTriangleIcon = () => (
  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
);

export default LoginPage;

