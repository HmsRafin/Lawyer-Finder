import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CalendarPicker from '../components/CalendarPicker';
import { lawyersApi } from '../api/lawyers';
import { appointmentsApi } from '../api/appointments';
import { useAuth } from '../context/AuthContext';

export default function BookAppointmentPage() {
  const { id } = useParams();
  const [lawyers, setLawyers] = useState([]);
  const [selectedLawyerId, setSelectedLawyerId] = useState(id ? Number(id) : 1);
  const [selectedLawyer, setSelectedLawyer] = useState(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [date, setDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [time, setTime] = useState('10:30:00');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadLawyers = async () => {
      const res = await lawyersApi.list();
      if (res.success && res.data) {
        setLawyers(res.data);
        const current = res.data.find(l => l.id === Number(selectedLawyerId)) || res.data[0];
        setSelectedLawyer(current);
      }
    };
    loadLawyers();
  }, [selectedLawyerId]);

  const handleLawyerChange = (e) => {
    const chosenId = Number(e.target.value);
    setSelectedLawyerId(chosenId);
    const current = lawyers.find(l => l.id === chosenId);
    setSelectedLawyer(current);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!description.trim()) {
      setErrorMsg('Please describe your legal issue.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        client_id: user?.id || 2,
        lawyer_id: selectedLawyer?.id || 1,
        appointment_date: date,
        appointment_time: time,
        case_description: description
      };

      const res = await appointmentsApi.create(payload);
      if (res.success) {
        showToast('Appointment successfully scheduled!', 'success');
        navigate('/client/appointments');
      } else {
        setErrorMsg(res.message || 'Slot already booked or conflict occurred.');
        showToast(res.message, 'error');
      }
    } catch (err) {
      setErrorMsg('Network error while booking appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1B6E45]">
          <span className="w-5 h-0.5 bg-[#1B6E45] rounded-full" />
          Direct Booking
        </div>
        <h1 className="font-display font-extrabold text-3xl text-[#181D19]">
          Book a Legal Consultation
        </h1>
        <p className="text-xs text-[#414942]">
          Your booking is safeguarded with transactional concurrency locks in MySQL.
        </p>
      </div>

      <div className="surface-card p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column */}
        <div className="md:col-span-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Select Lawyer</label>
            <select
              value={selectedLawyerId}
              onChange={handleLawyerChange}
              className="w-full text-xs p-3 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5] font-semibold"
            >
              {lawyers.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} — {l.specialization} ({l.district})
                </option>
              ))}
            </select>
          </div>

          {selectedLawyer && (
            <div className="p-4 bg-[#EFF5EE] rounded-2xl space-y-2 text-xs text-[#414942]">
              <div className="flex items-center justify-between font-bold text-[#181D19]">
                <span>{selectedLawyer.name}</span>
                <span className="text-[#1B6E45]">৳{Number(selectedLawyer.consultation_fee || 1500).toLocaleString()}</span>
              </div>
              <p>{selectedLawyer.bio || 'Advocate offering legal counseling and representation.'}</p>
              <div className="pt-2 border-t border-[#C1C9BC]/60 flex items-center justify-between text-[11px]">
                <span><b>Bar:</b> {selectedLawyer.bar_license || 'DBA-2020'}</span>
                <span><b>Rating:</b> {Number(selectedLawyer.rating || 4.8).toFixed(1)} ★</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Case Description *</label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="State your case matter, dispute type, or documents for review..."
              required
              className="w-full text-xs p-3 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5]"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FFDAD6] text-[#410002] text-xs flex items-center gap-2">
              <span className="material-symbols-rounded text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="md:col-span-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#414942] block mb-2">
              Choose Date &amp; Available Slot
            </label>
            <CalendarPicker
              selectedDate={date}
              selectedTime={time}
              onSelect={(d, t) => { setDate(d); setTime(t); }}
            />
          </div>

          <button
            type="button"
            onClick={handleBookingSubmit}
            disabled={loading}
            className="w-full btn-filled py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Reserving...' : 'Confirm Appointment'}
          </button>
        </div>

      </div>
    </div>
  );
}
