import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import type { AppNotification } from '../../services/notificationService';

export const NotificationBell: React.FC = () => {
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    sendTestAlert,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'ALERT':
      case 'CRITICAL':
        return <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'INFO':
      default:
        return <Info className="w-4 h-4 text-sky-400 shrink-0" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      if (seconds < 60) return t('notifications.justNow', 'Just now');
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-all cursor-pointer focus:outline-none"
        aria-label={t('notifications.title', 'Notifications')}
        title={t('notifications.title', 'Notifications')}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 flex items-center justify-center">
              <span className="sr-only">{unreadCount}</span>
            </span>
          </>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                {t('notifications.title', 'Notifications')}
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  {unreadCount} {t('notifications.unread', 'unread')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                  title={t('notifications.markAllAsRead', 'Mark all as read')}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('notifications.markAllAsRead', 'Mark all read')}</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions Sub-bar (Dev test alert shortcut) */}
          <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('notifications.liveStream', 'Live Alerts Channel')}
            </span>
            <button
              onClick={() => sendTestAlert()}
              className="text-[10px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
              title="Simulate CCP Violation Alert"
            >
              <Sparkles className="w-3 h-3" />
              <span>{t('notifications.sendTestAlert', 'Test Alert')}</span>
            </button>
          </div>

          {/* Notification List Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Bell className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
                <p className="text-xs font-medium">{t('notifications.noNotifications', 'No notifications yet')}</p>
                <p className="text-[10px] text-slate-600">
                  {t('notifications.emptySub', 'System alerts and CCP deviations will appear here.')}
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.isRead && markAsRead(item.id)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-800/50 ${
                    !item.isRead ? 'bg-slate-950/60' : 'opacity-75'
                  }`}
                >
                  <div className="mt-0.5">{renderNotificationIcon(item.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs font-semibold leading-snug truncate ${
                          !item.isRead ? 'text-white font-bold' : 'text-slate-300'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
