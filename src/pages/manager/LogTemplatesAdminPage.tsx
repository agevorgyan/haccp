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
import { PageHeader } from '../../components/common/PageHeader';
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
  Edit2,
  ShieldCheck,
} from 'lucide-react';

export const LogTemplatesAdminPage: FC = () => {
  const [templates, setTemplates] = useState<LogTemplate[]>([]);
  const [ccps, setCcps] = useState<Ccp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pill Filter State
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'CCP_LINKED'>('ALL');

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
      label: 'Sanitation Execution Evidence Photo',
      required: true,
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
      label: 'New Checkpoint Parameter',
      required: false,
    };
    setFields((prev) => [...prev, newField]);
  };

  const handleUpdateField = (id: string, updated: Partial<FormFieldSchema>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
  };

  const handleRemoveField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmitTemplate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (selectedTemplate) {
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
        return <Thermometer className="w-3.5 h-3.5 text-cyan-600" />;
      case FormFieldType.PHOTO:
        return <Camera className="w-3.5 h-3.5 text-emerald-600" />;
      case FormFieldType.TEXT:
        return <Type className="w-3.5 h-3.5 text-amber-600" />;
      case FormFieldType.NUMBER:
        return <Hash className="w-3.5 h-3.5 text-purple-600" />;
      case FormFieldType.BOOLEAN:
        return <ToggleLeft className="w-3.5 h-3.5 text-blue-600" />;
      case FormFieldType.SELECT:
        return <CheckSquare className="w-3.5 h-3.5 text-teal-600" />;
      case FormFieldType.SIGNATURE:
        return <PenTool className="w-3.5 h-3.5 text-pink-600" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const filteredTemplates = templates.filter((tpl) => {
    if (activeFilter === 'ACTIVE') return tpl.status === LogTemplateStatus.ACTIVE;
    if (activeFilter === 'DRAFT') return tpl.status === LogTemplateStatus.DRAFT;
    if (activeFilter === 'CCP_LINKED') return Boolean(tpl.ccpId);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Reusable PageHeader Component */}
      <PageHeader
        title="Dynamic Log Templates Engine"
        subtitle="Build custom digital journal templates, map schema fields to CCP limits, and manage versioning."
        icon={FileSpreadsheet}
        badge="SCHEMA BUILDER"
        actions={
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setTemplateForm({ name: '', description: '', ccpId: '', status: LogTemplateStatus.ACTIVE });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Log Template</span>
          </button>
        }
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-700 flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Pill Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'ALL', label: `All Templates (${templates.length})` },
          { key: 'ACTIVE', label: `Active (${templates.filter((t) => t.status === LogTemplateStatus.ACTIVE).length})` },
          { key: 'DRAFT', label: `Drafts (${templates.filter((t) => t.status === LogTemplateStatus.DRAFT).length})` },
          { key: 'CCP_LINKED', label: `CCP Linked (${templates.filter((t) => Boolean(t.ccpId)).length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs transition cursor-pointer whitespace-nowrap ${
              activeFilter === tab.key
                ? 'bg-blue-600 text-white font-bold shadow-xs shadow-blue-600/20'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Responsive 4-Column Templates Grid */}
      {loading ? (
        <div className="text-xs font-medium text-slate-500 p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          Loading log templates...
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white p-12 border border-dashed border-slate-300 rounded-2xl text-center text-xs text-slate-500 shadow-xs">
          No log templates match the selected filter. Click "Create Log Template" to build a new dynamic form.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top Section */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-lg shadow-xs">
                    📋
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      tpl.status === LogTemplateStatus.ACTIVE
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {tpl.status}
                  </span>
                </div>

                {/* Middle Section */}
                <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {tpl.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-medium">
                  {tpl.description || 'No description provided.'}
                </p>

                {/* Schema Fields Badge List */}
                <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Fields ({tpl.fields?.length || 0})</span>
                    {tpl.ccpId && (
                      <span className="text-blue-600 font-extrabold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> CCP Linked
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tpl.fields?.slice(0, 3).map((f) => (
                      <span
                        key={f.id}
                        className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-1"
                      >
                        {getFieldTypeIcon(f.type)}
                        <span className="truncate max-w-[80px]">{f.label}</span>
                      </span>
                    ))}
                    {(tpl.fields?.length || 0) > 3 && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        +{(tpl.fields?.length || 0) - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Footer Section */}
              <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span>Version v{tpl.version}</span>
                </div>
                <div className="flex items-center gap-1.5">
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
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer"
                    title="Edit Template"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                    title="Delete Template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE/EDIT TEMPLATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {selectedTemplate ? `Edit Log Template (v${selectedTemplate.version})` : 'Create Log Template'}
              </h3>
              {selectedTemplate && selectedTemplate.status === LogTemplateStatus.ACTIVE && (
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-blue-200">
                  <GitBranch className="w-3.5 h-3.5" /> Branching Active Template (v{selectedTemplate.version + 1})
                </span>
              )}
            </div>

            <form onSubmit={handleSubmitTemplate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Template Name</label>
                  <input
                    type="text"
                    required
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    placeholder="e.g. Daily Walk-In Fridge Temp Log"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Link to CCP (Optional)</label>
                  <select
                    value={templateForm.ccpId}
                    onChange={(e) => setTemplateForm({ ...templateForm, ccpId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">No CCP Link</option>
                    {ccps.map((ccp) => (
                      <option key={ccp.id} value={ccp.id}>
                        {ccp.name} ({ccp.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  placeholder="Standard operating procedure instructions for staff"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Dynamic Fields Schema Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 text-xs">Dynamic Form Schema Fields</span>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Field
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {fields.map((f) => (
                    <div
                      key={f.id}
                      className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <select
                          value={f.type}
                          onChange={(e) =>
                            handleUpdateField(f.id, { type: e.target.value as FormFieldType })
                          }
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900"
                        >
                          <option value={FormFieldType.TEMPERATURE}>Temperature Probe (°C)</option>
                          <option value={FormFieldType.PHOTO}>Photo Evidence</option>
                          <option value={FormFieldType.TEXT}>Text Note</option>
                          <option value={FormFieldType.NUMBER}>Numeric Value</option>
                          <option value={FormFieldType.BOOLEAN}>Pass/Fail Switch</option>
                        </select>
                        <input
                          type="text"
                          value={f.label}
                          onChange={(e) => handleUpdateField(f.id, { label: e.target.value })}
                          placeholder="Field Label"
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900"
                        />
                        <label className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                          <input
                            type="checkbox"
                            checked={f.required}
                            onChange={(e) => handleUpdateField(f.id, { required: e.target.checked })}
                          />
                          Req
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(f.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition"
                >
                  {selectedTemplate ? 'Save Version & Update' : 'Publish Template'}
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
