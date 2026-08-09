import { api } from './api';

export type FormFieldType =
  | 'TEXT'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'SELECT'
  | 'PHOTO'
  | 'SIGNATURE'
  | 'TEMPERATURE';

export const FormFieldType = {
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  SELECT: 'SELECT',
  PHOTO: 'PHOTO',
  SIGNATURE: 'SIGNATURE',
  TEMPERATURE: 'TEMPERATURE',
} as const;

export interface FormFieldSchema {
  id: string;
  type: FormFieldType;
  label: string;
  required?: boolean;
  min?: number;
  max?: number;
  unit?: string;
  options?: string[];
}

export type LogTemplateStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
export const LogTemplateStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  DRAFT: 'DRAFT',
} as const;

export interface LogTemplate {
  id: string;
  organizationId: string;
  branchId?: string;
  ccpId?: string;
  name: string;
  description?: string;
  fields: FormFieldSchema[];
  status: LogTemplateStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export type LogEntryStatus = 'DRAFT' | 'SUBMITTED' | 'CORRECTED';
export const LogEntryStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  CORRECTED: 'CORRECTED',
} as const;

export interface LogEntry {
  id: string;
  organizationId: string;
  branchId?: string;
  templateId: string;
  templateVersion: number;
  userId: string;
  timestamp: string;
  shiftId?: string;
  status: LogEntryStatus;
  data: Record<string, any>;
  location?: string;
  device?: string;
  createdAt: string;
  updatedAt: string;
  template?: LogTemplate;
}

export type CorrectionRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export const CorrectionRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export interface CorrectionRequest {
  id: string;
  organizationId: string;
  logEntryId: string;
  requestedBy: string;
  reason: string;
  proposedData: Record<string, any>;
  status: CorrectionRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerNote?: string;
  createdAt: string;
  updatedAt: string;
  logEntry?: LogEntry;
}

export const journalsApi = {
  // Log Templates
  async getLogTemplates(): Promise<LogTemplate[]> {
    const response = await api.get('/log-templates');
    return response.data;
  },

  async getLogTemplate(id: string): Promise<LogTemplate> {
    const response = await api.get(`/log-templates/${id}`);
    return response.data;
  },

  async createLogTemplate(data: {
    name: string;
    description?: string;
    branchId?: string;
    ccpId?: string;
    fields: FormFieldSchema[];
    status?: LogTemplateStatus;
  }): Promise<LogTemplate> {
    const response = await api.post('/log-templates', data);
    return response.data;
  },

  async updateLogTemplate(id: string, data: Partial<LogTemplate>): Promise<LogTemplate> {
    const response = await api.put(`/log-templates/${id}`, data);
    return response.data;
  },

  async deleteLogTemplate(id: string): Promise<{ success: boolean; id: string }> {
    const response = await api.delete(`/log-templates/${id}`);
    return response.data;
  },

  // Log Entries
  async getLogEntries(): Promise<LogEntry[]> {
    const response = await api.get('/log-entries');
    return response.data;
  },

  async getLogEntry(id: string): Promise<LogEntry> {
    const response = await api.get(`/log-entries/${id}`);
    return response.data;
  },

  async createLogEntry(data: {
    templateId: string;
    branchId?: string;
    shiftId?: string;
    data: Record<string, any>;
    location?: string;
    device?: string;
    status?: LogEntryStatus;
  }): Promise<LogEntry> {
    const response = await api.post('/log-entries', data);
    return response.data;
  },

  async updateLogEntry(id: string, data: Partial<LogEntry>): Promise<LogEntry> {
    const response = await api.put(`/log-entries/${id}`, data);
    return response.data;
  },

  async deleteLogEntry(id: string): Promise<{ success: boolean; id: string }> {
    const response = await api.delete(`/log-entries/${id}`);
    return response.data;
  },

  // Correction Requests
  async getCorrectionRequests(): Promise<CorrectionRequest[]> {
    const response = await api.get('/correction-requests');
    return response.data;
  },

  async createCorrectionRequest(data: {
    logEntryId: string;
    reason: string;
    proposedData: Record<string, any>;
  }): Promise<CorrectionRequest> {
    const response = await api.post('/correction-requests', data);
    return response.data;
  },

  async approveCorrectionRequest(id: string, reviewerNote?: string): Promise<CorrectionRequest> {
    const response = await api.patch(`/correction-requests/${id}/approve`, { reviewerNote });
    return response.data;
  },

  async rejectCorrectionRequest(id: string, reviewerNote?: string): Promise<CorrectionRequest> {
    const response = await api.patch(`/correction-requests/${id}/reject`, { reviewerNote });
    return response.data;
  },
};
