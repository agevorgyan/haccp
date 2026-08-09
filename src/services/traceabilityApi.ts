import { api } from './api';

export type BatchStatus = 'ACTIVE' | 'QUARANTINED' | 'EXHAUSTED' | 'RECALLED';
export const BatchStatus = {
  ACTIVE: 'ACTIVE',
  QUARANTINED: 'QUARANTINED',
  EXHAUSTED: 'EXHAUSTED',
  RECALLED: 'RECALLED',
} as const;

export interface Batch {
  id: string;
  organizationId: string;
  branchId?: string;
  supplierId?: string;
  receivingLogId?: string;
  productName: string;
  batchNumber: string;
  initialQuantity: number;
  currentQuantity: number;
  unit: string;
  productionDate?: string;
  expiryDate: string;
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
}

export const traceabilityApi = {
  async getBatches(): Promise<Batch[]> {
    const response = await api.get('/batches');
    return response.data;
  },

  async getBatch(id: string): Promise<Batch> {
    const response = await api.get(`/batches/${id}`);
    return response.data;
  },

  async createBatch(data: {
    productName: string;
    batchNumber: string;
    initialQuantity: number;
    currentQuantity: number;
    unit: string;
    expiryDate: string;
    productionDate?: string;
    supplierId?: string;
    receivingLogId?: string;
    branchId?: string;
  }): Promise<Batch> {
    const response = await api.post('/batches', data);
    return response.data;
  },

  async updateBatch(id: string, data: Partial<Batch>): Promise<Batch> {
    const response = await api.put(`/batches/${id}`, data);
    return response.data;
  },

  async decrementBatchQuantity(id: string, amount: number): Promise<Batch> {
    const response = await api.patch(`/batches/${id}/decrement`, { amount });
    return response.data;
  },

  async updateBatchStatus(id: string, status: BatchStatus): Promise<Batch> {
    const response = await api.patch(`/batches/${id}/status`, { status });
    return response.data;
  },

  async deleteBatch(id: string): Promise<{ success: boolean; id: string }> {
    const response = await api.delete(`/batches/${id}`);
    return response.data;
  },
};
