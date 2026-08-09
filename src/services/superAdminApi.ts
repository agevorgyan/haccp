import { api } from './api';

export type SubscriptionStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  TRIAL: 'TRIAL',
} as const;

export interface SubscriptionPlan {
  id: string;
  name: string;
  maxUsers: number;
  maxSensors: number;
  priceMonthly: number;
  createdAt: string;
  updatedAt: string;
}

export interface TenantBackofficeItem {
  organization: {
    id: string;
    name: string;
    taxId?: string;
    isActive: boolean;
    subscriptionPlanId?: string;
    subscriptionStatus: SubscriptionStatus;
    createdAt: string;
  };
  userCount: number;
  sensorCount: number;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
}

export const superAdminApi = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get('/super-admin/plans');
    return response.data;
  },

  async createPlan(data: {
    name: string;
    maxUsers: number;
    maxSensors: number;
    priceMonthly: number;
  }): Promise<SubscriptionPlan> {
    const response = await api.post('/super-admin/plans', data);
    return response.data;
  },

  async getTenants(): Promise<TenantBackofficeItem[]> {
    const response = await api.get('/super-admin/tenants');
    return response.data;
  },

  async updateTenantSubscription(
    id: string,
    data: {
      subscriptionPlanId?: string;
      subscriptionStatus?: SubscriptionStatus;
    },
  ): Promise<any> {
    const response = await api.patch(`/super-admin/tenants/${id}/subscription`, data);
    return response.data;
  },
};
