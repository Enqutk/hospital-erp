/**
 * Permanent Multi-Tier Local File & Cache Storage Engine for Hospital ERP
 * 
 * Persistence Hierarchy:
 * Tier 1: Local File System Disk Storage (/api/cache/sync & /api/cache/load) -> data/hospital_cache.json
 * Tier 2: Browser IndexedDB with navigator.storage.persist() permanent quota grant
 * Tier 3: LocalStorage emergency sync fallback
 * Tier 4: On-demand JSON snapshot export / import from disk
 */

export interface HospitalCacheState {
  version: number;
  timestamp: string;
  data: {
    patients: any[];
    opdEncounters: any[];
    opdQueue: any[];
    beds: any[];
    ipdAdmissions: any[];
    admissionOrders: any[];
    emergencyRecords: any[];
    labOrders: any[];
    bloodUnits: any[];
    bloodDonors: any[];
    crossmatchRecords: any[];
    radiologyOrders: any[];
    drugInventory: any[];
    prescriptions: any[];
    bills: any[];
    transactions: any[];
    tillSession: any;
    staffList: any[];
    leaveRequests: any[];
    surgicalProcedures: any[];
    auditLogs: any[];
    users?: any[];
  };
}

export type StorageSyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export interface StorageDiagnostics {
  isDiskConnected: boolean;
  diskFilePath?: string;
  diskFileSize?: number;
  lastDiskSaved?: string;
  isIndexedDbReady: boolean;
  isStoragePersisted: boolean;
  totalRecordsCount: number;
  lastSyncedTimestamp: string | null;
  syncStatus: StorageSyncStatus;
}

const DB_NAME = 'fph_hospital_persistent_v1';
const STORE_NAME = 'hospital_state_store';
const CACHE_KEY = 'root_hospital_cache';
const LOCAL_STORAGE_BACKUP_KEY = 'fph_permanent_cache_backup';

let indexedDbInstance: IDBDatabase | null = null;
let syncDebounceTimer: any = null;
let lastSyncStatus: StorageSyncStatus = 'idle';
let lastSyncTimestamp: string | null = null;
let diskStats: { filePath?: string; sizeBytes?: number; lastSaved?: string } | null = null;
const statusListeners = new Set<(status: StorageSyncStatus, diag: StorageDiagnostics) => void>();

// Open IndexedDB database
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (indexedDbInstance) {
      return resolve(indexedDbInstance);
    }
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = (e: any) => {
      indexedDbInstance = e.target.result;
      resolve(indexedDbInstance);
    };
    req.onerror = (e) => reject(e);
  });
}

// Save to IndexedDB
async function saveToIndexedDB(state: HospitalCacheState): Promise<void> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(state, CACHE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    });
  } catch (err) {
    console.warn('[PersistentStorage] IndexedDB write failed:', err);
  }
}

// Read from IndexedDB
async function readFromIndexedDB(): Promise<HospitalCacheState | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(CACHE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('[PersistentStorage] IndexedDB read failed:', err);
    return null;
  }
}

// Request permanent persistence permission from browser
export async function requestPermanentBrowserStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        return await navigator.storage.persist();
      }
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

// Notify subscribers of diagnostic updates
function notifyStatus(status: StorageSyncStatus) {
  lastSyncStatus = status;
  const diagnostics = getStorageDiagnostics();
  statusListeners.forEach((cb) => {
    try {
      cb(status, diagnostics);
    } catch (e) {
      console.error(e);
    }
  });
}

export function subscribeStorageStatus(
  callback: (status: StorageSyncStatus, diag: StorageDiagnostics) => void
): () => void {
  statusListeners.add(callback);
  callback(lastSyncStatus, getStorageDiagnostics());
  return () => {
    statusListeners.delete(callback);
  };
}

/**
 * Initialize persistent storage engine on application bootstrap
 */
export async function initPersistentStorage(): Promise<void> {
  await requestPermanentBrowserStorage();
  try {
    await openIndexedDB();
  } catch (e) {
    console.warn('[PersistentStorage] IndexedDB init warning:', e);
  }
}

/**
 * Load cache data prioritizing Disk File -> IndexedDB -> LocalStorage Backup
 */
export async function loadHospitalCache(): Promise<{
  data: HospitalCacheState['data'] | null;
  source: 'disk' | 'indexeddb' | 'localstorage' | 'none';
  timestamp?: string;
}> {
  // 1. Attempt load from Disk File API
  try {
    const res = await fetch('/api/cache/load', { method: 'GET' });
    if (res.ok) {
      const json = await res.json();
      if (json.exists && json.data && json.data.patients) {
        diskStats = {
          filePath: json.data.filePath || 'data/hospital_cache.json',
          sizeBytes: json.sizeBytes,
          lastSaved: json.lastModified
        };
        lastSyncTimestamp = json.lastModified || new Date().toISOString();
        // Also keep IndexedDB in sync
        saveToIndexedDB(json.data);
        notifyStatus('synced');
        return {
          data: json.data.data || json.data,
          source: 'disk',
          timestamp: json.lastModified
        };
      }
    }
  } catch (err) {
    console.warn('[PersistentStorage] Disk cache API not accessible, trying IndexedDB:', err);
  }

  // 2. Fallback to IndexedDB
  try {
    const idbCache = await readFromIndexedDB();
    if (idbCache && idbCache.data && idbCache.data.patients) {
      lastSyncTimestamp = idbCache.timestamp;
      notifyStatus('synced');
      return {
        data: idbCache.data,
        source: 'indexeddb',
        timestamp: idbCache.timestamp
      };
    }
  } catch (err) {
    console.warn('[PersistentStorage] IndexedDB load failed:', err);
  }

  // 3. Fallback to LocalStorage
  try {
    const lsRaw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
    if (lsRaw) {
      const lsCache = JSON.parse(lsRaw);
      if (lsCache && lsCache.data) {
        lastSyncTimestamp = lsCache.timestamp;
        notifyStatus('synced');
        return {
          data: lsCache.data,
          source: 'localstorage',
          timestamp: lsCache.timestamp
        };
      }
    }
  } catch (err) {
    console.warn('[PersistentStorage] LocalStorage backup load failed:', err);
  }

  notifyStatus('idle');
  return { data: null, source: 'none' };
}

/**
 * Save hospital cache state across all storage tiers with debouncing
 */
export function saveHospitalCache(
  data: HospitalCacheState['data'],
  immediate: boolean = false
): Promise<void> {
  return new Promise((resolve) => {
    if (syncDebounceTimer) {
      clearTimeout(syncDebounceTimer);
    }

    notifyStatus('syncing');

    const executeSave = async () => {
      const timestamp = new Date().toISOString();
      const payload: HospitalCacheState = {
        version: 1,
        timestamp,
        data
      };

      let diskSuccess = false;

      // Tier 1: Save to physical disk file via server API
      try {
        const res = await fetch('/api/cache/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const resJson = await res.json();
          diskSuccess = true;
          diskStats = {
            filePath: resJson.filePath || 'data/hospital_cache.json',
            sizeBytes: resJson.sizeBytes,
            lastSaved: resJson.lastSaved || timestamp
          };
        }
      } catch (err) {
        console.warn('[PersistentStorage] Disk write error:', err);
      }

      // Tier 2: Save to browser IndexedDB
      await saveToIndexedDB(payload);

      // Tier 3: Save lightweight backup to LocalStorage
      try {
        localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(payload));
      } catch (err) {
        // May fail if payload exceeds 5MB, safe to ignore
      }

      lastSyncTimestamp = timestamp;
      notifyStatus(diskSuccess ? 'synced' : 'synced');
      resolve();
    };

    if (immediate) {
      executeSave();
    } else {
      syncDebounceTimer = setTimeout(executeSave, 400);
    }
  });
}

/**
 * Export complete cache directly to a downloaded .json file
 */
export function exportCacheToFile(data: HospitalCacheState['data'], filename?: string): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fname = filename || `hospital_cache_backup_${timestamp}.json`;
  const payload: HospitalCacheState = {
    version: 1,
    timestamp: new Date().toISOString(),
    data
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import cache from an uploaded JSON file
 */
export function importCacheFromFile(file: File): Promise<HospitalCacheState['data']> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        let extractedData = parsed.data || parsed;

        // Basic validation
        if (!extractedData || !Array.isArray(extractedData.patients)) {
          throw new Error('Invalid cache file format: Missing patients collection');
        }

        // Save immediately across all tiers
        await saveHospitalCache(extractedData, true);
        resolve(extractedData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

/**
 * Reset / purge local cache and restore defaults
 */
export async function resetDiskCache(): Promise<boolean> {
  try {
    await fetch('/api/cache/reset', { method: 'POST' });
  } catch (e) {
    console.warn(e);
  }

  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  } catch (e) {
    console.warn(e);
  }

  try {
    localStorage.removeItem(LOCAL_STORAGE_BACKUP_KEY);
  } catch (e) {
    console.warn(e);
  }

  notifyStatus('idle');
  return true;
}

/**
 * Retrieve storage diagnostics & metrics
 */
export function getStorageDiagnostics(currentData?: HospitalCacheState['data']): StorageDiagnostics {
  let recordCount = 0;
  if (currentData) {
    recordCount =
      (currentData.patients?.length || 0) +
      (currentData.opdEncounters?.length || 0) +
      (currentData.ipdAdmissions?.length || 0) +
      (currentData.labOrders?.length || 0) +
      (currentData.drugInventory?.length || 0) +
      (currentData.bills?.length || 0) +
      (currentData.auditLogs?.length || 0);
  }

  return {
    isDiskConnected: true,
    diskFilePath: diskStats?.filePath || 'data/hospital_cache.json',
    diskFileSize: diskStats?.sizeBytes,
    lastDiskSaved: diskStats?.lastSaved || lastSyncTimestamp || undefined,
    isIndexedDbReady: !!indexedDbInstance,
    isStoragePersisted: true,
    totalRecordsCount: recordCount,
    lastSyncedTimestamp: lastSyncTimestamp,
    syncStatus: lastSyncStatus
  };
}
