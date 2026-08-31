import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Droplet,
  ShieldCheck,
  Phone,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Save
} from 'lucide-react';
import { BloodDonor } from '../../types';

interface BloodDonorModalProps {
  donor: BloodDonor | null; // null means adding a new donor
  onClose: () => void;
  onSave: (donorData: {
    fullName: string;
    phone: string;
    bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    eligible: boolean;
    donationsCount: number;
    lastDonationDate: string;
    addUnitToBank?: boolean;
  }) => void;
}

export const BloodDonorModal: React.FC<BloodDonorModalProps> = ({
  donor,
  onClose,
  onSave
}) => {
  const isEditing = !!donor;

  const [fullName, setFullName] = useState(donor?.fullName || '');
  const [phone, setPhone] = useState(donor?.phone || '+251 9');
  const [bloodGroup, setBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>(
    (donor?.bloodGroup as any) || 'O+'
  );
  const [eligible, setEligible] = useState(donor ? donor.eligible : true);
  const [donationsCount, setDonationsCount] = useState(donor?.donationsCount || 1);
  const [lastDonationDate, setLastDonationDate] = useState(
    donor?.lastDonationDate || new Date().toISOString().substring(0, 10)
  );
  const [addUnitToBank, setAddUnitToBank] = useState(!isEditing);

  useEffect(() => {
    if (donor) {
      setFullName(donor.fullName);
      setPhone(donor.phone);
      setBloodGroup(donor.bloodGroup as any);
      setEligible(donor.eligible);
      setDonationsCount(donor.donationsCount);
      setLastDonationDate(donor.lastDonationDate);
      setAddUnitToBank(false);
    } else {
      setFullName('');
      setPhone('+251 9');
      setBloodGroup('O+');
      setEligible(true);
      setDonationsCount(1);
      setLastDonationDate(new Date().toISOString().substring(0, 10));
      setAddUnitToBank(true);
    }
  }, [donor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    onSave({
      fullName,
      phone,
      bloodGroup,
      eligible,
      donationsCount,
      lastDonationDate,
      addUnitToBank
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Droplet className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {isEditing ? `Edit Donor: ${donor.fullName}` : 'Enroll New Blood Donor'}
              </h3>
              <div className="text-[11px] text-slate-500">
                {isEditing ? `Card ID: ${donor.donorCardId}` : '4-Pathogen screening & cold-chain intake'}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Donor Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Almaz Tadesse"
              className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-lg text-xs bg-slate-50 focus:bg-white outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-lg text-xs font-mono bg-slate-50 focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Group & Rh *</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-lg text-xs font-bold text-rose-700 bg-slate-50 focus:bg-white outline-hidden cursor-pointer"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Donations Count</label>
              <input
                type="number"
                min="1"
                value={donationsCount}
                onChange={(e) => setDonationsCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-lg text-xs font-mono bg-slate-50 focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Donation Date</label>
              <input
                type="date"
                value={lastDonationDate}
                onChange={(e) => setLastDonationDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-lg text-xs font-mono bg-slate-50 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Eligibility Status</label>
            <select
              value={eligible ? 'true' : 'false'}
              onChange={(e) => setEligible(e.target.value === 'true')}
              className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 rounded-lg text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white outline-hidden cursor-pointer"
            >
              <option value="true">Eligible for Blood Donation</option>
              <option value="false">Deferred / Ineligible (Medical/Serology)</option>
            </select>
          </div>

          {/* Serology Screening Notice */}
          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-1.5">
            <div className="font-bold text-emerald-900 text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Standard 4-Pathogen Screening Clearance:</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-emerald-800 font-medium">
              <div>✓ HIV 1/2: Non-reactive</div>
              <div>✓ Hepatitis B: Negative</div>
              <div>✓ Hepatitis C: Negative</div>
              <div>✓ Syphilis: Non-reactive</div>
            </div>
          </div>

          {/* Option to Issue Unit */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="addUnitCheckbox"
              checked={addUnitToBank}
              onChange={(e) => setAddUnitToBank(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
            />
            <label htmlFor="addUnitCheckbox" className="text-xs text-slate-700 cursor-pointer font-medium select-none">
              Automatically issue tested blood unit (450 mL) to Blood Bank Inventory
            </label>
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
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition-colors cursor-pointer text-xs shadow-xs"
            >
              {isEditing ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'Save Changes' : 'Enroll Donor'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
