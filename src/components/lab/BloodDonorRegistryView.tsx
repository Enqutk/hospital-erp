import React, { useState } from 'react';
import {
  User,
  Droplet,
  Plus,
  ShieldCheck,
  Phone,
  Calendar,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { BloodDonor } from '../../types';

interface BloodDonorRegistryViewProps {
  bloodDonors: BloodDonor[];
  onOpenEnrollModal: () => void;
  onOpenEditModal: (donor: BloodDonor) => void;
  onLogDonation: (donor: BloodDonor) => void;
}

export const BloodDonorRegistryView: React.FC<BloodDonorRegistryViewProps> = ({
  bloodDonors,
  onOpenEnrollModal,
  onOpenEditModal,
  onLogDonation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [eligibilityFilter, setEligibilityFilter] = useState('ALL');

  const filteredDonors = bloodDonors.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      d.fullName.toLowerCase().includes(q) ||
      d.donorCardId.toLowerCase().includes(q) ||
      d.phone.toLowerCase().includes(q) ||
      d.bloodGroup.toLowerCase().includes(q);

    const matchesGroup = groupFilter === 'ALL' || d.bloodGroup === groupFilter;
    const matchesEligibility =
      eligibilityFilter === 'ALL' ||
      (eligibilityFilter === 'ELIGIBLE' && d.eligible) ||
      (eligibilityFilter === 'DEFERRED' && !d.eligible);

    return matchesSearch && matchesGroup && matchesEligibility;
  });

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search donors by name, card ID, phone, or blood group..."
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
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-hidden cursor-pointer font-medium"
          >
            <option value="ALL">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <option key={bg} value={bg}>
                {bg} Group
              </option>
            ))}
          </select>

          <select
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-hidden cursor-pointer font-medium"
          >
            <option value="ALL">All Statuses ({bloodDonors.length})</option>
            <option value="ELIGIBLE">Eligible</option>
            <option value="DEFERRED">Deferred</option>
          </select>

          <button
            type="button"
            onClick={onOpenEnrollModal}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enroll Blood Donor</span>
          </button>
        </div>
      </div>

      {/* Donors Roster Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredDonors.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <User className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-600">No matching blood donors found</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Try adjusting your search criteria</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-4">Donor Profile & ID</th>
                  <th className="py-2.5 px-4">Blood Group & Rh</th>
                  <th className="py-2.5 px-4">Contact Phone</th>
                  <th className="py-2.5 px-4">Donation History</th>
                  <th className="py-2.5 px-4">Last Donation Date</th>
                  <th className="py-2.5 px-4">Eligibility Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDonors.map((donor) => {
                  return (
                    <tr
                      key={donor.donorCardId}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onOpenEditModal(donor)}
                    >
                      {/* Donor Name & Card ID */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-rose-700 transition-colors">
                          {donor.fullName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {donor.donorCardId}
                        </div>
                      </td>

                      {/* Blood Group */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-xs">
                          {donor.bloodGroup}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 font-mono text-slate-700 text-[11px]">
                        {donor.phone}
                      </td>

                      {/* Donations Count */}
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        <span className="font-bold font-mono">{donor.donationsCount}</span> {donor.donationsCount === 1 ? 'donation' : 'donations'}
                      </td>

                      {/* Last Donation Date */}
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                        {donor.lastDonationDate || 'First Intake'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {donor.eligible ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Eligible</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Deferred</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenEditModal(donor)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-md text-xs transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3 text-slate-500" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onLogDonation(donor)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md text-xs transition-colors cursor-pointer shadow-2xs"
                            title="Log new donation and store 450 mL unit in bank"
                          >
                            <Droplet className="w-3 h-3 fill-white" />
                            <span>+ 450mL Unit</span>
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
