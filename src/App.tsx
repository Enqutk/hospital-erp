import React, { useState, useEffect } from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { PatientClinicalBanner } from './components/common/PatientClinicalBanner';
import { LoginScreen } from './components/auth/LoginScreen';
import { LockScreenModal } from './components/auth/LockScreenModal';
import { ToastContainer } from './components/common/ToastContainer';

import { DashboardModule } from './components/modules/DashboardModule';
import { ReceptionModule } from './components/modules/ReceptionModule';
import { OPDModule } from './components/modules/OPDModule';
import { IPDModule } from './components/modules/IPDModule';
import { EmergencyModule } from './components/modules/EmergencyModule';
import { LabBloodBankModule } from './components/modules/LabBloodBankModule';
import { RadiologyModule } from './components/modules/RadiologyModule';
import { PharmacyModule } from './components/modules/PharmacyModule';
import { CashierBillingModule } from './components/modules/CashierBillingModule';
import { OTModule } from './components/modules/OTModule';
import { AdminModule } from './components/modules/AdminModule';
import { HRModule } from './components/modules/HRModule';

import { PatientCardPrintModal } from './components/modals/PatientCardPrintModal';
import { PrescriptionPrintModal } from './components/modals/PrescriptionPrintModal';
import { LabReportPrintModal } from './components/modals/LabReportPrintModal';
import { ReceiptPrintModal } from './components/modals/ReceiptPrintModal';
import { Patient, Prescription, LabOrder, BillingInvoice, UserRole } from './types';

const MainAppContent: React.FC = () => {
  const {
    isAuthenticated,
    isLocked,
    activeTab,
    setActiveTab,
    currentUser,
    prescriptions,
    labOrders,
    billingInvoices
  } = useHospital();

  // Sidebar Layout State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Print Modals State
  const [printPatientModalOpen, setPrintPatientModalOpen] = useState(false);
  const [activePatientForPrint, setActivePatientForPrint] = useState<Patient | null>(null);

  const [printRxModalOpen, setPrintRxModalOpen] = useState(false);
  const [activeRxForPrint, setActiveRxForPrint] = useState<Prescription | null>(null);

  const [printLabModalOpen, setPrintLabModalOpen] = useState(false);
  const [activeLabForPrint, setActiveLabForPrint] = useState<LabOrder | null>(null);

  const [printReceiptModalOpen, setPrintReceiptModalOpen] = useState(false);
  const [activeReceiptForPrint, setActiveReceiptForPrint] = useState<BillingInvoice | null>(null);

  // Auto-redirect if user role cannot access the currently active tab
  useEffect(() => {
    if (!isAuthenticated) return;

    // Super Admin has access to all tabs
    if (currentUser.role === 'ADMIN_HR') return;

    // All roles have access to their role-built Dashboard
    if (activeTab === 'DASHBOARD') return;

    const roleToTabMap: Record<UserRole, string> = {
      RECEPTIONIST: 'RECEPTION',
      OPD_DOCTOR: 'OPD',
      IPD_NURSE: 'IPD',
      EMERGENCY_OFFICER: 'EMERGENCY',
      LAB_TECH: 'LAB_BLOOD',
      RADIOLOGIST: 'RADIOLOGY',
      PHARMACIST: 'PHARMACY',
      CASHIER: 'CASHIER',
      ADMIN_HR: 'DASHBOARD',
      OT_COORDINATOR: 'OT'
    };

    const primaryTab = roleToTabMap[currentUser.role];
    if (primaryTab && activeTab !== primaryTab) {
      setActiveTab('DASHBOARD');
    }
  }, [currentUser.role, isAuthenticated, activeTab, setActiveTab]);

  // If not authenticated, render full-screen hospital login
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
      </>
    );
  }

  const handleOpenPatientCard = (patient: Patient) => {
    setActivePatientForPrint(patient);
    setPrintPatientModalOpen(true);
  };

  const handleOpenRxPrint = (rxId: string) => {
    const rx = prescriptions.find((p) => p.rxId === rxId) || prescriptions[0];
    if (rx) {
      setActiveRxForPrint(rx);
      setPrintRxModalOpen(true);
    }
  };

  const handleOpenLabPrint = (labOrderId: string) => {
    const order = labOrders.find((o) => o.labOrderId === labOrderId) || labOrders[0];
    if (order) {
      setActiveLabForPrint(order);
      setPrintLabModalOpen(true);
    }
  };

  const handleOpenReceiptPrint = (invoiceId: string) => {
    const inv = billingInvoices.find((i) => i.invoiceId === invoiceId) || billingInvoices[0];
    if (inv) {
      setActiveReceiptForPrint(inv);
      setPrintReceiptModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 antialiased selection:bg-emerald-600 selection:text-white">
      {/* Left Department Navigation Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Universal Top Navigation Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Patient Clinical Context Banner (exclusively shown in clinical workstation modules) */}
        {['OPD', 'IPD', 'EMERGENCY', 'LAB_BLOOD', 'PHARMACY', 'BILLING'].includes(activeTab) && (
          <PatientClinicalBanner onOpenPatientCard={handleOpenPatientCard} />
        )}

        {/* Main Module Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">
          {activeTab === 'DASHBOARD' && (
            <DashboardModule />
          )}

          {activeTab === 'RECEPTION' && (
            <ReceptionModule onOpenPatientCard={handleOpenPatientCard} />
          )}

          {activeTab === 'OPD' && (
            <OPDModule onOpenRxPrint={handleOpenRxPrint} />
          )}

          {activeTab === 'IPD' && (
            <IPDModule />
          )}

          {activeTab === 'EMERGENCY' && (
            <EmergencyModule />
          )}

          {activeTab === 'LAB_BLOOD' && (
            <LabBloodBankModule onOpenLabPrint={handleOpenLabPrint} />
          )}

          {activeTab === 'RADIOLOGY' && (
            <RadiologyModule />
          )}

          {activeTab === 'PHARMACY' && (
            <PharmacyModule onOpenRxPrint={handleOpenRxPrint} />
          )}

          {activeTab === 'CASHIER' && (
            <CashierBillingModule onOpenReceiptPrint={handleOpenReceiptPrint} />
          )}

          {activeTab === 'OT' && (
            <OTModule />
          )}

          {activeTab === 'ADMIN' && (
            <AdminModule />
          )}

          {activeTab === 'HR' && (
            <HRModule />
          )}
        </main>
      </div>

      {/* Terminal Lock Screen Overlay */}
      {isLocked && <LockScreenModal />}

      {/* Printable Modals */}
      {printPatientModalOpen && (
        <PatientCardPrintModal
          patient={activePatientForPrint}
          onClose={() => setPrintPatientModalOpen(false)}
        />
      )}

      {printRxModalOpen && (
        <PrescriptionPrintModal
          prescription={activeRxForPrint}
          onClose={() => setPrintRxModalOpen(false)}
        />
      )}

      {printLabModalOpen && (
        <LabReportPrintModal
          labOrder={activeLabForPrint}
          onClose={() => setPrintLabModalOpen(false)}
        />
      )}

      {printReceiptModalOpen && (
        <ReceiptPrintModal
          invoice={activeReceiptForPrint}
          onClose={() => setPrintReceiptModalOpen(false)}
        />
      )}

      {/* Feedback Toasts */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <HospitalProvider>
      <MainAppContent />
    </HospitalProvider>
  );
}

export default App;
