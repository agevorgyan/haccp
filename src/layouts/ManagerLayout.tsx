import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Building2,
  Settings,
  ChevronDown,
  ShieldCheck,
  ThermometerSnowflake,
  LogOut,
  Menu,
  X,
  Globe,
  Users,
  FileDiff,
  Layers,
  ShieldAlert,
  Sparkles,
  Truck,
  Boxes,
  Cpu,
  BarChart3,
} from 'lucide-react';
import { OfflineBadge } from '../components/common/OfflineBadge';
import { NotificationBell } from '../components/common/NotificationBell';
import { CorrectionRequestsModal } from '../components/manager/CorrectionRequestsModal';
import { AiCopilotChat } from '../components/common/AiCopilotChat';
import { authService } from '../services/authService';

interface NavItem {
  path: string;
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const TOP_NAV_ITEMS: NavItem[] = [
  { path: '/manager/analytics', key: 'nav.executiveAnalytics', icon: BarChart3, badge: 'HQ' },
  { path: '/manager/dashboard', key: 'nav.executiveDashboard', icon: LayoutDashboard },
  { path: '/manager/haccp', key: 'nav.haccpBuilder', icon: ShieldCheck },
  { path: '/manager/templates', key: 'nav.logTemplates', icon: Layers },
  { path: '/manager/compliance', key: 'nav.complianceDashboard', icon: ShieldAlert },
  { path: '/manager/cleaning', key: 'nav.cleaningSanitation', icon: Sparkles },
  { path: '/manager/suppliers', key: 'nav.suppliersReceiving', icon: Truck },
  { path: '/manager/traceability/batches', key: 'nav.batchesTraceability', icon: Boxes },
  { path: '/manager/iot-sensors', key: 'nav.iotSensors', icon: Cpu, badge: 'LIVE' },
  { path: '/manager/reports', key: 'nav.auditReports', icon: FileSpreadsheet, badge: 'PDF' },
  { path: '/manager/equipment', key: 'nav.sensoryEquipment', icon: ThermometerSnowflake },
  { path: '/manager/locations', key: 'nav.multiVenueOverview', icon: Building2 },
];

const SETTINGS_SUB_ITEMS: NavItem[] = [
  { path: '/manager/settings', key: 'nav.complianceSettings', icon: Settings },
  { path: '/manager/users', key: 'nav.userManagement', icon: Users },
  { path: '/manager/languages', key: 'nav.languageManagement', icon: Globe },
];

/**
 * ManagerLayout Component
 * Modern Enterprise SaaS layout: Dark Navy Sidebar + Crisp Light Main Content Area.
 */
export const ManagerLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedVenue, setSelectedVenue] = useState<string>('All Locations (3)');
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  const isSettingsActive = SETTINGS_SUB_ITEMS.some((item) => location.pathname === item.path);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(() => isSettingsActive);

  useEffect(() => {
    if (isSettingsActive) {
      setSettingsOpen(true);
    }
  }, [location.pathname, isSettingsActive]);

  const currentUser = authService.getCurrentUser();
  const displayName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.phone || 'Admin'
    : 'Admin';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AD';

  const roleKey = currentUser?.role ? `common.roles.${currentUser.role.toLowerCase()}` : 'common.roles.manager';
  const roleLabel = t(roleKey, currentUser?.role || 'MANAGER');

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white relative">
      <OfflineBadge />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop / Tablet Sidebar (Dark Navy Background) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header with DEMO ACCESS Pill Badge */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-blue-600/25">
              <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white text-base leading-none block">
                  SafeKitchen
                </span>
                <span className="text-[9px] uppercase font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded-full">
                  DEMO ACCESS
                </span>
              </div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mt-0.5">
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
        <div className="p-4 border-b border-slate-800/80">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5 block">
            {t('manager.locationPerformance')}
          </label>
          <div className="relative">
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer pr-8"
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
          {TOP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{t(item.key, item.key)}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Settings Collapsible Group */}
          <div className="pt-2">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isSettingsActive ? 'text-blue-400 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>{t('nav.settings', 'Settings')}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
            </button>
            {settingsOpen && (
              <div className="pl-6 pt-1 space-y-1">
                {SETTINGS_SUB_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t(item.key, item.key)}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* User Account Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {initials}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-slate-100 block truncate">{displayName}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{roleLabel}</span>
            </div>
          </div>
          <button
            onClick={() => authService.logout()}
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title={t('common.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area (Light Background) */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Crisp Top Navbar */}
        <header className="h-16 bg-white/90 border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl bg-slate-100 border border-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
              Organization Context: <strong className="text-slate-800 font-bold">{selectedVenue}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Copilot Header Trigger */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold border border-blue-200/80 transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Copilot</span>
            </button>

            {/* Correction Requests Modal Trigger */}
            <button
              onClick={() => setIsCorrectionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 transition-colors cursor-pointer"
            >
              <FileDiff className="w-3.5 h-3.5" />
              <span>Correction Requests</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{i18n.language === 'am' ? 'AM (ՀԱՅ)' : 'EN'}</span>
            </button>

            {/* Real-time Notification Bell */}
            <NotificationBell />

            {/* Direct Link to Staff Kitchen Mode */}
            <NavLink
              to="/staff/dashboard"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>{t('nav.kitchenMode')}</span>
            </NavLink>
          </div>
        </header>

        {/* Viewport Outlet */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating Action Button (FAB) for AI Copilot */}
      <button
        onClick={() => setIsAiModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-blue-400/40"
        title="Open AI Food Safety Copilot"
      >
        <Sparkles className="w-6 h-6 stroke-[2.5]" />
      </button>

      <CorrectionRequestsModal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
      />

      <AiCopilotChat
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
};

export default ManagerLayout;
