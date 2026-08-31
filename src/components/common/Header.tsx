import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Lock,
  LogOut,
  HardDrive,
  Database,
  User,
  Shield
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { StaffProfileModal } from '../auth/StaffProfileModal';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
  onOpenNewPatientModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenMobileSidebar,
  onOpenNewPatientModal
}) => {
  const {
    activeTab,
    currentUser,
    lockScreen,
    logout,
    patients = [],
    selectedPatientMrn,
    setSelectedPatientMrn,
    setOpenStorageModal,
    isCacheSyncing
  } = useHospital();

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  const filteredPatients = (patients || []).filter((p) => {
    const q = patientSearchQuery.toLowerCase();
    const fullName = `${p.firstName} ${p.middleName || ''} ${p.lastName}`.toLowerCase();
    return (
      p.mrn.toLowerCase().includes(q) ||
      fullName.includes(q) ||
      p.phone.includes(q) ||
      p.nationalId.toLowerCase().includes(q)
    );
  });

  const getModuleTitle = (tab: string) => {
    switch (tab) {
      case 'DASHBOARD': return 'Executive Dashboard & Telemetry';
      case 'RECEPTION': return 'Reception & Registration';
      case 'OPD': return 'OPD Clinical Consultations';
      case 'EMERGENCY': return 'Emergency & Triage Unit';
      case 'IPD': return 'IPD Wards & Bed Allocation';
      case 'LAB_BLOOD':
      case 'LAB': return 'Laboratory & Blood Bank';
      case 'RADIOLOGY': return 'Radiology (PACS)';
      case 'PHARMACY': return 'Pharmacy & Stock Control';
      case 'CASHIER': return 'Cashier & Billing Desk';
      case 'OT': return 'Operation Theater Suite';
      case 'ADMIN': return 'Hospital Administration & Governance';
      case 'HR': return 'Human Resources & Clinical Staffing';
      default: return 'Hospital System';
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-xs border-b border-slate-200/90 sticky top-0 z-20 shadow-2xs">
      <div className="px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Mobile Trigger & Breadcrumb */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onOpenMobileSidebar}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-md border border-emerald-100 hidden sm:inline">
                  Faya Primary Hospital
                </span>
                <span className="text-slate-300 text-xs hidden sm:inline">•</span>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {getModuleTitle(activeTab)}
                </h2>
              </div>
            </div>
          </div>

          {/* Center: Global Search Patient */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={patientSearchQuery}
                onChange={(e) => {
                  setPatientSearchQuery(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                onFocus={() => setSearchDropdownOpen(true)}
                placeholder="Search patient by MRN, Name, Phone..."
                className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-xl outline-hidden transition-all text-slate-900 placeholder:text-slate-400 shadow-2xs"
              />
              {patientSearchQuery && (
                <button
                  onClick={() => {
                    setPatientSearchQuery('');
                    setSearchDropdownOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {searchDropdownOpen && patientSearchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 max-h-64 overflow-y-auto">
                <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Patients ({filteredPatients.length})
                </div>
                {filteredPatients.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-500 text-center">
                    No matching records found.
                  </div>
                ) : (
                  filteredPatients.map((p) => (
                    <button
                      key={p.mrn}
                      onClick={() => {
                        setSelectedPatientMrn(p.mrn);
                        setSearchDropdownOpen(false);
                        setPatientSearchQuery('');
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer ${
                        selectedPatientMrn === p.mrn ? 'bg-emerald-50/80 text-emerald-950 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={p.firstName}
                          className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {p.firstName} {p.middleName} {p.lastName}
                          </div>
                          <div className="text-slate-500 text-[10px] font-mono">
                            {p.mrn} • {p.gender}, {p.dob}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-100 font-medium text-slate-700 px-2 py-0.5 rounded-md">
                        {p.activeStation || 'Reception'}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right: Actions & User Session */}
          <div className="flex items-center space-x-2">
            
            {/* Storage & Local Cache Indicator Button */}
            <button
              onClick={() => setOpenStorageModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-emerald-300 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Inspect Local File Cache & Storage Persistence"
            >
              <HardDrive className={`w-3.5 h-3.5 text-emerald-600 ${isCacheSyncing ? 'animate-pulse' : ''}`} />
              <span className="hidden xl:inline text-[11px] text-slate-700">
                {isCacheSyncing ? 'Syncing Disk...' : 'File Cache'}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${isCacheSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></span>
            </button>

            {onOpenNewPatientModal && (
              <button
                onClick={onOpenNewPatientModal}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Register Patient</span>
                <span className="sm:hidden">New</span>
              </button>
            )}

            {/* Authenticated Staff User */}
            <div className="flex items-center border-l border-slate-200 pl-2 gap-1">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center gap-2 p-1 hover:bg-slate-100/80 rounded-xl text-left transition-colors cursor-pointer"
                title="View Profile"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-200 shadow-2xs"
                />
                <div className="hidden sm:block leading-tight">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[110px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate max-w-[110px]">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
              </button>

              <button
                onClick={lockScreen}
                className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                title="Lock Terminal"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Staff Profile Modal */}
      {profileModalOpen && (
        <StaffProfileModal onClose={() => setProfileModalOpen(false)} />
      )}
    </header>
  );
};
