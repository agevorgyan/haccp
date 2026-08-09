import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  journalsApi,
  LogTemplateStatus,
  FormFieldType,
} from '../../services/journalsApi';
import type {
  LogTemplate,
  FormFieldSchema,
} from '../../services/journalsApi';
import { haccpApi } from '../../services/haccpApi';
import type { Ccp } from '../../services/haccpApi';
import {
  Plus,
  FileSpreadsheet,
  Trash2,
  GitBranch,
  Layers,
  AlertCircle,
  PlusCircle,
  Thermometer,
  Camera,
  Type,
  Hash,
  ToggleLeft,
  CheckSquare,
  PenTool,
} from 'lucide-react';

export const LogTemplatesAdminPage: FC = () => {
  const [templates, setTemplates] = useState<LogTemplate[]>([]);
  const [ccps, setCcps] = useState<Ccp[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Drawer
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LogTemplate | null>(null);

  // Form State
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    ccpId: '',
    status: LogTemplateStatus.ACTIVE as LogTemplateStatus,
  });

  const [fields, setFields] = useState<FormFieldSchema[]>([
    {
      id: 'temp_1',
      type: FormFieldType.TEMPERATURE,
      label: 'Cold Storage Probe Temperature',
      required: true,
      unit: '°C',
      max: 5,
    },
    {
      id: 'photo_1',
      type: FormFieldType.PHOTO,
      label: 'Cleanliness Photo Evidence',
      required: false,
    },
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedTemplates, fetchedCcps] = await Promise.all([
        journalsApi.getLogTemplates(),
        haccpApi.getCcps(),
      ]);
      setTemplates(fetchedTemplates);
      setCcps(fetchedCcps);
    } catch (err: any) {
      setError(err.message || 'Failed to load log templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddField = () => {
    const newField: FormFieldSchema = {
      id: `field_${Date.now()}`,
      type: FormFieldType.TEXT,
      label: 'New Form Field',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (index: number, updated: Partial<FormFieldSchema>) => {
    const nextFields = [...fields];
    nextFields[index] = { ...nextFields[index], ...updated };
    setFields(nextFields);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmitTemplate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (selectedTemplate && selectedTemplate.status === LogTemplateStatus.ACTIVE) {
        // Active template branching: updates create a new version record
        await journalsApi.updateLogTemplate(selectedTemplate.id, {
          name: templateForm.name,
          description: templateForm.description,
          ccpId: templateForm.ccpId || undefined,
          fields,
        });
      } else if (selectedTemplate) {
        await journalsApi.updateLogTemplate(selectedTemplate.id, {
          name: templateForm.name,
          description: templateForm.description,
          ccpId: templateForm.ccpId || undefined,
          fields,
        });
      } else {
        await journalsApi.createLogTemplate({
          name: templateForm.name,
          description: templateForm.description,
          ccpId: templateForm.ccpId || undefined,
          fields,
          status: templateForm.status,
        });
      }

      setIsModalOpen(false);
      setSelectedTemplate(null);
      setTemplateForm({ name: '', description: '', ccpId: '', status: LogTemplateStatus.ACTIVE });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save log template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this log template?')) return;
    try {
      await journalsApi.deleteLogTemplate(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete template');
    }
  };

  const getFieldTypeIcon = (type: FormFieldType) => {
    switch (type) {
      case FormFieldType.TEMPERATURE:
        return <Thermometer className="w-4 h-4 text-cyan-400" />;
      case FormFieldType.PHOTO:
        return <Camera className="w-4 h-4 text-emerald-400" />;
      case FormFieldType.TEXT:
        return <Type className="w-4 h-4 text-amber-400" />;
      case FormFieldType.NUMBER:
        return <Hash className="w-4 h-4 text-purple-400" />;
      case FormFieldType.BOOLEAN:
        return <ToggleLeft className="w-4 h-4 text-blue-400" />;
      case FormFieldType.SELECT:
        return <CheckSquare className="w-4 h-4 text-teal-400" />;
      case FormFieldType.SIGNATURE:
        return <PenTool className="w-4 h-4 text-pink-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Dynamic Log Templates Engine</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Build custom digital journal templates, map schema fields to CCP limits, and manage versioning.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedTemplate(null);
            setTemplateForm({ name: '', description: '', ccpId: '', status: LogTemplateStatus.ACTIVE });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          Create Log Template
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Templates Grid */}
      {loading ? (
        <div className="text-xs text-slate-500 p-8 text-center">Loading log templates...</div>
      ) : templates.length === 0 ? (
        <div className="bg-slate-950 p-12 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500">
          No log templates defined. Click "Create Log Template" to build a dynamic form for staff entries.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white">{tpl.name}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    v{tpl.version}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      tpl.status === LogTemplateStatus.ACTIVE
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tpl.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedTemplate(tpl);
                      setTemplateForm({
                        name: tpl.name,
                        description: tpl.description || '',
                        ccpId: tpl.ccpId || '',
                        status: tpl.status,
                      });
                      setFields(tpl.fields || []);
                      setIsModalOpen(true);
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 p-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400">{tpl.description || 'No description provided.'}</p>

              {/* Form Schema Field List */}
              <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Dynamic Form Schema ({tpl.fields?.length || 0} fields)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tpl.fields?.map((f) => (
                    <div
                      key={f.id}
                      className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center gap-2 text-xs text-slate-300"
                    >
                      {getFieldTypeIcon(f.type)}
                      <span className="truncate">{f.label}</span>
                      {f.required && <span className="text-red-400 text-[10px] font-bold">*</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE/EDIT TEMPLATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {selectedTemplate ? `Edit Log Template (v${selectedTemplate.version})` : 'Create Log Template'}
              </h3>
              {selectedTemplate && selectedTemplate.status === LogTemplateStatus.ACTIVE && (
                <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-blue-500/20">
                  <GitBranch className="w-3.5 h-3.5" /> Branching Active Template (v{selectedTemplate.version + 1})
                </span>
              )}
            </div>

            <form onSubmit={handleSubmitTemplate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Template Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daily Cold Storage Temperature Log"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Associated CCP (Optional)</label>
                  <select
                    value={templateForm.ccpId}
                    onChange={(e) => setTemplateForm({ ...templateForm, ccpId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">None (General Operational Log)</option>
                    {ccps.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Instructions for kitchen staff..."
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* DYNAMIC FORM BUILDER SCHEMA SECTION */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                    Dynamic Form Fields Builder ({fields.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold px-3 py-1.5 rounded-xl transition"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Field
                  </button>
                </div>

                <div className="space-y-3">
                  {fields.map((f, idx) => (
                    <div
                      key={f.id || idx}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold uppercase block mb-0.5">Field Type</label>
                          <select
                            value={f.type}
                            onChange={(e) => handleUpdateField(idx, { type: e.target.value as FormFieldType })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white"
                          >
                            <option value={FormFieldType.TEMPERATURE}>TEMPERATURE</option>
                            <option value={FormFieldType.PHOTO}>PHOTO</option>
                            <option value={FormFieldType.TEXT}>TEXT</option>
                            <option value={FormFieldType.NUMBER}>NUMBER</option>
                            <option value={FormFieldType.BOOLEAN}>BOOLEAN</option>
                            <option value={FormFieldType.SELECT}>SELECT</option>
                            <option value={FormFieldType.SIGNATURE}>SIGNATURE</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold uppercase block mb-0.5">Field Label</label>
                          <input
                            type="text"
                            value={f.label}
                            onChange={(e) => handleUpdateField(idx, { label: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3">
                          <label className="flex items-center gap-1.5 text-slate-300 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={f.required || false}
                              onChange={(e) => handleUpdateField(idx, { required: e.target.checked })}
                              className="rounded border-slate-800 text-emerald-600 focus:ring-emerald-500"
                            />
                            Required
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveField(idx)}
                            className="text-slate-500 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Save Log Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogTemplatesAdminPage;
