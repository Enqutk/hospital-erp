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
  LayoutDashboard,
  CreditCard,
  FileSpreadsheet,
  Clock,
  Send,
  UserPlus,
  CheckCircle2,
  Droplet,
  ShieldCheck,
  BarChart3,
  Inbox,
  Building,
  Baby,
  Bed,
  Package,
  ShieldAlert
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
    receptionSubView,
    setReceptionSubView,
    labSubView,
    setLabSubView,
    pharmacySubView,
    setPharmacySubView,
    emergencySubView,
    setEmergencySubView,
    ipdSubView,
    setIpdSubView,
    currentUser,
    patients = [],
    emergencyRecords = [],
    prescriptions = [],
    drugInventory = [],
    labOrders = [],
    bloodUnits = [],
    bloodDonors = [],
    crossmatchRecords = [],
    beds = [],
    admissionOrders = [],
    ipdAdmissions = [],
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
    (e) => e.status === 'Triaged' || e.status === 'In Trauma Bay'
  ).length;
  const redEmergencyCount = (emergencyRecords || []).filter(
    (e) => e.triageLevel === 'RED' && e.status !== 'Discharged'
  ).length;

  const pendingLabCount = (labOrders || []).filter((l) => l.status === 'Pending' || l.status === 'Sample Collected' || l.verificationStatus === 'Pending Review').length;
  const criticalLabAlertsCount = (labOrders || []).filter((l) => l.status === 'Critical Alert' || l.verificationStatus === 'Critical Alert').length;
  const availableBloodUnits = (bloodUnits || []).filter((u) => u.status === 'Available').length;
  const pendingRxCount = (prescriptions || []).filter((p) => p.status === 'Prescribed' || p.status === 'Dispensing').length;
  const lowStockDrugsCount = (drugInventory || []).filter((d) => d.stockOnHand <= d.reorderTriggerLevel).length;
  const occupiedBedsCount = (beds || []).filter((b) => b.status === 'Occupied').length;
  const availableBedsCount = (beds || []).filter((b) => b.status === 'Available').length;
  const pendingOrdersCount = (admissionOrders || []).filter((o) => o.status === 'Pending Bed Allocation').length;
  const pediatricCount = (ipdAdmissions || []).filter((a) => a.wardCode === 'PEDIATRICS' && a.status === 'Active').length;
  const activeInpatientsCount = (ipdAdmissions || []).filter((a) => a.status === 'Active').length;
  const opdWaitingCount = (opdQueue || []).filter((q) => q.status === 'Waiting').length;
  const pendingLeaveCount = (leaveRequests || []).filter((l) => l.status === 'Pending').length;

  // Dedicated receptionist navigation groups for Reception & Patient Registry workstation
  const receptionistNavigationSections = [
    {
      group: 'Overview & Intelligence',
      items: [
        {
          id: 'DASHBOARD',
          label: 'Front Desk Dashboard',
          icon: LayoutDashboard
        }
      ]
    },
    {
      group: 'Patient Registry',
      items: [
        {
          id: 'RECEPTION',
          subView: 'DIRECTORY',
          label: 'Patient Directory & EMR',
          icon: Users,
          badge: patients.length ? `${patients.length}` : undefined
        },
        {
          id: 'RECEPTION',
          subView: 'PRINT_STATION',
          label: 'ID Cards & Barcodes',
          icon: CreditCard
        }
      ]
    },
    {
      group: 'OPD Queue & Routing',
      items: [
        {
          id: 'RECEPTION',
          subView: 'QUEUE_BOARD',
          label: 'Live OPD Queue Board',
          icon: Activity,
          badge: opdWaitingCount > 0 ? `${opdWaitingCount} wait` : undefined
        }
      ]
    },
    {
      group: 'Tariffs & Pricing',
      items: [
        {
          id: 'RECEPTION',
          subView: 'TARIFFS',
          label: 'Service Tariffs & Fees',
          icon: Receipt
        }
      ]
    },
    {
      group: 'Shift & Governance',
      items: [
        {
          id: 'RECEPTION',
          subView: 'SHIFT_SUMMARY',
          label: 'Shift Summary & Roster',
          icon: Clock
        }
      ]
    }
  ];

  // Dedicated Lab Technician navigation groups
  const labTechNavigationSections = [
    {
      group: 'Overview & Intelligence',
      items: [
        {
          id: 'DASHBOARD',
          label: 'Laboratory Dashboard',
          icon: LayoutDashboard
        }
      ]
    },
    {
      group: 'Diagnostic Laboratory',
      items: [
        {
          id: 'LAB_BLOOD',
          subView: 'ORDERS',
          label: 'Diagnostic Orders & Queue',
          icon: FlaskConical,
          badge: pendingLabCount > 0 ? `${pendingLabCount} pending` : undefined
        },
        {
          id: 'LAB_BLOOD',
          subView: 'RESULTS',
          label: 'Result Entry & Validation',
          icon: CheckCircle2,
          badge: criticalLabAlertsCount > 0 ? `${criticalLabAlertsCount} alert` : undefined
        }
      ]
    },
    {
      group: 'Transfusion Blood Bank',
      items: [
        {
          id: 'LAB_BLOOD',
          subView: 'BLOOD_BANK',
          label: 'Blood Units & Storage',
          icon: Droplet,
          badge: availableBloodUnits > 0 ? `${availableBloodUnits} units` : undefined
        },
        {
          id: 'LAB_BLOOD',
          subView: 'DONORS',
          label: 'Donor Registry & Intake',
          icon: Users
        },
        {
          id: 'LAB_BLOOD',
          subView: 'CROSSMATCH',
          label: 'Crossmatch & Safety',
          icon: ShieldCheck
        }
      ]
    },
    {
      group: 'Quality & Analytics',
      items: [
        {
          id: 'LAB_BLOOD',
          subView: 'ANALYTICS',
          label: 'Lab Analytics & TAT',
          icon: BarChart3
        },
        {
          id: 'LAB_BLOOD',
          subView: 'QC',
          label: 'QC & Analyzer Telemetry',
          icon: Activity
        }
      ]
    }
  ];

  // Dedicated Pharmacist navigation groups
  const pharmacistNavigationSections = [
    {
      group: 'Overview & Intelligence',
      items: [
        {
          id: 'DASHBOARD',
          label: 'Pharmacy Dashboard',
          icon: LayoutDashboard
        }
      ]
    },
    {
      group: 'Clinical Dispensary',
      items: [
        {
          id: 'PHARMACY',
          subView: 'DISPENSARY',
          label: 'Prescription Worklist & Intake',
          icon: Pill,
          badge: pendingRxCount > 0 ? `${pendingRxCount} pending` : undefined
        },
        {
          id: 'PHARMACY',
          subView: 'HISTORY',
          label: 'Dispensing Audit History',
          icon: CheckCircle2
        }
      ]
    },
    {
      group: 'Inventory & Multi-Store',
      items: [
        {
          id: 'PHARMACY',
          subView: 'STOCK',
          label: 'Perpetual Stock & Batches',
          icon: Package,
          badge: lowStockDrugsCount > 0 ? `${lowStockDrugsCount} low` : undefined
        },
        {
          id: 'PHARMACY',
          subView: 'CONTROLLED',
          label: 'Controlled Vault & Cold-Chain',
          icon: ShieldAlert
        }
      ]
    },
    {
      group: 'Shift & Analytics',
      items: [
        {
          id: 'PHARMACY',
          subView: 'ANALYTICS',
          label: 'Dispensary Analytics',
          icon: BarChart3
        }
      ]
    }
  ];

  // Dedicated OPD Doctor navigation groups
  const doctorNavigationSections = [
    {
      group: 'Overview & Intelligence',
      items: [
        {
          id: 'DASHBOARD',
          label: 'Doctor OPD Dashboard',
          icon: LayoutDashboard
        }
      ]
    },
    {
      group: 'Clinical Consultations',
      items: [
        {
          id: 'OPD',
          label: 'OPD Consultation Suite',
          icon: Stethoscope,
          badge: opdWaitingCount > 0 ? `${opdWaitingCount} wait` : undefined
        }
      ]
    }
  ];

  // Dedicated Emergency Department navigation groups
  const emergencyOfficerNavigationSections = [
    {
      group: 'Overview & Intelligence',
      items: [
        {
          id: 'DASHBOARD',
          label: 'Emergency Dashboard',
          icon: LayoutDashboard
        }
      ]
    },
    {
      group: 'Emergency & Resuscitation',
      items: [
        {
          id: 'EMERGENCY',
          subView: 'ACTIVE_CASES',
          label: 'Emergency Triage & Cases',
          icon: AlertOctagon,
          badge: redEmergencyCount > 0 ? `${redEmergencyCount} RED` : emergencyActiveCount > 0 ? `${emergencyActiveCount} active` : undefined
        },
        {
          id: 'EMERGENCY',
          subView: 'TRAUMA_BAYS',
          label: 'Trauma Bay & Resus Matrix',
          icon: BedDouble
        }
      ]
    },
    {
      group: 'Shift & Analytics',
      items: [
        {
          id: 'EMERGENCY',
          subView: 'ANALYTICS',
          label: 'Trauma Telemetry',
          icon: BarChart3
        }
      ]
    }
  ];

  // Dedicated Inpatient Department (IPD Nurse) navigation groups
  const ipdNavigationSections = [
    {
      group: 'Overview & Intelligence',
      items: [
        {
          id: 'DASHBOARD',
          label: 'IPD Ward Dashboard',
          icon: LayoutDashboard
        }
      ]
    },
    {
      group: 'Clinical Bed Intake',
      items: [
        {
          id: 'IPD',
          subView: 'DOCTOR_ORDERS',
          label: 'Doctor Bed Orders',
          icon: Inbox,
          badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} pending` : undefined,
          isAlert: pendingOrdersCount > 0
        },
        {
          id: 'IPD',
          subView: 'BED_MATRIX',
          label: 'Live Bed Matrix',
          icon: Building,
          badge: `${availableBedsCount} free`
        }
      ]
    },
    {
      group: 'Inpatient Care Units',
      items: [
        {
          id: 'IPD',
          subView: 'ACTIVE_INPATIENTS',
          label: 'Active Inpatients',
          icon: UserCheck,
          badge: activeInpatientsCount > 0 ? `${activeInpatientsCount} adm` : undefined
        },
        {
          id: 'IPD',
          subView: 'PEDIATRICS',
          label: 'Pediatric Care (Ward 03)',
          icon: Baby,
          badge: pediatricCount > 0 ? `${pediatricCount} kids` : undefined
        }
      ]
    },
    {
      group: 'Governance & Analytics',
      items: [
        {
          id: 'IPD',
          subView: 'DISCHARGE_CLEARANCE',
          label: 'Discharge Clearances',
          icon: CheckCircle2,
          badge: activeInpatientsCount > 0 ? `${activeInpatientsCount}` : undefined
        },
        {
          id: 'IPD',
          subView: 'ANALYTICS',
          label: 'Inpatient & Ward Analytics',
          icon: BarChart3
        }
      ]
    }
  ];

  // Standard full navigation sections for Admin and other roles
  const standardNavigationSections = [
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
          subView: 'DIRECTORY',
          label: 'Reception & Registry',
          icon: Users,
          role: 'RECEPTIONIST' as UserRole,
          badge: patients.length ? `${patients.length}` : undefined
        },
        {
          id: 'RECEPTION',
          subView: 'QUEUE_BOARD',
          label: 'Live OPD Queue Board',
          icon: Activity,
          role: 'RECEPTIONIST' as UserRole,
          badge: opdWaitingCount > 0 ? `${opdWaitingCount} wait` : undefined
        },
        {
          id: 'RECEPTION',
          subView: 'PRINT_STATION',
          label: 'ID Cards & Barcodes',
          icon: CreditCard,
          role: 'RECEPTIONIST' as UserRole
        },
        {
          id: 'RECEPTION',
          subView: 'TARIFFS',
          label: 'Service Tariffs & Pricing',
          icon: Receipt,
          role: 'RECEPTIONIST' as UserRole
        },
        {
          id: 'RECEPTION',
          subView: 'SHIFT_SUMMARY',
          label: 'Shift Summary & Roster',
          icon: Clock,
          role: 'RECEPTIONIST' as UserRole
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
          subView: 'ORDERS',
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
  const navigationSections = useMemo(() => {
    if (currentUser.role === 'RECEPTIONIST') {
      return receptionistNavigationSections;
    }
    if (currentUser.role === 'LAB_TECH') {
      return labTechNavigationSections;
    }
    if (currentUser.role === 'OPD_DOCTOR') {
      return doctorNavigationSections;
    }
    if (currentUser.role === 'PHARMACIST') {
      return pharmacistNavigationSections;
    }
    if (currentUser.role === 'EMERGENCY_OFFICER') {
      return emergencyOfficerNavigationSections;
    }
    if (currentUser.role === 'IPD_NURSE') {
      return ipdNavigationSections;
    }

    const isSuperAdmin = currentUser.role === 'ADMIN_HR';

    return standardNavigationSections
      .map((section) => {
        const filteredItems = section.items.filter((item) => {
          if (isSuperAdmin) return true;
          return item.role === currentUser.role;
        });
        return { ...section, items: filteredItems };
      })
      .filter((section) => section.items.length > 0);
  }, [
    currentUser.role,
    occupiedBedsCount,
    availableBedsCount,
    pendingOrdersCount,
    pediatricCount,
    activeInpatientsCount,
    pendingLabCount,
    criticalLabAlertsCount,
    availableBloodUnits,
    pendingRxCount,
    lowStockDrugsCount,
    opdWaitingCount,
    emergencyActiveCount,
    pendingLeaveCount,
    patients.length,
    staffList.length
  ]);

  const handleSelectModule = (item: any) => {
    setActiveTab(item.id);
    if (item.id === 'RECEPTION' && item.subView) {
      setReceptionSubView(item.subView);
    }
    if (item.id === 'LAB_BLOOD' && item.subView) {
      setLabSubView(item.subView);
    }
    if (item.id === 'PHARMACY' && item.subView) {
      setPharmacySubView(item.subView);
    }
    if (item.id === 'EMERGENCY' && item.subView) {
      setEmergencySubView(item.subView);
    }
    if (item.id === 'IPD' && item.subView) {
      setIpdSubView(item.subView);
    }
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
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0 shadow-xs">
              <Activity className="w-4.5 h-4.5" />
            </div>
            {isOpen && (
              <div className="min-w-0">
                <div className="font-bold text-sm text-slate-900 leading-tight truncate">
                  VitalSync<span className="text-emerald-600">ERP</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
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
                <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {section.group}
                </div>
              )}
              {section.items.map((item: any) => {
                let isActive = false;
                if (item.id === 'RECEPTION') {
                  isActive = activeTab === 'RECEPTION' && (!item.subView || receptionSubView === item.subView);
                } else if (item.id === 'LAB_BLOOD') {
                  isActive = activeTab === 'LAB_BLOOD' && (!item.subView || labSubView === item.subView);
                } else if (item.id === 'PHARMACY') {
                  isActive = activeTab === 'PHARMACY' && (!item.subView || pharmacySubView === item.subView);
                } else if (item.id === 'EMERGENCY') {
                  isActive = activeTab === 'EMERGENCY' && (!item.subView || emergencySubView === item.subView);
                } else if (item.id === 'IPD') {
                  isActive = activeTab === 'IPD' && (!item.subView || ipdSubView === item.subView);
                } else {
                  isActive = activeTab === item.id;
                }

                const isUserStation = currentUser.role === (item.role || 'RECEPTIONIST');
                const IconComponent = item.icon;

                return (
                  <button
                    key={`${item.id}-${item.subView || ''}-${item.label}`}
                    onClick={() => handleSelectModule(item)}
                    title={!isOpen ? item.label : undefined}
                    className={`w-full text-left rounded-xl transition-all flex items-center cursor-pointer ${
                      isOpen ? 'px-2.5 py-2' : 'p-2.5 justify-center'
                    } ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
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
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md shrink-0 ml-1.5 ${
                          isActive
                            ? 'bg-slate-800 text-emerald-300'
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
          <span className="font-semibold text-slate-700">HMIS System v2.4</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Online</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200 shrink-0 sticky top-0 h-screen transition-all duration-200 z-30 ${
          isOpen ? 'w-60' : 'w-16'
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
