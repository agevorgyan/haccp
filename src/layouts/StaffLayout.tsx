import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCheck,
  Sparkles,
  LogOut,
  Globe,
  LayoutDashboard,
  WifiOff,
  CloudUpload,
  RefreshCw,
} from 'lucide-react';
import { OfflineBadge } from '../components/common/OfflineBadge';
import { NotificationBell } from '../components/common/NotificationBell';
import { authService } from '../services/authService';
import { useSync } from '../context/SyncContext';

interface StaffNavItem {
  path: string;
  key: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAFF_NAV_ITEMS: StaffNavItem[] = [
  { path: '/staff/dashboard', key: 'nav.kitchenMode', icon: LayoutDashboard },
  { path: '/staff/journal', key: 'nav.dailyJournal', icon: ClipboardCheck },
  { path: '/staff/cleaning', key: 'nav.cleaningSanitation', icon: Sparkles },
];

/**
 * StaffLayout Component
 * Mobile-optimized bottom navigation layout tailored for kitchen staff.
 */
export const StaffLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isOnline, pendingCount, isSyncing, triggerSync } = useSync();

  const currentUser = authService.getCurrentUser();
  const staffName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.phone || 'Operator'
    : 'Operator';

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 pb-20">
      <OfflineBadge />

      {/* Mobile Kitchen Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 shadow-md flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-lg shadow-sm">
            H
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-white">{staffName}</h1>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
              Kitchen Operator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dynamic Sync / Offline Status Badges */}
          {isSyncing ? (
            <span className="flex items-center gap-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-1 rounded-lg animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
            </span>
          ) : !isOnline ? (
            <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-1 rounded-lg">
              <WifiOff className="w-3 h-3" /> Offline Mode
              {pendingCount > 0 && <span className="bg-amber-400 text-slate-950 font-black px-1 rounded">{pendingCount}</span>}
            </span>
          ) : pendingCount > 0 ? (
            <button
              onClick={() => triggerSync()}
              className="flex items-center gap-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer"
            >
              <CloudUpload className="w-3 h-3" /> Pending Sync: {pendingCount}
            </button>
          ) : null}

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{i18n.language === 'am' ? 'AM' : 'EN'}</span>
          </button>

          <NotificationBell />

          <button
            onClick={() => authService.logout()}
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 max-w-4xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Touch-Optimized Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-around shadow-2xl backdrop-blur-lg">
        {STAFF_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-bold px-4 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{t(item.key, item.key)}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default StaffLayout;
