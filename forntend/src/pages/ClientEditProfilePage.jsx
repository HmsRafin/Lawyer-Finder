import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ClientEditProfilePage() {
  const { user, showToast } = useAuth();
  const [name, setName] = useState(user?.name || 'Sadia Anwar');
  const [email, setEmail] = useState(user?.email || 'sadia@gmail.com');
  const [phone, setPhone] = useState(user?.phone || '+8801711111111');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Client profile updated successfully!', 'success');
    }, 600);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="surface-card p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-[#181D19]">Edit Client Profile</h2>
          <p className="text-xs text-[#414942]">Keep your contact information up to date for lawyer consultations.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5]"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full btn-filled py-3 rounded-full font-bold text-sm"
          >
            {saving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
