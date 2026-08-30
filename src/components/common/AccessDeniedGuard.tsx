import React from 'react';
import {
  ShieldAlert,
  LogOut,
  Info
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { UserRole } from '../../types';

interface AccessDeniedGuardProps {
  requiredRole: UserRole;
  moduleName: string;
}

export const AccessDeniedGuard: React.FC<AccessDeniedGuardProps> = ({
  requiredRole,
  moduleName
}) => {
  const { currentUser, logout } = useHospital();

  return (
    <div className="mb-4 bg-amber-50/90 border border-amber-200/90 rounded-xl p-3.5 sm:p-4 text-slate-800 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-amber-950">
                Departmental Clearance • {moduleName}
              </h4>
              <span className="text-[9px] font-bold uppercase bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded">
                Read-Only Inspection
              </span>
            </div>
            <p className="text-[11px] text-amber-900/90 mt-0.5">
              Active session: <strong>{currentUser.name}</strong> ({currentUser.role.replace('_', ' ')}). Authorized clinical/financial entries for this department require <strong>{requiredRole.replace('_', ' ')}</strong> clearance.
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="shrink-0 bg-amber-800 hover:bg-amber-900 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-end sm:self-center"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out to Switch Account</span>
        </button>
      </div>
    </div>
  );
};
