import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Plus,
  Lock,
  LogOut,
  HardDrive,
  User,
  Shield,
  ChevronDown,
  Activity,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles
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
  const [floatingMenuOpen, setFloatingMenuOpen] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close floating menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setFloatingMenuOpen(false);
      }
    };
    if (floatingMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [floatingMenuOpen]);

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
      <div className="px-3 sm:px-6 py-2.5 max-w-full">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Left: Mobile Drawer Trigger & Department Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 min-w-0">
            <button
              onClick={onOpenMobileSidebar}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-md border border-emerald-100 hidden lg:inline">
                  Faya Primary Hospital
                </span>
                <span className="text-slate-300 text-xs hidden lg:inline">•</span>
                <h2 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-tight truncate">
                  {getModuleTitle(activeTab)}
                </h2>
              </div>
            </div>
          </div>

          {/* Center: Global Search Patient (Desktop) */}
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

          {/* Right: Actions & Clean Profile Pill with Floating Dropdown Modal */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            
            {/* Mobile Search Icon Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Search Patients"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Register Patient Action */}
            {onOpenNewPatientModal && (
              <button
                onClick={onOpenNewPatientModal}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Register Patient</span>
                <span className="sm:hidden">New</span>
              </button>
            )}

            {/* Profile Avatar Button (Triggers Floating Account Modal) */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setFloatingMenuOpen(!floatingMenuOpen)}
                className={`flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border transition-all cursor-pointer ${
                  floatingMenuOpen
                    ? 'bg-slate-100 border-slate-300 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
                title="Account, Profile & Session Actions"
              >
                <div className="relative shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-200 shadow-2xs"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white rounded-full"></span>
                </div>

                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[100px] md:max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate max-w-[100px] md:max-w-[120px]">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${floatingMenuOpen ? 'rotate-180 text-slate-700' : ''}`} />
              </button>

              {/* Floating Account & Profile Modal Dropdown */}
              {floatingMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                  
                  {/* User Profile Card Header */}
                  <div className="px-4 pb-3 border-b border-slate-100 flex items-start gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm leading-tight truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {currentUser.role.replace('_', ' ')}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.2 rounded border border-emerald-200">
                          {currentUser.department}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ID: {currentUser.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="p-2 space-y-1">
                    
                    {/* View Full Profile */}
                    <button
                      type="button"
                      onClick={() => {
                        setFloatingMenuOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 flex items-center justify-between text-slate-700 font-semibold transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <span>Staff Profile & Credentials</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                    </button>

                    {/* Local File Cache Diagnostics */}
                    <button
                      type="button"
                      onClick={() => {
                        setFloatingMenuOpen(false);
                        setOpenStorageModal(true);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 flex items-center justify-between text-slate-700 font-semibold transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                          <HardDrive className={`w-4 h-4 ${isCacheSyncing ? 'animate-pulse' : ''}`} />
                        </div>
                        <div>
                          <div>Local File Cache & Sync</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {isCacheSyncing ? 'Syncing with disk...' : 'Persistent storage active'}
                          </div>
                        </div>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${isCacheSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                    </button>

                    {/* Lock Terminal Session */}
                    <button
                      type="button"
                      onClick={() => {
                        setFloatingMenuOpen(false);
                        lockScreen();
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-amber-50 text-slate-700 hover:text-amber-900 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer group"
                    >
                      <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div>Lock Clinical Terminal</div>
                        <div className="text-[10px] text-slate-400 font-normal">PIN security protection</div>
                      </div>
                    </button>

                  </div>

                  {/* Prominent Log Out Button */}
                  <div className="pt-2 px-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setFloatingMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign Out / End Shift</span>
                      </div>
                      <span className="text-[10px] font-mono text-rose-500 bg-rose-100 px-1.5 py-0.5 rounded">
                        Exit
                      </span>
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Search Row */}
        {mobileSearchOpen && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 md:hidden relative animate-in fade-in slide-in-from-top-2 duration-150">
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
                className="w-full pl-9 pr-12 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl outline-hidden text-slate-900 placeholder:text-slate-400"
                autoFocus
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

            {/* Mobile Dropdown Results */}
            {searchDropdownOpen && patientSearchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 max-h-64 overflow-y-auto">
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
                        setMobileSearchOpen(false);
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
        )}
      </div>

      {/* Staff Profile Modal */}
      {profileModalOpen && (
        <StaffProfileModal onClose={() => setProfileModalOpen(false)} />
      )}
    </header>
  );
};
