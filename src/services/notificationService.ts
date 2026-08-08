import api from './api';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: 'ALERT' | 'INFO' | 'WARNING' | 'CRITICAL';
  createdAt: string;
}

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    const response = await api.get<AppNotification[]>('/notifications');
    return response.data;
  },

  async markAsRead(id: string): Promise<AppNotification> {
    const response = await api.patch<AppNotification>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<{ success: boolean; updatedCount: number }> {
    const response = await api.patch<{ success: boolean; updatedCount: number }>('/notifications/read-all');
    return response.data;
  },

  async getVapidPublicKey(): Promise<string> {
    const response = await api.get<{ publicKey: string }>('/notifications/vapid-public-key');
    return response.data.publicKey;
  },

  async subscribePush(subscriptionData: Record<string, any>): Promise<any> {
    const response = await api.post('/notifications/subscribe', subscriptionData);
    return response.data;
  },

  async sendTestAlert(data?: { title?: string; message?: string; type?: string }): Promise<AppNotification> {
    const response = await api.post<AppNotification>('/notifications/test-alert', data || {});
    return response.data;
  },
};

/**
 * Utility function to convert VAPID public key base64 string to Uint8Array
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
