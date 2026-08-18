import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarPicker from './CalendarPicker';
import { appointmentsApi } from '../api/appointments';
import { useAuth } from '../context/AuthContext';

export default function BookingModal({ lawyer, isOpen, onClose }) {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('10:30:00');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('services');

  if (!isOpen || !lawyer) return null;

  const initials = lawyer.initials || 
    (lawyer.name ? lawyer.name.replace('Adv. ', '').split(' ').map(n=>n[0]).slice(0,2).join('') : 'LW');

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!description.trim()) {
      setErrorMsg('Please enter a brief description of your legal case.');
      return;
    }

    if (!user) {
      showToast('Please log in as a client to confirm your booking.', 'error');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        client_id: user.id || 2,
        lawyer_id: lawyer.id || 1,
        appointment_date: date,
        appointment_time: time,
        case_description: description
      };

      const res = await appointmentsApi.create(payload);

      if (res.success) {
        showToast('Appointment requested successfully!', 'success');
        onClose();
        navigate('/client/appointments');
      } else {
        setErrorMsg(res.message || 'Failed to book appointment. Please try another slot.');
        showToast(res.message || 'Booking conflict or error', 'error');
      }
    } catch (err) {
      setErrorMsg('Network error while booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadein">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-e5 overflow-hidden flex flex-col animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1B6E45] to-[#0F4E2E] text-white p-6 sm:p-7 relative flex flex-wrap items-center gap-4 sm:gap-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <span className="material-symbols-rounded">close</span>
          </button>

          <div className="w-[72px] h-[72px] rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-display font-extrabold text-2xl shadow-inner">
            {initials}
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-display">{lawyer.name}</h3>
            <p className="text-sm text-white/85">{lawyer.specialization} Lawyer · {lawyer.district}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-[#FFE3AD]">
              <span className="material-symbols-rounded fill text-[16px]">star</span>
              <span className="font-bold">{Number(lawyer.rating || 4.9).toFixed(1)}</span>
              <span>·</span>
              <span>{lawyer.reviews_count || 128} verified client reviews</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Left Column: Lawyer Info & Details */}
          <div className="lg:col-span-6 space-y-5">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-[#C1C9BC]">
              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`pb-2.5 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'services' 
                    ? 'border-[#1B6E45] text-[#1B6E45]' 
                    : 'border-transparent text-[#71796F] hover:text-[#181D19]'
                }`}
              >
                Services Provided
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`pb-2.5 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'reviews' 
                    ? 'border-[#1B6E45] text-[#1B6E45]' 
                    : 'border-transparent text-[#71796F] hover:text-[#181D19]'
                }`}
              >
                Client Reviews
              </button>
            </div>

            {activeTab === 'services' && (
              <div className="space-y-4">
                <p className="text-xs text-[#414942] leading-relaxed">
                  {lawyer.bio || "Senior practicing attorney offering consultation, case evaluation, document review, and courtroom litigation representation."}
                </p>

                <div className="space-y-2">
                  {(lawyer.services || [
                    "Contract Review & Legal Consultation",
                    "Case Drafting & Representation",
                    "Dispute Resolution & Advisory"
                  ]).map((svc, i) => (
                    <div key={i} className="chip-m3 text-xs w-fit">
                      <span className="material-symbols-rounded text-[16px] text-[#1B6E45]">check</span>
                      {svc}
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#E3EBE1] text-xs text-[#414942] space-y-1">
                  <p><b>Bar License:</b> {lawyer.bar_license || 'DBA-2020-0098'}</p>
                  <p><b>Experience:</b> {lawyer.experience_years || 8} years active practice</p>
                  <p><b>Consultation Fee:</b> ৳{Number(lawyer.consultation_fee || 1500).toLocaleString()}</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {(lawyer.reviews || [
                  { name: "Sadia Anwar", rating: 5.0, comment: "Extremely thorough with our contract review — explained every clause clearly." },
                  { name: "Mahin Hasan", rating: 4.8, comment: "Responsive and knowledgeable, resolved our registration issue in days." }
                ]).map((rev, i) => (
                  <div key={i} className="p-3 bg-[#F5FAF5] rounded-xl border border-[#C1C9BC]/60 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>{rev.name}</span>
                      <span className="text-[#C9911A] flex items-center">
                        <span className="material-symbols-rounded fill text-[14px]">star</span>
                        {rev.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-[#414942]">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Case Description Input */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#414942] mb-1.5">
                Case Description / Issue Summary *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly state your legal issue, case type, or documents you want reviewed..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-[#C1C9BC] focus:outline-none focus:ring-2 focus:ring-[#1B6E45] bg-[#F5FAF5]"
                required
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#FFDAD6] text-[#414942] border border-[#BA1A1A]/30 text-xs flex items-center gap-2">
                <span className="material-symbols-rounded text-[#BA1A1A] text-[18px]">error</span>
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Right Column: Interactive M3 Calendar & Time Slot Picker */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#414942] mb-2">
                Select Date &amp; Time
              </h4>
              <CalendarPicker
                selectedDate={date}
                selectedTime={time}
                onSelect={(newDate, newTime) => {
                  setDate(newDate);
                  setTime(newTime);
                }}
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="p-3 bg-[#EFF5EE] rounded-xl text-xs text-[#414942] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#181D19]">Selected Slot:</span> {date} at {time.substring(0, 5)}
                </div>
                <span className="font-bold text-[#1B6E45]">৳{Number(lawyer.consultation_fee || 1500).toLocaleString()}</span>
              </div>

              <button
                type="button"
                onClick={handleBookingSubmit}
                disabled={loading}
                className="w-full btn-filled py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Processing with SQL Lock...</span>
                ) : (
                  <>
                    <span className="material-symbols-rounded text-[18px]">event_available</span>
                    Confirm &amp; Book Appointment
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
