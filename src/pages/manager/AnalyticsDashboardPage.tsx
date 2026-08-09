import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { analyticsApi } from '../../services/analyticsApi';
import type { AnalyticsOverview, DailyTrendItem } from '../../services/analyticsApi';
import {
  TrendingUp,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Activity,
  Calendar,
  AlertCircle,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export const AnalyticsDashboardPage: FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<DailyTrendItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [overviewData, trendsData] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getTrends(),
      ]);
      setOverview(overviewData);
      setTrends(trendsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 75) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  const maxLogs = Math.max(...trends.map((t) => t.logsCount), 1);

  return (
    <div className="p-6 space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Executive Analytics & Oversight</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time compliance aggregation engine, 30-day health index, and 14-day trend analytics.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition"
        >
          <Activity className="w-4 h-4 text-emerald-400" /> Refresh Data
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* METRIC CARDS GRID */}
      {loading ? (
        <div className="text-xs text-slate-500 p-12 text-center bg-slate-950 rounded-2xl border border-slate-800">
          Calculating real-time executive metrics...
        </div>
      ) : overview ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* CARD 1: Overall Compliance Score */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">30-Day Compliance Score</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-mono px-3 py-1 rounded-xl border ${getScoreColor(overview.complianceScore)}`}>
                {overview.complianceScore}%
              </span>
              <span className="text-[11px] text-slate-500">Target: ≥95%</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Based on {overview.totalLogs30d} logs and {overview.violations30d} deviations over 30 days.
            </p>
          </div>

          {/* CARD 2: Open Violations */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Open CCP Violations</span>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {overview.openViolationsCount}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-bold">
                Crit: {overview.openViolationsBySeverity.CRITICAL}
              </span>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                High: {overview.openViolationsBySeverity.HIGH}
              </span>
              <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded font-bold">
                Med: {overview.openViolationsBySeverity.MEDIUM}
              </span>
            </div>
          </div>

          {/* CARD 3: Active CAPAs */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Active CAPAs (Actions)</span>
              <FileCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {overview.activeCapasCount}
            </div>
            <p className="text-[11px] text-slate-400">
              Corrective and preventive actions currently in progress or awaiting verification.
            </p>
          </div>

          {/* CARD 4: Log Volume */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">30-Day Submissions</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {overview.totalLogs30d}
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Audit trail compliance rate
            </p>
          </div>
        </div>
      ) : null}

      {/* 14-DAY VISUAL TREND CHART */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              14-Day Activity & Deviation Trends
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Daily comparison of compliant log submissions (emerald) vs CCP violation detections (red).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              <span>Log Submissions</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-400">
              <span className="w-3 h-3 rounded bg-red-500 inline-block" />
              <span>Violations</span>
            </div>
          </div>
        </div>

        {trends.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No trend data available for the last 14 days.</div>
        ) : (
          <div className="space-y-3 pt-2">
            {/* Visual Bar Chart Grid */}
            <div className="grid grid-cols-14 gap-2 h-44 items-end bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              {trends.map((item, idx) => {
                const logHeight = Math.max(12, Math.round((item.logsCount / maxLogs) * 100));
                const violHeight = Math.max(8, Math.round((item.violationsCount / maxLogs) * 100));

                return (
                  <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end group relative">
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-900 border border-slate-700 text-white text-[10px] p-2 rounded-lg z-20 whitespace-nowrap shadow-xl">
                      <span className="font-bold border-b border-slate-800 pb-1 mb-1">{item.date}</span>
                      <span>Logs: <strong>{item.logsCount}</strong></span>
                      <span>Violations: <strong className="text-red-400">{item.violationsCount}</strong></span>
                      <span>Rate: <strong className="text-emerald-400">{item.complianceRate}%</strong></span>
                    </div>

                    <div className="flex items-end gap-1 w-full justify-center">
                      {/* Log Bar */}
                      <div
                        style={{ height: `${logHeight}%` }}
                        className="w-2.5 bg-emerald-500 rounded-t transition-all group-hover:bg-emerald-400"
                      />
                      {/* Violation Bar */}
                      {item.violationsCount > 0 && (
                        <div
                          style={{ height: `${violHeight}%` }}
                          className="w-2.5 bg-red-500 rounded-t transition-all group-hover:bg-red-400"
                        />
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono truncate w-full text-center">
                      {item.date.split('-')[2]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
