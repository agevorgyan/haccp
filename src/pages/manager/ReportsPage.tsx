import React from 'react';
import { Download, Calendar, Filter, FileCheck, AlertOctagon } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Official HACCP Compliance & Audit Reports</h2>
          <p className="text-xs text-slate-400">Generate, verify, and export PDF/CSV logs for municipal health inspectors.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all">
          <Download className="w-4 h-4" />
          <span>Export Official Health Inspector Pack (PDF)</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">Date Range:</span>
          <select className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white">
            <option>Last 7 Days (Aug 1 - Aug 7)</option>
            <option>Last 30 Days</option>
            <option>Current Month to Date</option>
            <option>Custom Range</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 ml-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filter by Log Type:</span>
          <select className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white">
            <option>All CCP Logs (Temp, Hygiene, Receiving)</option>
            <option>Temperature Monitoring Only</option>
            <option>Corrective Action Log (CAPA)</option>
          </select>
        </div>
      </div>

      {/* Generated Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Weekly Cold Storage Audit Log</h3>
                <p className="text-xs text-slate-400">Downtown Bistro • Aug 01 - Aug 07</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
              Verified
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Contains 280 automated sensor readings and manual staff entries. 0 uncorrected breaches.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Digital Signature: SHA-256 Valid</span>
            <button className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
          </div>
        </div>

        <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Corrective Action Incident Log</h3>
                <p className="text-xs text-slate-400">Central Kitchen • Aug 04</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2 py-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
              Archived
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Recorded cooling deviation on Blast Chiller #1. Product disposed per HACCP Rule 6.2.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Signed by Head Chef David</span>
            <button className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
