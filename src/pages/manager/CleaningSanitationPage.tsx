import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  operationsApi,
  CleaningFrequency,
  CleaningTaskStatus,
} from '../../services/operationsApi';
import type { CleaningTask } from '../../services/operationsApi';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  Camera,
  CheckSquare,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

export const CleaningSanitationPage: FC = () => {
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [completingTask, setCompletingTask] = useState<CleaningTask | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  // Task Form
  const [taskForm, setTaskForm] = useState({
    area: 'Kitchen Floor & Prep Counters',
    equipment: 'Stainless Steel Prep Station',
    chemical: 'Quaternary Ammonium Sanitizer (200 PPM)',
    concentration: '200 PPM',
    frequency: CleaningFrequency.DAILY as CleaningFrequency,
    method: 'Spray chemical sanitizer solution, let sit for 60s air dry.',
    responsibleRole: 'Line Cook / Kitchen Staff',
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await operationsApi.getCleaningTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load cleaning tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await operationsApi.createCleaningTask(taskForm);
      setIsTaskModalOpen(false);
      await fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to create cleaning task');
    }
  };

  const handleCompleteTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!completingTask) return;

    try {
      await operationsApi.completeCleaningTask(completingTask.id, photoUrl, completionNotes);
      setCompletingTask(null);
      setPhotoUrl('');
      setCompletionNotes('');
      await fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to mark task complete');
    }
  };

  const handleVerifyTask = async (taskId: string) => {
    try {
      await operationsApi.verifyCleaningTask(taskId, 'Verified by Kitchen Manager');
      await fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to verify cleaning task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this cleaning task?')) return;
    try {
      await operationsApi.deleteCleaningTask(taskId);
      await fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to delete cleaning task');
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === CleaningTaskStatus.PENDING);
  const completedTasks = tasks.filter((t) => t.status === CleaningTaskStatus.COMPLETED);
  const verifiedTasks = tasks.filter((t) => t.status === CleaningTaskStatus.VERIFIED);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Cleaning & Sanitation Protocols</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track sanitation task completion with photo evidence and manager verification logs.
          </p>
        </div>
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          Add Cleaning Task
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Staff Task Execution vs Manager Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL: Pending Staff Cleaning Tasks */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Pending Staff Tasks ({pendingTasks.length})
          </h2>

          {loading ? (
            <div className="text-xs text-slate-500 p-8 text-center">Loading cleaning tasks...</div>
          ) : pendingTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              All sanitation tasks for this shift are completed!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{t.area}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {t.frequency}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">{t.method}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Sanitizing Chemical</span>
                      <span className="font-semibold text-cyan-400">{t.chemical}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Target Role</span>
                      <span>{t.responsibleRole}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setCompletingTask(t);
                        setPhotoUrl('');
                        setCompletionNotes('');
                      }}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      <Camera className="w-4 h-4" /> Complete Task (Upload Photo)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Completed Tasks Awaiting Manager Verification */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Manager Verification Cockpit ({completedTasks.length} Awaiting, {verifiedTasks.length} Verified)
          </h2>

          {loading ? (
            <div className="text-xs text-slate-500 p-8 text-center">Loading completed tasks...</div>
          ) : completedTasks.length === 0 && verifiedTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No completed cleaning tasks awaiting manager verification.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Completed Tasks Awaiting Verification */}
              {completedTasks.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{t.area}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      COMPLETED
                    </span>
                  </div>

                  {t.photoUrl && (
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 flex items-center gap-2 text-xs text-emerald-400 truncate font-mono">
                      <ImageIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{t.photoUrl}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Completed At: {t.completedAt ? new Date(t.completedAt).toLocaleString() : 'N/A'}
                    </span>
                    <button
                      onClick={() => handleVerifyTask(t.id)}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Verify Task
                    </button>
                  </div>
                </div>
              ))}

              {/* Already Verified Tasks */}
              {verifiedTasks.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-300">{t.area}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    VERIFIED
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Create Sanitation Protocol</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Target Area / Equipment</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kitchen Floor & Drain Grates"
                  value={taskForm.area}
                  onChange={(e) => setTaskForm({ ...taskForm, area: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Sanitizing Chemical & Concentration</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chlorine Bleach Solution (100 PPM)"
                  value={taskForm.chemical}
                  onChange={(e) => setTaskForm({ ...taskForm, chemical: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Frequency</label>
                <select
                  value={taskForm.frequency}
                  onChange={(e) => setTaskForm({ ...taskForm, frequency: e.target.value as CleaningFrequency })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value={CleaningFrequency.DAILY}>DAILY</option>
                  <option value={CleaningFrequency.PER_SHIFT}>PER_SHIFT</option>
                  <option value={CleaningFrequency.HOURLY}>HOURLY</option>
                  <option value={CleaningFrequency.WEEKLY}>WEEKLY</option>
                  <option value={CleaningFrequency.MONTHLY}>MONTHLY</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Cleaning Method Steps</label>
                <textarea
                  required
                  placeholder="Scrub surface with degreaser, rinse with potable water..."
                  value={taskForm.method}
                  onChange={(e) => setTaskForm({ ...taskForm, method: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white h-20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Save Task Protocol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE TASK MODAL (STAFF PHOTO UPLOAD) */}
      {completingTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Complete Sanitation Task</h3>
            <p className="text-slate-400">
              Task: <strong className="text-white">{completingTask.area}</strong>
            </p>

            <form onSubmit={handleCompleteTask} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Photo Evidence URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://storage.haccp.com/photos/clean_123.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Execution Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Sanitizer concentration verified 200 PPM"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCompletingTask(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Submit Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleaningSanitationPage;
