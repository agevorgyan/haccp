import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Download, 
  Clock, 
  AlertCircle, 
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { 
  MOCK_SUMMARY_STATS, 
  MOCK_CRITICAL_VIOLATIONS, 
  MOCK_TEMP_TRENDS, 
  MOCK_BRANCH_PERFORMANCE,
} from '../../data/managerMockData';
import { authService } from '../../services/authService';
import { MultiChannelNotificationSettingsCard } from '../../components/common/MultiChannelNotificationSettingsCard';
import type { CriticalViolation } from '../../data/managerMockData';

/**
 * ManagerDashboard Component
 */
export const ManagerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [violations, setViolations] = useState<CriticalViolation[]>(MOCK_CRITICAL_VIOLATIONS);

  const currentUser = authService.getCurrentUser();
  const displayName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.phone || 'Manager'
    : 'Manager';

  // Handle status toggle for demonstration
  const handleResolveViolation = (id: string) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'Resolved' as const } : v))
    );
  };

  // Status badge styling helper
  const renderViolationStatusBadge = (status: CriticalViolation['status']) => {
    switch (status) {
      case 'Open':
        return (
          <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Open
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            In Progress
          </span>
        );
      case 'Resolved':
      default:
        return (
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Resolved
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 antialiased">
      {/* Desktop Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-950/60 p-6 rounded-3xl border border-slate-800/80 shadow-sm backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              {t('manager.dashboardTitle', 'Executive Operations Oversight')}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
            Welcome, {displayName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('manager.dashboardSub', 'Real-time compliance monitoring, CCP limit violations, and temperature telemetry.')}
          </p>
        </div>

        {/* Timeframe & Export Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all">
            <Download className="w-4 h-4" />
            <span>{t('common.exportPdf')}</span>
          </button>
        </div>
      </div>

      {/* Multi-Channel Push, Email & Telegram Alert Settings Card */}
      <MultiChannelNotificationSettingsCard />

      {/* Summary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Overall Compliance Score */}
        <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800/80 shadow-sm hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('manager.metrics.overallCompliance')}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {MOCK_SUMMARY_STATS.totalBranches}
            </span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              100% Operational
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">All locations sending telemetry</p>
        </div>

        {/* KPI 2: Today's Log Completion Rate */}
        <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800/80 shadow-sm hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Log Completion (Today)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {MOCK_SUMMARY_STATS.logCompletionRate}%
            </span>
            <span className="text-xs font-bold text-teal-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +{MOCK_SUMMARY_STATS.completionTrendChange}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">170 of 176 daily logs recorded</p>
        </div>

        {/* KPI 3: Open Critical Violations */}
        <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800/80 shadow-sm hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Open Critical Violations
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-4xl font-extrabold text-rose-400 tracking-tight">
              {MOCK_SUMMARY_STATS.openViolations}
            </span>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              CAPA Action Needed
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">2 temperature breaches • 1 hygiene</p>
        </div>

        {/* KPI 4: Audit Readiness Score */}
        <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800/80 shadow-sm hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Audit Readiness Score
            </span>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {MOCK_SUMMARY_STATS.auditReadinessScore}%
            </span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Grade A Compliant
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Based on FDA Food Code standard</p>
        </div>
      </div>

      {/* Main Content Area (Desktop Grid: Chart Col 1-2, Violations Col 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1-2: Recharts Temperature Trend Chart */}
        <div className="lg:col-span-2 bg-slate-950/80 p-6 rounded-3xl border border-slate-800/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  7-Day Cold Storage Temperature Telemetry (°C)
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  Live Sensor Feed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparative walk-in fridge logs against HACCP safe zone threshold (+2.0°C to +6.0°C).
              </p>
            </div>

            {/* Custom Chart Legend Badges */}
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-3 h-1 bg-emerald-400 rounded-full"></span> Downtown
              </span>
              <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <span className="w-3 h-1 bg-sky-400 rounded-full"></span> Uptown
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-3 h-1 bg-amber-400 rounded-full"></span> Central Kitchen
              </span>
            </div>
          </div>

          {/* Recharts Canvas */}
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={MOCK_TEMP_TRENDS}
                margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="day" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 10]} 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  unit="°C"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                  itemStyle={{ padding: '2px 0' }}
                />

                {/* Safe Zone Threshold Lines */}
                <ReferenceLine 
                  y={2.0} 
                  stroke="#22c55e" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5}
                  label={{ value: 'Min Safe (+2.0°C)', fill: '#22c55e', fontSize: 10, position: 'insideBottomRight' }} 
                />
                <ReferenceLine 
                  y={6.0} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5}
                  label={{ value: 'Max Safe (+6.0°C)', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} 
                />

                {/* Branch Temperature Lines */}
                <Line
                  type="monotone"
                  dataKey="downtownBistro"
                  name="Downtown Bistro"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="uptownBakery"
                  name="Uptown Bakery"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#0284c7' }}
                />
                <Line
                  type="monotone"
                  dataKey="centralKitchen"
                  name="Central Kitchen"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Aug 04 Spike: Downtown Bistro recorded 7.8°C breach. Thermostat recalibrated.</span>
            </span>
            <button className="text-emerald-400 hover:underline font-semibold shrink-0">
              View Sensor Logs
            </button>
          </div>
        </div>

        {/* Col 3: Recent Critical Violations Table */}
        <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800/80 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Critical Violations Log
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                CCP deviations requiring supervisor approval.
              </p>
            </div>
            <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-full">
              {violations.filter((v) => v.status !== 'Resolved').length} Active
            </span>
          </div>

          {/* Compact Violations List */}
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] pr-1">
            {violations.map((violation) => (
              <div
                key={violation.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {violation.ccpCode}
                    </span>
                    <h3 className="text-xs font-bold text-white mt-1.5">
                      {violation.branchName}
                    </h3>
                  </div>
                  {renderViolationStatusBadge(violation.status)}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {violation.issue}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {violation.date}, {violation.time}
                  </span>

                  {violation.status !== 'Resolved' ? (
                    <button
                      onClick={() => handleResolveViolation(violation.id)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
                    >
                      Sign Off CAPA
                    </button>
                  ) : (
                    <span className="text-slate-500 font-semibold">
                      Signed by {violation.assignedTo}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Location Branch Compliance Leaderboard */}
      <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Branch Compliance Leaderboard & Audit Readiness
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time daily logging completion rates and active sensor alerts per venue.
            </p>
          </div>
          <button className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
            <span>Manage All Venues</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Branch Name</th>
                <th className="px-4 py-3 font-semibold">District</th>
                <th className="px-4 py-3 font-semibold">Shift Log Progress</th>
                <th className="px-4 py-3 font-semibold">Compliance Rate</th>
                <th className="px-4 py-3 font-semibold">Active Alerts</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {MOCK_BRANCH_PERFORMANCE.map((branch) => (
                <tr key={branch.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-white">
                    {branch.name}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    {branch.city}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(branch.completedToday / branch.totalToday) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-slate-200">
                        {branch.completedToday}/{branch.totalToday}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-extrabold text-emerald-400">
                    {branch.complianceScore}%
                  </td>
                  <td className="px-4 py-3.5">
                    {branch.activeAlerts > 0 ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {branch.activeAlerts} Alert
                      </span>
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                      branch.status === 'Compliant'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : branch.status === 'Warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {branch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
