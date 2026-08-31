import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Plus,
  Save,
  Store,
  DollarSign,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { DrugItem, PharmacyStoreLocation } from '../../types';

interface DrugItemModalProps {
  drug: DrugItem | null; // null means adding a new item
  onClose: () => void;
  onSave: (drugData: DrugItem) => void;
}

export const DrugItemModal: React.FC<DrugItemModalProps> = ({
  drug,
  onClose,
  onSave
}) => {
  const isEditing = !!drug;

  const [drugCode, setDrugCode] = useState(drug?.drugCode || '');
  const [genericName, setGenericName] = useState(drug?.genericName || '');
  const [brandName, setBrandName] = useState(drug?.brandName || '');
  const [category, setCategory] = useState(drug?.category || 'Antibacterial (General)');
  const [batchNumber, setBatchNumber] = useState(drug?.batchNumber || `BT-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [expiryDate, setExpiryDate] = useState(drug?.expiryDate || '2027-06-30');
  const [stockOnHand, setStockOnHand] = useState(drug?.stockOnHand || 100);
  const [reorderTriggerLevel, setReorderTriggerLevel] = useState(drug?.reorderTriggerLevel || 50);
  const [unitSalePrice, setUnitSalePrice] = useState(drug?.unitSalePrice || 25);
  const [storeLocation, setStoreLocation] = useState<PharmacyStoreLocation>(drug?.storeLocation || 'Main Pharmacy');
  const [supplierCode, setSupplierCode] = useState(drug?.supplierCode || 'SUP-EPSS-001');

  useEffect(() => {
    if (drug) {
      setDrugCode(drug.drugCode);
      setGenericName(drug.genericName);
      setBrandName(drug.brandName);
      setCategory(drug.category);
      setBatchNumber(drug.batchNumber);
      setExpiryDate(drug.expiryDate);
      setStockOnHand(drug.stockOnHand);
      setReorderTriggerLevel(drug.reorderTriggerLevel);
      setUnitSalePrice(drug.unitSalePrice);
      setStoreLocation(drug.storeLocation);
      setSupplierCode(drug.supplierCode);
    }
  }, [drug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugCode || !genericName) return;

    onSave({
      drugCode,
      genericName,
      brandName: brandName || genericName,
      category,
      batchNumber,
      expiryDate,
      stockOnHand,
      reorderTriggerLevel,
      unitSalePrice,
      storeLocation,
      supplierCode
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {isEditing ? `Edit Formulary Item: ${drug.genericName}` : 'Add New Formulary Drug'}
              </h3>
              <div className="text-[11px] text-slate-500">
                Perpetual stock batch and reorder parameters
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Drug Code *</label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={drugCode}
                onChange={(e) => setDrugCode(e.target.value)}
                placeholder="e.g. DRG-AMOX-500"
                className="w-full px-3 py-1.5 border border-slate-200 focus:border-teal-600 rounded-lg text-xs font-mono bg-slate-50 focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Therapeutic Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Antibacterial"
                className="w-full px-3 py-1.5 border border-slate-200 focus:border-teal-600 rounded-lg text-xs bg-slate-50 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Generic Name & Strength *</label>
            <input
              type="text"
              required
              value={genericName}
              onChange={(e) => setGenericName(e.target.value)}
              placeholder="e.g. Amoxicillin 500mg Capsules"
              className="w-full px-3 py-1.5 border border-slate-200 focus:border-teal-600 rounded-lg text-xs bg-slate-50 focus:bg-white outline-hidden font-semibold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand / Trade Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Moxilin / Generic"
                className="w-full px-3 py-1.5 border border-slate-200 focus:border-teal-600 rounded-lg text-xs bg-slate-50 focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Location</label>
              <select
                value={storeLocation}
                onChange={(e) => setStoreLocation(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-200 focus:border-teal-600 rounded-lg text-xs bg-slate-50 focus:bg-white outline-hidden cursor-pointer"
              >
                <option value="Main Pharmacy">Main Pharmacy</option>
                <option value="Emergency Pharmacy">Emergency Pharmacy</option>
                <option value="IPD Satellite">IPD Satellite Store</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batch Number</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 focus:border-teal-600 rounded-lg text-xs font-mono bg-slate-50 focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 focus:border-teal-600 rounded-lg text-xs font-mono bg-slate-50 focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Price (ETB)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={unitSalePrice}
                onChange={(e) => setUnitSalePrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 focus:border-teal-600 rounded-lg text-xs font-mono bg-slate-50 focus:bg-white outline-hidden font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stock On Hand (Units)</label>
              <input
                type="number"
                min="0"
                value={stockOnHand}
                onChange={(e) => setStockOnHand(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 focus:border-teal-600 rounded-lg text-xs font-mono bg-slate-50 focus:bg-white outline-hidden font-bold text-teal-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reorder Trigger Level</label>
              <input
                type="number"
                min="1"
                value={reorderTriggerLevel}
                onChange={(e) => setReorderTriggerLevel(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 focus:border-teal-600 rounded-lg text-xs font-mono bg-slate-50 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          {/* Footer Actions */}
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
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors cursor-pointer text-xs shadow-xs"
            >
              {isEditing ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'Save Changes' : 'Add Formulary Item'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
