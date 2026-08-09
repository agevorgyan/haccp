import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { analyticsApi } from '../../services/analyticsApi';
import type { AnalyticsOverview, DailyTrendItem } from '../../services/analyticsApi';
import { PageHeader } from '../../components/common/PageHeader';
import {
  TrendingUp,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Calendar,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  RefreshCw,
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
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const maxLogs = Math.max(...trends.map((t) => t.logsCount), 1);

  return (
    <div className="space-y-6">
      {/* Reusable PageHeader Component */}
      <PageHeader
        title="Executive Analytics & Oversight"
        subtitle="Real-time compliance aggregation engine, 30-day health index, and 14-day trend analytics."
        icon={BarChart3}
        badge="ENTERPRISE HQ"
        actions={
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        }
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-700 flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* METRIC CARDS GRID */}
      {loading ? (
        <div className="text-xs font-medium text-slate-500 p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          Calculating real-time executive metrics...
        </div>
      ) : overview ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* CARD 1: Overall Compliance Score */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                30-Day Compliance Score
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold px-3 py-1 rounded-xl border ${getScoreColor(overview.complianceScore)}`}>
                {overview.complianceScore}%
              </span>
              <span className="text-xs text-slate-500 font-semibold">Target: ≥95%</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Based on <strong className="text-slate-800">{overview.totalLogs30d}</strong> submissions and <strong className="text-slate-800">{overview.violations30d}</strong> deviations.
            </p>
          </div>

          {/* CARD 2: Open Violations */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Open CCP Violations
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="my-3 text-3xl font-extrabold text-slate-900">
              {overview.openViolationsCount}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
              <span className="bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-bold">
                Crit: {overview.openViolationsBySeverity.CRITICAL}
              </span>
              <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                High: {overview.openViolationsBySeverity.HIGH}
              </span>
              <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-md font-bold">
                Med: {overview.openViolationsBySeverity.MEDIUM}
              </span>
            </div>
          </div>

          {/* CARD 3: Active CAPAs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active CAPAs (Actions)
              </span>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="my-3 text-3xl font-extrabold text-slate-900">
              {overview.activeCapasCount}
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Corrective action tickets currently in progress or awaiting manager verification.
            </p>
          </div>

          {/* CARD 4: Log Volume */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                30-Day Submissions
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="my-3 text-3xl font-extrabold text-slate-900">
              {overview.totalLogs30d}
            </div>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Audit trail logging active
            </p>
          </div>
        </div>
      ) : null}

      {/* 14-DAY VISUAL TREND CHART */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              14-Day Activity & Deviation Trends
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Daily comparison of compliant log submissions (emerald) vs CCP violation detections (red).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>Log Submissions</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span>Violations</span>
            </div>
          </div>
        </div>

        {trends.length === 0 ? (
          <div className="text-xs text-slate-400 p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
            No trend data recorded for the last 14 days.
          </div>
        ) : (
          <div className="pt-4 overflow-x-auto">
            <div className="min-w-[600px] h-52 flex items-end justify-between gap-2 border-b border-slate-200 pb-2 px-2">
              {trends.map((item, idx) => {
                const logsHeight = Math.max((item.logsCount / maxLogs) * 100, 8);
                const violationsHeight = Math.min((item.violationsCount / maxLogs) * 100, 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      {/* Submissions Bar */}
                      <div
                        style={{ height: `${logsHeight}%` }}
                        className="w-3.5 bg-emerald-500 rounded-t-md transition-all group-hover:bg-emerald-600 relative"
                        title={`${item.date}: ${item.logsCount} logs`}
                      />
                      {/* Violations Bar */}
                      {item.violationsCount > 0 && (
                        <div
                          style={{ height: `${violationsHeight}%` }}
                          className="w-3.5 bg-rose-500 rounded-t-md transition-all group-hover:bg-rose-600 relative"
                          title={`${item.date}: ${item.violationsCount} violations`}
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold truncate w-full text-center">
                      {item.date.split('-').slice(1).join('/')}
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
