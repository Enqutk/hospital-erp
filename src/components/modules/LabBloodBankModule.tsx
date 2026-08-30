import React, { useState } from 'react';
import {
  FlaskConical,
  Droplet,
  Barcode,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Search,
  Printer,
  FileText,
  TrendingUp,
  User,
  Heart,
  Calendar,
  Clock
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { LabOrder, BloodUnit, BloodDonor, CrossmatchRecord } from '../../types';

interface LabBloodBankModuleProps {
  onOpenLabPrint: (labOrderId: string) => void;
}

export const LabBloodBankModule: React.FC<LabBloodBankModuleProps> = ({ onOpenLabPrint }) => {
  const {
    labOrders,
    updateLabResults,
    createLabOrder,
    bloodUnits,
    bloodDonors,
    crossmatchRecords,
    registerBloodDonor,
    addBloodUnit,
    createCrossmatch,
    patients,
    selectedPatientMrn,
    getPatientByMrn,
    currentUser
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'LAB' | 'BLOOD_BANK'>('LAB');
  const [selectedLabOrderId, setSelectedLabOrderId] = useState<string>(labOrders[0]?.labOrderId || '');

  // Result entry form state
  const activeLabOrder = labOrders.find((o) => o.labOrderId === selectedLabOrderId) || labOrders[0];
  const [resultsState, setResultsState] = useState<LabOrder['results']>(activeLabOrder ? activeLabOrder.results : []);

  // Blood Donor Registration State
  const [donorName, setDonorName] = useState('Abinet Tsegaye');
  const [donorPhone, setDonorPhone] = useState('+251 911 445 667');
  const [donorBloodGroup, setDonorBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');

  // Crossmatch form state
  const [matchPatientMrn, setMatchPatientMrn] = useState(selectedPatientMrn || 'FPH-2025-0102');
  const [matchUnitId, setMatchUnitId] = useState(bloodUnits[0]?.unitId || 'BLD-A-0101');
  const [matchResult, setMatchResult] = useState<'Compatible (No Agglutination)' | 'Incompatible'>('Compatible (No Agglutination)');

  const handleSelectLabOrder = (order: LabOrder) => {
    setSelectedLabOrderId(order.labOrderId);
    setResultsState(order.results);
  };

  const handleVerifyLabOrder = (criticalAlert: boolean) => {
    if (!activeLabOrder) return;
    updateLabResults(
      activeLabOrder.labOrderId,
      resultsState,
      criticalAlert ? 'Critical Alert' : 'Verified'
    );
  };

  const handleRegisterDonor = (e: React.FormEvent) => {
    e.preventDefault();
    const donor = registerBloodDonor({
      fullName: donorName,
      phone: donorPhone,
      bloodGroup: donorBloodGroup,
      lastDonationDate: new Date().toISOString().substring(0, 10),
      donationsCount: 1,
      eligible: true
    });

    // Also add blood unit to inventory
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 35);

    addBloodUnit({
      bloodGroup: donorBloodGroup,
      collectionDate: new Date().toISOString().substring(0, 10),
      expiryDate: expiry.toISOString().substring(0, 10),
      screeningClearance: { hiv: true, hbv: true, hcv: true, syphilis: true },
      status: 'Available',
      donorCardId: donor.donorCardId,
      volumeMl: 450
    });

    setDonorName('');
    setDonorPhone('+251 9');
  };

  const handleCreateCrossmatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = getPatientByMrn(matchPatientMrn);
    createCrossmatch({
      mrn: matchPatientMrn,
      patientName: p ? `${p.firstName} ${p.lastName}` : 'Patient',
      patientBloodGroup: p?.bloodGroup || 'A+',
      requestedUnits: 1,
      matchedUnitId: matchUnitId,
      crossmatchingResult: matchResult,
      status: matchResult === 'Compatible (No Agglutination)' ? 'Cleared for Transfusion' : 'Rejected'
    });
  };

  const bloodGroupCounts: Record<string, number> = {
    'A+': bloodUnits.filter((u) => u.bloodGroup === 'A+' && u.status === 'Available').length,
    'A-': bloodUnits.filter((u) => u.bloodGroup === 'A-' && u.status === 'Available').length,
    'B+': bloodUnits.filter((u) => u.bloodGroup === 'B+' && u.status === 'Available').length,
    'B-': bloodUnits.filter((u) => u.bloodGroup === 'B-' && u.status === 'Available').length,
    'AB+': bloodUnits.filter((u) => u.bloodGroup === 'AB+' && u.status === 'Available').length,
    'AB-': bloodUnits.filter((u) => u.bloodGroup === 'AB-' && u.status === 'Available').length,
    'O+': bloodUnits.filter((u) => u.bloodGroup === 'O+' && u.status === 'Available').length,
    'O-': bloodUnits.filter((u) => u.bloodGroup === 'O-' && u.status === 'Available').length
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5 rounded border border-sky-200">
              Station 1 of 1
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Clinical Laboratory & Transfusion Blood Bank
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Electronic order intake, unique barcode generation, verified parametric result entry with automated panic/critical value triggers, blood group donor inventory, 4-pathogen screening clearance, and crossmatching records.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('LAB')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'LAB' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Diagnostic Laboratory ({labOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('BLOOD_BANK')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'BLOOD_BANK' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span>Blood Bank & Transfusion</span>
          </button>
        </div>
      </div>

      {activeTab === 'LAB' ? (
        /* Laboratory Sub-Module */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Order Queue & Barcode Tracker (Left) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Barcode className="w-4 h-4 text-slate-700" />
                  <h3 className="text-sm font-bold text-slate-900">Lab Orders & Barcode Tracker</h3>
                </div>
                <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded">
                  {labOrders.length} Orders
                </span>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {labOrders.map((order) => {
                  const isSelected = selectedLabOrderId === order.labOrderId;
                  const isCritical = order.verificationStatus === 'Critical Alert';
                  const isVerified = order.verificationStatus === 'Verified';

                  return (
                    <div
                      key={order.labOrderId}
                      onClick={() => handleSelectLabOrder(order)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                          : isCritical
                          ? 'border-rose-300 bg-rose-50/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">{order.patientName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            MRN: {order.mrn} | ID: {order.labOrderId}
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : isVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.verificationStatus}
                        </span>
                      </div>

                      <div className="font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded text-[11px]">
                        {order.testName}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1 font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          <Barcode className="w-3 h-3 text-slate-500" />
                          <span>{order.sampleIdBarcode}</span>
                        </div>
                        <span className="text-slate-400">{order.collectionDateTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Test Results Verification Workspace (Right) */}
          <div className="lg:col-span-7 space-y-4">
            {activeLabOrder ? (
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900">{activeLabOrder.testName}</span>
                      <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                        {activeLabOrder.sampleIdBarcode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Patient: <strong>{activeLabOrder.patientName}</strong> (MRN: {activeLabOrder.mrn}) • Ordered by: {activeLabOrder.orderedBy}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenLabPrint(activeLabOrder.labOrderId)}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Lab Report</span>
                  </button>
                </div>

                {/* Parametric Results Entry Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider">
                    <span className="col-span-4">Parameter / Assay</span>
                    <span className="col-span-4">Result Value</span>
                    <span className="col-span-2">Unit</span>
                    <span className="col-span-2">Ref Range</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {resultsState.map((res, idx) => (
                      <div key={idx} className={`px-4 py-3 grid grid-cols-12 gap-2 items-center ${res.isCritical ? 'bg-rose-50/70' : res.isAbnormal ? 'bg-amber-50/50' : 'bg-white'}`}>
                        <div className="col-span-4 font-bold text-slate-800">
                          {res.parameter}
                          {res.isCritical && (
                            <span className="ml-1 text-[10px] bg-rose-600 text-white font-bold px-1 rounded">
                              CRITICAL
                            </span>
                          )}
                        </div>

                        <div className="col-span-4">
                          <input
                            type="text"
                            value={res.value}
                            onChange={(e) => {
                              const updated = [...resultsState];
                              updated[idx].value = e.target.value;
                              setResultsState(updated);
                            }}
                            className="w-full px-2 py-1 border border-slate-300 rounded font-mono font-bold text-xs bg-white"
                          />
                        </div>

                        <div className="col-span-2 font-mono text-slate-500 text-[11px]">{res.unit}</div>
                        <div className="col-span-2 font-mono text-slate-600 text-[11px]">{res.referenceRange}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Verifying Tech: <strong>{currentUser.name} (MLS)</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleVerifyLabOrder(true)}
                      className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Flag Panic / Critical Alert</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVerifyLabOrder(false)}
                      className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Sign Results</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-400">
                Select a laboratory order to view parameters.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Blood Bank Sub-Module */
        <div className="space-y-6">
          {/* Blood Group Inventory Stock Matrix */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Perpetual Blood Type Inventory & Rh Matrix</h3>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                {bloodUnits.filter((u) => u.status === 'Available').length} Available Units In Bank
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {Object.entries(bloodGroupCounts).map(([grp, count]) => (
                <div
                  key={grp}
                  className={`p-3 rounded-xl border text-center ${
                    count === 0
                      ? 'border-rose-300 bg-rose-50/40 text-rose-900'
                      : 'border-slate-200 bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="text-lg font-black text-rose-600">{grp}</div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">{count} Units</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {count === 0 ? 'CRITICAL SHORTAGE' : 'Tested & Screened'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Donor Registration Form (Left) */}
            <div className="lg:col-span-6 bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-slate-900">Blood Donor Intake & 4-Pathogen Screening</h3>
                </div>
                <span className="text-[11px] text-slate-400">HIV, HBV, HCV, Syphilis</span>
              </div>

              <form onSubmit={handleRegisterDonor} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Donor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="e.g. Abinet Tsegaye"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Donor Phone *</label>
                    <input
                      type="text"
                      required
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Group & Rh *</label>
                    <select
                      value={donorBloodGroup}
                      onChange={(e) => setDonorBloodGroup(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-rose-700"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Screening Verification Checks */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
                  <div className="font-bold text-emerald-900 text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Mandatory Transfusion Screening Clearance:
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-emerald-800">
                    <div>✓ HIV 1/2 Ab/Ag: Non-reactive</div>
                    <div>✓ Hepatitis B (HBsAg): Negative</div>
                    <div>✓ Hepatitis C (HCV Ab): Negative</div>
                    <div>✓ Syphilis (VDRL/RPR): Non-reactive</div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enroll Donor & Add Unit to Bank</span>
                </button>
              </form>
            </div>

            {/* Patient Crossmatch & Transfusion Matching (Right) */}
            <div className="lg:col-span-6 bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Droplet className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-slate-900">Patient Transfusion Crossmatch Request</h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Major & Minor Crossmatching
                </span>
              </div>

              <form onSubmit={handleCreateCrossmatchSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Patient *</label>
                  <select
                    value={matchPatientMrn}
                    onChange={(e) => setMatchPatientMrn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {patients.map((p) => (
                      <option key={p.mrn} value={p.mrn}>
                        {p.firstName} {p.lastName} ({p.mrn}) — Blood: {p.bloodGroup || 'Unspecified'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Bank Unit *</label>
                    <select
                      value={matchUnitId}
                      onChange={(e) => setMatchUnitId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    >
                      {bloodUnits.map((u) => (
                        <option key={u.unitId} value={u.unitId}>
                          {u.unitId} ({u.bloodGroup}) — Exp: {u.expiryDate}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Crossmatching Serology *</label>
                    <select
                      value={matchResult}
                      onChange={(e) => setMatchResult(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-emerald-800"
                    >
                      <option value="Compatible (No Agglutination)">Compatible (No Agglutination)</option>
                      <option value="Incompatible">Incompatible (Agglutination Flagged)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Issue Transfusion Compatibility Clearance</span>
                </button>
              </form>

              {/* Crossmatch Log History */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-700 mb-2">Recent Crossmatching Records:</div>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {crossmatchRecords.map((x) => (
                    <div key={x.matchId} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] flex items-center justify-between">
                      <div>
                        <strong>{x.patientName}</strong> ({x.patientBloodGroup}) ↔ Unit <strong>{x.matchedUnitId}</strong>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {x.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
