import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [role, setRole] = useState('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Lawyer fields
  const [specialization, setSpecialization] = useState('Corporate');
  const [district, setDistrict] = useState('Dhaka');
  const [experience, setExperience] = useState(5);
  const [fee, setFee] = useState(1500);
  const [barLicense, setBarLicense] = useState('');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone,
        ...(role === 'lawyer' && {
          specialization,
          district,
          experience_years: Number(experience),
          consultation_fee: Number(fee),
          bar_license: barLicense || `BAR-${new Date().getFullYear()}-0099`,
          bio
        })
      };

      const res = await register(payload);
      if (res.success) {
        if (role === 'lawyer') {
          navigate('/lawyer/requests');
        } else {
          navigate('/client/appointments');
        }
      } else {
        setErrorMsg(res.message || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl surface-card p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B6E45] to-[#0F4E2E] text-white flex items-center justify-center mx-auto shadow-e2">
            <span className="material-symbols-rounded text-[26px]">how_to_reg</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-[#181D19]">Create an Account</h2>
          <p className="text-xs text-[#414942]">Join Lawyer Finder as a Client or practicing Lawyer.</p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-[#E9F0E7] p-1.5 rounded-2xl border border-[#C1C9BC]/60">
          <button
            type="button"
            onClick={() => setRole('client')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              role === 'client' ? 'bg-[#1B6E45] text-white shadow-e2' : 'text-[#414942]'
            }`}
          >
            <span className="material-symbols-rounded text-[18px]">person</span>
            I am a Client
          </button>
          <button
            type="button"
            onClick={() => setRole('lawyer')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              role === 'lawyer' ? 'bg-[#1B6E45] text-white shadow-e2' : 'text-[#414942]'
            }`}
          >
            <span className="material-symbols-rounded text-[18px]">gavel</span>
            I am a Lawyer
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FFDAD6] text-[#410002] text-xs flex items-center gap-2">
            <span className="material-symbols-rounded text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={role === 'lawyer' ? 'Adv. Rahim Karim' : 'Sadia Anwar'}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5] focus:outline-none focus:ring-1 focus:ring-[#1B6E45]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+8801700000000"
                className="w-full text-xs p-2.5 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5] focus:outline-none focus:ring-1 focus:ring-[#1B6E45]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="w-full text-xs p-2.5 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5] focus:outline-none focus:ring-1 focus:ring-[#1B6E45]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Password *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full text-xs p-2.5 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5] focus:outline-none focus:ring-1 focus:ring-[#1B6E45]"
              />
            </div>
          </div>

          {/* Lawyer-Specific Fields */}
          {role === 'lawyer' && (
            <div className="p-4 bg-[#EFF5EE] rounded-2xl border border-[#C1C9BC] space-y-4 animate-fadein">
              <p className="text-xs font-bold text-[#1B6E45] uppercase tracking-wider">Professional Profile Details</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#414942] uppercase">Specialization</label>
                  <select
                    value={specialization}
                    onChange={e => setSpecialization(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[#C1C9BC] bg-white font-semibold"
                  >
                    <option value="Corporate">Corporate Law</option>
                    <option value="Criminal">Criminal Defense</option>
                    <option value="Family">Family &amp; Divorce</option>
                    <option value="Property">Property &amp; Real Estate</option>
                    <option value="Tax">Tax &amp; NBR</option>
                    <option value="Labor">Labor &amp; Employment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#414942] uppercase">District / Bar</label>
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[#C1C9BC] bg-white font-semibold"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chattogram">Chattogram</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Rajshahi">Rajshahi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#414942] uppercase">Exp (Years)</label>
                  <input
                    type="number"
                    min={1}
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[#C1C9BC] bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#414942] uppercase">Fee (৳)</label>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    value={fee}
                    onChange={e => setFee(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[#C1C9BC] bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#414942] uppercase">Bar License</label>
                  <input
                    type="text"
                    value={barLicense}
                    onChange={e => setBarLicense(e.target.value)}
                    placeholder="DBA-2020-0041"
                    className="w-full text-xs p-2 rounded-lg border border-[#C1C9BC] bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#414942] uppercase">Bio &amp; Summary</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell clients about your legal background, major cases, or counseling approach..."
                  className="w-full text-xs p-2 rounded-lg border border-[#C1C9BC] bg-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-filled py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span className="material-symbols-rounded text-[18px]">check_circle</span>
                Complete Registration
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-[#414942]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#1B6E45] hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
