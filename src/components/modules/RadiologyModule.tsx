import React, { useState } from 'react';
import {
  Radio,
  Eye,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Sun,
  Contrast,
  RotateCw,
  Printer,
  ShieldCheck,
  User,
  Plus
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { RadiologyOrder, RadiologyModality } from '../../types';

export const RadiologyModule: React.FC = () => {
  const {
    radiologyOrders,
    updateRadiologyReport,
    createRadiologyOrder,
    patients,
    selectedPatientMrn,
    getPatientByMrn,
    currentUser
  } = useHospital();

  const [selectedOrderId, setSelectedOrderId] = useState<string>(radiologyOrders[0]?.radiologyOrderId || '');
  const activeOrder = radiologyOrders.find((o) => o.radiologyOrderId === selectedOrderId) || radiologyOrders[0];

  const [reportFindings, setReportFindings] = useState(activeOrder ? activeOrder.diagnosticFindings : '');
  const [radiologistSig, setRadiologistSig] = useState(activeOrder ? activeOrder.radiologistSignature : currentUser.name);

  // PACS Viewer controls simulation
  const [zoomLevel, setZoomLevel] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);

  // New Request Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [newMrn, setNewMrn] = useState(selectedPatientMrn || 'FPH-2025-0101');
  const [newModality, setNewModality] = useState<RadiologyModality>('X-Ray');
  const [newRegion, setNewRegion] = useState('Chest PA View & Lateral');

  const handleSelectOrder = (order: RadiologyOrder) => {
    setSelectedOrderId(order.radiologyOrderId);
    setReportFindings(order.diagnosticFindings);
    setRadiologistSig(order.radiologistSignature || currentUser.name);
    // reset visualizer
    setZoomLevel(1);
    setBrightness(100);
    setContrast(100);
    setIsInverted(false);
  };

  const handleSaveReport = () => {
    if (!activeOrder) return;
    updateRadiologyReport(
      activeOrder.radiologyOrderId,
      reportFindings,
      radiologistSig || `${currentUser.name} (Radiologist)`,
      'Report Verified'
    );
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const p = getPatientByMrn(newMrn);

    createRadiologyOrder({
      mrn: newMrn,
      patientName: p ? `${p.firstName} ${p.lastName}` : 'Patient',
      modality: newModality,
      targetRegion: newRegion,
      scanImageUrl:
        newModality === 'CT'
          ? 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80'
          : newModality === 'Ultrasound'
          ? 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&auto=format&fit=crop&q=80',
      diagnosticFindings: 'Awaiting radiologist review & structured impression...',
      radiologistSignature: 'Dr. Bethlehem Girma, MD (Consultant Radiologist)',
      status: 'Scheduled',
      orderedBy: `${currentUser.name} (Radiology)`,
      scheduledDateTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2 py-0.5 rounded border border-cyan-200">
              Station 1 of 1
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Radiology & Digital Imaging (PACS Viewer)
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Coordinates imaging requests across modalities (X-Ray, Ultrasound, CT, MRI), scheduling based on machine availability, diagnostic image viewer tools, and structured radiologist reports.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Imaging Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Imaging Worklist & Queue (Left) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900">Radiology Modality Worklist</h3>
              </div>
              <span className="text-xs bg-cyan-50 text-cyan-800 font-bold px-2 py-0.5 rounded">
                {radiologyOrders.length} Scans
              </span>
            </div>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {radiologyOrders.map((ord) => {
                const isSelected = selectedOrderId === ord.radiologyOrderId;
                return (
                  <div
                    key={ord.radiologyOrderId}
                    onClick={() => handleSelectOrder(ord)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50/50 ring-1 ring-cyan-500'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{ord.patientName}</span>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {ord.radiologyOrderId} | MRN: {ord.mrn}
                        </div>
                      </div>

                      <span className="font-black text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                        {ord.modality}
                      </span>
                    </div>

                    <div className="text-slate-800 font-medium bg-slate-100/70 p-1.5 rounded text-[11px]">
                      <strong>Target:</strong> {ord.targetRegion}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Sched: {ord.scheduledDateTime}</span>
                      <span className="font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Digital PACS Scan Viewer & Radiologist Report (Right) */}
        <div className="lg:col-span-8 space-y-4">
          {activeOrder ? (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
              
              {/* Scan Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">{activeOrder.modality} — {activeOrder.targetRegion}</span>
                    <span className="font-mono text-xs bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-bold">
                      {activeOrder.radiologyOrderId}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Patient: <strong>{activeOrder.patientName}</strong> (MRN: {activeOrder.mrn}) • Ordered By: {activeOrder.orderedBy}
                  </div>
                </div>

                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
                  {activeOrder.status}
                </span>
              </div>

              {/* Digital PACS Image Canvas with Tools */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
                {/* PACS Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                      PACS Digital Viewer
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-[11px] text-slate-400 font-mono">DICOM 16-Bit Stream</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.min(prev + 0.2, 2.0))}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.max(prev - 0.2, 0.6))}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInverted(!isInverted)}
                      className={`p-1.5 rounded text-xs font-bold ${isInverted ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                      title="Invert Grayscale"
                    >
                      <Contrast className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setZoomLevel(1);
                        setBrightness(100);
                        setContrast(100);
                        setIsInverted(false);
                      }}
                      className="text-[11px] px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Simulated Diagnostic Image Canvas */}
                <div className="relative h-64 sm:h-72 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80">
                  <img
                    src={activeOrder.scanImageUrl}
                    alt={activeOrder.targetRegion}
                    className="max-h-full object-contain transition-transform duration-150"
                    style={{
                      transform: `scale(${zoomLevel})`,
                      filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(1)' : ''}`
                    }}
                  />
                  <div className="absolute top-2 left-2 text-[10px] font-mono text-teal-400 bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-xs">
                    FAYA HOSP PACS | {activeOrder.modality}
                  </div>
                  <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded">
                    FOV: 24cm | Zoom: {Math.round(zoomLevel * 100)}%
                  </div>
                </div>
              </div>

              {/* Structured Radiologist Report Form */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-600" />
                    Structured Diagnostic Findings & Radiologist Impression
                  </label>
                  <span className="text-[11px] text-slate-400">Radiology Information System (RIS)</span>
                </div>

                <textarea
                  rows={4}
                  value={reportFindings}
                  onChange={(e) => setReportFindings(e.target.value)}
                  placeholder="Enter detailed radiological findings, anatomical variations, pathology impression..."
                  className="w-full p-3 border border-slate-300 rounded-xl font-mono text-xs focus:border-cyan-500 outline-none leading-relaxed"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Radiologist Digital Signature *</label>
                    <input
                      type="text"
                      value={radiologistSig}
                      onChange={(e) => setRadiologistSig(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div className="flex items-end justify-end">
                    <button
                      type="button"
                      onClick={handleSaveReport}
                      className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Transmit Diagnostic Report</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-400">
              Select an imaging scan from the worklist to view.
            </div>
          )}
        </div>
      </div>

      {/* New Imaging Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-600" />
              Schedule New Imaging Request
            </h3>

            <form onSubmit={handleCreateRequest} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient *</label>
                <select
                  value={newMrn}
                  onChange={(e) => setNewMrn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {patients.map((p) => (
                    <option key={p.mrn} value={p.mrn}>
                      {p.firstName} {p.lastName} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modality *</label>
                  <select
                    value={newModality}
                    onChange={(e) => setNewModality(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="X-Ray">X-Ray</option>
                    <option value="Ultrasound">Ultrasound</option>
                    <option value="CT">CT Scan</option>
                    <option value="MRI">MRI</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Region *</label>
                  <input
                    type="text"
                    required
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold"
                >
                  Schedule Scan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
