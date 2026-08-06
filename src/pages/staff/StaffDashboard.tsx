import React from 'react';
import { NavLink } from 'react-router-dom';
import { Thermometer, CheckCircle2, Clock, ShieldAlert, ArrowRight } from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Shift Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
              Shift Status
            </span>
            <h2 className="text-lg font-bold text-white leading-snug">Morning Service Prep</h2>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
            On Track
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400 block">Pending Checks</span>
            <span className="font-bold text-amber-400 text-sm">3 Required</span>
          </div>
          <div>
            <span className="text-slate-400 block">Completed Today</span>
            <span className="font-bold text-emerald-400 text-sm">18 Logs</span>
          </div>
        </div>
      </div>

      {/* Quick Action Button for Temp Check */}
      <NavLink
        to="/staff/temp-check"
        className="block bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-4 rounded-2xl shadow-lg transition-all transform active:scale-98 border border-emerald-400/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Thermometer className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Record Temperature</h3>
              <p className="text-xs text-emerald-100/80">Cooling & Fridge Log (CCP 1)</p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-white/80" />
        </div>
      </NavLink>

      {/* Scheduled Tasks List */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Required Shift Checks
        </h3>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold">Walk-in Freezer 1 Temp</p>
                <p className="text-[11px] text-amber-700">Due in 15 min • Target &le; -18°C</p>
              </div>
            </div>
            <NavLink
              to="/staff/temp-check"
              className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Log Now
            </NavLink>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold">Sanitizer Concentration</p>
                <p className="text-[11px] text-slate-500">Passed 200 PPM • 08:30 AM by Marco</p>
              </div>
            </div>
            <span className="text-xs text-emerald-600 font-bold">Done</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <p className="text-xs font-bold">Raw Poultry Storage Check</p>
                <p className="text-[11px] text-slate-500">Passed • Shelf 4 isolation verified</p>
              </div>
            </div>
            <span className="text-xs text-emerald-600 font-bold">Done</span>
          </div>
        </div>
      </div>
    </div>
  );
};
