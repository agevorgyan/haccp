import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  complianceApi,
  ViolationSeverity,
  CapaStatus,
} from '../../services/complianceApi';
import type {
  Violation,
  CorrectiveAction,
} from '../../services/complianceApi';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  ShieldAlert,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

export const ComplianceDashboardPage: FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [capas, setCapas] = useState<CorrectiveAction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Forms
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [isCapaModalOpen, setIsCapaModalOpen] = useState<boolean>(false);

  const [capaForm, setCapaForm] = useState({
    description: '',
    rootCause: '',
    immediateAction: '',
    preventiveAction: '',
    assignedTo: '00000000-0000-0000-0000-000000000000',
    deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedViolations, fetchedCapas] = await Promise.all([
        complianceApi.getViolations(),
        complianceApi.getCapas(),
      ]);
      setViolations(fetchedViolations);
      setCapas(fetchedCapas);
    } catch (err: any) {
      setError(err.message || 'Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCapa = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedViolation) return;

    try {
      await complianceApi.createCapa({
        violationId: selectedViolation.id,
        ...capaForm,
      });

      setIsCapaModalOpen(false);
      setSelectedViolation(null);
      setCapaForm({
        description: '',
        rootCause: '',
        immediateAction: '',
        preventiveAction: '',
        assignedTo: '00000000-0000-0000-0000-000000000000',
        deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create CAPA');
    }
  };

  const handleUpdateCapaStatus = async (capaId: string, nextStatus: CapaStatus) => {
    try {
      await complianceApi.updateCapaStatus(capaId, nextStatus);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update CAPA status');
    }
  };

  const getSeverityBadge = (severity: ViolationSeverity) => {
    switch (severity) {
      case ViolationSeverity.CRITICAL:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case ViolationSeverity.HIGH:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case ViolationSeverity.MEDIUM:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getCapaStatusBadge = (status: CapaStatus) => {
    switch (status) {
      case CapaStatus.RESOLVED:
      case CapaStatus.CLOSED:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case CapaStatus.IN_PROGRESS:
      case CapaStatus.VERIFICATION:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Compliance & CAPA Engine</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated violation detection against CCP limits and Corrective and Preventive Actions (CAPA) workflow.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Violations & Active CAPAs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL: Automated Violations */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Automated CCP Violations ({violations.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-xs text-slate-500 p-8 text-center">Loading violations...</div>
          ) : violations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No violations detected. All CCP limits are within compliant ranges.
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((v) => (
                <div
                  key={v.id}
                  className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getSeverityBadge(
                        v.severity,
                      )}`}
                    >
                      {v.severity} VIOLATION
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(v.detectedAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-white">{v.rule}</p>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Actual Value</span>
                      <span className="text-red-400 font-bold">{v.actualValue}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Expected Threshold</span>
                      <span className="text-emerald-400 font-bold">{v.expectedValue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">
                      Status: <strong className="text-white uppercase">{v.status}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedViolation(v);
                        setIsCapaModalOpen(true);
                      }}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Initiate CAPA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: CAPA Lifecycle Workflow Cockpit */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Corrective Actions (CAPAs) ({capas.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-xs text-slate-500 p-8 text-center">Loading CAPAs...</div>
          ) : capas.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No Corrective and Preventive Actions active.
            </div>
          ) : (
            <div className="space-y-4">
              {capas.map((capa) => (
                <div
                  key={capa.id}
                  className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCapaStatusBadge(
                        capa.status,
                      )}`}
                    >
                      CAPA Status: {capa.status}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Due: {capa.deadline?.split('T')[0]}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white">{capa.description}</p>

                  <div className="space-y-1.5 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/60 text-slate-300">
                    <div>
                      <strong className="text-slate-500 uppercase text-[10px] block">Immediate Action Taken:</strong>
                      <span>{capa.immediateAction}</span>
                    </div>
                    <div>
                      <strong className="text-slate-500 uppercase text-[10px] block">Preventive Action Plan:</strong>
                      <span>{capa.preventiveAction}</span>
                    </div>
                  </div>

                  {/* CAPA Lifecycle State Transition Buttons */}
                  <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/80">
                    {capa.status === CapaStatus.OPEN && (
                      <button
                        onClick={() => handleUpdateCapaStatus(capa.id, CapaStatus.IN_PROGRESS)}
                        className="bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-semibold px-3 py-1 rounded-lg transition"
                      >
                        Start Action (IN_PROGRESS)
                      </button>
                    )}
                    {capa.status === CapaStatus.IN_PROGRESS && (
                      <button
                        onClick={() => handleUpdateCapaStatus(capa.id, CapaStatus.PENDING_REVIEW)}
                        className="bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600/30 text-xs font-semibold px-3 py-1 rounded-lg transition"
                      >
                        Submit for Review (PENDING_REVIEW)
                      </button>
                    )}
                    {capa.status === CapaStatus.PENDING_REVIEW && (
                      <button
                        onClick={() => handleUpdateCapaStatus(capa.id, CapaStatus.VERIFICATION)}
                        className="bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 text-xs font-semibold px-3 py-1 rounded-lg transition"
                      >
                        Verify (VERIFICATION)
                      </button>
                    )}
                    {capa.status === CapaStatus.VERIFICATION && (
                      <button
                        onClick={() => handleUpdateCapaStatus(capa.id, CapaStatus.CLOSED)}
                        className="bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold px-3 py-1 rounded-lg transition"
                      >
                        Close & Resolve (CLOSED)
                      </button>
                    )}
                    {capa.status === CapaStatus.CLOSED && (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> CAPA Closed & Violation Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE CAPA MODAL */}
      {isCapaModalOpen && selectedViolation && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Initiate Corrective Action (CAPA)</h3>
            <p className="text-slate-400">
              Violated Rule: <strong className="text-red-400">{selectedViolation.rule}</strong>
            </p>

            <form onSubmit={handleCreateCapa} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">CAPA Description</label>
                <textarea
                  required
                  placeholder="e.g. Cold storage compressor failure maintenance protocol"
                  value={capaForm.description}
                  onChange={(e) => setCapaForm({ ...capaForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white h-16"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Immediate Action Taken</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Moved raw ingredients to backup walk-in freezer"
                  value={capaForm.immediateAction}
                  onChange={(e) => setCapaForm({ ...capaForm, immediateAction: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Preventive Action Plan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule bi-weekly HVAC technician maintenance"
                  value={capaForm.preventiveAction}
                  onChange={(e) => setCapaForm({ ...capaForm, preventiveAction: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Completion Deadline</label>
                  <input
                    type="date"
                    required
                    value={capaForm.deadline}
                    onChange={(e) => setCapaForm({ ...capaForm, deadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCapaModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Save & Assign CAPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceDashboardPage;
