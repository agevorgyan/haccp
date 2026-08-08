import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Building2,
  Settings,
  Bell,
  Search,
  ChevronDown,
  ShieldCheck,
  ThermometerSnowflake,
  LogOut,
  Menu,
  X,
  Download,
  AlertCircle,
  Globe,
  Users
} from 'lucide-react';
import { OfflineBadge } from '../components/common/OfflineBadge';
import { authService } from '../services/authService';

interface NavItem {
  path: string;
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const MANAGER_NAV_ITEMS: NavItem[] = [
  { path: '/manager/dashboard', key: 'nav.executiveDashboard', icon: LayoutDashboard },
  { path: '/manager/reports', key: 'nav.auditReports', icon: FileSpreadsheet, badge: 'PDF' },
  { path: '/manager/users', key: 'nav.userManagement', icon: Users },
  { path: '/manager/equipment', key: 'nav.sensoryEquipment', icon: ThermometerSnowflake },
  { path: '/manager/languages', key: 'nav.languageManagement', icon: Globe },
  { path: '/manager/locations', key: 'nav.multiVenueOverview', icon: Building2 },
  { path: '/manager/settings', key: 'nav.complianceSettings', icon: Settings },
];

/**
 * ManagerLayout Component
 * Desktop/Tablet-first administrative cockpit engineered for restaurant owners, quality managers,
 * and food safety auditors who need macro analytics, compliance reports, and audit trail exports.
 */
export const ManagerLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedVenue, setSelectedVenue] = useState<string>('All Locations (3)');

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am');
  };

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      <OfflineBadge />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold text-xl shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-base leading-none block">
                SafeKitchen
              </span>
              <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
                HACCP Enterprise
              </span>
            </div>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Venue Context Switcher */}
        <div className="p-4 border-b border-slate-800/60">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5 block">
            {t('manager.locationPerformance')}
          </label>
          <div className="relative">
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 appearance-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer pr-8"
            >
              <option value="All Locations (3)">All Locations (3)</option>
              <option value="Downtown Bistro">Downtown Bistro</option>
              <option value="Uptown Bakery">Uptown Bakery & Cafe</option>
              <option value="Central Production Facility">Central Kitchen Facility</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {MANAGER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{t(item.key)}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Account / Manager Profile */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center border border-slate-600">
                ES
              </div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                <p className="text-xs font-semibold text-slate-200 leading-tight">Elena Rostova</p>
                <p className="text-[10px] text-slate-400 leading-tight">{t('common.roles.manager')}</p>
              </div>
            </div>
            <button
              onClick={() => {
                authService.logout();
                window.location.href = '/login';
              }}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
              title={t('nav.logout')}
              aria-label={t('nav.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        {/* Manager Workspace Top Bar */}
        <header className="h-16 bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
              aria-label="Open Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search */}
            <div className="relative hidden sm:block w-64 md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={t('common.search')}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quick Action Header Tools */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              title="Toggle Application Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{i18n.language === 'am' ? 'AM (ՀԱՅ)' : 'EN'}</span>
            </button>

            {/* Quick Export Button */}
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors">
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('common.exportAudit')}</span>
            </button>

            {/* Critical Alert Center */}
            <button
              className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
              aria-label="View CCP Alerts"
              title="2 Critical CCP Deviations Detected"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>

            {/* Direct Link to Staff Kitchen Mode */}
            <NavLink
              to="/staff/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>{t('nav.kitchenMode')}</span>
            </NavLink>
          </div>
        </header>

        {/* Viewport Outlet */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Real-time CCP Warning Banner */}
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  {t('manager.activeCCPAlert')}
                </h4>
                <p className="text-xs text-rose-200/90 mt-0.5">
                  {t('manager.ccpAlertDetail')}
                </p>
              </div>
            </div>
            <NavLink
              to="/manager/reports"
              className="shrink-0 text-xs font-semibold underline hover:text-white"
            >
              {t('manager.investigateLog')}
            </NavLink>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;

