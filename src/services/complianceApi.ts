import { api } from './api';

export type ViolationSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export const ViolationSeverity = {
  INFO: 'INFO',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type ViolationStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export const ViolationStatus = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

export interface Violation {
  id: string;
  organizationId: string;
  branchId?: string;
  sourceType: string;
  sourceId: string;
  severity: ViolationSeverity;
  rule: string;
  actualValue: string;
  expectedValue: string;
  status: ViolationStatus;
  detectedAt: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export type CapaStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING_REVIEW'
  | 'VERIFICATION'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CLOSED';

export const CapaStatus = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_REVIEW: 'PENDING_REVIEW',
  VERIFICATION: 'VERIFICATION',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
  CLOSED: 'CLOSED',
} as const;

export interface CorrectiveAction {
  id: string;
  organizationId: string;
  branchId?: string;
  violationId: string;
  description: string;
  rootCause?: string;
  immediateAction: string;
  preventiveAction: string;
  assignedTo: string;
  deadline: string;
  status: CapaStatus;
  approvedBy?: string;
  actionNotes?: string;
  evidenceUrl?: string;
  createdAt: string;
  updatedAt: string;
  violation?: Violation;
}

export const complianceApi = {
  // Violations
  async getViolations(): Promise<Violation[]> {
    const response = await api.get('/violations');
    return response.data;
  },

  async getViolation(id: string): Promise<Violation> {
    const response = await api.get(`/violations/${id}`);
    return response.data;
  },

  async updateViolationStatus(id: string, status: ViolationStatus): Promise<Violation> {
    const response = await api.patch(`/violations/${id}/status`, { status });
    return response.data;
  },

  // CAPAs
  async getCapas(): Promise<CorrectiveAction[]> {
    const response = await api.get('/capas');
    return response.data;
  },

  async getCapa(id: string): Promise<CorrectiveAction> {
    const response = await api.get(`/capas/${id}`);
    return response.data;
  },

  async createCapa(data: {
    violationId: string;
    description: string;
    rootCause?: string;
    immediateAction: string;
    preventiveAction: string;
    assignedTo: string;
    deadline: string;
    branchId?: string;
  }): Promise<CorrectiveAction> {
    const response = await api.post('/capas', data);
    return response.data;
  },

  async updateCapaStatus(
    id: string,
    status: CapaStatus,
    extra?: { actionNotes?: string; evidenceUrl?: string; rootCause?: string },
  ): Promise<CorrectiveAction> {
    const response = await api.patch(`/capas/${id}/status`, { status, ...extra });
    return response.data;
  },
};
