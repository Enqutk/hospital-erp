import React, { useState } from 'react';
import { X, Plus, FlaskConical, Barcode, User, Stethoscope } from 'lucide-react';
import { Patient, LabOrder } from '../../types';

interface NewLabOrderModalProps {
  patients: Patient[];
  onClose: () => void;
  onCreateOrder: (orderData: Omit<LabOrder, 'labOrderId'>) => void;
}

const COMMON_TESTS = [
  {
    name: 'Complete Blood Count (CBC with 5-Part Diff)',
    code: 'LAB-CBC',
    parameters: [
      { parameter: 'White Blood Cells (WBC)', value: '7.8', unit: '10^3/uL', referenceRange: '4.5 - 11.0' },
      { parameter: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', referenceRange: '13.5 - 17.5' },
      { parameter: 'Hematocrit (Hct)', value: '42.5', unit: '%', referenceRange: '41.0 - 50.0' },
      { parameter: 'Platelets (PLT)', value: '250', unit: '10^3/uL', referenceRange: '150 - 450' }
    ]
  },
  {
    name: 'Malaria Rapid Diagnostic Test (RDT) & Blood Film',
    code: 'LAB-MAL',
    parameters: [
      { parameter: 'Malaria Pf/Pv RDT', value: 'Negative', unit: 'Qualitative', referenceRange: 'Negative' },
      { parameter: 'Blood Film Parasitemia', value: '0', unit: 'parasites/uL', referenceRange: '0 / uL' }
    ]
  },
  {
    name: 'Comprehensive Renal Function Panel (RFP)',
    code: 'LAB-RFP',
    parameters: [
      { parameter: 'Serum Creatinine', value: '1.0', unit: 'mg/dL', referenceRange: '0.7 - 1.3' },
      { parameter: 'Blood Urea Nitrogen (BUN)', value: '16.0', unit: 'mg/dL', referenceRange: '7.0 - 20.0' },
      { parameter: 'eGFR', value: '> 90', unit: 'mL/min/1.73m²', referenceRange: '> 60' }
    ]
  },
  {
    name: 'Liver Function Panel (LFT)',
    code: 'LAB-LFT',
    parameters: [
      { parameter: 'ALT (SGPT)', value: '28', unit: 'U/L', referenceRange: '7 - 56' },
      { parameter: 'AST (SGOT)', value: '24', unit: 'U/L', referenceRange: '10 - 40' },
      { parameter: 'Total Bilirubin', value: '0.8', unit: 'mg/dL', referenceRange: '0.2 - 1.2' }
    ]
  }
];

export const NewLabOrderModal: React.FC<NewLabOrderModalProps> = ({
  patients,
  onClose,
  onCreateOrder
}) => {
  const [selectedMrn, setSelectedMrn] = useState(patients[0]?.mrn || '');
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);
  const [urgency, setUrgency] = useState<'Routine' | 'STAT Urgent'>('STAT Urgent');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const selectedPatient = patients.find((p) => p.mrn === selectedMrn) || patients[0];
  const testTemplate = COMMON_TESTS[selectedTestIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const sampleBarcode = `SMP-${Math.floor(100000 + Math.random() * 900000)}`;

    onCreateOrder({
      mrn: selectedPatient.mrn,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      testName: testTemplate.name,
      testCode: testTemplate.code,
      sampleIdBarcode: sampleBarcode,
      status: 'Sample Collected',
      orderedBy: 'Dr. Dawit Haile, MD (Emergency/OPD)',
      collectionDateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      results: testTemplate.parameters.map((p) => ({ ...p })),
      verificationStatus: 'Pending Review'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">New STAT Laboratory Order</h3>
              <div className="text-[11px] text-slate-500">Specimen collection & barcode generation</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Patient *</label>
            <select
              value={selectedMrn}
              onChange={(e) => setSelectedMrn(e.target.value)}
              className="w-full p-2 border border-slate-200 focus:border-emerald-600 rounded-lg text-xs bg-slate-50 focus:bg-white outline-hidden cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.mrn} value={p.mrn}>
                  {p.firstName} {p.lastName} ({p.mrn}) — ABO: {p.bloodGroup || 'Unspecified'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Investigation / Panel Template *</label>
            <select
              value={selectedTestIndex}
              onChange={(e) => setSelectedTestIndex(Number(e.target.value))}
              className="w-full p-2 border border-slate-200 focus:border-emerald-600 rounded-lg text-xs bg-slate-50 focus:bg-white outline-hidden cursor-pointer font-semibold text-slate-900"
            >
              {COMMON_TESTS.map((t, idx) => (
                <option key={t.code} value={idx}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority / Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full p-2 border border-slate-200 focus:border-emerald-600 rounded-lg text-xs font-bold text-rose-700 bg-slate-50 focus:bg-white outline-hidden cursor-pointer"
              >
                <option value="STAT Urgent">STAT Urgent (Emergency/OPD)</option>
                <option value="Routine">Routine Elective</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ordering Physician</label>
              <input
                type="text"
                readOnly
                value="Dr. Dawit Haile, MD"
                className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-100 text-slate-600"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Parameters Included ({testTemplate.parameters.length} Analytes):
            </span>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700">
              {testTemplate.parameters.map((p, i) => (
                <div key={i} className="truncate">
                  • {p.parameter} ({p.unit})
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors cursor-pointer text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Order & Generate Barcode</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
