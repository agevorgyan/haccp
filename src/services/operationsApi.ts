import { api } from './api';

export type CleaningFrequency =
  | 'ONCE'
  | 'HOURLY'
  | 'PER_SHIFT'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY';

export const CleaningFrequency = {
  ONCE: 'ONCE',
  HOURLY: 'HOURLY',
  PER_SHIFT: 'PER_SHIFT',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
} as const;

export type CleaningTaskStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'VERIFIED';
export const CleaningTaskStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  OVERDUE: 'OVERDUE',
  VERIFIED: 'VERIFIED',
} as const;

export interface CleaningTask {
  id: string;
  organizationId: string;
  branchId?: string;
  area: string;
  equipment?: string;
  chemical: string;
  concentration?: string;
  frequency: CleaningFrequency;
  method: string;
  responsibleRole: string;
  assignedTo?: string;
  status: CleaningTaskStatus;
  completedBy?: string;
  completedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';
export const SupplierStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLACKLISTED: 'BLACKLISTED',
} as const;

export type SupplierRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export const SupplierRiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export interface Supplier {
  id: string;
  organizationId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  categories: string[];
  certificates?: Record<string, any>;
  status: SupplierStatus;
  riskLevel: SupplierRiskLevel;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export type PackagingCondition = 'INTACT' | 'DAMAGED' | 'COMPROMISED';
export const PackagingCondition = {
  INTACT: 'INTACT',
  DAMAGED: 'DAMAGED',
  COMPROMISED: 'COMPROMISED',
} as const;

export type ReceivingStatus = 'ACCEPTED' | 'REJECTED';
export const ReceivingStatus = {
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;

export interface ReceivingLog {
  id: string;
  organizationId: string;
  branchId?: string;
  supplierId: string;
  receivedBy: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  temperature?: number;
  packagingCondition: PackagingCondition;
  expiryDate: string;
  status: ReceivingStatus;
  rejectionReason?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  supplier?: Supplier;
}

export const operationsApi = {
  // Cleaning Tasks
  async getCleaningTasks(): Promise<CleaningTask[]> {
    const response = await api.get('/cleaning-tasks');
    return response.data;
  },

  async createCleaningTask(data: {
    area: string;
    equipment?: string;
    chemical: string;
    concentration?: string;
    frequency: CleaningFrequency;
    method: string;
    responsibleRole: string;
    assignedTo?: string;
    branchId?: string;
  }): Promise<CleaningTask> {
    const response = await api.post('/cleaning-tasks', data);
    return response.data;
  },

  async updateCleaningTask(id: string, data: Partial<CleaningTask>): Promise<CleaningTask> {
    const response = await api.put(`/cleaning-tasks/${id}`, data);
    return response.data;
  },

  async completeCleaningTask(
    id: string,
    photoUrl?: string,
    notes?: string,
  ): Promise<CleaningTask> {
    const response = await api.patch(`/cleaning-tasks/${id}/complete`, { photoUrl, notes });
    return response.data;
  },

  async verifyCleaningTask(id: string, notes?: string): Promise<CleaningTask> {
    const response = await api.patch(`/cleaning-tasks/${id}/verify`, { notes });
    return response.data;
  },

  async deleteCleaningTask(id: string): Promise<{ success: boolean; id: string }> {
    const response = await api.delete(`/cleaning-tasks/${id}`);
    return response.data;
  },

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    const response = await api.get('/suppliers');
    return response.data;
  },

  async createSupplier(data: {
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    categories: string[];
    riskLevel?: SupplierRiskLevel;
    certificates?: Record<string, any>;
  }): Promise<Supplier> {
    const response = await api.post('/suppliers', data);
    return response.data;
  },

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  },

  async deleteSupplier(id: string): Promise<{ success: boolean; id: string }> {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },

  // Receiving Logs
  async getReceivingLogs(): Promise<ReceivingLog[]> {
    const response = await api.get('/receiving');
    return response.data;
  },

  async createReceivingLog(data: {
    supplierId: string;
    productName: string;
    batchNumber: string;
    quantity: number;
    unit: string;
    temperature?: number;
    packagingCondition: PackagingCondition;
    expiryDate: string;
    status: ReceivingStatus;
    rejectionReason?: string;
    photoUrl?: string;
    branchId?: string;
  }): Promise<ReceivingLog> {
    const response = await api.post('/receiving', data);
    return response.data;
  },
};
