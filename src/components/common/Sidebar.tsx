import React, { useMemo } from 'react';
import {
  Users,
  Stethoscope,
  AlertOctagon,
  BedDouble,
  FlaskConical,
  Scan,
  Pill,
  Receipt,
  Scissors,
  Building2,
  ChevronLeft,
  ChevronRight,
  Activity,
  UserCheck,
  LayoutDashboard
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: boolean | (() => void);
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    patients = [],
    emergencyRecords = [],
    prescriptions = [],
    labOrders = [],
    beds = [],
    opdQueue = [],
    staffList = [],
    leaveRequests = []
  } = useHospital();

  const handleToggle = () => {
    if (typeof onToggle === 'function') {
      onToggle();
    }
  };

  const emergencyActiveCount = (emergencyRecords || []).filter(
    (e) => e.status === 'Triage' || e.status === 'Resuscitation' || e.status === 'Observation'
  ).length;

  const pendingLabCount = (labOrders || []).filter((l) => l.status === 'Pending' || l.status === 'Sample Collected').length;
  const pendingRxCount = (prescriptions || []).filter((p) => p.status === 'Prescribed' || p.status === 'Dispensing').length;
  const occupiedBedsCount = (beds || []).filter((b) => b.status === 'Occupied').length;
  const opdWaitingCount = (opdQueue || []).filter((q) => q.status === 'Waiting').length;
  const pendingLeaveCount = (leaveRequests || []).filter((l) => l.status === 'Pending').length;

  // Navigation sections with Administration & Dashboard at the top
  const allNavigationSections = [
    {
      group: 'Executive & Admin',
      items: [
        {
          id: 'DASHBOARD',
          label: 'Hospital Dashboard',
          icon: LayoutDashboard,
          role: 'ADMIN_HR' as UserRole
        },
        {
          id: 'ADMIN',
          label: 'Administration',
          icon: Building2,
          role: 'ADMIN_HR' as UserRole
        },
        {
          id: 'HR',
          label: 'Human Resources (HR)',
          icon: UserCheck,
          role: 'ADMIN_HR' as UserRole,
          badge: pendingLeaveCount > 0 ? `${pendingLeaveCount} leave` : `${staffList.length} staff`
        }
      ]
    },
    {
      group: 'Front Desk',
      items: [
        {
          id: 'RECEPTION',
          label: 'Reception & Registry',
          icon: Users,
          role: 'RECEPTIONIST' as UserRole,
          badge: patients.length ? `${patients.length}` : undefined
        }
      ]
    },
    {
      group: 'Clinical Care',
      items: [
        {
          id: 'OPD',
          label: 'OPD Consultations',
          icon: Stethoscope,
          role: 'OPD_DOCTOR' as UserRole,
          badge: opdWaitingCount > 0 ? `${opdWaitingCount} wait` : undefined
        },
        {
          id: 'EMERGENCY',
          label: 'Emergency & Triage',
          icon: AlertOctagon,
          role: 'EMERGENCY_OFFICER' as UserRole,
          badge: emergencyActiveCount > 0 ? `${emergencyActiveCount}` : undefined,
          isAlert: emergencyActiveCount > 0
        },
        {
          id: 'IPD',
          label: 'IPD Wards & Beds',
          icon: BedDouble,
          role: 'IPD_NURSE' as UserRole,
          badge: `${occupiedBedsCount}/${beds.length}`
        },
        {
          id: 'OT',
          label: 'Operation Theater',
          icon: Scissors,
          role: 'OT_COORDINATOR' as UserRole
        }
      ]
    },
    {
      group: 'Diagnostics & Pharmacy',
      items: [
        {
          id: 'LAB_BLOOD',
          label: 'Lab & Blood Bank',
          icon: FlaskConical,
          role: 'LAB_TECH' as UserRole,
          badge: pendingLabCount > 0 ? `${pendingLabCount}` : undefined
        },
        {
          id: 'RADIOLOGY',
          label: 'Radiology (PACS)',
          icon: Scan,
          role: 'RADIOLOGIST' as UserRole
        },
        {
          id: 'PHARMACY',
          label: 'Pharmacy & Stock',
          icon: Pill,
          role: 'PHARMACIST' as UserRole,
          badge: pendingRxCount > 0 ? `${pendingRxCount}` : undefined
        }
      ]
    },
    {
      group: 'Finance',
      items: [
        {
          id: 'CASHIER',
          label: 'Cashier & Billing',
          icon: Receipt,
          role: 'CASHIER' as UserRole
        }
      ]
    }
  ];

  // RBAC Navigation Filtering:
  // ADMIN_HR has access to all hospital modules.
  // Other staff only see modules matching their assigned station / role.
  const navigationSections = useMemo(() => {
    const isSuperAdmin = currentUser.role === 'ADMIN_HR';

    return allNavigationSections
      .map((section) => {
        const filteredItems = section.items.filter((item) => {
          if (isSuperAdmin) return true;
          return item.role === currentUser.role;
        });
        return { ...section, items: filteredItems };
      })
      .filter((section) => section.items.length > 0);
  }, [currentUser.role, occupiedBedsCount, pendingLabCount, pendingRxCount, opdWaitingCount, emergencyActiveCount, pendingLeaveCount, patients.length, staffList.length]);

  const handleSelectModule = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white text-slate-700 select-none">
      {/* Top Hospital Identity */}
      <div>
        <div className="h-14 px-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
              <Activity className="w-4.5 h-4.5" />
            </div>
            {isOpen && (
              <div className="min-w-0">
                <div className="font-bold text-sm text-slate-900 leading-tight truncate">
                  VitalSync<span className="text-emerald-600">ERP</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Faya Primary Hospital
                </div>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={handleToggle}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="p-2 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] no-scrollbar">
          {navigationSections.map((section) => (
            <div key={section.group} className="space-y-0.5">
              {isOpen && (
                <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {section.group}
                </div>
              )}
              {section.items.map((item) => {
                const isActive =
                  activeTab === item.id ||
                  (item.id === 'LAB_BLOOD' && (activeTab === 'LAB' || activeTab === 'lab'));
                const isUserStation = currentUser.role === item.role;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectModule(item.id)}
                    title={!isOpen ? item.label : undefined}
                    className={`w-full text-left rounded-lg transition-colors flex items-center cursor-pointer ${
                      isOpen ? 'px-2.5 py-2' : 'p-2.5 justify-center'
                    } ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <IconComponent
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? 'text-emerald-400'
                            : isUserStation
                            ? 'text-emerald-600'
                            : 'text-slate-500'
                        }`}
                      />

                      {isOpen && (
                        <span className="text-xs truncate">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {isOpen && item.badge && (
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.2 rounded shrink-0 ml-1.5 ${
                          isActive
                            ? 'bg-slate-800 text-slate-200'
                            : item.isAlert
                            ? 'bg-rose-100 text-rose-700 font-bold'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      {isOpen && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <span>HMIS System v2.4</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200 shrink-0 sticky top-0 h-screen transition-all duration-200 z-30 ${
          isOpen ? 'w-56' : 'w-16'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
