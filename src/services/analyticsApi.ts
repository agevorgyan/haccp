import { api } from './api';

export interface AnalyticsOverview {
  complianceScore: number;
  totalLogs30d: number;
  violations30d: number;
  openViolationsCount: number;
  openViolationsBySeverity: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
    INFO: number;
  };
  activeCapasCount: number;
}

export interface DailyTrendItem {
  date: string;
  logsCount: number;
  violationsCount: number;
  complianceRate: number;
}

export const analyticsApi = {
  async getOverview(): Promise<AnalyticsOverview> {
    const response = await api.get('/analytics/overview');
    return response.data;
  },

  async getTrends(): Promise<DailyTrendItem[]> {
    const response = await api.get('/analytics/trends');
    return response.data;
  },
};
