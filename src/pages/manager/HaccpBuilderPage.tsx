import React, { useState, useEffect } from 'react';
import {
  haccpApi,
  HaccpPlanStatus,
  HazardCategory,
} from '../../services/haccpApi';
import type {
  HaccpPlan,
  Hazard,
  Ccp,
} from '../../services/haccpApi';
import {
  Plus,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  GitBranch,
  CheckCircle2,
  Trash2,
  Lock,
  Thermometer,
} from 'lucide-react';

export const HaccpBuilderPage: React.FC = () => {
  const [plans, setPlans] = useState<HaccpPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<HaccpPlan | null>(null);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [ccps, setCcps] = useState<Ccp[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hazards' | 'ccps'>('hazards');

  // Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);
  const [isCcpModalOpen, setIsCcpModalOpen] = useState(false);

  // Forms
  const [planForm, setPlanForm] = useState({ name: '' });

  const [hazardForm, setHazardForm] = useState<{
    category: HazardCategory;
    description: string;
    source: string;
    preventiveMeasures: string;
    severity: number;
    likelihood: number;
  }>({
    category: HazardCategory.BIOLOGICAL,
    description: '',
    source: '',
    preventiveMeasures: '',
    severity: 3,
    likelihood: 3,
  });

  const [ccpForm, setCcpForm] = useState({
    hazardId: '',
    code: 'CCP-01',
    name: '',
    description: '',
    criticalLimitMin: undefined as number | undefined,
    criticalLimitMax: 5,
    warningLimitMin: undefined as number | undefined,
    warningLimitMax: 3,
    unit: '°C',
    monitoringMethod: 'Digital Probe Thermometer Log',
    monitoringFrequency: 'Every 2 hours',
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await haccpApi.getHaccpPlans();
      setPlans(data);
      if (data.length > 0 && !selectedPlan) {
        setSelectedPlan(data[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load HACCP plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanDetails = async (planId: string) => {
    try {
      const [fetchedHazards, fetchedCcps] = await Promise.all([
        haccpApi.getHazards(planId),
        haccpApi.getCcps(planId),
      ]);
      setHazards(fetchedHazards);
      setCcps(fetchedCcps);
    } catch (err: any) {
      setError(err.message || 'Failed to load plan hazards/CCPs');
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      fetchPlanDetails(selectedPlan.id);
    }
  }, [selectedPlan?.id]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPlan = await haccpApi.createHaccpPlan(planForm);
      setPlanForm({ name: '' });
      setIsPlanModalOpen(false);
      await fetchPlans();
      setSelectedPlan(newPlan);
    } catch (err: any) {
      alert(err.message || 'Failed to create plan');
    }
  };

  const handleCreateNewVersion = async () => {
    if (!selectedPlan) return;
    try {
      const newVersionPlan = await haccpApi.createNewPlanVersion(selectedPlan.id);
      await fetchPlans();
      setSelectedPlan(newVersionPlan);
    } catch (err: any) {
      alert(err.message || 'Failed to create new plan version');
    }
  };

  const handleApprovePlan = async () => {
    if (!selectedPlan) return;
    try {
      const approved = await haccpApi.approveHaccpPlan(selectedPlan.id);
      await fetchPlans();
      setSelectedPlan(approved);
    } catch (err: any) {
      alert(err.message || 'Failed to approve plan');
    }
  };

  const handleAddHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    try {
      await haccpApi.createHazard({
        planId: selectedPlan.id,
        ...hazardForm,
      });
      setIsHazardModalOpen(false);
      setHazardForm({
        category: HazardCategory.BIOLOGICAL,
        description: '',
        source: '',
        preventiveMeasures: '',
        severity: 3,
        likelihood: 3,
      });
      await fetchPlanDetails(selectedPlan.id);
    } catch (err: any) {
      alert(err.message || 'Failed to add hazard');
    }
  };

  const handleDeleteHazard = async (id: string) => {
    if (!selectedPlan || !confirm('Are you sure you want to delete this hazard?')) return;
    try {
      await haccpApi.deleteHazard(id);
      await fetchPlanDetails(selectedPlan.id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete hazard');
    }
  };

  const handleAddCcp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    try {
      await haccpApi.createCcp({
        planId: selectedPlan.id,
        ...ccpForm,
      });
      setIsCcpModalOpen(false);
      await fetchPlanDetails(selectedPlan.id);
    } catch (err: any) {
      alert(err.message || 'Failed to add CCP');
    }
  };

  const handleDeleteCcp = async (id: string) => {
    if (!selectedPlan || !confirm('Are you sure you want to delete this CCP?')) return;
    try {
      await haccpApi.deleteCcp(id);
      await fetchPlanDetails(selectedPlan.id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete CCP');
    }
  };

  const isEditable =
    selectedPlan?.status === HaccpPlanStatus.DRAFT ||
    selectedPlan?.status === HaccpPlanStatus.IN_REVIEW;

  const hazardsRequiringCcp = hazards.filter((h) => h.requiresCCP);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">HACCP Core Plan Builder</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Build food safety plans, conduct 5x5 hazard risk assessments, and configure CCP thresholds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            New HACCP Plan
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Plan Selector & Versioning Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Plans List */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            HACCP Plans ({plans.length})
          </h2>
          {loading ? (
            <div className="text-xs text-slate-500 p-4">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="text-xs text-slate-500 p-4 border border-dashed border-slate-800 rounded-xl text-center">
              No HACCP plans created yet.
            </div>
          ) : (
            <div className="space-y-2">
              {plans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{plan.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        v{plan.version}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span
                        className={`font-medium uppercase tracking-wider ${
                          plan.status === HaccpPlanStatus.APPROVED || plan.status === HaccpPlanStatus.ACTIVE
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {plan.status}
                      </span>
                      <span className="text-slate-500">
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Plan Details Cockpit */}
        <div className="md:col-span-3 space-y-6">
          {selectedPlan ? (
            <>
              {/* Plan Banner */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white">{selectedPlan.name}</h2>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Version {selectedPlan.version}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                      {selectedPlan.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Plan ID: <span className="font-mono">{selectedPlan.id}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedPlan.status === HaccpPlanStatus.DRAFT && (
                    <button
                      onClick={handleApprovePlan}
                      className="flex items-center gap-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold px-3 py-2 rounded-xl transition"
                    >
                      <FileCheck className="w-4 h-4" />
                      Approve Plan
                    </button>
                  )}

                  {(selectedPlan.status === HaccpPlanStatus.APPROVED ||
                    selectedPlan.status === HaccpPlanStatus.ACTIVE) && (
                    <button
                      onClick={handleCreateNewVersion}
                      className="flex items-center gap-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold px-3 py-2 rounded-xl transition"
                    >
                      <GitBranch className="w-4 h-4" />
                      Create New Version (v{selectedPlan.version + 1})
                    </button>
                  )}
                </div>
              </div>

              {!isEditable && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>
                    This plan is <strong>{selectedPlan.status}</strong> and protected against destructive edits. Click "Create New Version" to branch a new draft.
                  </span>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setActiveTab('hazards')}
                  className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition ${
                    activeTab === 'hazards'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Hazard Analysis ({hazards.length})
                </button>
                <button
                  onClick={() => setActiveTab('ccps')}
                  className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition ${
                    activeTab === 'ccps'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Thermometer className="w-4 h-4" />
                  Critical Control Points ({ccps.length})
                </button>
              </div>

              {/* TAB 1: Hazards */}
              {activeTab === 'hazards' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Identified Hazards & 5x5 Risk Assessment
                    </h3>
                    {isEditable && (
                      <button
                        onClick={() => setIsHazardModalOpen(true)}
                        className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-emerald-500 transition"
                      >
                        <Plus className="w-4 h-4" />
                        Add Hazard
                      </button>
                    )}
                  </div>

                  {hazards.length === 0 ? (
                    <div className="bg-slate-950 p-8 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500">
                      No hazards identified for this HACCP plan. Click "Add Hazard" to evaluate biological, chemical, physical, or allergen risks.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {hazards.map((h) => (
                        <div
                          key={h.id}
                          className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 uppercase">
                                {h.category}
                              </span>
                              <h4 className="text-sm font-semibold text-white">{h.description}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold px-3 py-1 rounded-full ${
                                  h.riskScore >= 10
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400'
                                }`}
                              >
                                Risk Score: {h.riskScore} ({h.severity}x{h.likelihood})
                              </span>
                              {isEditable && (
                                <button
                                  onClick={() => handleDeleteHazard(h.id)}
                                  className="text-slate-500 hover:text-red-400 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 bg-slate-900/40 p-3 rounded-xl">
                            <div>
                              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Source / Contamination Origin</span>
                              <span>{h.source || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Preventive & Control Measures</span>
                              <span>{h.preventiveMeasures || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            {h.isSignificant && (
                              <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                                <AlertTriangle className="w-3.5 h-3.5" /> Significant Hazard
                              </span>
                            )}
                            {h.requiresCCP && (
                              <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Requires CCP Engine
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CCPs */}
              {activeTab === 'ccps' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Configured Critical Control Points ({ccps.length})
                    </h3>
                    {isEditable && (
                      <button
                        onClick={() => {
                          if (hazardsRequiringCcp.length === 0) {
                            alert('No hazards marked as requiring CCP (riskScore >= 10). Add a significant hazard first.');
                            return;
                          }
                          setCcpForm({
                            ...ccpForm,
                            hazardId: hazardsRequiringCcp[0].id,
                          });
                          setIsCcpModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-emerald-500 transition"
                      >
                        <Plus className="w-4 h-4" />
                        Add CCP
                      </button>
                    )}
                  </div>

                  {ccps.length === 0 ? (
                    <div className="bg-slate-950 p-8 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500">
                      No Critical Control Points defined. CCPs must be attached to significant hazards requiring control.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {ccps.map((ccp) => (
                        <div
                          key={ccp.id}
                          className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {ccp.code}
                              </span>
                              <div>
                                <h4 className="text-sm font-bold text-white">{ccp.name}</h4>
                                <p className="text-xs text-slate-400">{ccp.description}</p>
                              </div>
                            </div>
                            {isEditable && (
                              <button
                                onClick={() => handleDeleteCcp(ccp.id)}
                                className="text-slate-500 hover:text-red-400 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Critical Limit</span>
                              <span className="font-semibold text-white mt-1 block">
                                {ccp.criticalLimitMin ?? 'N/A'} {ccp.unit} to {ccp.criticalLimitMax ?? 'N/A'} {ccp.unit}
                              </span>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Warning Threshold</span>
                              <span className="font-semibold text-white mt-1 block">
                                {ccp.warningLimitMin ?? 'N/A'} {ccp.unit} to {ccp.warningLimitMax ?? 'N/A'} {ccp.unit}
                              </span>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monitoring Protocol</span>
                              <span className="font-semibold text-slate-200 mt-1 block">
                                {ccp.monitoringMethod} ({ccp.monitoringFrequency})
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-950 p-12 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
              Select or create a HACCP Plan to configure food safety parameters.
            </div>
          )}
        </div>
      </div>

      {/* CREATE PLAN MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Create HACCP Plan</h3>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Food Safety Plan"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD HAZARD MODAL */}
      {isHazardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Add Hazard Analysis</h3>
            <form onSubmit={handleAddHazard} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Hazard Category</label>
                <select
                  value={hazardForm.category}
                  onChange={(e) => setHazardForm({ ...hazardForm, category: e.target.value as HazardCategory })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value={HazardCategory.BIOLOGICAL}>BIOLOGICAL</option>
                  <option value={HazardCategory.CHEMICAL}>CHEMICAL</option>
                  <option value={HazardCategory.PHYSICAL}>PHYSICAL</option>
                  <option value={HazardCategory.ALLERGEN}>ALLERGEN</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Hazard Description</label>
                <textarea
                  required
                  placeholder="e.g. Salmonella growth in raw poultry storage"
                  value={hazardForm.description}
                  onChange={(e) => setHazardForm({ ...hazardForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Severity (1 to 5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={hazardForm.severity}
                    onChange={(e) => setHazardForm({ ...hazardForm, severity: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Likelihood (1 to 5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={hazardForm.likelihood}
                    onChange={(e) => setHazardForm({ ...hazardForm, likelihood: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Calculated Risk Score:</span>
                <span className={`font-bold text-sm ${hazardForm.severity * hazardForm.likelihood >= 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {hazardForm.severity * hazardForm.likelihood} {hazardForm.severity * hazardForm.likelihood >= 10 ? '(Requires CCP)' : '(Standard Control)'}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Source / Contamination Origin</label>
                <input
                  type="text"
                  placeholder="e.g. Supplier delivery or cross-contamination"
                  value={hazardForm.source}
                  onChange={(e) => setHazardForm({ ...hazardForm, source: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Preventive & Control Measures</label>
                <input
                  type="text"
                  placeholder="e.g. Strict cold storage monitoring <= 4°C"
                  value={hazardForm.preventiveMeasures}
                  onChange={(e) => setHazardForm({ ...hazardForm, preventiveMeasures: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsHazardModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Save Hazard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CCP MODAL */}
      {isCcpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Define Critical Control Point (CCP)</h3>
            <form onSubmit={handleAddCcp} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Target Significant Hazard</label>
                <select
                  value={ccpForm.hazardId}
                  onChange={(e) => setCcpForm({ ...ccpForm, hazardId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {hazardsRequiringCcp.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.description} (Risk Score: {h.riskScore})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">CCP Code</label>
                  <input
                    type="text"
                    required
                    placeholder="CCP-01"
                    value={ccpForm.code}
                    onChange={(e) => setCcpForm({ ...ccpForm, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">CCP Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Cold Storage Monitoring"
                    value={ccpForm.name}
                    onChange={(e) => setCcpForm({ ...ccpForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Critical Max Limit</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="5.0"
                    value={ccpForm.criticalLimitMax ?? ''}
                    onChange={(e) => setCcpForm({ ...ccpForm, criticalLimitMax: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Warning Max Limit</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="3.0"
                    value={ccpForm.warningLimitMax ?? ''}
                    onChange={(e) => setCcpForm({ ...ccpForm, warningLimitMax: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Measurement Unit</label>
                <input
                  type="text"
                  required
                  placeholder="°C"
                  value={ccpForm.unit}
                  onChange={(e) => setCcpForm({ ...ccpForm, unit: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Monitoring Method</label>
                  <input
                    type="text"
                    required
                    placeholder="Digital probe log"
                    value={ccpForm.monitoringMethod}
                    onChange={(e) => setCcpForm({ ...ccpForm, monitoringMethod: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Monitoring Frequency</label>
                  <input
                    type="text"
                    required
                    placeholder="Every 2 hours"
                    value={ccpForm.monitoringFrequency}
                    onChange={(e) => setCcpForm({ ...ccpForm, monitoringFrequency: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCcpModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Save CCP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HaccpBuilderPage;
