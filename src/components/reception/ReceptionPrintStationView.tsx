import React, { useState } from 'react';
import {
  Printer,
  CreditCard,
  QrCode,
  Barcode,
  Search,
  CheckCircle2,
  Download,
  Share2,
  FileText,
  Shield,
  User,
  Heart,
  Droplet,
  Phone,
  Building,
  Sparkles
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Patient } from '../../types';
import { calculateAge } from '../../utils/opdRouting';

interface ReceptionPrintStationViewProps {
  onOpenPatientCard: (patient: Patient) => void;
}

export const ReceptionPrintStationView: React.FC<ReceptionPrintStationViewProps> = ({ onOpenPatientCard }) => {
  const { patients, selectedPatientMrn, setSelectedPatientMrn, getPatientByMrn } = useHospital();
  const [searchQuery, setSearchQuery] = useState('');
  const [printType, setPrintType] = useState<'ID_CARD' | 'WRISTBAND' | 'VISITOR_PASS' | 'ROUTING_SLIP'>('ID_CARD');

  const selectedPatient = selectedPatientMrn
    ? getPatientByMrn(selectedPatientMrn) || patients[0]
    : patients[0];

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const fullName = `${p.firstName} ${p.middleName || ''} ${p.lastName}`.toLowerCase();
    return (
      q === '' ||
      p.mrn.toLowerCase().includes(q) ||
      fullName.includes(q) ||
      p.phone.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm">Patient ID Card & Document Print Desk</h2>
              <span className="text-[11px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200/60">
                Front Desk Station
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Generate and issue official laminated barcode medical cards, wristbands, and registration summaries
            </p>
          </div>
        </div>

        {/* Print Type Selector */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs">
          <button
            onClick={() => setPrintType('ID_CARD')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              printType === 'ID_CARD'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Medical ID Card
          </button>
          <button
            onClick={() => setPrintType('WRISTBAND')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              printType === 'WRISTBAND'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Triage Wristband
          </button>
          <button
            onClick={() => setPrintType('ROUTING_SLIP')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              printType === 'ROUTING_SLIP'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Routing Slip
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left: Patient Selector List */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col h-[520px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Patient</span>
            <span className="text-[11px] text-slate-400 font-mono">{filteredPatients.length} records</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, MRN, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-hidden transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredPatients.map((p) => {
              const isSelected = selectedPatient?.mrn === p.mrn;
              return (
                <button
                  key={p.mrn}
                  onClick={() => setSelectedPatientMrn(p.mrn)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all border flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-2xs'
                      : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200/70 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt=""
                      className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {p.mrn} • {p.payerClass.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Live Interactive Card / Document Preview */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {printType === 'ID_CARD' && 'Medical ID Card Preview'}
                  {printType === 'WRISTBAND' && 'Thermal Clinical Wristband Preview'}
                  {printType === 'ROUTING_SLIP' && 'OPD Consultation Intake Slip Preview'}
                </h3>
                <p className="text-xs text-slate-500">Standard ISO/IEC 7810 format with official medical barcode</p>
              </div>

              {selectedPatient && (
                <button
                  onClick={() => onOpenPatientCard(selectedPatient)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Send to Printer</span>
                </button>
              )}
            </div>

            {selectedPatient ? (
              <div className="mt-6 flex justify-center">
                {/* ID Card Format */}
                {printType === 'ID_CARD' && (
                  <div className="w-full max-w-md bg-linear-to-br from-emerald-950 via-slate-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xs">
                          FP
                        </div>
                        <div>
                          <div className="font-bold text-xs tracking-tight text-slate-100">FAYA PRIMARY HOSPITAL</div>
                          <div className="text-[9px] text-emerald-400 font-medium uppercase tracking-wider">Official Medical Health Card</div>
                        </div>
                      </div>
                      <Shield className="w-4 h-4 text-emerald-400 opacity-80" />
                    </div>

                    {/* Card Body */}
                    <div className="flex gap-4 items-start">
                      <img
                        src={selectedPatient.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160'}
                        alt={selectedPatient.firstName}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-500/50 shadow-md shrink-0"
                      />

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="text-base font-bold text-white tracking-tight truncate">
                          {selectedPatient.firstName} {selectedPatient.middleName} {selectedPatient.lastName}
                        </div>

                        <div className="text-[11px] font-mono text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-md inline-block">
                          MRN: {selectedPatient.mrn}
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-300 pt-1">
                          <div>Age: <span className="font-semibold text-white">{calculateAge(selectedPatient.dob)} yrs</span></div>
                          <div>Gender: <span className="font-semibold text-white">{selectedPatient.gender}</span></div>
                          <div>Blood: <span className="font-bold text-rose-400">{selectedPatient.bloodGroup || 'O+'}</span></div>
                          <div>Payer: <span className="font-semibold text-teal-300 truncate block">{selectedPatient.payerClass.split(' ')[0]}</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Barcode */}
                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                      <div>
                        <div className="font-mono text-slate-500">||||| | |||| || |||||| |||| |</div>
                        <div>Reg: {selectedPatient.registeredAt || '2025-01-10'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-300">{selectedPatient.phone}</div>
                        <div className="text-emerald-400 font-mono text-[9px]">VALID FOR ALL CLINICS</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Wristband Format */}
                {printType === 'WRISTBAND' && (
                  <div className="w-full max-w-lg bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 flex items-center justify-between text-slate-800 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-900 rounded-lg font-bold text-xs">
                        WRISTBAND
                      </div>
                      <div>
                        <div className="font-bold text-sm font-sans">{selectedPatient.firstName} {selectedPatient.lastName}</div>
                        <div className="text-[11px] text-slate-500">MRN: {selectedPatient.mrn} • DOB: {selectedPatient.dob} ({selectedPatient.gender})</div>
                        <div className="text-[11px] text-rose-700 font-bold">BLOOD: {selectedPatient.bloodGroup || 'O+'} • ALLERGIES: {selectedPatient.allergies?.join(', ') || 'NKA'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold">||||||||||||||||||</div>
                      <div className="text-[10px] text-slate-500 font-sans">Hospital ID Tag</div>
                    </div>
                  </div>
                )}

                {/* Routing Slip Format */}
                {printType === 'ROUTING_SLIP' && (
                  <div className="w-full max-w-md bg-white border border-slate-300 rounded-xl p-5 shadow-xs text-xs space-y-3 font-mono">
                    <div className="text-center pb-2 border-b border-slate-200">
                      <div className="font-bold font-sans text-sm text-slate-900">FAYA PRIMARY HOSPITAL</div>
                      <div className="text-[10px] text-slate-500">OPD CONSULTATION INTAKE SLIP</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between"><span>Patient:</span><span className="font-bold">{selectedPatient.firstName} {selectedPatient.lastName}</span></div>
                      <div className="flex justify-between"><span>MRN:</span><span className="font-bold">{selectedPatient.mrn}</span></div>
                      <div className="flex justify-between"><span>Age/Gender:</span><span>{calculateAge(selectedPatient.dob)} yrs / {selectedPatient.gender}</span></div>
                      <div className="flex justify-between"><span>Assigned Room:</span><span className="font-bold text-emerald-700">OPD Room 1</span></div>
                      <div className="flex justify-between"><span>Date/Time:</span><span>{new Date().toLocaleString()}</span></div>
                    </div>
                    <div className="text-center pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                      Please proceed directly to the designated consultation room waiting area.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                Select a patient from the list to preview and print ID card
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Standard laser & thermal barcode printers supported
            </span>
            <span className="font-medium text-slate-700">Format: Standard ID-1 CR80</span>
          </div>
        </div>

      </div>
    </div>
  );
};
