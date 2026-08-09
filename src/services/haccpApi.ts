import { api } from './api';

export type HaccpPlanStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'ACTIVE' | 'ARCHIVED';
export const HaccpPlanStatus = {
  DRAFT: 'DRAFT',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;

export type HazardCategory = 'BIOLOGICAL' | 'CHEMICAL' | 'PHYSICAL' | 'ALLERGEN';
export const HazardCategory = {
  BIOLOGICAL: 'BIOLOGICAL',
  CHEMICAL: 'CHEMICAL',
  PHYSICAL: 'PHYSICAL',
  ALLERGEN: 'ALLERGEN',
} as const;

export type CcpStatus = 'ACTIVE' | 'INACTIVE';
export const CcpStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export interface HaccpPlan {
  id: string;
  organizationId: string;
  branchId?: string;
  name: string;
  version: number;
  status: HaccpPlanStatus;
  effectiveFrom?: string;
  effectiveTo?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hazard {
  id: string;
  organizationId: string;
  planId: string;
  processStepId?: string;
  category: HazardCategory;
  description: string;
  source: string;
  preventiveMeasures: string;
  severity: number;
  likelihood: number;
  riskScore: number;
  isSignificant: boolean;
  requiresCCP: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ccp {
  id: string;
  organizationId: string;
  planId: string;
  hazardId: string;
  code: string;
  name: string;
  description?: string;
  criticalLimitMin?: number;
  criticalLimitMax?: number;
  warningLimitMin?: number;
  warningLimitMax?: number;
  unit: string;
  monitoringMethod: string;
  monitoringFrequency: string;
  status: CcpStatus;
  createdAt: string;
  updatedAt: string;
}

export const haccpApi = {
  // HACCP Plans
  async getHaccpPlans(): Promise<HaccpPlan[]> {
    const response = await api.get('/haccp-plans');
    return response.data;
  },

  async getHaccpPlan(id: string): Promise<HaccpPlan> {
    const response = await api.get(`/haccp-plans/${id}`);
    return response.data;
  },

  async createHaccpPlan(data: {
    name: string;
    branchId?: string;
    effectiveFrom?: string;
    effectiveTo?: string;
  }): Promise<HaccpPlan> {
    const response = await api.post('/haccp-plans', data);
    return response.data;
  },

  async updateHaccpPlan(id: string, data: Partial<HaccpPlan>): Promise<HaccpPlan> {
    const response = await api.put(`/haccp-plans/${id}`, data);
    return response.data;
  },

  async createNewPlanVersion(id: string): Promise<HaccpPlan> {
    const response = await api.post(`/haccp-plans/${id}/version`);
    return response.data;
  },

  async approveHaccpPlan(id: string): Promise<HaccpPlan> {
    const response = await api.post(`/haccp-plans/${id}/approve`);
    return response.data;
  },

  // Hazards
  async getHazards(planId?: string): Promise<Hazard[]> {
    if (arguments.length > 0 && (!planId || planId === 'undefined' || planId === 'null')) {
      return Promise.resolve([]);
    }
    const params: Record<string, string> = {};
    if (planId && planId !== 'undefined' && planId !== 'null') {
      params.planId = planId;
    }
    const response = await api.get('/hazards', { params });
    return response.data;
  },

  async createHazard(data: {
    planId: string;
    category: HazardCategory;
    description: string;
    source: string;
    preventiveMeasures: string;
    severity: number;
    likelihood: number;
    processStepId?: string;
  }): Promise<Hazard> {
    const response = await api.post('/hazards', data);
    return response.data;
  },

  async updateHazard(id: string, data: Partial<Hazard>): Promise<Hazard> {
    const response = await api.put(`/hazards/${id}`, data);
    return response.data;
  },

  async deleteHazard(id: string): Promise<{ success: boolean; id: string }> {
    const response = await api.delete(`/hazards/${id}`);
    return response.data;
  },

  // CCPs
  async getCcps(planId?: string): Promise<Ccp[]> {
    if (arguments.length > 0 && (!planId || planId === 'undefined' || planId === 'null')) {
      return Promise.resolve([]);
    }
    const params: Record<string, string> = {};
    if (planId && planId !== 'undefined' && planId !== 'null') {
      params.planId = planId;
    }
    const response = await api.get('/ccps', { params });
    return response.data;
  },

  async createCcp(data: {
    planId: string;
    hazardId: string;
    code: string;
    name: string;
    description?: string;
    criticalLimitMin?: number;
    criticalLimitMax?: number;
    warningLimitMin?: number;
    warningLimitMax?: number;
    unit?: string;
    monitoringMethod: string;
    monitoringFrequency: string;
  }): Promise<Ccp> {
    const response = await api.post('/ccps', data);
    return response.data;
  },

  async updateCcp(id: string, data: Partial<Ccp>): Promise<Ccp> {
    const response = await api.put(`/ccps/${id}`, data);
    return response.data;
  },

  async deleteCcp(id: string): Promise<{ success: boolean; id: string }> {
    const response = await api.delete(`/ccps/${id}`);
    return response.data;
  },
};
