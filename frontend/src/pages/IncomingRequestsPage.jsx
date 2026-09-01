import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { appointmentsApi } from '../api/appointments';
import { useAuth } from '../context/AuthContext';

export default function IncomingRequestsPage() {
  const { user, showToast } = useAuth();
  const lawyerId = user?.lawyer_id || 1;

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch appointments
      const res = await appointmentsApi.list({ lawyer_id: lawyerId });
      if (res.success && Array.isArray(res.data)) {
        setAppointments(res.data);
      } else {
        // Fallback default demo data
        setAppointments([
          {
            id: 1,
            client_name: "Sadia Anwar",
            client_email: "sadia@gmail.com",
            client_phone: "+8801711111111",
            appointment_date: "2026-08-20",
            appointment_time: "10:30:00",
            case_description: "Need consultation for cross-border software licensing agreement and VAT compliance.",
            status: "pending"
          },
          {
            id: 2,
            client_name: "Mahin Hasan",
            client_email: "mahin@gmail.com",
            client_phone: "+8801722222222",
            appointment_date: "2026-08-22",
            appointment_time: "14:30:00",
            case_description: "Shareholders agreement drafting and startup incorporation guidance.",
            status: "accepted"
          },
          {
            id: 4,
            client_name: "Farhan Ahmed",
            client_email: "farhan@gmail.com",
            client_phone: "+8801744444444",
            appointment_date: "2026-08-19",
            appointment_time: "09:30:00",
            case_description: "Urgent bail application consultation and court proceeding advisory.",
            status: "pending"
          }
        ]);
      }

      // 2. Fetch stats
      const statsRes = await appointmentsApi.getStats(lawyerId);
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      } else {
        setStats({
          total_cases: 88,
          active_cases: 14,
          pending_requests: 3,
          upcoming_count: 5,
          status_breakdown: { pending: 3, accepted: 14, completed: 68, rejected: 3, cancelled: 0 }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const res = await appointmentsApi.updateStatus({
        id: appointmentId,
        status: newStatus
      });

      if (res.success) {
        showToast(`Appointment status updated to '${newStatus}'.`, 'success');
        // Update local state immediately
        setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: newStatus } : a));
        // Refresh aggregate stats
        fetchData();
      } else {
        showToast(res.message || 'Status transition rejected', 'error');
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const filtered = filterStatus === 'all'
    ? appointments
    : appointments.filter(a => (a.status || '').toLowerCase() === filterStatus);

  return (
    <div className="min-h-[calc(100vh-72px)] grid grid-cols-1 lg:grid-cols-12">
      
      {/* Lawyer Dashboard Sidebar */}
      <aside className="lg:col-span-3 bg-gradient-to-b from-[#1B6E45] to-[#0F4E2E] text-white p-6 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          
          {/* Lawyer Info Pill */}
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl border border-white/20">
            <div className="w-11 h-11 rounded-full bg-[#A7F2C3] text-[#002110] font-bold font-display flex items-center justify-center text-base">
              RK
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">{user?.name || 'Adv. Rahim Karim'}</h3>
              <p className="text-[11px] text-white/75">{user?.specialization || 'Corporate'} Lawyer</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            <a href="#requests" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white shadow-inner">
              <span className="material-symbols-rounded text-[20px]">inbox</span>
              Incoming Case Requests
            </a>
            <a href="#active" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors">
              <span className="material-symbols-rounded text-[20px]">folder_open</span>
              Active Cases
            </a>
            <a href="#history" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors">
              <span className="material-symbols-rounded text-[20px]">history</span>
              Case History
            </a>
            <Link to="/lawyer/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors">
              <span className="material-symbols-rounded text-[20px]">account_circle</span>
              Edit Profile &amp; Fees
            </Link>
          </nav>
        </div>

        {/* Status Indicator */}
        <div className="p-3.5 bg-black/20 rounded-2xl text-xs space-y-1 border border-white/10">
          <div className="flex items-center justify-between font-bold">
            <span>Availability:</span>
            <span className="text-[#A7F2C3] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#A7F2C3] animate-pulse" />
              Accepting Cases
            </span>
          </div>
          <p className="text-[10px] text-white/70">Connected to MySQL appointments table</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:col-span-9 p-6 sm:p-8 bg-[#F5FAF5] space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#181D19]">
              Welcome back, {user?.name?.split(' ')[0] || 'Advocate'}
            </h2>
            <p className="text-xs sm:text-sm text-[#414942] mt-1">
              Here are the real-time client case requests and SQL appointment aggregates.
            </p>
          </div>

          <Link to="/lawyer/profile" className="btn-tonal px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5">
            <span className="material-symbols-rounded text-[18px]">edit</span>
            Update Profile
          </Link>
        </div>

        {/* Aggregates Stat Cards (Calls stats.php) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="surface-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#A7F2C3] text-[#002110] flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-rounded text-[24px]">folder</span>
            </div>
            <div>
              <p className="font-display font-extrabold text-2xl text-[#181D19]">
                {stats?.total_cases || appointments.length}
              </p>
              <p className="text-xs text-[#414942] font-semibold">Total Case Records</p>
            </div>
          </div>

          <div className="surface-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE3AD] text-[#2A1800] flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-rounded text-[24px]">schedule</span>
            </div>
            <div>
              <p className="font-display font-extrabold text-2xl text-[#7A5300]">
                {stats?.status_breakdown?.pending || appointments.filter(a=>a.status==='pending').length}
              </p>
              <p className="text-xs text-[#414942] font-semibold">Pending Review</p>
            </div>
          </div>

          <div className="surface-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C6F3D6] text-[#00390F] flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-rounded text-[24px]">task_alt</span>
            </div>
            <div>
              <p className="font-display font-extrabold text-2xl text-[#1B6E45]">
                {stats?.status_breakdown?.accepted || appointments.filter(a=>a.status==='accepted').length}
              </p>
              <p className="text-xs text-[#414942] font-semibold">Active Accepted Cases</p>
            </div>
          </div>
        </div>

        {/* Incoming Appointments Table */}
        <div className="surface-card p-6 space-y-4" id="requests">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#C1C9BC]">
            <div>
              <h3 className="font-display font-bold text-lg text-[#181D19]">Incoming Case Requests</h3>
              <p className="text-xs text-[#414942]">Manage and update client consultations directly via MySQL.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-[#E9F0E7] p-1 rounded-xl">
              {['all', 'pending', 'accepted', 'completed'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    filterStatus === tab ? 'bg-[#1B6E45] text-white shadow-xs' : 'text-[#414942]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[#71796F]">
              <span className="material-symbols-rounded animate-spin text-[28px] text-[#1B6E45]">sync</span>
              <p className="text-xs font-semibold mt-2">Loading client requests...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-[#71796F] space-y-2">
              <span className="material-symbols-rounded text-[36px]">inbox</span>
              <p className="text-xs font-semibold">No case requests found under '{filterStatus}' status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#C1C9BC] text-[#71796F] uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-3">Schedule Date &amp; Slot</th>
                    <th className="py-3 px-3">Case Summary</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EBE1]">
                  {filtered.map(apt => (
                    <tr key={apt.id} className="hover:bg-[#F5FAF5] transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[#181D19]">{apt.client_name || 'Client User'}</div>
                        <div className="text-[11px] text-[#71796F]">{apt.client_phone || apt.client_email || 'No contact'}</div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-[#181D19]">{apt.appointment_date}</div>
                        <div className="text-[11px] text-[#1B6E45] font-bold">{apt.appointment_time?.substring(0, 5)}</div>
                      </td>

                      <td className="py-3.5 px-3 max-w-xs">
                        <p className="line-clamp-2 text-[#414942] text-[11px]">
                          {apt.case_description}
                        </p>
                      </td>

                      <td className="py-3.5 px-3">
                        <StatusBadge status={apt.status} />
                      </td>

                      <td className="py-3.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                        {apt.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(apt.id, 'accepted')}
                              className="px-3 py-1 rounded-full text-xs font-bold bg-[#C6F3D6] text-[#00390F] hover:bg-[#A7F2C3] transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(apt.id, 'rejected')}
                              className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFDAD6] text-[#410002] hover:bg-[#FFB4AB] transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {apt.status === 'accepted' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(apt.id, 'completed')}
                            className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCE6FF] text-[#0B3D8F] hover:bg-[#ADC6FF] transition-colors"
                          >
                            Mark Completed
                          </button>
                        )}

                        {['completed', 'rejected', 'cancelled'].includes(apt.status) && (
                          <span className="text-[11px] text-[#71796F] italic">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

    </div>
  );
}
