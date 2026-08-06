import React from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle, Thermometer, CheckCircle } from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Executive Compliance Overview</h2>
          <p className="text-xs text-slate-400">Real-time telemetry and HACCP audit metrics across 3 locations.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Last Synced: Just now</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">HACCP Score</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">98.4%</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +1.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Audit readiness score across venues</p>
        </div>

        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Logs Completed</span>
            <CheckCircle className="w-5 h-5 text-teal-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">142/145</span>
            <span className="text-xs font-bold text-teal-400">97.9%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">3 pending logs due before 23:00</p>
        </div>

        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CCP Deviations</span>
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-400">2</span>
            <span className="text-xs font-bold text-rose-400">Action Required</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">1 resolved • 1 under investigation</p>
        </div>

        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Sensors</span>
            <Thermometer className="w-5 h-5 text-sky-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">24/24</span>
            <span className="text-xs font-bold text-emerald-400">100% Online</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Wireless probes & cold room monitors</p>
        </div>
      </div>

      {/* Multi-Location Status Table */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Venue Compliance Heatmap</h3>
          <span className="text-xs text-slate-400">Showing last 24 hours</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Venue Name</th>
                <th className="px-5 py-3.5">Manager on Duty</th>
                <th className="px-5 py-3.5">Shift Log Rate</th>
                <th className="px-5 py-3.5">Deviations</th>
                <th className="px-5 py-3.5">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-900/50">
                <td className="px-5 py-4 font-semibold text-white">Downtown Bistro</td>
                <td className="px-5 py-4">Chef Marco Rossi</td>
                <td className="px-5 py-4 text-emerald-400 font-bold">98% (42/43)</td>
                <td className="px-5 py-4 text-rose-400 font-bold">1 Alert</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
                    Passed
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="px-5 py-4 font-semibold text-white">Uptown Bakery & Cafe</td>
                <td className="px-5 py-4">Sarah Jenkins</td>
                <td className="px-5 py-4 text-emerald-400 font-bold">100% (36/36)</td>
                <td className="px-5 py-4 text-slate-400 font-medium">0 Alerts</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
                    Passed
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="px-5 py-4 font-semibold text-white">Central Production Kitchen</td>
                <td className="px-5 py-4">David Chen</td>
                <td className="px-5 py-4 text-amber-400 font-bold">94% (64/68)</td>
                <td className="px-5 py-4 text-amber-400 font-bold">1 Warning</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold text-[11px]">
                    Review Needed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
