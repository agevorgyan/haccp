import React from 'react';
import { useTranslation } from 'react-i18next';
import { BellRing, ShieldCheck, CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const PushNotificationSettingsCard: React.FC = () => {
  const { t } = useTranslation();
  const { pushEnabled, pushLoading, enablePushNotifications, sendTestAlert } = useNotifications();

  return (
    <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800/80 shadow-sm backdrop-blur-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                {t('notifications.enablePushTitle', 'Browser Push Notifications & Real-Time Alerts')}
              </h3>
              {pushEnabled ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {t('notifications.enabled', 'Enabled')}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {t('notifications.disabled', 'Disabled')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {t(
                'notifications.enablePushSub',
                'Receive instant OS-level desktop & mobile alerts when Critical Control Points (CCP) or temperature safe zones are breached.',
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => sendTestAlert()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-400 text-xs font-bold border border-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Send real-time test notification"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>{t('notifications.testAlert', 'Test Notification')}</span>
          </button>

          <button
            onClick={() => enablePushNotifications()}
            disabled={pushLoading || pushEnabled}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              pushEnabled
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            } disabled:opacity-60`}
          >
            {pushLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('notifications.enabling', 'Configuring...')}</span>
              </>
            ) : pushEnabled ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{t('notifications.pushEnabledBtn', 'Push Active')}</span>
              </>
            ) : (
              <>
                <BellRing className="w-4 h-4" />
                <span>{t('notifications.enablePushBtn', 'Enable Push Notifications')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
