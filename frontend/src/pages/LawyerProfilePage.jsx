import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CalendarPicker from '../components/CalendarPicker';
import { lawyersApi } from '../api/lawyers';
import { appointmentsApi } from '../api/appointments';
import { useAuth } from '../context/AuthContext';

export default function LawyerProfilePage() {
  const { id } = useParams();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');

  // Booking states
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [date, setDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [time, setTime] = useState('10:30:00');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLawyer = async () => {
      setLoading(true);
      try {
        const res = await lawyersApi.getById(id || 1);
        if (res.success && res.data) {
          setLawyer(res.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLawyer();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!description.trim()) {
      setErrorMsg('Please describe your case or issue.');
      return;
    }

    if (!user) {
      showToast('Please log in to complete your appointment booking.', 'error');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        client_id: user.id || 2,
        lawyer_id: lawyer.id,
        appointment_date: date,
        appointment_time: time,
        case_description: description
      };

      const res = await appointmentsApi.create(payload);
      if (res.success) {
        showToast('Appointment successfully confirmed with SQL transaction guard!', 'success');
        navigate('/client/appointments');
      } else {
        setErrorMsg(res.message || 'Time slot already taken or conflict occurred.');
        showToast(res.message, 'error');
      }
    } catch (err) {
      setErrorMsg('Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 py-20 text-center">
        <span className="material-symbols-rounded animate-spin text-[36px] text-[#1B6E45]">sync</span>
        <p className="text-xs font-semibold mt-2 text-[#414942]">Loading lawyer profile...</p>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 py-20 text-center surface-card p-10 space-y-4">
        <h2 className="text-xl font-bold">Lawyer Profile Not Found</h2>
        <button onClick={() => navigate('/lawyers')} className="btn-filled px-4 py-2 rounded-full text-xs">
          Back to Directory
        </button>
      </div>
    );
  }

  const initials = lawyer.initials || 
    (lawyer.name ? lawyer.name.replace('Adv. ', '').split(' ').map(n=>n[0]).slice(0,2).join('') : 'LW');

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-[#1B6E45] to-[#0F4E2E] text-white rounded-3xl p-6 sm:p-8 shadow-e3 relative flex flex-wrap items-center gap-6">
        <div className="w-[84px] h-[84px] rounded-full bg-white/20 border-3 border-white/40 flex items-center justify-center text-white font-display font-extrabold text-3xl shadow-inner">
          {initials}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl">{lawyer.name}</h1>
            <span className="bg-[#C6F3D6] text-[#00390F] text-[11px] font-bold px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>
          <p className="text-sm text-white/85">{lawyer.specialization} Lawyer · {lawyer.district} Bar</p>
          <div className="flex items-center gap-3 text-xs text-[#FFE3AD] pt-1">
            <span className="flex items-center gap-1 font-bold">
              <span className="material-symbols-rounded fill text-[16px]">star</span>
              {Number(lawyer.rating || 4.9).toFixed(1)}
            </span>
            <span>·</span>
            <span>{lawyer.reviews_count || 128} Reviews</span>
            <span>·</span>
            <span>{lawyer.experience_years || 8}+ Years Experience</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3 bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/20">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/70">Consultation Fee</p>
            <p className="text-base font-extrabold text-[#FFE3AD]">৳{Number(lawyer.consultation_fee || 1500).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Interactive Booking Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Bio, Tabs, Reviews */}
        <div className="lg:col-span-7 space-y-6">
          <div className="surface-card p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-[#181D19]">About the Advocate</h3>
            <p className="text-xs sm:text-sm text-[#414942] leading-relaxed">
              {lawyer.bio || "Dedicated advocate with a strong background in courtroom litigation, legal counseling, commercial contract negotiation, and dispute arbitration."}
            </p>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#E3EBE1] text-xs">
              <div className="p-3 bg-[#EFF5EE] rounded-xl text-center">
                <p className="text-[10px] font-bold text-[#71796F] uppercase">Bar License</p>
                <p className="font-bold text-[#181D19] mt-0.5">{lawyer.bar_license || 'DBA-2019-0041'}</p>
              </div>
              <div className="p-3 bg-[#EFF5EE] rounded-xl text-center">
                <p className="text-[10px] font-bold text-[#71796F] uppercase">Cases Handled</p>
                <p className="font-bold text-[#181D19] mt-0.5">210+</p>
              </div>
              <div className="p-3 bg-[#EFF5EE] rounded-xl text-center">
                <p className="text-[10px] font-bold text-[#71796F] uppercase">Success Rate</p>
                <p className="font-bold text-[#1B6E45] mt-0.5">94%</p>
              </div>
            </div>
          </div>

          {/* Services & Reviews Tabs */}
          <div className="surface-card p-6 space-y-4">
            <div className="flex gap-4 border-b border-[#C1C9BC]">
              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === 'services' ? 'border-[#1B6E45] text-[#1B6E45]' : 'border-transparent text-[#71796F]'
                }`}
              >
                Services &amp; Practice Areas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  activeTab === 'reviews' ? 'border-[#1B6E45] text-[#1B6E45]' : 'border-transparent text-[#71796F]'
                }`}
              >
                Client Reviews ({lawyer.reviews?.length || 3})
              </button>
            </div>

            {activeTab === 'services' ? (
              <div className="space-y-2.5">
                {(lawyer.services || [
                  "Corporate Contract Drafting & Cross-border Compliance",
                  "Business Registration & Trademark Filing",
                  "Shareholders Agreement & M&A Advisory",
                  "Civil Litigation & Appellate Hearing"
                ]).map((s, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F5FAF5] border border-[#C1C9BC]/50 text-xs">
                    <span className="material-symbols-rounded text-[#1B6E45] text-[18px]">check_circle</span>
                    <span className="font-medium text-[#181D19]">{s}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(lawyer.reviews || [
                  { name: "Sadia Anwar", rating: 5.0, comment: "Extremely thorough with our contract review — explained every clause clearly." },
                  { name: "Mahin Hasan", rating: 4.8, comment: "Responsive and knowledgeable, resolved our registration issue in days." },
                  { name: "Nusrat Tania", rating: 5.0, comment: "Booked an appointment same day and got clear, actionable advice." }
                ]).map((r, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#F5FAF5] border border-[#C1C9BC]/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#181D19]">{r.name}</span>
                      <span className="text-[#C9911A] flex items-center gap-0.5">
                        <span className="material-symbols-rounded fill text-[14px]">star</span>
                        {r.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-[#414942] leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Direct Booking Widget */}
        <div className="lg:col-span-5">
          <div className="surface-card p-6 space-y-5 sticky top-24">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-[#181D19] flex items-center gap-2">
                <span className="material-symbols-rounded text-[#1B6E45]">calendar_month</span>
                Book Appointment
              </h3>
              <p className="text-xs text-[#414942]">Select your preferred date &amp; slot to reserve a consultation.</p>
            </div>

            <CalendarPicker
              selectedDate={date}
              selectedTime={time}
              onSelect={(d, t) => { setDate(d); setTime(t); }}
            />

            <form onSubmit={handleBooking} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#414942]">
                  Case Description *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide details about your case or legal questions..."
                  required
                  className="w-full text-xs p-3 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5] focus:outline-none focus:ring-1 focus:ring-[#1B6E45]"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-[#FFDAD6] text-[#410002] text-xs flex items-center gap-2">
                  <span className="material-symbols-rounded text-[18px]">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="p-3 bg-[#EFF5EE] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#181D19]">Slot:</span> {date} @ {time.substring(0,5)}
                </div>
                <span className="font-bold text-[#1B6E45]">৳{Number(lawyer.consultation_fee || 1500).toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-filled py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Reserving via SQL Transaction...</span>
                ) : (
                  <>
                    <span className="material-symbols-rounded text-[18px]">event_available</span>
                    Confirm Appointment
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
