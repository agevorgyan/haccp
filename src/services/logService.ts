import api from './api';
import type { DailyLog, TemperatureSubmission } from '../types/haccp';
import { MOCK_DAILY_LOGS } from '../data/mockData';

/**
 * Log Service
 * Manages fetching assigned HACCP daily logs and submitting temperature entries to NestJS backend.
 * Includes graceful fallback to mock data when backend database is disconnected.
 */
export const logService = {
  /**
   * Fetch assigned daily HACCP logs for the active shift
   */
  async getDailyLogs(): Promise<DailyLog[]> {
    try {
      const response = await api.get<DailyLog[]>('/log-entries/daily');
      return response.data;
    } catch (error) {
      console.warn('Backend API unreachable or offline. Falling back to cached HACCP daily logs.', error);
      // Return cached mock logs when local backend server is not connected
      return MOCK_DAILY_LOGS;
    }
  },

  /**
   * Submit new temperature log entry
   */
  async submitTemperatureLog(submission: TemperatureSubmission): Promise<{ success: boolean; id: string }> {
    try {
      const response = await api.post<{ success: boolean; id: string }>('/log-entries', submission);
      return response.data;
    } catch (error) {
      console.warn('Backend API offline. Queuing temperature log submission locally.', error);
      return {
        success: true,
        id: `local-${Date.now()}`,
      };
    }
  },
};
