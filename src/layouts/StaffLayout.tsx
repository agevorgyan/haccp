import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Thermometer, 
  ClipboardCheck, 
  AlertTriangle, 
  UserCheck, 
  ChevronRight,
  Plus,
  LogOut,
  Globe
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
  { path: '/staff/temp-check', key: 'nav.sensoryEquipment', icon: Thermometer, badge: 3 },
  { path: '/staff/logs', key: 'staff.scheduledTasksTitle', icon: ClipboardCheck },
  { path: '/staff/incidents', key: 'manager.recentDeviations', icon: AlertTriangle },
];

/**
 * StaffLayout Component
 * Mobile-first operational interface designed specifically for line cooks, kitchen supervisors,
 * and food safety operators working on smartphones or small tablets in kitchen environments.
 */
export const StaffLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const currentUser = authService.getCurrentUser();
  const staffName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.phone || 'Operator'
    : 'Chef Marco';

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 select-none pb-20">
      {/* Network Connectivity Banner */}
      <OfflineBadge />

      {/* Mobile Kitchen Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 shadow-md flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-lg shadow-sm">
            H
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-semibold tracking-tight text-slate-100 leading-tight">
                Downtown Bistro — Main Kitchen
              </h1>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                AM Shift Active
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <UserCheck className="w-3 h-3 text-slate-400" />
                {staffName}
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Tools / Language Switcher / Notifications / Logout */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <NotificationBell />

          {/* Language Switcher Button */}
          <button
            onClick={toggleLanguage}
            className="p-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{i18n.language === 'am' ? 'AM' : 'EN'}</span>
          </button>

          <button
            onClick={() => {
              authService.logout();
              window.location.href = '/login';
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title={t('nav.logout')}
            aria-label={t('nav.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area (Scrollable with mobile safe padding) */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      {/* Floating Action Button (Quick Temp Check shortcut) */}
      <div className="fixed bottom-20 right-4 z-40">
        <NavLink
          to="/staff/temp-check"
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-xl flex items-center justify-center transition-all transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400/50"
          aria-label={t('staff.logTemperatureBtn')}
          title={t('staff.logTemperatureBtn')}
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </NavLink>
      </div>

      {/* Ergonomic Mobile Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-2 py-1.5 shadow-lg backdrop-blur-md bg-opacity-95"
        aria-label="Staff Mobile Navigation"
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {STAFF_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[52px] py-1 px-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-400 font-semibold bg-slate-800/80'
                    : 'text-slate-400 hover:text-slate-200 active:bg-slate-800/40'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-tight mt-1 font-medium tracking-tight">
                  {t(item.key)}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default StaffLayout;

