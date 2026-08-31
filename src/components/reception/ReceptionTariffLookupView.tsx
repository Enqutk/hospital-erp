import React, { useState } from 'react';
import {
  Receipt,
  Search,
  CheckCircle2,
  Shield,
  CreditCard,
  FileSpreadsheet,
  Building,
  Sparkles,
  Info,
  HelpCircle
} from 'lucide-react';

interface TariffItem {
  code: string;
  category: 'Registration' | 'Consultation' | 'Laboratory' | 'Radiology' | 'Emergency' | 'Inpatient Ward';
  serviceName: string;
  cashPriceETB: number;
  cbhiCovered: boolean;
  corporateRateETB: number;
  notes: string;
}

const HOSPITAL_TARIFFS: TariffItem[] = [
  { code: 'SRV-001', category: 'Registration', serviceName: 'New Outpatient Medical Record Card & Barcode', cashPriceETB: 50, cbhiCovered: true, corporateRateETB: 50, notes: 'One-time registration card fee' },
  { code: 'SRV-002', category: 'Registration', serviceName: 'Patient Card Replacement (Lost Card)', cashPriceETB: 30, cbhiCovered: false, corporateRateETB: 30, notes: 'Non-covered reprint fee' },
  { code: 'SRV-010', category: 'Consultation', serviceName: 'General OPD Physician Consultation', cashPriceETB: 120, cbhiCovered: true, corporateRateETB: 150, notes: 'Full clinical examination' },
  { code: 'SRV-011', category: 'Consultation', serviceName: 'Specialist / Senior Consultant Review', cashPriceETB: 250, cbhiCovered: true, corporateRateETB: 300, notes: 'Surgery, OB/GYN, Internal Med' },
  { code: 'SRV-020', category: 'Emergency', serviceName: 'Emergency Triage & Resuscitation Intake', cashPriceETB: 200, cbhiCovered: true, corporateRateETB: 250, notes: 'Emergency department assessment' },
  { code: 'SRV-030', category: 'Laboratory', serviceName: 'Complete Blood Count (CBC / Hemogram)', cashPriceETB: 180, cbhiCovered: true, corporateRateETB: 200, notes: 'Automated 5-part differential' },
  { code: 'SRV-031', category: 'Laboratory', serviceName: 'Blood Glucose (Fasting / Random)', cashPriceETB: 60, cbhiCovered: true, corporateRateETB: 80, notes: 'Point-of-care rapid chemistry' },
  { code: 'SRV-032', category: 'Laboratory', serviceName: 'Blood Grouping & Crossmatch Typing', cashPriceETB: 140, cbhiCovered: true, corporateRateETB: 160, notes: 'ABO and Rh antibody testing' },
  { code: 'SRV-040', category: 'Radiology', serviceName: 'Chest X-Ray (PA & Lateral View)', cashPriceETB: 220, cbhiCovered: true, corporateRateETB: 250, notes: 'Digital radiography with PACS' },
  { code: 'SRV-041', category: 'Radiology', serviceName: 'Obstetric / Abdominal Ultrasound', cashPriceETB: 280, cbhiCovered: true, corporateRateETB: 320, notes: 'Doppler / Sonography scan' },
  { code: 'SRV-050', category: 'Inpatient Ward', serviceName: 'General Ward Bed Day (Per 24h)', cashPriceETB: 150, cbhiCovered: true, corporateRateETB: 200, notes: 'Includes 24h nursing care' },
  { code: 'SRV-051', category: 'Inpatient Ward', serviceName: 'Private Room Bed Day (Per 24h)', cashPriceETB: 450, cbhiCovered: false, corporateRateETB: 500, notes: 'En-suite private hospital room' }
];

export const ReceptionTariffLookupView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredTariffs = HOSPITAL_TARIFFS.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      t.code.toLowerCase().includes(q) ||
      t.serviceName.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);

    const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm">Hospital Service Tariffs & Fee Schedule</h2>
              <span className="text-[11px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200/60">
                Front Desk Reference
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Official hospital pricing catalog, CBHI community insurance coverage rules, and corporate tariffs
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="font-bold text-slate-900">Ministry of Health Tariff v2.4</span>
          <div className="text-[10px] text-slate-500 font-mono">Currency: Ethiopian Birr (ETB)</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search service name, tariff code, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-600 outline-hidden transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 overflow-x-auto text-xs">
            {['ALL', 'Registration', 'Consultation', 'Laboratory', 'Radiology', 'Emergency', 'Inpatient Ward'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tariffs Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Code & Service Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Cash / Direct Price</th>
                <th className="py-3 px-4">CBHI Coverage</th>
                <th className="py-3 px-4">Corporate Rate</th>
                <th className="py-3 px-4">Clinical Guidance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {filteredTariffs.map((tariff) => (
                <tr key={tariff.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{tariff.serviceName}</div>
                    <div className="font-mono text-[11px] text-slate-400 mt-0.5">{tariff.code}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {tariff.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-emerald-800 text-sm">
                      {tariff.cashPriceETB} ETB
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {tariff.cbhiCovered ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        100% Covered
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Out of Pocket
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                    {tariff.corporateRateETB} ETB
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {tariff.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
