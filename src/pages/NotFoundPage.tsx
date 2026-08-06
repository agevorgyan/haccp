import React from 'react';
import { NavLink } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">404 - Route Not Found</h1>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        The HACCP module or log page you requested does not exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <NavLink
          to="/staff/dashboard"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Kitchen Staff App
        </NavLink>
        <NavLink
          to="/manager/dashboard"
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
        >
          Go to Manager Dashboard
        </NavLink>
      </div>
    </div>
  );
};
