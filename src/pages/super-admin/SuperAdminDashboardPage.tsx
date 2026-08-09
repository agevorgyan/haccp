import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import { superAdminApi } from '../../services/superAdminApi';
import type { TenantBackofficeItem, SubscriptionPlan, SubscriptionStatus } from '../../services/superAdminApi';
import {
  Building2,
  Users,
  Cpu,
  Plus,
  Edit,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  AlertTriangle,
} from 'lucide-react';

export const SuperAdminDashboardPage: FC = () => {
  const [tenants, setTenants] = useState<TenantBackofficeItem[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [selectedTenant, setSelectedTenant] = useState<TenantBackofficeItem | null>(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState<boolean>(false);
  const [targetPlanId, setTargetPlanId] = useState<string>('');
  const [targetStatus, setTargetStatus] = useState<SubscriptionStatus>('ACTIVE');

  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState<boolean>(false);
  const [newPlanForm, setNewPlanForm] = useState({
    name: '',
    maxUsers: 10,
    maxSensors: 25,
    priceMonthly: 99,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tenantsData, plansData] = await Promise.all([
        superAdminApi.getTenants(),
        superAdminApi.getPlans(),
      ]);
      setTenants(tenantsData);
      setPlans(plansData);
    } catch (err: any) {
      setError(err.message || 'Failed to load super admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openSubModal = (tenant: TenantBackofficeItem) => {
    setSelectedTenant(tenant);
    setTargetPlanId(tenant.organization.subscriptionPlanId || (plans[0]?.id || ''));
    setTargetStatus(tenant.subscriptionStatus);
    setIsSubModalOpen(true);
  };

  const handleUpdateSubscription = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    try {
      await superAdminApi.updateTenantSubscription(selectedTenant.organization.id, {
        subscriptionPlanId: targetPlanId || undefined,
        subscriptionStatus: targetStatus,
      });
      setIsSubModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update subscription');
    }
  };

  const handleCreatePlan = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await superAdminApi.createPlan(newPlanForm);
      setIsNewPlanModalOpen(false);
      setNewPlanForm({ name: '', maxUsers: 10, maxSensors: 25, priceMonthly: 99 });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create plan');
    }
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> ACTIVE
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3" /> SUSPENDED
          </span>
        );
      case 'TRIAL':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" /> TRIAL
          </span>
        );
      default:
        return null;
    }
  };

  const totalUsers = tenants.reduce((acc, t) => acc + t.userCount, 0);
  const totalSensors = tenants.reduce((acc, t) => acc + t.sensorCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <h1 className="text-xl font-bold text-white tracking-tight">Multi-Tenant SaaS Backoffice</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global organization management, subscription quota enforcement, and SaaS tier control.
          </p>
        </div>

        <button
          onClick={() => setIsNewPlanModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create SaaS Plan Tier
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-xs text-red-400">
          {error}
        </div>
      )}

      {/* METRICS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-red-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Total Tenant Organizations</span>
            <span className="text-2xl font-extrabold text-white font-mono">{tenants.length}</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Active User Accounts</span>
            <span className="text-2xl font-extrabold text-white font-mono">{totalUsers}</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Active Telemetry Sensors</span>
            <span className="text-2xl font-extrabold text-white font-mono">{totalSensors}</span>
          </div>
        </div>
      </div>

      {/* TENANT DIRECTORY TABLE */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-400" />
            Registered Organizations & Quota Allocation
          </h2>
          <span className="text-xs text-slate-500 font-mono">{tenants.length} Tenants</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading tenant backoffice directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Organization</th>
                  <th className="p-4">Plan Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">User Quota</th>
                  <th className="p-4">Sensor Quota</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {tenants.map((tenant) => {
                  const plan = tenant.subscriptionPlan;
                  const maxUsers = plan?.maxUsers || 5;
                  const maxSensors = plan?.maxSensors || 10;
                  const userPct = Math.min(100, Math.round((tenant.userCount / maxUsers) * 100));
                  const sensorPct = Math.min(100, Math.round((tenant.sensorCount / maxSensors) * 100));

                  return (
                    <tr key={tenant.organization.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <span className="font-bold text-white block text-sm">{tenant.organization.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {tenant.organization.id.substring(0, 8)}... | Tax: {tenant.organization.taxId || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-200">
                        {plan ? (
                          <div className="flex items-center gap-1.5">
                            <span>{plan.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">(${(+plan.priceMonthly).toFixed(0)}/mo)</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No Plan Assigned</span>
                        )}
                      </td>
                      <td className="p-4">{getStatusBadge(tenant.subscriptionStatus)}</td>
                      <td className="p-4">
                        <div className="space-y-1 w-32">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span>{tenant.userCount} / {maxUsers}</span>
                            {userPct >= 100 && <span className="text-red-400 font-bold">FULL</span>}
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${userPct}%` }}
                              className={`h-full ${userPct >= 100 ? 'bg-red-500' : 'bg-emerald-500'}`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 w-32">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span>{tenant.sensorCount} / {maxSensors}</span>
                            {sensorPct >= 100 && <span className="text-red-400 font-bold">FULL</span>}
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${sensorPct}%` }}
                              className={`h-full ${sensorPct >= 100 ? 'bg-red-500' : 'bg-cyan-500'}`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openSubModal(tenant)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
                        >
                          <Edit className="w-3.5 h-3.5 inline mr-1" />
                          Manage Plan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MANAGE PLAN / SUSPEND MODAL */}
      {isSubModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Subscription & Quota Management
            </h3>

            <p className="text-xs text-slate-400">
              Updating settings for <strong className="text-white">{selectedTenant.organization.name}</strong>.
            </p>

            <form onSubmit={handleUpdateSubscription} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">SaaS Plan Tier</label>
                <select
                  value={targetPlanId}
                  onChange={(e) => setTargetPlanId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="">Select Plan...</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${(+p.priceMonthly).toFixed(0)}/mo ({p.maxUsers} Users, {p.maxSensors} Sensors)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Subscription Lifecycle Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as SubscriptionStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="ACTIVE">ACTIVE (Full Platform Access)</option>
                  <option value="TRIAL">TRIAL (Evaluation Access)</option>
                  <option value="SUSPENDED">SUSPENDED (Restrict Access)</option>
                </select>
              </div>

              {targetStatus === 'SUSPENDED' && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>Warning: Suspending tenant will deactivate user login for this organization.</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW SAAS PLAN MODAL */}
      {isNewPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-red-500" />
              Register New SaaS Subscription Tier
            </h3>

            <form onSubmit={handleCreatePlan} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Plus"
                  value={newPlanForm.name}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Max Users</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPlanForm.maxUsers}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, maxUsers: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Max Sensors</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newPlanForm.maxSensors}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, maxSensors: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Price Monthly ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={newPlanForm.priceMonthly}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, priceMonthly: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20"
                >
                  Create Plan Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboardPage;
