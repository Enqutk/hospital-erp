import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Store,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Filter,
  DollarSign
} from 'lucide-react';
import { DrugItem, PharmacyStoreLocation } from '../../types';

interface PharmacyStockInventoryViewProps {
  drugInventory: DrugItem[];
  onOpenAddDrugModal: () => void;
  onOpenEditDrugModal: (drug: DrugItem) => void;
}

export const PharmacyStockInventoryView: React.FC<PharmacyStockInventoryViewProps> = ({
  drugInventory,
  onOpenAddDrugModal,
  onOpenEditDrugModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState<PharmacyStoreLocation | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOW' | 'EXPIRING'>('ALL');

  const isExpiringSoon = (expiryDateStr: string) => {
    const exp = new Date(expiryDateStr);
    const now = new Date();
    const diffDays = (exp.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 90;
  };

  const isLowStock = (item: DrugItem) => {
    return item.stockOnHand <= item.reorderTriggerLevel;
  };

  const filteredInventory = drugInventory.filter((item) => {
    const matchStore = storeFilter === 'ALL' || item.storeLocation === storeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      q === '' ||
      item.genericName.toLowerCase().includes(q) ||
      item.brandName.toLowerCase().includes(q) ||
      item.drugCode.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.batchNumber.toLowerCase().includes(q);

    const matchStock =
      statusFilter === 'ALL' ||
      (statusFilter === 'LOW' && isLowStock(item)) ||
      (statusFilter === 'EXPIRING' && isExpiringSoon(item.expiryDate));

    return matchStore && matchQuery && matchStock;
  });

  const lowStockCount = drugInventory.filter(isLowStock).length;
  const expiringCount = drugInventory.filter((d) => isExpiringSoon(d.expiryDate)).length;

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search formulary by generic, brand, code, category, or batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-teal-600 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
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
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value as any)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-hidden cursor-pointer font-medium"
          >
            <option value="ALL">All Multi-Stores</option>
            <option value="Main Pharmacy">Main Pharmacy</option>
            <option value="Emergency Pharmacy">Emergency Pharmacy</option>
            <option value="IPD Satellite">IPD Satellite Store</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-hidden cursor-pointer font-medium"
          >
            <option value="ALL">All Stock ({drugInventory.length})</option>
            <option value="LOW">Low Stock Warnings ({lowStockCount})</option>
            <option value="EXPIRING">Expiring ≤ 90 Days ({expiringCount})</option>
          </select>

          <button
            type="button"
            onClick={onOpenAddDrugModal}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Formulary Drug</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredInventory.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Package className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-600">No matching drug items found</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Try changing your search or filter parameters</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-4">Formulary Drug & Code</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Store Location</th>
                  <th className="py-2.5 px-4">Batch Number</th>
                  <th className="py-2.5 px-4">Expiry Date</th>
                  <th className="py-2.5 px-4">Stock On Hand</th>
                  <th className="py-2.5 px-4">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => {
                  const low = isLowStock(item);
                  const expiring = isExpiringSoon(item.expiryDate);

                  return (
                    <tr
                      key={item.drugCode}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onOpenEditDrugModal(item)}
                    >
                      {/* Drug Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {item.genericName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.drugCode} • {item.brandName}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600">
                        <span className="text-[11px]">{item.category}</span>
                      </td>

                      {/* Store */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {item.storeLocation}
                        </span>
                      </td>

                      {/* Batch */}
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                        {item.batchNumber}
                      </td>

                      {/* Expiry */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className={expiring ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                          {item.expiryDate}
                        </span>
                      </td>

                      {/* Stock On Hand */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold text-xs ${
                            low ? 'text-rose-600' : 'text-slate-900'
                          }`}>
                            {item.stockOnHand}
                          </span>
                          {low && (
                            <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1 rounded">
                              LOW
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Min trigger: {item.reorderTriggerLevel}
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        ETB {item.unitSalePrice.toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onOpenEditDrugModal(item)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-md text-xs transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>
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
