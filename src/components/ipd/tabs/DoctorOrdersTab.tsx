import React, { useState } from 'react';
import {
  Inbox,
  Plus,
  Bed,
  Eye,
  Building,
  Baby,
  Activity,
  Search,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { DoctorAdmissionOrder, Patient, WardCode } from '../../../types';
import { WARDS_LIST, getPatientAge } from '../types';

interface DoctorOrdersTabProps {
  admissionOrders: DoctorAdmissionOrder[];
  patients: Patient[];
  onOpenNewOrderModal: () => void;
  onOpenAllocateModal: (order: DoctorAdmissionOrder) => void;
  onSelectOrderForDetail: (order: DoctorAdmissionOrder) => void;
  onOpenChart: (bedNumber: string) => void;
}

export const DoctorOrdersTab: React.FC<DoctorOrdersTabProps> = ({
  admissionOrders,
  patients,
  onOpenNewOrderModal,
  onOpenAllocateModal,
  onSelectOrderForDetail,
  onOpenChart
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'ALLOCATED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingOrders = admissionOrders.filter((o) => o.status === 'Pending Bed Allocation');

  const filteredOrders = admissionOrders.filter((order) => {
    const matchesFilter =
      filterStatus === 'ALL' ||
      (filterStatus === 'PENDING' && order.status === 'Pending Bed Allocation') ||
      (filterStatus === 'ALLOCATED' && order.status === 'Bed Allocated');

    const matchesSearch =
      searchQuery === '' ||
      order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderingDoctor.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header & Actions Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Doctor Bed Admission Orders Queue</span>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                {pendingOrders.length} Pending Allocation
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Doctor admission orders from outpatient consultation and emergency departments.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNewOrderModal}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Bed Order</span>
          </button>
        </div>

        {/* Simple Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Orders ({admissionOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === 'PENDING'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Pending ({pendingOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('ALLOCATED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === 'ALLOCATED'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Bed Assigned ({admissionOrders.length - pendingOrders.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient, MRN, doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-500 focus:outline-hidden bg-white"
            />
          </div>
        </div>

        {/* Clean, Simple Order Cards List */}
        <div className="space-y-2.5 pt-2">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
              <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <div className="font-semibold text-slate-600">No Admission Orders Found</div>
              <p className="text-[11px] text-slate-400">All intake orders have been allocated or none match your filter.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isPending = order.status === 'Pending Bed Allocation';
              const isAllocated = order.status === 'Bed Allocated';
              const pt = patients.find((p) => p.mrn === order.mrn);
              const isChild = order.recommendedWard === 'PEDIATRICS' || (pt && parseInt(getPatientAge(pt?.dob), 10) < 15);
              const wardObj = WARDS_LIST.find((w) => w.code === order.recommendedWard);

              return (
                <div
                  key={order.orderId}
                  className={`p-4 rounded-xl border transition-all text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isPending
                      ? 'border-amber-200 bg-amber-50/20 hover:border-amber-300'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Left: Patient and Target Ward Summary */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        isChild
                          ? 'bg-blue-100 text-blue-700'
                          : isPending
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isChild ? <Baby className="w-5 h-5" /> : <Bed className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">
                          {order.patientName}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {order.mrn}
                        </span>
                        {isChild && (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                            Pediatric
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            order.clinicalPriority === 'Emergency / Stat'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : order.clinicalPriority === 'Urgent'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {order.clinicalPriority}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>Target: {wardObj?.name || order.recommendedWard}</span>
                        </span>
                        <span>•</span>
                        <span>
                          Ordered by <strong className="text-slate-700">{order.orderingDoctor.split(',')[0]}</strong>
                        </span>
                        <span>•</span>
                        <span>{order.orderTime}</span>
                        {order.requiresOxygen && (
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold border border-blue-200 text-[10px]">
                            O2 Port Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Clean Status Badge & Primary Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        isPending
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : isAllocated
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isPending ? 'Pending Allocation' : isAllocated ? `Bed Assigned (${order.assignedBedNumber})` : order.status}
                    </span>

                    {/* Simple View Details Button that opens dedicated details page */}
                    <button
                      type="button"
                      onClick={() => onSelectOrderForDetail(order)}
                      className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Details</span>
                    </button>

                    {isPending ? (
                      <button
                        type="button"
                        onClick={() => onOpenAllocateModal(order)}
                        className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        <Bed className="w-3.5 h-3.5" />
                        <span>Allocate Bed</span>
                      </button>
                    ) : (
                      order.assignedBedNumber && (
                        <button
                          type="button"
                          onClick={() => onOpenChart(order.assignedBedNumber!)}
                          className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer shadow-xs transition-colors"
                        >
                          <span>Open Chart</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
