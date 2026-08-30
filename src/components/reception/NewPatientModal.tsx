import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertTriangle } from 'lucide-react';
import { Patient, PayerClass, Vitals } from '../../types';
import { OPD_STATIONS } from '../../data/mockData';
import { getRecommendedOPDRoom } from '../../utils/opdRouting';

interface NewPatientModalProps {
  onClose: () => void;
  onRegister: (
    patientData: Omit<Patient, 'mrn' | 'registeredAt'>,
    autoDispatch: boolean,
    targetRoom: number,
    vitals: Vitals
  ) => void;
  checkDuplicate: (nationalId: string, phone: string) => Patient | null;
}

const sampleAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150'
];

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  onClose,
  onRegister,
  checkDuplicate
}) => {
  const [formState, setFormState] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '1995-06-12',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    nationalId: '',
    phone: '+251 9',
    emergencyContactName: '',
    emergencyContactPhone: '+251 9',
    payerClass: 'CBHI (Community Health Insurance)' as PayerClass,
    insuranceNumber: '',
    bloodGroup: 'O+',
    allergies: 'None Reported',
    photoUrl: sampleAvatars[0],
    autoDispatchOPD: true,
    targetOPDRoom: 1
  });

  const [vitals, setVitals] = useState<Vitals>({
    bpSystolic: 120,
    bpDiastolic: 80,
    heartRate: 76,
    respRate: 18,
    tempCelsius: 37.0,
    spO2: 98
  });

  const formRec = getRecommendedOPDRoom(formState.dob, formState.gender);

  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      targetOPDRoom: formRec.roomNumber
    }));
  }, [formState.dob, formState.gender]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.firstName.trim() || !formState.lastName.trim() || !formState.phone.trim()) {
      alert('Please fill in required fields: First Name, Last Name, and Phone Number.');
      return;
    }

    const dup = checkDuplicate(formState.nationalId, formState.phone);
    if (dup) {
      const confirmContinue = window.confirm(
        `A patient with ID ${dup.nationalId} or Phone ${dup.phone} already exists (${dup.firstName} ${dup.lastName} - MRN: ${dup.mrn}). Do you still want to proceed?`
      );
      if (!confirmContinue) return;
    }

    onRegister(
      {
        firstName: formState.firstName.trim(),
        middleName: formState.middleName.trim(),
        lastName: formState.lastName.trim(),
        dob: formState.dob,
        gender: formState.gender,
        nationalId: formState.nationalId.trim() || `ETH-${Math.floor(10000000 + Math.random() * 90000000)}`,
        phone: formState.phone.trim(),
        emergencyContactName: formState.emergencyContactName.trim() || 'Family Contact',
        emergencyContactPhone: formState.emergencyContactPhone.trim() || formState.phone.trim(),
        payerClass: formState.payerClass,
        insuranceNumber: formState.insuranceNumber.trim(),
        photoUrl: formState.photoUrl,
        bloodGroup: formState.bloodGroup,
        allergies: formState.allergies
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        activeStation: 'Reception Registered'
      },
      formState.autoDispatchOPD,
      formState.targetOPDRoom,
      vitals
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Register New Patient</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter demographic identification, contact info, payer insurance, and optional initial triage.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Section 1: Demographics */}
          <div>
            <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-3">
              1. Patient Identification & Demographics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  First Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Almaz"
                  value={formState.firstName}
                  onChange={(e) => setFormState({ ...formState, firstName: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Father's Name (Middle)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kebede"
                  value={formState.middleName}
                  onChange={(e) => setFormState({ ...formState, middleName: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Grandfather's Name (Last) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tadesse"
                  value={formState.lastName}
                  onChange={(e) => setFormState({ ...formState, lastName: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formState.dob}
                  onChange={(e) => setFormState({ ...formState, dob: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={formState.gender}
                  onChange={(e) => setFormState({ ...formState, gender: e.target.value as any })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={formState.bloodGroup}
                  onChange={(e) => setFormState({ ...formState, bloodGroup: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden bg-white"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">National ID / Kebele</label>
                <input
                  type="text"
                  placeholder="e.g. ETH-482910"
                  value={formState.nationalId}
                  onChange={(e) => setFormState({ ...formState, nationalId: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Emergency */}
          <div>
            <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-3">
              2. Contact & Emergency Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Phone <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+251 91 234 5678"
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sara Bekele (Spouse)"
                  value={formState.emergencyContactName}
                  onChange={(e) => setFormState({ ...formState, emergencyContactName: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="+251 92 876 5432"
                  value={formState.emergencyContactPhone}
                  onChange={(e) => setFormState({ ...formState, emergencyContactPhone: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payer & Clinical Notes */}
          <div>
            <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-3">
              3. Payer / Insurance & Clinical Warnings
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payer Classification
                </label>
                <select
                  value={formState.payerClass}
                  onChange={(e) => setFormState({ ...formState, payerClass: e.target.value as PayerClass })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden bg-white"
                >
                  <option value="CBHI (Community Health Insurance)">CBHI (Community Health Insurance)</option>
                  <option value="Cash / Out-of-Pocket">Cash / Out-of-Pocket</option>
                  <option value="Corporate / Company">Corporate / Company</option>
                  <option value="Private Insurance">Private Insurance</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Insurance / Policy Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. CBHI-AA-09231"
                  value={formState.insuranceNumber}
                  onChange={(e) => setFormState({ ...formState, insuranceNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Known Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa, None"
                  value={formState.allergies}
                  onChange={(e) => setFormState({ ...formState, allergies: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:border-slate-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Initial Triage & Routing */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-semibold text-slate-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.autoDispatchOPD}
                  onChange={(e) => setFormState({ ...formState, autoDispatchOPD: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span>Automatically dispatch to OPD Doctor upon registration</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Recommended: Room {formRec.roomNumber} ({formRec.station.name})
              </span>
            </div>

            {formState.autoDispatchOPD && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Target Consultation Room</label>
                    <select
                      value={formState.targetOPDRoom}
                      onChange={(e) => setFormState({ ...formState, targetOPDRoom: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs"
                    >
                      {OPD_STATIONS.map((stn) => (
                        <option key={stn.stationNumber} value={stn.stationNumber}>
                          Room {stn.stationNumber}: {stn.name} ({stn.doctorName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Triage Priority</label>
                    <input
                      type="text"
                      readOnly
                      value={formRec.suggestedPriority}
                      className="w-full border border-slate-300 rounded p-1.5 bg-slate-100 text-slate-700 text-xs"
                    />
                  </div>
                </div>

                {/* Optional initial vitals */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                  <div>
                    <span className="block text-[10px] text-slate-500">BP Sys</span>
                    <input
                      type="number"
                      value={vitals.bpSystolic}
                      onChange={(e) => setVitals({ ...vitals, bpSystolic: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded p-1 text-center text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">BP Dia</span>
                    <input
                      type="number"
                      value={vitals.bpDiastolic}
                      onChange={(e) => setVitals({ ...vitals, bpDiastolic: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded p-1 text-center text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Heart Rate</span>
                    <input
                      type="number"
                      value={vitals.heartRate}
                      onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded p-1 text-center text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Resp Rate</span>
                    <input
                      type="number"
                      value={vitals.respRate}
                      onChange={(e) => setVitals({ ...vitals, respRate: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded p-1 text-center text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Temp (°C)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={vitals.tempCelsius}
                      onChange={(e) => setVitals({ ...vitals, tempCelsius: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded p-1 text-center text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">SpO2 (%)</span>
                    <input
                      type="number"
                      value={vitals.spO2}
                      onChange={(e) => setVitals({ ...vitals, spO2: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded p-1 text-center text-slate-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Patient & Register</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
