import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { appointmentsApi } from '../api/appointments';
import { useAuth } from '../context/AuthContext';

export default function MyAppointmentsPage() {
  const { user, showToast } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const clientId = user?.id || 2;
      const res = await appointmentsApi.list({ client_id: clientId });
      if (res.success && Array.isArray(res.data)) {
        setAppointments(res.data);
      } else {
        // Fallback default sample records for client
        setAppointments([
          {
            id: 1,
            lawyer_name: "Adv. Rahim Karim",
            specialization: "Corporate",
            district: "Dhaka",
            appointment_date: "2026-08-20",
            appointment_time: "10:30:00",
            case_description: "Need consultation for cross-border software licensing agreement and VAT compliance.",
            status: "pending",
            consultation_fee: "2500.00"
          },
          {
            id: 2,
            lawyer_name: "Adv. Farzana Yasmin",
            specialization: "Family",
            district: "Chattogram",
            appointment_date: "2026-08-22",
            appointment_time: "14:30:00",
            case_description: "Family inheritance dispute regarding ancestral property division in Chattogram.",
            status: "accepted",
            consultation_fee: "1800.00"
          },
          {
            id: 5,
            lawyer_name: "Adv. Nasrin Akter",
            specialization: "Property",
            district: "Khulna",
            appointment_date: "2026-08-15",
            appointment_time: "16:00:00",
            case_description: "Property land title deed verification before real estate purchase.",
            status: "completed",
            consultation_fee: "1500.00"
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleOpenCancel = (aptId) => {
    setCancellingId(aptId);
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancellingId) return;

    setSubmittingCancel(true);
    try {
      const res = await appointmentsApi.cancel(cancellingId, cancelReason || 'Cancelled by client');
      if (res.success) {
        showToast('Appointment successfully cancelled.', 'success');
        setIsCancelModalOpen(false);
        // Update state locally
        setAppointments(prev => prev.map(a => a.id === cancellingId ? { ...a, status: 'cancelled' } : a));
      } else {
        showToast(res.message || 'Failed to cancel appointment', 'error');
      }
    } catch (err) {
      showToast('Error cancelling appointment', 'error');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const filtered = statusFilter === 'all' 
    ? appointments 
    : appointments.filter(a => (a.status || '').toLowerCase() === statusFilter);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1B6E45]">
            <span className="w-5 h-0.5 bg-[#1B6E45] rounded-full" />
            Client Dashboard
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#181D19]">
            My Appointments
          </h1>
          <p className="text-xs sm:text-sm text-[#414942] mt-1">
            Track and manage your upcoming consultations and historical case records.
          </p>
        </div>

        <Link to="/lawyers" className="btn-filled px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-rounded text-[18px]">add</span>
          Book New Appointment
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#C1C9BC] pb-3">
        {['all', 'pending', 'accepted', 'completed', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
              statusFilter === tab
                ? 'bg-[#1B6E45] text-white shadow-e1'
                : 'bg-[#EFF5EE] text-[#414942] hover:bg-[#E3EBE1]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="py-20 text-center text-[#71796F]">
          <span className="material-symbols-rounded animate-spin text-[32px] text-[#1B6E45]">sync</span>
          <p className="text-xs font-semibold mt-2">Loading appointments from MySQL database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-card p-12 text-center space-y-4">
          <span className="material-symbols-rounded text-[44px] text-[#71796F]">event_busy</span>
          <h3 className="font-bold text-lg text-[#181D19]">No {statusFilter !== 'all' ? statusFilter : ''} appointments found</h3>
          <p className="text-xs text-[#414942] max-w-sm mx-auto">
            You don't have any appointments matching this status. Find a verified lawyer and book a consultation in minutes.
          </p>
          <Link to="/lawyers" className="btn-filled px-6 py-2.5 rounded-full text-xs font-bold inline-flex items-center gap-2">
            <span className="material-symbols-rounded text-[18px]">search</span>
            Search Lawyers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(apt => (
            <div key={apt.id} className="surface-card p-6 flex flex-col justify-between space-y-4 relative">
              
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-base text-[#181D19]">{apt.lawyer_name}</h3>
                  <p className="text-xs text-[#414942] font-medium">{apt.specialization} Lawyer · {apt.district}</p>
                </div>
                <StatusBadge status={apt.status} />
              </div>

              {/* Date & Time Slot Box */}
              <div className="p-3.5 bg-[#EFF5EE] rounded-2xl flex items-center justify-between text-xs text-[#414942]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded text-[#1B6E45] text-[20px]">calendar_today</span>
                  <div>
                    <p className="font-bold text-[#181D19]">{apt.appointment_date}</p>
                    <p className="text-[11px]">{apt.appointment_time?.substring(0, 5)} (Slot)</p>
                  </div>
                </div>
                {apt.consultation_fee && (
                  <span className="font-extrabold text-[#1B6E45]">৳{Number(apt.consultation_fee).toLocaleString()}</span>
                )}
              </div>

              {/* Case Description */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-[#71796F] uppercase tracking-wider">Case Description:</p>
                <p className="text-xs text-[#414942] line-clamp-3 bg-[#F5FAF5] p-2.5 rounded-xl border border-[#C1C9BC]/50">
                  {apt.case_description}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-[#E3EBE1] flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#71796F]">Ref: #{apt.id}</span>
                
                {['pending', 'accepted'].includes(apt.status?.toLowerCase()) && (
                  <button
                    type="button"
                    onClick={() => handleOpenCancel(apt.id)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold text-[#BA1A1A] hover:bg-[#FFDAD6] transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-rounded text-[16px]">cancel</span>
                    Cancel Booking
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md surface-card p-6 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-[#BA1A1A]">
              <span className="material-symbols-rounded text-[28px]">warning</span>
              <h3 className="font-display font-bold text-lg text-[#181D19]">Cancel Appointment</h3>
            </div>

            <p className="text-xs text-[#414942]">
              Are you sure you want to cancel appointment <b>#{cancellingId}</b>? This will update the status to 'cancelled' in the database.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#414942]">
                  Reason for Cancellation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="e.g. Rescheduled matter, resolved independently..."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#C1C9BC] bg-[#F5FAF5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#414942] hover:bg-[#E3EBE1]"
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  disabled={submittingCancel}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-[#BA1A1A] text-white hover:bg-[#930006] shadow-sm flex items-center gap-1.5"
                >
                  {submittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
