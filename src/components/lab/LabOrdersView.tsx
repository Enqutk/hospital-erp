import React, { useState } from 'react';
import {
  Search,
  Plus,
  Barcode,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  Filter,
  User
} from 'lucide-react';
import { LabOrder } from '../../types';

interface LabOrdersViewProps {
  labOrders: LabOrder[];
  selectedLabOrderId: string;
  onOpenDetailsModal: (order: LabOrder) => void;
  onOpenEditModal: (order: LabOrder) => void;
  onOpenOrderModal: () => void;
  onOpenLabPrint: (labOrderId: string) => void;
}

export const LabOrdersView: React.FC<LabOrdersViewProps> = ({
  labOrders,
  selectedLabOrderId,
  onOpenDetailsModal,
  onOpenEditModal,
  onOpenOrderModal,
  onOpenLabPrint
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredOrders = labOrders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      order.patientName.toLowerCase().includes(q) ||
      order.mrn.toLowerCase().includes(q) ||
      order.labOrderId.toLowerCase().includes(q) ||
      order.sampleIdBarcode.toLowerCase().includes(q) ||
      order.testName.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL' ||
      order.verificationStatus.toLowerCase().includes(statusFilter.toLowerCase()) ||
      order.status.toLowerCase().includes(statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'Critical Alert') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
          Critical Alert
        </span>
      );
    }
    if (status === 'Verified') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          Verified
        </span>
      );
    }
    if (status === 'In Analysis') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          In Analysis
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        Pending Sample
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient, MRN, test, or barcode ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter & Action Buttons */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-hidden cursor-pointer font-medium"
          >
            <option value="ALL">All Statuses ({labOrders.length})</option>
            <option value="Pending">Pending Sample</option>
            <option value="In Analysis">In Analysis</option>
            <option value="Verified">Verified Results</option>
            <option value="Critical">Critical Alerts</option>
          </select>

          <button
            type="button"
            onClick={onOpenOrderModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New STAT Order</span>
          </button>
        </div>
      </div>

      {/* Lab Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <FlaskConical className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-600">No matching laboratory orders found</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Try changing your search term or filter</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-4">Patient Profile</th>
                  <th className="py-2.5 px-4">Test / Investigation</th>
                  <th className="py-2.5 px-4">Specimen Barcode</th>
                  <th className="py-2.5 px-4">Ordered By</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const isSelected = selectedLabOrderId === order.labOrderId;

                  return (
                    <tr
                      key={order.labOrderId}
                      className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${
                        isSelected ? 'bg-slate-50/70' : ''
                      }`}
                      onClick={() => onOpenDetailsModal(order)}
                    >
                      {/* Patient Name & MRN */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {order.patientName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {order.mrn} • {order.labOrderId}
                        </div>
                      </td>

                      {/* Test Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {order.testName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Assay Code: {order.testCode}
                        </div>
                      </td>

                      {/* Barcode */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          <Barcode className="w-3 h-3 text-slate-500" />
                          <span>{order.sampleIdBarcode}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {order.collectionDateTime}
                        </div>
                      </td>

                      {/* Ordered By */}
                      <td className="py-3 px-4 text-slate-600">
                        <span>{order.orderedBy}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {getStatusBadge(order.verificationStatus)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenDetailsModal(order)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-md text-xs transition-colors cursor-pointer"
                          >
                            Details
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenEditModal(order)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                          >
                            <span>Edit Results</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenLabPrint(order.labOrderId)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                            title="Print Laboratory Report"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
