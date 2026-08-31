import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Cpu, Gauge } from 'lucide-react';

export const LabQualityControlView: React.FC = () => {
  const analyzers = [
    {
      id: 'ANLZ-01',
      name: 'Sysmex XN-550 Automated Hematology',
      modality: 'Complete Blood Counts (5-Part Diff)',
      status: 'Calibrated & Ready',
      qcPassRate: '99.8%',
      lastCalibration: 'Today, 06:30 AM',
      reagentLevel: '88%'
    },
    {
      id: 'ANLZ-02',
      name: 'Roche Cobas c311 Clinical Chemistry',
      modality: 'Liver / Renal Function / Electrolytes',
      status: 'Calibrated & Ready',
      qcPassRate: '99.4%',
      lastCalibration: 'Today, 06:00 AM',
      reagentLevel: '74%'
    },
    {
      id: 'ANLZ-03',
      name: 'Bio-Rad D-10 Hemoglobin Analyzer',
      modality: 'HbA1c / Glycated Hemoglobin',
      status: 'Calibrated & Ready',
      qcPassRate: '100%',
      lastCalibration: 'Yesterday, 18:00',
      reagentLevel: '91%'
    },
    {
      id: 'ANLZ-04',
      name: 'Helmer UltraCW Automated Cell Washer',
      modality: 'Transfusion Crossmatching / Coombs',
      status: 'Operational',
      qcPassRate: '100%',
      lastCalibration: 'Aug 29, 2026',
      reagentLevel: '95%'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Analyzer Quality Control & Calibration Telemetry</h3>
            <p className="text-xs text-slate-500">
              Daily Westgard multirule QC validation and analyzer instrument health
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>All Analyzers In Spec</span>
          </span>
        </div>
      </div>

      {/* Analyzers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {analyzers.map((anlz) => (
          <div key={anlz.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{anlz.name}</span>
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                    {anlz.id}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{anlz.modality}</div>
              </div>

              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-semibold shrink-0">
                {anlz.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-medium">QC Pass Rate</span>
                <span className="font-bold font-mono text-emerald-700">{anlz.qcPassRate}</span>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-medium">Last Calibration</span>
                <span className="font-semibold text-slate-800 text-[11px]">{anlz.lastCalibration}</span>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-medium">Reagent Pack</span>
                <span className="font-bold font-mono text-slate-900">{anlz.reagentLevel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
