import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { authService } from '../services/authService';
import { notificationService, type AppNotification, urlBase64ToUint8Array } from '../services/notificationService';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  pushEnabled: boolean;
  pushLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  enablePushNotifications: () => Promise<boolean>;
  sendTestAlert: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pushEnabled, setPushEnabled] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });
  const [pushLoading, setPushLoading] = useState<boolean>(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    if (!authService.isAuthenticated()) return;
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.warn('Failed to fetch notifications from backend:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Register service worker on mount if supported
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Service Worker registered successfully:', reg.scope))
        .catch((err) => console.warn('Service Worker registration failed:', err));
    }
  }, []);

  // Socket.io Real-time Connection setup
  useEffect(() => {
    if (!authService.isAuthenticated()) return;

    fetchNotifications();

    const token = authService.getToken();
    if (!token) return;

    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const socket: Socket = io(`${backendUrl}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connected to NestJS Notifications Gateway via WebSocket');
    });

    socket.on('notification', (newNotification: AppNotification) => {
      console.log('Real-time notification received via Socket.io:', newNotification);
      setNotifications((prev) => [newNotification, ...prev.filter((n) => n.id !== newNotification.id)]);

      // Browser native Notification fallback if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/icon-192.png',
          });
        } catch {
          // ignore
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Notifications Gateway');
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const enablePushNotifications = async (): Promise<boolean> => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      alert('Web Push Notifications are not supported in this browser.');
      return false;
    }

    setPushLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushEnabled(false);
        alert('Push Notification permission was denied.');
        return false;
      }

      setPushEnabled(true);

      const registration = await navigator.serviceWorker.ready;
      const publicKey = await notificationService.getVapidPublicKey();
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey as any,
        });
      }

      await notificationService.subscribePush(subscription.toJSON());
      return true;
    } catch (err) {
      console.error('Failed to subscribe to Web Push:', err);
      return false;
    } finally {
      setPushLoading(false);
    }
  };

  const sendTestAlert = async () => {
    try {
      await notificationService.sendTestAlert();
    } catch (err) {
      console.error('Failed to trigger test alert:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        pushEnabled,
        pushLoading,
        markAsRead,
        markAllAsRead,
        enablePushNotifications,
        sendTestAlert,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
