import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Phone, 
  Lock, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { authService } from '../../services/authService';

/**
 * LoginPage Component
 * Mobile-first authentication screen for kitchen staff, managers, and business owners.
 * Features dark/emerald theme, touch targets (>=48px), loading feedback, error banners, and 1-tap test presets.
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      setError('Please enter both Phone Number and PIN/Password.');
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
      
      // Redirect based on authenticated user role
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
        setError('Invalid Phone Number or PIN. Please try again.');
      } else {
        setError('Unable to connect to authentication server. Please check your network.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick preset loader for local QA testing
  const handleApplyPreset = (presetPhone: string, presetPin: string) => {
    setPhone(presetPhone);
    setPassword(presetPin);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 select-none antialiased">
      {/* Top Brand Header */}
      <header className="pt-6 sm:pt-8 text-center max-w-sm mx-auto w-full">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-4 border border-emerald-400/30">
          <ShieldCheck className="w-9 h-9 text-slate-950 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          SafeKitchen <span className="text-emerald-400">HACCP</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
          B2B Food Safety Digital Compliance SaaS
        </p>
      </header>

      {/* Main Login Card */}
      <main className="my-auto max-w-sm mx-auto w-full bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Sign In to Venue</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter your registered phone number & 4-digit PIN
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
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 099222222"
                autoComplete="tel"
                required
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-11 pr-4 min-h-[48px] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono"
              />
            </div>
          </div>

          {/* PIN / Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
              PIN / Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
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
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Shift</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Local QA Quick Fill Presets */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local Test Account Presets</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset('099222222', '1234')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-left border border-slate-800 transition-colors group cursor-pointer"
            >
              <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Staff User
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">099222222</p>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset('099111111', '1234')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-left border border-slate-800 transition-colors group cursor-pointer"
            >
              <p className="text-[11px] font-bold text-teal-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Manager User
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
