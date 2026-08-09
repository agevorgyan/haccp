import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  operationsApi,
  SupplierRiskLevel,
  PackagingCondition,
  ReceivingStatus,
} from '../../services/operationsApi';
import type {
  Supplier,
  ReceivingLog,
} from '../../services/operationsApi';
import {
  Truck,
  Plus,
  Star,
  CheckCircle2,
  XCircle,
  Thermometer,
  PackageCheck,
  Building2,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export const SuppliersReceivingPage: FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [receivingLogs, setReceivingLogs] = useState<ReceivingLog[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'receiving'>('receiving');

  // Modals
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState(false);

  // Forms
  const [supplierForm, setSupplierForm] = useState({
    name: 'Fresh Harvest Poultry Co.',
    contactPerson: 'Sarah Jenkins',
    phone: '+1 (555) 234-5678',
    email: 'orders@freshharvest.com',
    categories: ['Poultry', 'Meat'],
    riskLevel: SupplierRiskLevel.LOW as SupplierRiskLevel,
  });

  const [receivingForm, setReceivingForm] = useState({
    supplierId: '',
    productName: 'Raw Chicken Breast Fillets',
    batchNumber: `LOT-${Date.now().toString().slice(-6)}`,
    quantity: 50,
    unit: 'kg',
    temperature: 2.5,
    packagingCondition: PackagingCondition.INTACT as PackagingCondition,
    expiryDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    status: ReceivingStatus.ACCEPTED as ReceivingStatus,
    rejectionReason: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedSuppliers, fetchedLogs] = await Promise.all([
        operationsApi.getSuppliers(),
        operationsApi.getReceivingLogs(),
      ]);
      setSuppliers(fetchedSuppliers);
      setReceivingLogs(fetchedLogs);
      if (fetchedSuppliers.length > 0 && !receivingForm.supplierId) {
        setReceivingForm((prev) => ({ ...prev, supplierId: fetchedSuppliers[0].id }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load suppliers/receiving logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSupplier = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await operationsApi.createSupplier(supplierForm);
      setIsSupplierModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create supplier');
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await operationsApi.deleteSupplier(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete supplier');
    }
  };

  const handleCreateReceivingLog = async (e: FormEvent) => {
    e.preventDefault();

    if (
      receivingForm.status === ReceivingStatus.REJECTED &&
      !receivingForm.rejectionReason.trim()
    ) {
      alert('Rejection reason is mandatory when a delivery is REJECTED.');
      return;
    }

    try {
      await operationsApi.createReceivingLog(receivingForm);
      setIsReceivingModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to log delivery receiving');
    }
  };

  const getRiskBadge = (risk: SupplierRiskLevel) => {
    switch (risk) {
      case SupplierRiskLevel.HIGH:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case SupplierRiskLevel.MEDIUM:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Suppliers & Receiving Control</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage food supply chain vendors, log incoming deliveries, and enforce CCP temperature limits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'suppliers' ? (
            <button
              onClick={() => setIsSupplierModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" /> Add Supplier
            </button>
          ) : (
            <button
              onClick={() => {
                if (suppliers.length === 0) {
                  alert('Please create at least one supplier in the Supplier Directory first.');
                  return;
                }
                setReceivingForm({
                  ...receivingForm,
                  supplierId: suppliers[0].id,
                });
                setIsReceivingModalOpen(true);
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" /> Record Delivery Inspection
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('receiving')}
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition ${
            activeTab === 'receiving'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          Receiving Inspection Logs ({receivingLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition ${
            activeTab === 'suppliers'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Supplier Directory ({suppliers.length})
        </button>
      </div>

      {/* TAB 1: RECEIVING INSPECTION LOGS */}
      {activeTab === 'receiving' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-xs text-slate-500 p-8 text-center">Loading receiving logs...</div>
          ) : receivingLogs.length === 0 ? (
            <div className="bg-slate-950 p-12 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500">
              No delivery inspection logs recorded yet. Click "Record Delivery Inspection" to inspect incoming food supplies.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {receivingLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {log.status === ReceivingStatus.ACCEPTED ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <h3 className="text-sm font-bold text-white">{log.productName}</h3>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        log.status === ReceivingStatus.ACCEPTED
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Lot / Batch #</span>
                      <span className="font-mono font-bold text-white">{log.batchNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Quantity</span>
                      <span className="font-semibold text-white">
                        {log.quantity} {log.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Delivery Temp</span>
                      <span className="font-semibold text-cyan-400 flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5" /> {log.temperature ?? 'N/A'} °C
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Packaging Condition</span>
                      <span className="font-semibold text-slate-200">{log.packagingCondition}</span>
                    </div>
                  </div>

                  {log.status === ReceivingStatus.REJECTED && (
                    <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl text-xs text-red-400">
                      <strong className="block text-[10px] uppercase font-bold">Rejection Reason:</strong>
                      <span>{log.rejectionReason || 'Non-compliant delivery'}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Supplier ID: {log.supplierId.substring(0, 8)}...</span>
                    <span>Expiry: {log.expiryDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUPPLIER DIRECTORY */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-xs text-slate-500 p-8 text-center">Loading supplier directory...</div>
          ) : suppliers.length === 0 ? (
            <div className="bg-slate-950 p-12 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500">
              No food suppliers registered. Click "Add Supplier" to add supply chain vendors.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{s.name}</h3>
                      <p className="text-xs text-slate-400">{s.contactPerson} ({s.phone})</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getRiskBadge(
                          s.riskLevel,
                        )}`}
                      >
                        {s.riskLevel} RISK
                      </span>
                      <button
                        onClick={() => handleDeleteSupplier(s.id)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{s.rating ?? '5.00'} / 5.0</span>
                    </div>
                    <div className="text-slate-400 truncate">
                      Categories: <span className="text-white">{s.categories?.join(', ') || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE SUPPLIER MODAL */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Register Food Supplier</h3>
            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Supplier Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Harvest Farms"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={supplierForm.contactPerson}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+1 555 123 4567"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="orders@supplier.com"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD RECEIVING LOG MODAL */}
      {isReceivingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Record Delivery Inspection</h3>
            <form onSubmit={handleCreateReceivingLog} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Supplier</label>
                <select
                  value={receivingForm.supplierId}
                  onChange={(e) => setReceivingForm({ ...receivingForm, supplierId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Risk: {s.riskLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Raw Poultry Fillets"
                    value={receivingForm.productName}
                    onChange={(e) => setReceivingForm({ ...receivingForm, productName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Batch / Lot Number</label>
                  <input
                    type="text"
                    required
                    placeholder="LOT-998231"
                    value={receivingForm.batchNumber}
                    onChange={(e) => setReceivingForm({ ...receivingForm, batchNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={receivingForm.quantity}
                    onChange={(e) => setReceivingForm({ ...receivingForm, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="kg"
                    value={receivingForm.unit}
                    onChange={(e) => setReceivingForm({ ...receivingForm, unit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Delivery Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={receivingForm.temperature}
                    onChange={(e) => setReceivingForm({ ...receivingForm, temperature: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Packaging Condition</label>
                  <select
                    value={receivingForm.packagingCondition}
                    onChange={(e) => setReceivingForm({ ...receivingForm, packagingCondition: e.target.value as PackagingCondition })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value={PackagingCondition.INTACT}>INTACT</option>
                    <option value={PackagingCondition.DAMAGED}>DAMAGED</option>
                    <option value={PackagingCondition.COMPROMISED}>COMPROMISED</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Inspection Status</label>
                  <select
                    value={receivingForm.status}
                    onChange={(e) => setReceivingForm({ ...receivingForm, status: e.target.value as ReceivingStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value={ReceivingStatus.ACCEPTED}>ACCEPTED</option>
                    <option value={ReceivingStatus.REJECTED}>REJECTED</option>
                  </select>
                </div>
              </div>

              {receivingForm.status === ReceivingStatus.REJECTED && (
                <div className="space-y-1 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <label className="font-bold text-red-400 block">Mandatory Rejection Reason *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delivery temperature exceeded 4°C limit (recorded 9.5°C)"
                    value={receivingForm.rejectionReason}
                    onChange={(e) => setReceivingForm({ ...receivingForm, rejectionReason: e.target.value })}
                    className="w-full bg-slate-950 border border-red-500/40 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReceivingModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Save Receiving Inspection Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersReceivingPage;
