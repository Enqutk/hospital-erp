import React from 'react';
import {
  Shield,
  Clock,
  CheckCircle2,
  Lock,
  LogOut,
  X,
  Building2,
  BadgeCheck,
  User
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface StaffProfileModalProps {
  onClose: () => void;
}

export const StaffProfileModal: React.FC<StaffProfileModalProps> = ({ onClose }) => {
  const { currentUser, lockScreen, logout } = useHospital();

  const handleLock = () => {
    onClose();
    lockScreen();
  };

  const handleSignOut = () => {
    onClose();
    logout();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Staff Identity & Clearance
              </h3>
              <p className="text-[11px] text-slate-400">
                Faya Primary Hospital Terminal Session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* User Details */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center space-x-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-xl object-cover border border-emerald-500 shadow-xs shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {currentUser.name}
                </h4>
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {currentUser.title}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 font-mono">
                <span>ID: {currentUser.id}</span>
                <span>•</span>
                <span>Dept: {currentUser.department}</span>
                <span>•</span>
                <span>Shift: {currentUser.shift || 'Morning'}</span>
              </div>
            </div>
          </div>

          {/* Module Access Clearance */}
          <div>
            <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
              Authorized Departmental Modules
            </h5>
            <div className="flex flex-wrap gap-1 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
              {currentUser.allowedModules?.map((mod) => (
                <span
                  key={mod}
                  className="text-[10px] font-medium bg-white text-slate-800 border border-slate-200 px-2 py-0.5 rounded"
                >
                  {mod.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5">
            To switch to a different staff role or station, sign out below to return to the hospital authentication terminal.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-3.5 flex items-center justify-between gap-2">
          <button
            onClick={handleLock}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Lock Screen</span>
          </button>

          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out / Switch User</span>
          </button>
        </div>

      </div>
    </div>
  );
};
