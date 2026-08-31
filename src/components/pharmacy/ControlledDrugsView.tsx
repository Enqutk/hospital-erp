import React, { useState } from 'react';
import {
  ShieldAlert,
  Thermometer,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Clock
} from 'lucide-react';

export const ControlledDrugsView: React.FC = () => {
  const [tempReading] = useState('3.8°C (Normal: 2°C - 8°C)');

  const controlledList = [
    {
      code: 'DRG-MORPH-10',
      name: 'Morphine Sulfate 10mg/mL Injection',
      schedule: 'Schedule II Narcotic',
      stock: 45,
      unit: 'Ampoules',
      lastWitness: 'Pharm. Henok Worku & Dr. Dawit Haile',
      vaultLocation: 'Double-Locked Safe A',
      status: 'Secured'
    },
    {
      code: 'DRG-DIAZ-10',
      name: 'Diazepam 10mg/2mL Injection',
      schedule: 'Schedule IV Benzodiazepine',
      stock: 80,
      unit: 'Ampoules',
      lastWitness: 'Pharm. Henok Worku & Dr. Hana Tadesse',
      vaultLocation: 'Double-Locked Safe B',
      status: 'Secured'
    },
    {
      code: 'DRG-PETH-50',
      name: 'Pethidine (Meperidine) 50mg/mL',
      schedule: 'Schedule II Narcotic',
      stock: 28,
      unit: 'Ampoules',
      lastWitness: 'Pharm. Henok Worku & Dr. Samuel Girma',
      vaultLocation: 'Double-Locked Safe A',
      status: 'Secured'
    }
  ];

  const coldChainUnits = [
    {
      unit: 'Refrigerated Drug Vault #1',
      temp: '3.4°C',
      status: 'Optimal (2-8°C)',
      contents: 'Insulins, Oxytocin, Hepatitis B Vaccines, Tetanus Toxoid',
      lastCheck: 'Today, 08:00 AM'
    },
    {
      unit: 'Refrigerated Drug Vault #2',
      temp: '4.1°C',
      status: 'Optimal (2-8°C)',
      contents: 'Rabies Vaccine, Anti-Rabies Immunoglobulin, Sera',
      lastCheck: 'Today, 08:00 AM'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Controlled Narcotics & Cold-Chain Vault Register</h2>
            <p className="text-slate-500 text-[11px]">
              Double-witness dispensing log, narcotics quota control, and 2°C–8°C pharmaceutical cold-chain
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Vault Security Active</span>
          </span>
        </div>
      </div>

      {/* Controlled Substance Register Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-slate-900 text-xs">Controlled Substances Vault Inventory</span>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Double-Lock Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <th className="py-2.5 px-4">Substance & Formulary Code</th>
                <th className="py-2.5 px-4">Controlled Class</th>
                <th className="py-2.5 px-4">Vault Balance</th>
                <th className="py-2.5 px-4">Last Double-Witness Sign-Off</th>
                <th className="py-2.5 px-4 text-right">Security Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {controlledList.map((c) => (
                <tr key={c.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{c.code} • {c.vaultLocation}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px]">
                      {c.schedule}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {c.stock} {c.unit}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px]">
                    {c.lastWitness}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cold Chain Refrigeration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coldChainUnits.map((u, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-sky-600" />
                <span className="font-bold text-slate-900 text-xs">{u.unit}</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {u.temp}
              </span>
            </div>

            <div className="text-xs text-slate-600">
              <span className="font-medium text-slate-500 block text-[10px] uppercase">Storage Contents:</span>
              <div className="mt-0.5 text-slate-800 font-medium">{u.contents}</div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-100">
              <span>{u.status}</span>
              <span>Last Log: {u.lastCheck}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
