import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  Building2,
  LogOut,
  Globe,
  LayoutDashboard,
} from 'lucide-react';
import { authService } from '../services/authService';

export const SuperAdminLayout: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased">
      {/* Super Admin Top Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-600/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-white text-base tracking-tight block">
              SafeKitchen Backoffice
            </span>
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">
              Super Admin SaaS Portal
            </span>
          </div>
        </div>

        {/* Global Navigation */}
        <nav className="flex items-center gap-2">
          <NavLink
            to="/super-admin/tenants"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isActive
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-slate-400 hover:text-white'
              }`
            }
          >
            <Building2 className="w-4 h-4" />
            <span>Tenants & Subscriptions</span>
          </NavLink>

          <button
            onClick={() => navigate('/manager/analytics')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <span>Switch to Manager View</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-bold border border-slate-700 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{i18n.language === 'am' ? 'AM' : 'EN'}</span>
          </button>

          <div className="text-right">
            <span className="text-xs font-bold text-white block">
              {currentUser?.firstName || 'Super Admin'}
            </span>
            <span className="text-[10px] text-red-400 font-bold uppercase block">SUPER_ADMIN</span>
          </div>

          <button
            onClick={() => authService.logout()}
            className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;
