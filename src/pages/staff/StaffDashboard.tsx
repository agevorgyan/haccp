import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Thermometer, 
  Sparkles, 
  PackageCheck, 
  Flame, 
  ChevronRight,
  Search
} from 'lucide-react';
import { MOCK_OPERATOR, MOCK_DAILY_LOGS } from '../../data/mockData';
import type { DailyLog, TaskStatus, TaskCategory, TemperatureSubmission } from '../../types/haccp';
import { TemperatureLogForm } from '../../components/staff/TemperatureLogForm';

/**
 * StaffDashboard Component
 * Core mobile interface for kitchen staff, line cooks, and food safety leads.
 * Displays shift greeting, progress metrics, task filters, and interactive HACCP log cards.
 */
export const StaffDashboard: React.FC = () => {
  const [logs, setLogs] = useState<DailyLog[]>(MOCK_DAILY_LOGS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'warning'>('all');
  const [activeFormLog, setActiveFormLog] = useState<DailyLog | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate shift metrics
  const totalTasks = logs.length;
  const completedCount = logs.filter((l) => l.status === 'completed').length;
  const warningCount = logs.filter((l) => l.status === 'warning').length;
  const pendingCount = logs.filter((l) => l.status === 'pending').length;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  // Filter logs based on tab selection & search
  const filteredLogs = logs.filter((log) => {
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'pending' && log.status === 'pending') ||
      (activeFilter === 'completed' && log.status === 'completed') ||
      (activeFilter === 'warning' && log.status === 'warning');

    const matchesSearch =
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.equipmentOrArea.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleOpenForm = (log: DailyLog) => {
    setActiveFormLog(log);
  };

  const handleCloseForm = () => {
    setActiveFormLog(null);
  };

  const handleLogSubmitted = (submission: TemperatureSubmission) => {
    setLogs((prevLogs) =>
      prevLogs.map((item) => {
        if (item.id === submission.logId) {
          return {
            ...item,
            status: submission.isWithinSafeZone ? 'completed' : 'warning',
            lastReading: {
              value: submission.temperature,
              recordedAt: `Today, ${submission.timestamp}`,
              recordedBy: submission.operatorName,
            },
          };
        }
        return item;
      })
    );

    setTimeout(() => {
      setActiveFormLog(null);
    }, 800);
  };

  // Helper to render Category Icon
  const renderCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'temperature':
        return <Thermometer className="w-5 h-5 text-sky-400" />;
      case 'hot-holding':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'hygiene':
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case 'receiving':
        return <PackageCheck className="w-5 h-5 text-indigo-400" />;
      default:
        return <Thermometer className="w-5 h-5 text-slate-400" />;
    }
  };

  // Helper to render Status Badge & Icon
  const renderStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            Breach Alert
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 select-none pb-8">
      {/* Temperature Form Modal Overlay */}
      {activeFormLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full animate-scale-up">
            <TemperatureLogForm
              log={activeFormLog}
              onSaveSuccess={handleLogSubmitted}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* Staff Greeting Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={MOCK_OPERATOR.avatarUrl}
                alt={MOCK_OPERATOR.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Welcome Back 👋</p>
              <h2 className="text-base font-extrabold text-white tracking-tight leading-snug">
                Chef {MOCK_OPERATOR.name}
              </h2>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
            AM Shift
          </span>
        </div>

        {/* Shift Compliance Progress Bar */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-slate-400 font-semibold">Shift Progress</span>
            <span className="font-extrabold text-emerald-400">
              {completedCount} of {totalTasks} Tasks ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex-1 min-w-[70px] py-2 px-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
            activeFilter === 'all'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({totalTasks})
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
            activeFilter === 'pending'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setActiveFilter('warning')}
          className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
            activeFilter === 'warning'
              ? 'bg-rose-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Alerts ({warningCount})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
            activeFilter === 'completed'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Done ({completedCount})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter equipment, fridge, or task..."
          className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
      </div>

      {/* Daily Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">All Checked Off!</p>
            <p className="text-xs text-slate-500 mt-1">No pending logs match your selected filter.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => handleOpenForm(log)}
              className={`p-4 rounded-3xl bg-white border shadow-sm transition-all transform active:scale-98 cursor-pointer ${
                log.status === 'warning'
                  ? 'border-rose-300 ring-2 ring-rose-500/20 bg-rose-50/20'
                  : log.status === 'completed'
                  ? 'border-slate-200/80 opacity-90'
                  : 'border-slate-200 hover:border-emerald-500/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    log.status === 'warning'
                      ? 'bg-rose-100 text-rose-600'
                      : log.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {renderCategoryIcon(log.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {log.title}
                      </h3>
                      {log.ccpCode && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                          {log.ccpCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {log.equipmentOrArea}
                    </p>
                  </div>
                </div>

                {renderStatusBadge(log.status)}
              </div>

              {/* Log Meta Details */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {log.safeRange && (
                  <span className="text-[11px] text-slate-500">
                    Target: <strong className="text-slate-700 font-semibold">{log.safeRange.min}{log.safeRange.unit} to {log.safeRange.max}{log.safeRange.unit}</strong>
                  </span>
                )}

                {log.lastReading ? (
                  <span className={`text-[11px] font-bold ${
                    log.status === 'warning' ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    Last: {log.lastReading.value}°C ({log.lastReading.recordedAt.split(',')[1] || log.lastReading.recordedAt})
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Due by {log.timeDue}
                  </span>
                )}

                <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                  <span>Log</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
