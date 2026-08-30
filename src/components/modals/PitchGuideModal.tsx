import React from 'react';
import {
  X,
  Sparkles,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  CreditCard,
  HeartPulse,
  Lock,
  Layers
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { UserRole } from '../../types';

interface PitchGuideModalProps {
  onClose: () => void;
}

export const PitchGuideModal: React.FC<PitchGuideModalProps> = ({ onClose }) => {
  const { switchRole, setActiveTab } = useHospital();

  const workflowSteps = [
    {
      step: '1',
      title: 'Reception & Smart MRN Registration',
      role: 'RECEPTIONIST' as UserRole,
      tab: 'RECEPTION',
      desc: 'Register incoming patients, check duplicate National IDs / Phones, issue barcode ID cards, and route to OPD stations.',
      badge: 'Front Desk'
    },
    {
      step: '2',
      title: 'OPD Clinical Consultation & EMR',
      role: 'OPD_DOCTOR' as UserRole,
      tab: 'OPD',
      desc: '6 doctor consultation stations, ICD-10 diagnostic coding, e-prescriptions, lab order dispatch, and IPD admissions.',
      badge: 'Clinicians'
    },
    {
      step: '3',
      title: 'Emergency Triage & Resuscitation',
      role: 'EMERGENCY_OFFICER' as UserRole,
      tab: 'EMERGENCY',
      desc: 'South African Triage Scale (Red, Orange, Yellow, Green), GCS score calculator, trauma bay resuscitation, and rapid OT booking.',
      badge: 'Emergency'
    },
    {
      step: '4',
      title: 'Laboratory & Blood Bank Matching',
      role: 'LAB_TECH' as UserRole,
      tab: 'LAB_BLOOD',
      desc: 'Barcoded specimen tracking, critical value alerts, blood donor register, and electronic crossmatching.',
      badge: 'Diagnostics'
    },
    {
      step: '5',
      title: 'Radiology & PACS Imaging Suite',
      role: 'RADIOLOGIST' as UserRole,
      tab: 'RADIOLOGY',
      desc: 'Interactive DICOM scan viewer, contrast safety checklist, and structured radiologist reporting.',
      badge: 'Diagnostics'
    },
    {
      step: '6',
      title: 'Pharmacy & Stock Dispensary',
      role: 'PHARMACIST' as UserRole,
      tab: 'PHARMACY',
      desc: 'FEFO/FIFO batch expiry monitoring, drug-drug interaction screening, and prescription dispensing.',
      badge: 'Dispensary'
    },
    {
      step: '7',
      title: 'IPD Ward & Real-Time Bed Control',
      role: 'IPD_NURSE' as UserRole,
      tab: 'IPD',
      desc: 'Medical, Surgical, Pediatric & Maternity wards bed census, vitals monitoring, nursing notes, and discharge checklists.',
      badge: 'Wards'
    },
    {
      step: '8',
      title: 'Operation Theater & WHO Safety Protocol',
      role: 'OT_COORDINATOR' as UserRole,
      tab: 'OT',
      desc: 'Major/Minor OT scheduling, digital WHO surgical safety checklist (Sign In, Time Out, Sign Out), and PACU clearance.',
      badge: 'Surgical'
    },
    {
      step: '9',
      title: 'Cashier POS & Multi-Payer Billing',
      role: 'CASHIER' as UserRole,
      tab: 'CASHIER',
      desc: 'Real-time billing, Telebirr QR, CBE Birr, CBHI insurance claims discount deduction, till session reconciliation.',
      badge: 'Billing'
    },
    {
      step: '10',
      title: 'Hospital Administration, HR & Audit',
      role: 'ADMIN_HR' as UserRole,
      tab: 'ADMIN',
      desc: 'Staff rosters, duty shift schedules, leave approvals, revenue analytics, and security audit logs.',
      badge: 'Executive'
    }
  ];

  const handleLaunchStep = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  VitalSync ERP • Hospital Workflow & Pitch Guide
                </h3>
                <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  10 Modules
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Designed for Ethiopian Primary & General Hospitals • MoH HMIS Standard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Workflow Steps */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-emerald-950 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-900">Role-Based Access Control (RBAC) & Interactive Simulation</h4>
              <p className="text-emerald-800/90 mt-0.5 leading-relaxed">
                Every department has distinct credentials, permissions, and specialized workflows. Click any module below to immediately jump into that department with the authorized staff profile.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workflowSteps.map((ws) => (
              <div
                key={ws.step}
                className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {ws.step}
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                      {ws.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {ws.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {ws.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-500 font-mono">
                    Role: {ws.role}
                  </span>
                  <button
                    onClick={() => handleLaunchStep(ws.tab)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>View Module</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Complete end-to-end patient journey from Reception to Discharge & Billing.</span>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-xl cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
