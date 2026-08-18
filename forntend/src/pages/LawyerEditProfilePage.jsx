import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LawyerEditProfilePage() {
  const { user, showToast } = useAuth();
  const [name, setName] = useState(user?.name || 'Adv. Rahim Karim');
  const [specialization, setSpecialization] = useState('Corporate');
  const [district, setDistrict] = useState('Dhaka');
  const [fee, setFee] = useState(2500);
  const [experience, setExperience] = useState(9);
  const [bio, setBio] = useState('Senior corporate and commercial lawyer specializing in contract compliance, cross-border M&A, and company registrations.');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Lawyer profile & fees updated successfully!', 'success');
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="surface-card p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-[#181D19]">Edit Lawyer Profile &amp; Practice Details</h2>
          <p className="text-xs text-[#414942]">Manage your specialization, consultation fees, and profile biography.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Advocate Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Specialization</label>
              <select
                value={specialization}
                onChange={e => setSpecialization(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5] font-semibold"
              >
                <option value="Corporate">Corporate Law</option>
                <option value="Criminal">Criminal Defense</option>
                <option value="Family">Family &amp; Divorce</option>
                <option value="Property">Property &amp; Real Estate</option>
                <option value="Tax">Tax &amp; NBR</option>
                <option value="Labor">Labor &amp; Employment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">District</label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5] font-semibold"
              >
                <option value="Dhaka">Dhaka</option>
                <option value="Chattogram">Chattogram</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Khulna">Khulna</option>
                <option value="Rajshahi">Rajshahi</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Fee (৳)</label>
              <input
                type="number"
                value={fee}
                onChange={e => setFee(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Experience (Yrs)</label>
              <input
                type="number"
                value={experience}
                onChange={e => setExperience(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Biography &amp; Services</label>
            <textarea
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full btn-filled py-3 rounded-full font-bold text-sm"
          >
            {saving ? 'Saving Profile...' : 'Save Lawyer Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
