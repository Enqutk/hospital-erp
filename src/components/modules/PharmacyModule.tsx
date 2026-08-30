import React, { useState } from 'react';
import {
  Pill,
  AlertTriangle,
  CheckCircle,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Store,
  Calendar,
  Layers,
  ArrowDownRight,
  Printer,
  ShieldCheck,
  Building2,
  FileText
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { DrugItem, PharmacyStoreLocation, Prescription } from '../../types';

interface PharmacyModuleProps {
  onOpenRxPrint: (rxId: string) => void;
}

export const PharmacyModule: React.FC<PharmacyModuleProps> = ({ onOpenRxPrint }) => {
  const {
    drugInventory,
    prescriptions,
    dispensePrescription,
    addNewDrugItem,
    updateDrugStock,
    patients,
    currentUser
  } = useHospital();

  const [activeStore, setActiveStore] = useState<PharmacyStoreLocation | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'EXPIRING'>('ALL');
  const [activeTab, setActiveTab] = useState<'DISPENSARY' | 'STOCK_INVENTORY'>('DISPENSARY');

  // New Drug Item Modal state
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [newDrug, setNewDrug] = useState<DrugItem>({
    drugCode: 'DRG-CIPRO-500',
    genericName: 'Ciprofloxacin 500mg Film-Coated Tablets',
    brandName: 'Cipro / Generic Ciprofloxacin',
    category: 'Antibacterial (Fluoroquinolone)',
    batchNumber: 'BT-2025-551X',
    expiryDate: '2026-10-31',
    stockOnHand: 350,
    reorderTriggerLevel: 100,
    supplierCode: 'SUP-EPSS-001',
    unitSalePrice: 45,
    storeLocation: 'Main Pharmacy'
  });

  const stores: PharmacyStoreLocation[] = ['Main Pharmacy', 'Emergency Pharmacy', 'IPD Satellite'];

  // Check expiring items (< 90 days)
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
    const matchStore = activeStore === 'ALL' || item.storeLocation === activeStore;
    const matchQuery =
      searchQuery === '' ||
      item.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.drugCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStock =
      stockFilter === 'ALL' ||
      (stockFilter === 'LOW' && isLowStock(item)) ||
      (stockFilter === 'EXPIRING' && isExpiringSoon(item.expiryDate));

    return matchStore && matchQuery && matchStock;
  });

  const pendingPrescriptions = prescriptions.filter((p) => p.status === 'Prescribed');
  const dispensedPrescriptions = prescriptions.filter((p) => p.status === 'Dispensed');

  const handleAddNewDrugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNewDrugItem(newDrug);
    setAddItemModalOpen(false);
  };

  const lowStockCount = drugInventory.filter(isLowStock).length;
  const expiringCount = drugInventory.filter((d) => isExpiringSoon(d.expiryDate)).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8EEEB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#E6F0EC] text-[#2D4F4B] text-xs font-bold px-2.5 py-0.5 rounded-lg border border-[#D1DFD9]">
              Integrated Pharmacy ERP
            </span>
            <h1 className="text-xl font-bold text-[#2D4F4B] tracking-tight">
              Hospital Pharmacy Dispensing & Multi-Store Perpetual Inventory
            </h1>
          </div>
          <p className="text-xs text-[#8DA69E] mt-1 max-w-2xl">
            Live integration with OPD and Inpatient physician orders. Restricts dispensing exclusively to verified signed prescriptions, tracks multi-store batch stocks (Main, ER, IPD), and alerts on low stock & batch expiration dates.
          </p>
        </div>

        {/* Tab & Action controls */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#F0F5F2] p-1.5 rounded-2xl border border-[#E8EEEB]">
            <button
              onClick={() => setActiveTab('DISPENSARY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'DISPENSARY' ? 'bg-[#5DA399] text-white shadow-xs' : 'text-[#3D6B66] hover:text-[#2D4F4B]'
              }`}
            >
              Rx Dispensing ({pendingPrescriptions.length} Pending)
            </button>
            <button
              onClick={() => setActiveTab('STOCK_INVENTORY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'STOCK_INVENTORY' ? 'bg-[#5DA399] text-white shadow-xs' : 'text-[#3D6B66] hover:text-[#2D4F4B]'
              }`}
            >
              Multi-Store Stock ({drugInventory.length})
            </button>
          </div>

          <button
            onClick={() => setAddItemModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#5DA399] hover:bg-[#4E8E85] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* KPI & Alert Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E8EEEB] shadow-xs">
          <div className="text-xs font-bold text-[#8DA69E] uppercase tracking-wider">Total Formulations</div>
          <div className="text-2xl font-bold text-[#2D4F4B] mt-1">{drugInventory.length} Items</div>
          <div className="text-[11px] text-[#8DA69E] mt-0.5">3 Hospital Stores</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8EEEB] shadow-xs">
          <div className="text-xs font-bold text-[#5DA399] uppercase tracking-wider">Pending Prescriptions</div>
          <div className="text-2xl font-bold text-[#5DA399] mt-1">{pendingPrescriptions.length} In Queue</div>
          <div className="text-[11px] text-[#8DA69E] mt-0.5">Ready for Dispensing</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8EEEB] shadow-xs">
          <div className="text-xs font-bold text-[#D35400] uppercase tracking-wider">Low Stock Warnings</div>
          <div className="text-2xl font-bold text-[#D35400] mt-1">{lowStockCount} Items</div>
          <div className="text-[11px] text-[#D35400] mt-0.5">Below Reorder Trigger</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8EEEB] shadow-xs">
          <div className="text-xs font-bold text-[#C0392B] uppercase tracking-wider">Near Expiry Batches</div>
          <div className="text-2xl font-bold text-[#C0392B] mt-1">{expiringCount} Batches</div>
          <div className="text-[11px] text-[#C0392B] mt-0.5">Expiring ≤ 90 Days</div>
        </div>
      </div>

      {activeTab === 'DISPENSARY' ? (
        /* Prescriptions Dispensing Live Queue */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-[#E8EEEB] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Pill className="w-5 h-5 text-[#5DA399]" />
                <h2 className="text-base font-bold text-[#2D4F4B]">
                  Doctor-Signed Prescriptions Queue (Live Pharmacy Feed)
                </h2>
              </div>
              <span className="text-xs text-[#8DA69E] font-medium">
                Enforces Patient Allergy & Stock Checks
              </span>
            </div>

            {pendingPrescriptions.length === 0 && dispensedPrescriptions.length === 0 ? (
              <div className="text-center py-8 text-[#8DA69E] text-xs bg-[#F8FAF9] rounded-2xl border border-[#E8EEEB]">
                No active electronic prescriptions found.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pending Prescriptions */}
                {pendingPrescriptions.map((rx) => (
                  <div
                    key={rx.rxId}
                    className="p-4 rounded-2xl border border-[#D1DFD9] bg-[#F0F5F2]/40 space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8EEEB]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#2D4F4B]">{rx.patientName}</span>
                          <span className="font-mono text-xs bg-[#E6F0EC] text-[#2D4F4B] font-bold px-2 py-0.5 rounded-lg border border-[#D1DFD9]">
                            {rx.rxId}
                          </span>
                          <span className="font-mono text-[#8DA69E]">MRN: {rx.mrn}</span>
                        </div>
                        <div className="text-[11px] text-[#8DA69E] mt-0.5">
                          Prescribed by: <strong className="text-[#2D4F4B]">{rx.prescriberName}</strong> ({rx.department}) • {rx.createdAt}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] font-bold bg-[#E6F0EC] text-[#2D4F4B] px-2.5 py-1 rounded-lg border border-[#D1DFD9]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#5DA399]" />
                          Signed & Authenticated
                        </span>

                        <button
                          type="button"
                          onClick={() => onOpenRxPrint(rx.rxId)}
                          className="flex items-center gap-1 bg-white hover:bg-[#F8FAF9] border border-[#E8EEEB] text-[#2D4F4B] px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Rx</span>
                        </button>
                      </div>
                    </div>

                    {/* Prescribed Items Table */}
                    <div className="border border-[#E8EEEB] rounded-xl overflow-hidden bg-white">
                      <div className="bg-[#F0F5F2] px-3 py-2 font-bold text-[#2D4F4B] grid grid-cols-12 gap-2 text-[11px] uppercase border-b border-[#E8EEEB]">
                        <span className="col-span-4">Medication / Strength</span>
                        <span className="col-span-3">Dosage & Instructions</span>
                        <span className="col-span-2">Qty</span>
                        <span className="col-span-3">Live Stock Status</span>
                      </div>

                      <div className="divide-y divide-[#E8EEEB]">
                        {rx.items.map((it, idx) => {
                          const stockItem = drugInventory.find((d) => d.drugCode === it.drugCode);
                          const hasStock = stockItem && stockItem.stockOnHand >= it.quantity;

                          return (
                            <div key={idx} className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center text-xs">
                              <div className="col-span-4 font-bold text-[#2D4F4B]">
                                {it.genericName}
                              </div>
                              <div className="col-span-3 text-slate-700 text-[11px]">
                                {it.dosage} • {it.frequency} ({it.durationDays}d)
                              </div>
                              <div className="col-span-2 font-mono font-bold text-[#2D4F4B]">
                                {it.quantity} Units
                              </div>
                              <div className="col-span-3">
                                {hasStock ? (
                                  <span className="text-[#2D4F4B] font-bold bg-[#E6F0EC] px-2 py-0.5 rounded-lg text-[11px] inline-flex items-center gap-1 border border-[#D1DFD9]">
                                    <CheckCircle className="w-3 h-3 text-[#5DA399]" />
                                    Available ({stockItem?.stockOnHand} in stock)
                                  </span>
                                ) : (
                                  <span className="text-[#C0392B] font-bold bg-[#FDEDEC] px-2 py-0.5 rounded-lg text-[11px] inline-flex items-center gap-1 border border-[#F5B7B1]">
                                    <AlertTriangle className="w-3 h-3 text-[#C0392B]" />
                                    Low/Out of Stock ({stockItem?.stockOnHand || 0})
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dispense Action */}
                    <div className="pt-1 flex items-center justify-between">
                      <div className="text-[11px] text-[#8DA69E]">
                        Pharmacist verification required before stock deduction and patient handover.
                      </div>

                      <button
                        onClick={() => dispensePrescription(rx.rxId)}
                        className="flex items-center gap-1.5 bg-[#5DA399] hover:bg-[#4E8E85] text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Dispense & Deduct Perpetual Stock</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Dispensed History */}
                {dispensedPrescriptions.length > 0 && (
                  <div className="pt-4 border-t border-[#E8EEEB]">
                    <h3 className="font-bold text-[#2D4F4B] text-xs mb-2">Recently Dispensed Prescriptions</h3>
                    <div className="space-y-2">
                      {dispensedPrescriptions.map((rx) => (
                        <div
                          key={rx.rxId}
                          className="p-3 bg-[#F8FAF9] rounded-xl border border-[#E8EEEB] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#2D4F4B]">{rx.patientName}</span>
                            <span className="text-[#8DA69E] font-mono ml-2">({rx.rxId})</span>
                            <div className="text-[11px] text-[#8DA69E]">
                              {rx.items.map((i) => i.genericName.split(' ')[0]).join(', ')}
                            </div>
                          </div>
                          <span className="font-bold text-[#2D4F4B] bg-[#E6F0EC] px-2 py-0.5 rounded-lg text-[10px] border border-[#D1DFD9]">
                            Dispensed & Logged
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Multi-Store Perpetual Inventory Table */
        <div className="bg-white rounded-2xl p-6 border border-[#E8EEEB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8EEEB]">
            <div className="flex items-center space-x-2">
              <Store className="w-5 h-5 text-[#5DA399]" />
              <h2 className="text-base font-bold text-[#2D4F4B]">Perpetual Multi-Store Drug Inventory</h2>
            </div>

            {/* Store & Alert Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex bg-[#F0F5F2] p-1 rounded-xl border border-[#E8EEEB]">
                <button
                  onClick={() => setActiveStore('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeStore === 'ALL' ? 'bg-[#5DA399] text-white' : 'text-[#3D6B66] hover:text-[#2D4F4B]'
                  }`}
                >
                  All Stores
                </button>
                {stores.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveStore(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      activeStore === s ? 'bg-[#5DA399] text-white font-bold' : 'text-[#3D6B66] hover:text-[#2D4F4B]'
                    }`}
                  >
                    {s.split(' ')[0]}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8DA69E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search drug, code, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 pr-3 py-1.5 border border-[#E8EEEB] bg-[#F8FAF9] rounded-xl text-xs outline-none focus:border-[#5DA399]"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border border-[#E8EEEB] rounded-2xl overflow-hidden text-xs">
            <div className="bg-[#F0F5F2] px-4 py-2.5 font-bold text-[#2D4F4B] grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider border-b border-[#E8EEEB]">
              <span className="col-span-4">Drug Formulation & Category</span>
              <span className="col-span-2">Batch & Expiry</span>
              <span className="col-span-2">Store Location</span>
              <span className="col-span-2 text-right">Stock on Hand</span>
              <span className="col-span-2 text-right">Unit Price</span>
            </div>

            <div className="divide-y divide-[#E8EEEB]">
              {filteredInventory.map((item) => {
                const low = isLowStock(item);
                const expiring = isExpiringSoon(item.expiryDate);

                return (
                  <div
                    key={item.drugCode}
                    className={`px-4 py-3 grid grid-cols-12 gap-2 items-center ${
                      expiring ? 'bg-[#FDEDEC]/40' : low ? 'bg-[#FFF3E0]/40' : 'bg-white hover:bg-[#F8FAF9]'
                    }`}
                  >
                    <div className="col-span-4">
                      <div className="font-bold text-[#2D4F4B]">{item.genericName}</div>
                      <div className="text-[11px] text-[#8DA69E] font-mono">
                        {item.drugCode} • {item.category}
                      </div>
                    </div>

                    <div className="col-span-2 text-[11px]">
                      <div className="font-mono text-slate-700">{item.batchNumber}</div>
                      <div
                        className={`font-semibold ${
                          expiring ? 'text-[#C0392B] font-bold' : 'text-[#8DA69E]'
                        }`}
                      >
                        Exp: {item.expiryDate} {expiring && '⚠️ Near Expiry'}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[10px] font-bold bg-[#E6F0EC] text-[#2D4F4B] px-2 py-0.5 rounded-lg border border-[#D1DFD9]">
                        {item.storeLocation}
                      </span>
                    </div>

                    <div className="col-span-2 text-right">
                      <div className="font-mono font-bold text-[#2D4F4B] text-sm">
                        {item.stockOnHand}
                      </div>
                      <div className="text-[10px] text-[#8DA69E]">
                        Reorder at: {item.reorderTriggerLevel}
                      </div>
                    </div>

                    <div className="col-span-2 text-right font-mono font-bold text-[#2D4F4B]">
                      ETB {item.unitSalePrice}.00
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Item Modal */}
      {addItemModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#E8EEEB] text-xs">
            <h3 className="text-base font-bold text-[#2D4F4B] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#5DA399]" />
              Register New Drug Item & Batch Entry
            </h3>

            <form onSubmit={handleAddNewDrugSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D4F4B] mb-1">Drug Code *</label>
                  <input
                    type="text"
                    required
                    value={newDrug.drugCode}
                    onChange={(e) => setNewDrug({ ...newDrug, drugCode: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8EEEB] bg-[#F8FAF9] rounded-xl font-mono text-xs outline-none focus:border-[#5DA399]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D4F4B] mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={newDrug.category}
                    onChange={(e) => setNewDrug({ ...newDrug, category: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8EEEB] bg-[#F8FAF9] rounded-xl text-xs outline-none focus:border-[#5DA399]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2D4F4B] mb-1">Generic Name & Strength *</label>
                <input
                  type="text"
                  required
                  value={newDrug.genericName}
                  onChange={(e) => setNewDrug({ ...newDrug, genericName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8EEEB] bg-[#F8FAF9] rounded-xl text-xs outline-none focus:border-[#5DA399]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D4F4B] mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={newDrug.batchNumber}
                    onChange={(e) => setNewDrug({ ...newDrug, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8EEEB] bg-[#F8FAF9] rounded-xl font-mono text-xs outline-none focus:border-[#5DA399]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D4F4B] mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={newDrug.expiryDate}
                    onChange={(e) => setNewDrug({ ...newDrug, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8EEEB] bg-[#F8FAF9] rounded-xl text-xs outline-none focus:border-[#5DA399]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-[#2D4F4B] mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    required
                    value={newDrug.stockOnHand}
                    onChange={(e) => setNewDrug({ ...newDrug, stockOnHand: Number(e.target.value) })}
                    className="w-full px-2 py-2 border border-[#E8EEEB] bg-[#F8FAF9] rounded-xl font-mono text-center text-xs outline-none focus:border-[#5DA399]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D4F4B] mb-1">Reorder Trigger</label>
                  <input
                    type="number"
                    value={newDrug.reorderTriggerLevel}
                    onChange={(e) => setNewDrug({ ...newDrug, reorderTriggerLevel: Number(e.target.value) })}
                    className="w-full px-2 py-2 border border-[#E8EEEB] bg-[#F8FAF9] rounded-xl font-mono text-center text-xs outline-none focus:border-[#5DA399]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D4F4B] mb-1">Unit Price (ETB)</label>
                  <input
                    type="number"
                    value={newDrug.unitSalePrice}
                    onChange={(e) => setNewDrug({ ...newDrug, unitSalePrice: Number(e.target.value) })}
                    className="w-full px-2 py-2 border border-[#E8EEEB] bg-[#F8FAF9] rounded-xl font-mono text-center text-xs outline-none focus:border-[#5DA399]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2D4F4B] mb-1">Store Location *</label>
                <select
                  value={newDrug.storeLocation}
                  onChange={(e) => setNewDrug({ ...newDrug, storeLocation: e.target.value as any })}
                  className="w-full px-3 py-2 border border-[#E8EEEB] bg-[#F8FAF9] rounded-xl text-xs outline-none focus:border-[#5DA399]"
                >
                  <option value="Main Pharmacy">Main Pharmacy (Central Dispensary)</option>
                  <option value="Emergency Pharmacy">Emergency Pharmacy</option>
                  <option value="IPD Satellite">IPD Inpatient Satellite</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E8EEEB]">
                <button
                  type="button"
                  onClick={() => setAddItemModalOpen(false)}
                  className="px-4 py-2 bg-[#F0F5F2] text-[#2D4F4B] rounded-xl font-bold hover:bg-[#E6F0EC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5DA399] hover:bg-[#4E8E85] text-white rounded-xl font-bold cursor-pointer"
                >
                  Register Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
