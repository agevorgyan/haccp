import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { offlineSyncService } from '../services/offlineSyncService';
import { journalsApi } from '../services/journalsApi';
import { operationsApi } from '../services/operationsApi';

interface SyncContextType {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  triggerSync: () => Promise<void>;
  refreshPendingCount: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await offlineSyncService.getQueueCount();
      setPendingCount(count);
    } catch {
      setPendingCount(0);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    try {
      const pendingItems = await offlineSyncService.getPendingQueue();
      if (pendingItems.length === 0) {
        await refreshPendingCount();
        return;
      }

      setIsSyncing(true);

      for (const item of pendingItems) {
        try {
          if (item.type === 'LOG_ENTRY') {
            await journalsApi.createLogEntry(item.payload);
          } else if (item.type === 'CLEANING_TASK_COMPLETE') {
            await operationsApi.completeCleaningTask(
              item.payload.taskId,
              item.payload.photoUrl,
              item.payload.notes
            );
          }
          await offlineSyncService.removeQueueItem(item.id);
        } catch (err) {
          console.error(`Failed to sync offline item ${item.id}:`, err);
        }
      }
    } catch (err) {
      console.error('Offline auto-sync failed:', err);
    } finally {
      setIsSyncing(false);
      await refreshPendingCount();
    }
  }, [isSyncing, refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync check if online
    if (navigator.onLine) {
      triggerSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync, refreshPendingCount]);

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        pendingCount,
        isSyncing,
        triggerSync,
        refreshPendingCount,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
