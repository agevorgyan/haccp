import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  traceabilityApi,
  BatchStatus,
} from '../../services/traceabilityApi';
import type { Batch } from '../../services/traceabilityApi';
import {
  Boxes,
  Plus,
  MinusCircle,
  Clock,
  Trash2,
  AlertCircle,
  Tag,
} from 'lucide-react';

export const BatchesManagementPage: FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [decrementingBatch, setDecrementingBatch] = useState<Batch | null>(null);
  const [decrementAmount, setDecrementAmount] = useState<number>(1);

  // Batch Form
  const [batchForm, setBatchForm] = useState({
    productName: 'Raw Chicken Breast Fillets',
    batchNumber: `LOT-${Date.now().toString().slice(-6)}`,
    initialQuantity: 100,
    currentQuantity: 100,
    unit: 'kg',
    productionDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
  });

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await traceabilityApi.getBatches();
      setBatches(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load batch inventory records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreateBatch = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await traceabilityApi.createBatch({
        ...batchForm,
        currentQuantity: batchForm.initialQuantity,
      });
      setIsCreateModalOpen(false);
      await fetchBatches();
    } catch (err: any) {
      alert(err.message || 'Failed to create batch');
    }
  };

  const handleDecrementQuantity = async (e: FormEvent) => {
    e.preventDefault();
    if (!decrementingBatch) return;

    try {
      await traceabilityApi.decrementBatchQuantity(decrementingBatch.id, decrementAmount);
      setDecrementingBatch(null);
      setDecrementAmount(1);
      await fetchBatches();
    } catch (err: any) {
      alert(err.message || 'Failed to decrement batch quantity');
    }
  };

  const handleStatusChange = async (batchId: string, nextStatus: BatchStatus) => {
    try {
      await traceabilityApi.updateBatchStatus(batchId, nextStatus);
      await fetchBatches();
    } catch (err: any) {
      alert(err.message || 'Failed to update batch status');
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('Are you sure you want to delete this batch record?')) return;
    try {
      await traceabilityApi.deleteBatch(batchId);
      await fetchBatches();
    } catch (err: any) {
      alert(err.message || 'Failed to delete batch');
    }
  };

  const getStatusBadge = (status: BatchStatus) => {
    switch (status) {
      case BatchStatus.ACTIVE:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case BatchStatus.QUARANTINED:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case BatchStatus.RECALLED:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case BatchStatus.EXHAUSTED:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Batches & Lot Traceability Engine</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Trace ingredient lots, track real-time inventory levels, and enforce food safety quarantine & recall controls.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          Register New Batch
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Lot Inventory Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400" />
            Lot Inventory Directory ({batches.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-xs text-slate-500 p-8 text-center">Loading batch inventory...</div>
        ) : batches.length === 0 ? (
          <div className="p-12 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500">
            No lot batches registered in inventory. Click "Register New Batch" to add ingredient lots.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 px-3">Batch Number</th>
                  <th className="pb-3 px-3">Product Name</th>
                  <th className="pb-3 px-3">Current / Initial Quantity</th>
                  <th className="pb-3 px-3">Expiry Date</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-3 font-mono font-bold text-white">
                      {batch.batchNumber}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-200">
                      {batch.productName}
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      <span className="text-emerald-400 font-bold">{batch.currentQuantity}</span> /{' '}
                      {batch.initialQuantity} {batch.unit}
                    </td>
                    <td className="py-3.5 px-3 flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {batch.expiryDate}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          batch.status,
                        )}`}
                      >
                        {batch.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {batch.status === BatchStatus.ACTIVE && (
                          <button
                            onClick={() => {
                              setDecrementingBatch(batch);
                              setDecrementAmount(1);
                            }}
                            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-lg transition"
                          >
                            <MinusCircle className="w-3.5 h-3.5" /> Use Inventory
                          </button>
                        )}

                        {/* Status Change Dropdown */}
                        <select
                          value={batch.status}
                          onChange={(e) => handleStatusChange(batch.id, e.target.value as BatchStatus)}
                          className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value={BatchStatus.ACTIVE}>ACTIVE</option>
                          <option value={BatchStatus.QUARANTINED}>QUARANTINED</option>
                          <option value={BatchStatus.RECALLED}>RECALLED</option>
                          <option value={BatchStatus.EXHAUSTED}>EXHAUSTED</option>
                        </select>

                        <button
                          onClick={() => handleDeleteBatch(batch.id)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE BATCH MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Register Lot Batch</h3>
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Raw Chicken Fillets"
                    value={batchForm.productName}
                    onChange={(e) => setBatchForm({ ...batchForm, productName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Batch / Lot Number</label>
                  <input
                    type="text"
                    required
                    placeholder="LOT-998822"
                    value={batchForm.batchNumber}
                    onChange={(e) => setBatchForm({ ...batchForm, batchNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Initial Quantity</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={batchForm.initialQuantity}
                    onChange={(e) =>
                      setBatchForm({
                        ...batchForm,
                        initialQuantity: parseFloat(e.target.value) || 0,
                        currentQuantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="kg, cases, liters"
                    value={batchForm.unit}
                    onChange={(e) => setBatchForm({ ...batchForm, unit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Production Date</label>
                  <input
                    type="date"
                    value={batchForm.productionDate}
                    onChange={(e) => setBatchForm({ ...batchForm, productionDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={batchForm.expiryDate}
                    onChange={(e) => setBatchForm({ ...batchForm, expiryDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Save Batch Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DECREMENT INVENTORY MODAL */}
      {decrementingBatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Use / Decrement Inventory</h3>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 space-y-1">
              <div>
                Batch: <strong className="text-white font-mono">{decrementingBatch.batchNumber}</strong> ({decrementingBatch.productName})
              </div>
              <div>
                Current Available Quantity: <strong className="text-emerald-400">{decrementingBatch.currentQuantity} {decrementingBatch.unit}</strong>
              </div>
            </div>

            <form onSubmit={handleDecrementQuantity} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Quantity Amount to Decrement ({decrementingBatch.unit})</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min="0.1"
                  max={decrementingBatch.currentQuantity}
                  value={decrementAmount}
                  onChange={(e) => setDecrementAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDecrementingBatch(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Decrement Quantity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchesManagementPage;
