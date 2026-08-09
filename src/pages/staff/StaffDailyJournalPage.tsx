import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  journalsApi,
  LogEntryStatus,
  FormFieldType,
} from '../../services/journalsApi';
import type {
  LogTemplate,
  LogEntry,
} from '../../services/journalsApi';
import {
  ClipboardCheck,
  CheckCircle2,
  Lock,
  Send,
  AlertCircle,
  FileDiff,
  Camera,
  Thermometer,
} from 'lucide-react';

export const StaffDailyJournalPage: FC = () => {
  const [templates, setTemplates] = useState<LogTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LogTemplate | null>(null);
  const [entries, setEntries] = useState<LogEntry[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dynamic Form Values
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Correction Request Modal Form
  const [correctingEntry, setCorrectingEntry] = useState<LogEntry | null>(null);
  const [correctionReason, setCorrectionReason] = useState('');
  const [proposedDataText, setProposedDataText] = useState('');

  const fetchData = async () => {
    try {
      setError(null);
      const [fetchedTemplates, fetchedEntries] = await Promise.all([
        journalsApi.getLogTemplates(),
        journalsApi.getLogEntries(),
      ]);
      setTemplates(fetchedTemplates);
      setEntries(fetchedEntries);
      if (fetchedTemplates.length > 0 && !selectedTemplate) {
        setSelectedTemplate(fetchedTemplates[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load daily log data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (fieldId: string, val: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleSubmitJournal = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    try {
      setError(null);
      setSuccessMsg(null);

      await journalsApi.createLogEntry({
        templateId: selectedTemplate.id,
        data: formData,
        status: LogEntryStatus.SUBMITTED,
      });

      setSuccessMsg('Journal log entry submitted successfully! Audit log recorded.');
      setFormData({});
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit journal entry');
    }
  };

  const handleOpenCorrection = (entry: LogEntry) => {
    setCorrectingEntry(entry);
    setCorrectionReason('');
    setProposedDataText(JSON.stringify(entry.data, null, 2));
  };

  const handleSubmitCorrectionRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!correctingEntry) return;

    try {
      const parsedProposed = JSON.parse(proposedDataText);
      await journalsApi.createCorrectionRequest({
        logEntryId: correctingEntry.id,
        reason: correctionReason,
        proposedData: parsedProposed,
      });
      alert('Correction request submitted to managers for review!');
      setCorrectingEntry(null);
    } catch (err: any) {
      alert('Invalid JSON proposed data payload or submission error.');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Mobile Header */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Staff Daily Compliance Journal</h1>
            <p className="text-xs text-slate-400">Record CCP parameters and sanitation execution logs.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Template Selector Pills */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Select Active Journal Template ({templates.length})
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => {
                setSelectedTemplate(tpl);
                setFormData({});
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                selectedTemplate?.id === tpl.id
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
              }`}
            >
              {tpl.name} (v{tpl.version})
            </button>
          ))}
        </div>
      </div>

      {/* DYNAMIC FORM EXECUTION PANEL */}
      {selectedTemplate ? (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">{selectedTemplate.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{selectedTemplate.description || 'Fill out mandatory compliance observations below.'}</p>
          </div>

          <form onSubmit={handleSubmitJournal} className="space-y-5 text-xs">
            {selectedTemplate.fields?.map((field) => (
              <div key={field.id} className="space-y-1.5 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                    {field.type === FormFieldType.TEMPERATURE && <Thermometer className="w-4 h-4 text-cyan-400" />}
                    {field.type === FormFieldType.PHOTO && <Camera className="w-4 h-4 text-emerald-400" />}
                    {field.label}
                    {field.required && <span className="text-red-400 font-bold">*</span>}
                  </label>
                  {field.unit && <span className="text-[10px] text-slate-500 font-bold uppercase">{field.unit}</span>}
                </div>

                {/* TEMPERATURE / NUMBER INPUT */}
                {(field.type === FormFieldType.TEMPERATURE || field.type === FormFieldType.NUMBER) && (
                  <input
                    type="number"
                    step="0.1"
                    required={field.required}
                    placeholder={field.unit ? `Enter numeric value (${field.unit})` : 'Enter numeric value'}
                    value={formData[field.id] ?? ''}
                    onChange={(e) => handleInputChange(field.id, parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                )}

                {/* PHOTO INPUT */}
                {field.type === FormFieldType.PHOTO && (
                  <input
                    type="text"
                    required={field.required}
                    placeholder="Paste photo evidence URL..."
                    value={formData[field.id] ?? ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                )}

                {/* TEXT / SIGNATURE INPUT */}
                {(field.type === FormFieldType.TEXT || field.type === FormFieldType.SIGNATURE) && (
                  <input
                    type="text"
                    required={field.required}
                    placeholder="Enter observation notes / signature..."
                    value={formData[field.id] ?? ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                )}

                {/* BOOLEAN TOGGLE */}
                {field.type === FormFieldType.BOOLEAN && (
                  <label className="flex items-center gap-2 cursor-pointer pt-1 text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData[field.id] || false}
                      onChange={(e) => handleInputChange(field.id, e.target.checked)}
                      className="w-4 h-4 rounded border-slate-800 text-emerald-600 focus:ring-emerald-500"
                    />
                    Pass / Compliant
                  </label>
                )}

                {/* SELECT DROPDOWN */}
                {field.type === FormFieldType.SELECT && (
                  <select
                    required={field.required}
                    value={formData[field.id] ?? ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">-- Select Option --</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg shadow-emerald-600/20"
            >
              <Send className="w-4 h-4" />
              Submit Journal Record to Compliance Log
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
          No log templates available. Contact kitchen management to create an active log template.
        </div>
      )}

      {/* RECENTLY SUBMITTED IMMUTABLE LOG ENTRIES */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Submitted Immutable Records ({entries.length})
        </h3>

        {entries.length === 0 ? (
          <div className="bg-slate-950 p-6 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
            No journal entries submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">{entry.template?.name || 'Compliance Log Entry'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      v{entry.templateVersion}
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {entry.status}
                  </span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 text-xs font-mono">
                  <pre className="text-slate-300 whitespace-pre-wrap">
                    {JSON.stringify(entry.data, null, 2)}
                  </pre>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Submitted: {new Date(entry.createdAt).toLocaleString()}</span>
                  <button
                    onClick={() => handleOpenCorrection(entry)}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    <FileDiff className="w-3.5 h-3.5" /> Request Historical Correction
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CORRECTION REQUEST MODAL FOR STAFF */}
      {correctingEntry && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Submit Historical Correction Request</h3>
            <p className="text-slate-400 text-xs">
              Submitted log entries are immutable compliance records. Direct edits are prohibited. Submitting a correction request requires manager review and approval.
            </p>

            <form onSubmit={handleSubmitCorrectionRequest} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Reason for Correction</label>
                <textarea
                  required
                  placeholder="e.g. Typo in probe temperature reading (meant 3.2°C instead of 32°C)"
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white h-20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Proposed Corrected Data (JSON)</label>
                <textarea
                  required
                  value={proposedDataText}
                  onChange={(e) => setProposedDataText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-emerald-400 h-28"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCorrectingEntry(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-amber-600 text-white hover:bg-amber-500"
                >
                  Submit Request to Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDailyJournalPage;
