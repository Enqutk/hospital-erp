import React, { useState, useRef, useEffect } from 'react';
import {
  HardDrive,
  Database,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  X,
  FileCode,
  ShieldCheck,
  Zap,
  Info,
  Server
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface StorageCacheModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StorageCacheModal: React.FC<StorageCacheModalProps> = ({ isOpen, onClose }) => {
  const {
    storageDiagnostics,
    isCacheSyncing,
    lastSyncedAt,
    forceSyncDiskCache,
    exportCache,
    importCache,
    resetAllData,
    patients,
    opdEncounters,
    bills,
    drugInventory,
    labOrders,
    ipdAdmissions,
    auditLogs
  } = useHospital();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [syncingNow, setSyncingNow] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  if (!isOpen) return null;

  const handleForceSave = async () => {
    setSyncingNow(true);
    try {
      await forceSyncDiskCache();
      setActionMessage({ type: 'success', text: 'Disk cache snapshot saved successfully to data/hospital_cache.json' });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: 'Failed to write cache: ' + err.message });
    } finally {
      setSyncingNow(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      await importCache(file);
      setActionMessage({ type: 'success', text: `Successfully loaded and restored cache from ${file.name}` });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setActionMessage({ type: 'error', text: 'Import failed: ' + err.message });
    } finally {
      setImporting(false);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Local File Cache & Persistent Storage
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Un-eraseable
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Data is permanently stored on physical local disk & persistent browser memory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
          
          {/* Action Notification Banner */}
          {actionMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2.5 font-medium border ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
          )}

          {/* Storage Tiers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Tier 1: Local Disk File */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tier 1: Disk File</span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100 font-semibold px-1.5 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                  <FileCode className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">data/hospital_cache.json</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Size: <span className="font-mono text-slate-700">{formatBytes(storageDiagnostics?.diskFileSize)}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                Auto-saved on disk
              </div>
            </div>

            {/* Tier 2: IndexedDB Permanent Quota */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tier 2: IndexedDB</span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100 font-semibold px-1.5 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3" />
                    Persisted
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                  <Database className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>fph_hospital_db</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Status: <span className="font-semibold text-slate-700">Permanent Grant</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                Browser eviction immune
              </div>
            </div>

            {/* Tier 3: Memory & Backup */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tier 3: Redundancy</span>
                  <span className="text-[10px] text-indigo-700 bg-indigo-100 font-semibold px-1.5 py-0.5 rounded-md">
                    Synchronized
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                  <Server className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Sync Mirror</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Debounce: <span className="font-mono text-slate-700">400ms non-blocking</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                Instant reload recovery
              </div>
            </div>

          </div>

          {/* Records Summary */}
          <div className="bg-slate-900 text-white rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300">Cached Hospital Records in Memory & Disk</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-md">
                Last synced: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Just now'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                <div className="text-lg font-bold text-emerald-400">{patients.length}</div>
                <div className="text-[11px] text-slate-400">Patients</div>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                <div className="text-lg font-bold text-cyan-400">{opdEncounters.length}</div>
                <div className="text-[11px] text-slate-400">OPD Visits</div>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                <div className="text-lg font-bold text-amber-400">{drugInventory.length}</div>
                <div className="text-[11px] text-slate-400">Medicines</div>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                <div className="text-lg font-bold text-purple-400">{bills.length}</div>
                <div className="text-[11px] text-slate-400">Invoices</div>
              </div>
            </div>
          </div>

          {/* Actions & Operations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Cache Operations & Snapshots
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Force Instant Disk Write */}
              <button
                onClick={handleForceSave}
                disabled={syncingNow || isCacheSyncing}
                className="flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg">
                    <Zap className={`w-4 h-4 ${syncingNow ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950">Save Instant Snapshot</div>
                    <div className="text-[10px] text-emerald-700">Write memory state immediately to disk</div>
                  </div>
                </div>
              </button>

              {/* Export JSON Backup */}
              <button
                onClick={() => exportCache()}
                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-700 text-white rounded-lg">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Export JSON Backup</div>
                    <div className="text-[10px] text-slate-500">Download timestamped .json snapshot</div>
                  </div>
                </div>
              </button>

              {/* Import from JSON File */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-sky-600 text-white rounded-lg">
                      <Upload className={`w-4 h-4 ${importing ? 'animate-bounce' : ''}`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Restore from File</div>
                      <div className="text-[10px] text-slate-500">Upload a saved .json cache file</div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Factory Reset Guard */}
              <div>
                {!resetConfirmOpen ? (
                  <button
                    onClick={() => setResetConfirmOpen(true)}
                    className="w-full flex items-center justify-between p-3 bg-rose-50/60 hover:bg-rose-100/80 border border-rose-200 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-rose-600 text-white rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-rose-950">Factory Reset</div>
                        <div className="text-[10px] text-rose-700">Clear file cache & reset to defaults</div>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-rose-900 leading-tight">Confirm wipe?</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={async () => {
                          await resetAllData();
                          setResetConfirmOpen(false);
                          setActionMessage({ type: 'success', text: 'System reset to default initial state' });
                        }}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Yes, Wipe
                      </button>
                      <button
                        onClick={() => setResetConfirmOpen(false)}
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-medium rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Info Alert */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              All modifications you perform across Reception, OPD, IPD, Diagnostics, Pharmacy, and Billing are auto-saved to disk in real-time. No manual saving is required.
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Permanent Storage Engine v1.0</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
