export type OfflineActionType = 'LOG_ENTRY' | 'CLEANING_TASK_COMPLETE';

export interface OfflineQueueItem {
  id: string;
  type: OfflineActionType;
  payload: any;
  status: 'PENDING' | 'SYNCING' | 'ERROR';
  timestamp: number;
}

const DB_NAME = 'haccp_offline_db';
const STORE_NAME = 'sync_queue';
const DB_VERSION = 1;

/**
 * Offline Sync Service using native IndexedDB API.
 * Stores pending HACCP logs and sanitation tasks locally when network is unavailable.
 */
class OfflineSyncService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB is not supported in this environment.'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  /**
   * Save an offline action to IndexedDB sync queue
   */
  async enqueue(type: OfflineActionType, payload: any): Promise<OfflineQueueItem> {
    const db = await this.getDB();
    const item: OfflineQueueItem = {
      id: `offline_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      status: 'PENDING',
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.add(item);

      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending queue items sorted by timestamp
   */
  async getPendingQueue(): Promise<OfflineQueueItem[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const items: OfflineQueueItem[] = request.result || [];
        const pending = items.filter((i) => i.status === 'PENDING').sort((a, b) => a.timestamp - b.timestamp);
        resolve(pending);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove a successfully synced item from IndexedDB
   */
  async removeQueueItem(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get count of pending items in sync queue
   */
  async getQueueCount(): Promise<number> {
    try {
      const pending = await this.getPendingQueue();
      return pending.length;
    } catch {
      return 0;
    }
  }

  /**
   * Clear all items in queue
   */
  async clearQueue(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineSyncService = new OfflineSyncService();
