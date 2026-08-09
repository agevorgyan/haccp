import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Thermometer,
  ClipboardCheck,
  AlertTriangle,
  LogOut,
  Globe,
  Sparkles,
} from 'lucide-react';
import { OfflineBadge } from '../components/common/OfflineBadge';
import { NotificationBell } from '../components/common/NotificationBell';
import { authService } from '../services/authService';

interface NavItem {
  path: string;
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const STAFF_NAV_ITEMS: NavItem[] = [
  { path: '/staff/dashboard', key: 'nav.executiveDashboard', icon: LayoutDashboard },
  { path: '/staff/journal', key: 'nav.dailyJournal', icon: ClipboardCheck },
  { path: '/staff/cleaning', key: 'nav.cleaningSanitation', icon: Sparkles },
  { path: '/staff/temp-check', key: 'nav.sensoryEquipment', icon: Thermometer, badge: 3 },
  { path: '/staff/incidents', key: 'manager.recentDeviations', icon: AlertTriangle },
];

/**
 * StaffLayout Component
 */
export const StaffLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const currentUser = authService.getCurrentUser();
  const staffName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.phone || 'Operator'
    : 'Operator';

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 select-none pb-20">
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
      <main className="flex-1 p-4">
        <Outlet />
      </main>

      {/* Bottom Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-2 py-2 flex items-center justify-around">
        {STAFF_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all relative ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{t(item.key, item.key)}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default StaffLayout;
