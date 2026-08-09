import React from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff, RefreshCw, CloudUpload } from 'lucide-react';
import { useSync } from '../../context/SyncContext';

/**
 * OfflineBadge Component
 * Dynamically displays Offline Status, Syncing state, and Pending Queue items counter.
 */
export const OfflineBadge: React.FC = () => {
  const { t } = useTranslation();
  const { isOnline, pendingCount, isSyncing, triggerSync } = useSync();

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div
      className={`fixed top-3 right-3 z-50 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl backdrop-blur-md transition-all duration-300 ${
        isSyncing
          ? 'bg-blue-600 text-white animate-pulse'
          : !isOnline
          ? 'bg-amber-500 text-slate-950 animate-pulse'
          : 'bg-emerald-600 text-white'
      }`}
      role="status"
      aria-live="polite"
    >
      {isSyncing ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>{t('offline.syncing', 'Syncing...')}</span>
        </>
      ) : !isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          <span>{t('offline.title', 'Offline Mode')}</span>
          {pendingCount > 0 && (
            <span className="ml-1 bg-slate-950 text-amber-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </>
      ) : (
        <button
          onClick={() => triggerSync()}
          className="flex items-center gap-1.5 hover:underline cursor-pointer"
        >
          <CloudUpload className="w-3.5 h-3.5" />
          <span>{t('offline.pendingSync', `Pending Sync: ${pendingCount}`)}</span>
        </button>
      )}
    </div>
  );
};
