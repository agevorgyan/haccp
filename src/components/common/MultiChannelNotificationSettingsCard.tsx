import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BellRing,
  Mail,
  Send,
  Monitor,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Copy,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const MultiChannelNotificationSettingsCard: React.FC = () => {
  const { t } = useTranslation();
  const {
    pushEnabled,
    pushLoading,
    enablePushNotifications,
    userPrefs,
    email,
    isTelegramConnected,
    telegramChatId,
    updateChannelPreferences,
    generateTelegramCode,
    disconnectTelegram,
    sendTestAlert,
  } = useNotifications();

  // Email state editing
  const [emailInput, setEmailInput] = useState<string>(email || '');
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);

  // Telegram modal state
  const [showTelegramModal, setShowTelegramModal] = useState<boolean>(false);
  const [telegramCode, setTelegramCode] = useState<string>('');
  const [botUsername, setBotUsername] = useState<string>('SafeKitchenHACCPBot');
  const [telegramLoading, setTelegramLoading] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleToggleInApp = () => {
    updateChannelPreferences({ inApp: !userPrefs.inApp });
  };

  const handleTogglePush = () => {
    if (!pushEnabled) {
      enablePushNotifications();
    } else {
      updateChannelPreferences({ push: !userPrefs.push });
    }
  };

  const handleToggleEmail = () => {
    updateChannelPreferences({ email: !userPrefs.email });
  };

  const handleToggleTelegram = () => {
    if (!isTelegramConnected) {
      handleOpenTelegramModal();
    } else {
      updateChannelPreferences({ telegram: !userPrefs.telegram });
    }
  };

  const handleSaveEmail = () => {
    if (emailInput.trim()) {
      updateChannelPreferences({}, emailInput.trim());
      setIsEditingEmail(false);
    }
  };

  const handleOpenTelegramModal = async () => {
    setTelegramLoading(true);
    setShowTelegramModal(true);
    try {
      const res = await generateTelegramCode();
      setTelegramCode(res.code);
      if (res.botUsername) {
        setBotUsername(res.botUsername);
      }
    } catch (err) {
      console.error('Failed to generate Telegram link code:', err);
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (telegramCode) {
      navigator.clipboard.writeText(telegramCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800/80 shadow-sm backdrop-blur-sm space-y-6 antialiased">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {t('notifications.multiChannelTitle', 'Multi-Channel Compliance Alerts & Notifications')}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {t(
                'notifications.multiChannelSub',
                'Configure real-time delivery channels for HACCP Critical Control Point (CCP) deviations and shift reports.',
              )}
            </p>
          </div>
        </div>

        {/* Global Test Alert Trigger */}
        <button
          onClick={() => sendTestAlert(['APP', 'PUSH', 'EMAIL', 'TELEGRAM'])}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>{t('notifications.testMultiChannel', 'Test All Active Channels')}</span>
        </button>
      </div>

      {/* 4 Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Channel 1: In-App Alerts */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{t('notifications.inAppTitle', 'In-App Real-Time Feed')}</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                {t('notifications.inAppSub', 'Live WebSocket stream in top navigation bell.')}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              checked={userPrefs.inApp}
              onChange={handleToggleInApp}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Channel 2: Browser Push Notifications */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white">
                  {t('notifications.pushTitle', 'Browser Push Notifications')}
                </h4>
                {pushEnabled ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                    <XCircle className="w-3 h-3" /> Permission Needed
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                {t('notifications.pushSub', 'OS desktop/mobile popups via Web Push.')}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              checked={userPrefs.push && pushEnabled}
              onChange={handleTogglePush}
              disabled={pushLoading}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Channel 3: Email Compliance Alerts */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white">
                {t('notifications.emailTitle', 'Email Compliance Alerts')}
              </h4>
              <div className="mt-1 flex items-center gap-2">
                {!isEditingEmail ? (
                  <>
                    <span className="text-[11px] text-slate-300 font-mono truncate max-w-[160px]">
                      {email || 'No email configured'}
                    </span>
                    <button
                      onClick={() => {
                        setEmailInput(email);
                        setIsEditingEmail(true);
                      }}
                      className="text-[10px] text-emerald-400 hover:underline font-semibold cursor-pointer shrink-0"
                    >
                      {t('common.edit', 'Edit')}
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="user@example.com"
                      className="px-2 py-0.5 bg-slate-950 border border-slate-700 rounded text-[11px] text-white focus:outline-none focus:border-emerald-500 font-mono w-36"
                    />
                    <button
                      onClick={handleSaveEmail}
                      className="p-1 rounded bg-emerald-500 text-slate-950 text-[10px] font-bold cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              checked={userPrefs.email}
              onChange={handleToggleEmail}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Channel 4: Telegram Instant Bot Alerts */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white">
                  {t('notifications.telegramTitle', 'Telegram Instant Bot Alerts')}
                </h4>
                {isTelegramConnected ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500">
                    Not Linked
                  </span>
                )}
              </div>

              {isTelegramConnected ? (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {telegramChatId || 'Linked'}
                  </span>
                  <button
                    onClick={() => disconnectTelegram()}
                    className="text-[10px] text-rose-400 hover:underline font-semibold cursor-pointer"
                  >
                    {t('notifications.disconnect', 'Disconnect')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleOpenTelegramModal}
                  className="mt-1 text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer underline"
                >
                  <span>{t('notifications.connectTelegram', 'Connect Telegram Bot')}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              checked={userPrefs.telegram && isTelegramConnected}
              onChange={handleToggleTelegram}
              disabled={!isTelegramConnected}
              className="sr-only peer disabled:opacity-40"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>

      {/* Telegram Link Modal */}
      {showTelegramModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {t('notifications.linkTelegramTitle', 'Connect Telegram Bot')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Receive instant HACCP alerts on Telegram
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTelegramModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {telegramLoading ? (
              <div className="p-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-teal-400 mx-auto" />
                <p className="text-xs text-slate-400">Generating secure 6-digit linking code...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <li>
                    Open Telegram and search for <strong className="text-teal-400">@{botUsername}</strong> or click below:
                  </li>
                  <li className="pl-4 pt-1">
                    <a
                      href={`https://t.me/${botUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 font-bold border border-teal-500/20 hover:bg-teal-500/20 transition-all"
                    >
                      <span>Open @{botUsername}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </li>
                  <li className="pt-2">
                    Send the 6-digit verification code below to the bot:
                  </li>
                </ol>

                {/* 6-Digit Code Display */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/30 text-center space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">
                    Your Verification Code
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl font-black font-mono tracking-widest text-teal-400">
                      {telegramCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                      title="Copy code"
                    >
                      {copiedCode ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                  {copiedCode && (
                    <span className="text-[10px] font-bold text-emerald-400 block animate-fadeIn">
                      {t('notifications.codeCopied', 'Code copied to clipboard!')}
                    </span>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowTelegramModal(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
                  >
                    {t('common.save', 'Done')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
