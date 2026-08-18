import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LawyerCard from '../components/LawyerCard';
import BookingModal from '../components/BookingModal';
import { lawyersApi } from '../api/lawyers';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const [lawyers, setLawyers] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [specFilter, setSpecFilter] = useState('Corporate');
  const [distFilter, setDistFilter] = useState('Dhaka');
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLawyers = async () => {
      const res = await lawyersApi.list();
      if (res.success && res.data) {
        setLawyers(res.data);
      }
    };
    fetchLawyers();
  }, []);

  const handleOpenBooking = (lawyer) => {
    setSelectedLawyer(lawyer);
    setIsModalOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/lawyers?specialization=${specFilter}&district=${distFilter}`);
  };

  const services = [
    { name: "Corporate Law", icon: "apartment", count: "312 lawyers", desc: "Contracts, business registration & compliance" },
    { name: "Criminal Defense", icon: "gavel", count: "268 lawyers", desc: "Bail hearings, litigation & trial defense" },
    { name: "Family & Divorce", icon: "family_restroom", count: "241 lawyers", desc: "Inheritance, custody & marital mediation" },
    { name: "Property & Real Estate", icon: "home_work", count: "190 lawyers", desc: "Title deeds, land disputes & registration" },
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        {/* Ambient Gradient Background Glow */}
        <div className="absolute inset-0 -z-10 pointer-events-none opacity-40">
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#A7F2C3]/60 rounded-full blur-3xl" />
          <div className="absolute top-12 right-1/4 w-96 h-96 bg-[#FFE3AD]/50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text & Search Box */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1B6E45]">
              <span className="w-6 h-0.5 bg-[#1B6E45] rounded-full" />
              AUST · CSE 3104 Project
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#181D19] tracking-tight leading-[1.08]">
              Find the right <em className="not-italic text-[#1B6E45]">lawyer</em>,<br />
              faster than ever.
            </h1>

            <p className="text-base sm:text-lg text-[#414942] max-w-xl leading-relaxed">
              Lawyer Finder connects clients with verified lawyers by specialization and district — search, compare, book an appointment, and track your case in one place.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/lawyers" className="btn-filled px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-rounded text-[18px]">search</span>
                Find a Lawyer
              </Link>
              <button 
                onClick={() => { switchRole('lawyer'); navigate('/lawyer/requests'); }}
                className="btn-outline px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2"
              >
                <span className="material-symbols-rounded text-[18px]">gavel</span>
                I'm a Lawyer
              </button>
            </div>

            {/* Trust Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#C1C9BC]/60">
              <div>
                <div className="font-display font-extrabold text-2xl text-[#1B6E45]">1,200+</div>
                <div className="text-xs text-[#414942]">Verified lawyers</div>
              </div>
              <div>
                <div className="font-display font-extrabold text-2xl text-[#1B6E45]">8</div>
                <div className="text-xs text-[#414942]">Specializations</div>
              </div>
              <div>
                <div className="font-display font-extrabold text-2xl text-[#1B6E45]">64</div>
                <div className="text-xs text-[#414942]">Districts covered</div>
              </div>
              <div>
                <div className="font-display font-extrabold text-2xl text-[#1B6E45]">4.8★</div>
                <div className="text-xs text-[#414942]">Avg. client rating</div>
              </div>
            </div>

            {/* Hero Instant Search Card */}
            <form onSubmit={handleSearchSubmit} className="surface-card p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5 space-y-1 text-left">
                <label className="text-[11px] font-bold text-[#414942] uppercase tracking-wider pl-1">
                  Lawyer Specialization
                </label>
                <div className="flex items-center gap-2 bg-[#E9F0E7] px-3.5 py-2.5 rounded-xl border border-[#C1C9BC]">
                  <span className="material-symbols-rounded text-[#1B6E45] text-[20px]">category</span>
                  <select 
                    value={specFilter} 
                    onChange={e => setSpecFilter(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-[#181D19] focus:outline-none cursor-pointer"
                  >
                    <option value="Corporate">Corporate</option>
                    <option value="Criminal">Criminal</option>
                    <option value="Family">Family</option>
                    <option value="Property">Property</option>
                    <option value="Tax">Tax</option>
                    <option value="Labor">Labor</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-4 space-y-1 text-left">
                <label className="text-[11px] font-bold text-[#414942] uppercase tracking-wider pl-1">
                  Location / District
                </label>
                <div className="flex items-center gap-2 bg-[#E9F0E7] px-3.5 py-2.5 rounded-xl border border-[#C1C9BC]">
                  <span className="material-symbols-rounded text-[#1B6E45] text-[20px]">location_on</span>
                  <select 
                    value={distFilter} 
                    onChange={e => setDistFilter(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-[#181D19] focus:outline-none cursor-pointer"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chattogram">Chattogram</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Rajshahi">Rajshahi</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <button type="submit" className="w-full btn-filled py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5">
                  <span className="material-symbols-rounded text-[18px]">search</span>
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Right 3D Laptop Mockup (Replicated Signature Visual) */}
          <div className="lg:col-span-5 relative flex justify-center [perspective:1400px]">
            <div className="w-full max-w-[460px] [transform:rotateY(-12deg)_rotateX(5deg)] transition-transform duration-500 hover:[transform:rotateY(-4deg)_rotateX(2deg)]">
              <div className="bg-[#0E1710] rounded-t-2xl p-2.5 shadow-e5 border border-[#142a1c]">
                {/* Laptop Top Dots */}
                <div className="flex gap-1.5 pb-2 px-1">
                  <span className="w-2 h-2 rounded-full bg-[#BA1A1A]/80" />
                  <span className="w-2 h-2 rounded-full bg-[#C9911A]/80" />
                  <span className="w-2 h-2 rounded-full bg-[#1B6E45]/80" />
                </div>
                
                {/* Laptop Screen Content */}
                <div className="bg-[#F5FAF5] rounded-lg overflow-hidden border border-[#DDE5DB]">
                  <div className="bg-gradient-to-r from-[#1B6E45] to-[#0F4E2E] text-white p-3 text-xs font-bold flex items-center gap-2">
                    <span className="material-symbols-rounded fill text-[16px]">balance</span>
                    Lawyer Finder · Live Appointments
                  </div>
                  <div className="p-3.5 space-y-3">
                    <div className="bg-white border border-[#C1C9BC] rounded-lg p-2 text-[11px] text-[#414942] flex items-center gap-2 shadow-xs">
                      <span className="material-symbols-rounded text-[15px] text-[#1B6E45]">search</span>
                      <span>Filter: Corporate Law · Dhaka</span>
                    </div>

                    <p className="text-[10px] font-bold text-[#71796F] uppercase tracking-wider">Available Lawyers</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white rounded-lg p-2 shadow-xs text-center border border-[#E3EBE1]">
                        <div className="w-7 h-7 rounded-full bg-[#A7F2C3] mx-auto mb-1 flex items-center justify-center font-bold text-[10px] text-[#002110]">RK</div>
                        <div className="h-1.5 bg-[#1B6E45]/70 rounded w-4/5 mx-auto mb-1" />
                        <div className="h-1 bg-[#DDE5DB] rounded w-1/2 mx-auto" />
                      </div>
                      <div className="bg-white rounded-lg p-2 shadow-xs text-center border border-[#E3EBE1]">
                        <div className="w-7 h-7 rounded-full bg-[#FFE3AD] mx-auto mb-1 flex items-center justify-center font-bold text-[10px] text-[#2A1800]">FY</div>
                        <div className="h-1.5 bg-[#1B6E45]/70 rounded w-4/5 mx-auto mb-1" />
                        <div className="h-1 bg-[#DDE5DB] rounded w-1/2 mx-auto" />
                      </div>
                      <div className="bg-white rounded-lg p-2 shadow-xs text-center border border-[#E3EBE1]">
                        <div className="w-7 h-7 rounded-full bg-[#DCE6FF] mx-auto mb-1 flex items-center justify-center font-bold text-[10px] text-[#0B3D8F]">KH</div>
                        <div className="h-1.5 bg-[#1B6E45]/70 rounded w-4/5 mx-auto mb-1" />
                        <div className="h-1 bg-[#DDE5DB] rounded w-1/2 mx-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Laptop Base */}
              <div className="h-3.5 bg-gradient-to-b from-[#dfe5db] to-[#b9c2b3] rounded-b-xl shadow-md -mx-3 [transform:rotateX(60deg)] [transform-origin:top]" />
              
              {/* Floating Badges */}
              <div className="absolute top-4 -right-4 bg-white rounded-2xl shadow-e3 px-3.5 py-2 text-xs font-bold flex items-center gap-2 border border-white/80 animate-float-slow hidden sm:flex">
                <span className="material-symbols-rounded fill text-[#1B6E45] text-[18px]">event_available</span>
                <span>SQL Double-Booking Guard</span>
              </div>

              <div className="absolute -bottom-2 -left-4 bg-white rounded-2xl shadow-e3 px-3.5 py-2 text-xs font-bold flex items-center gap-2 border border-white/80 animate-float-delayed hidden sm:flex">
                <span className="material-symbols-rounded fill text-[#C9911A] text-[18px]">star</span>
                <span>4.9 Avg Client Rating</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* RECOMMENDED LAWYERS SECTION */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1B6E45] mb-1">
              <span className="w-5 h-0.5 bg-[#1B6E45] rounded-full" />
              Curated for you
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#181D19]">
              Recommended Lawyers
            </h2>
            <p className="text-sm text-[#414942] mt-1">
              Based on popular specializations, verified credentials, and client feedback.
            </p>
          </div>
          <Link to="/lawyers" className="btn-tonal px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1">
            View all lawyers
            <span className="material-symbols-rounded text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {lawyers.slice(0, 4).map(lawyer => (
            <LawyerCard 
              key={lawyer.id} 
              lawyer={lawyer} 
              onQuickBook={handleOpenBooking} 
            />
          ))}
        </div>
      </section>

      {/* POPULAR LEGAL SERVICES SECTION */}
      <section className="bg-[#EFF5EE] py-14 border-y border-[#C1C9BC]/50">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1B6E45] mb-1">
              <span className="w-5 h-0.5 bg-[#1B6E45] rounded-full" />
              Browse by Category
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#181D19]">
              Popular Legal Services
            </h2>
            <p className="text-sm text-[#414942] mt-1">
              Direct access to top-rated lawyers who specialize in your specific case requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((svc, i) => (
              <div 
                key={i} 
                onClick={() => navigate(`/lawyers?specialization=${svc.name.split(' ')[0]}`)}
                className="surface-card p-5 cursor-pointer hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#A7F2C3] flex items-center justify-center text-[#0F4E2E] mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-rounded text-[26px]">{svc.icon}</span>
                </div>
                <h4 className="font-bold text-base text-[#181D19] group-hover:text-[#1B6E45] transition-colors">{svc.name}</h4>
                <p className="text-xs text-[#414942] mt-1 mb-3">{svc.desc}</p>
                <span className="text-[11px] font-bold text-[#1B6E45] bg-[#C6F3D6] px-2.5 py-1 rounded-full">{svc.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THREE MODULES ARCHITECTURE SECTION */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6" id="modules">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1B6E45] mb-1">
            <span className="w-5 h-0.5 bg-[#1B6E45] rounded-full" />
            System Architecture
          </div>
          <h2 className="font-display font-extrabold text-3xl text-[#181D19]">
            Three Modules, One Relational Database
          </h2>
          <p className="text-sm text-[#414942] mt-2">
            Built with a clean normalized SQL database schema shared by three coordinated modules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Client Module */}
          <div className="surface-card p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B6E45] to-[#0F4E2E] text-white flex items-center justify-center shadow-e2">
              <span className="material-symbols-rounded text-[24px]">person</span>
            </div>
            <h3 className="font-display font-bold text-xl text-[#181D19]">Client Module</h3>
            <ul className="space-y-2 text-xs text-[#414942]">
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[#1B6E45] text-[16px]">check_circle</span>
                Search lawyers by specialization &amp; district
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[#1B6E45] text-[16px]">check_circle</span>
                View detailed lawyer profiles &amp; reviews
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[#1B6E45] text-[16px]">check_circle</span>
                Book appointments with SQL conflict prevention
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[#1B6E45] text-[16px]">check_circle</span>
                Track &amp; soft-cancel appointments in real-time
              </li>
            </ul>
          </div>

          {/* Lawyer Module */}
          <div className="surface-card p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B6E45] to-[#0F4E2E] text-white flex items-center justify-center shadow-e2">
              <span className="material-symbols-rounded text-[24px]">gavel</span>
            </div>
            <h3 className="font-display font-bold text-xl text-[#181D19]">Lawyer Module</h3>
            <ul className="space-y-2 text-xs text-[#414942]">
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[#1B6E45] text-[16px]">check_circle</span>
                Review incoming case requests with full client joins
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[#1B6E45] text-[16px]">check_circle</span>
                Accept, reject, or complete case status
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[#1B6E45] text-[16px]">check_circle</span>
                Maintain calendar availability &amp; fees
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[#1B6E45] text-[16px]">check_circle</span>
                Real-time case statistics &amp; aggregate metrics
              </li>
            </ul>
          </div>

          {/* Admin Module */}
          <div className="surface-card p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B6E45] to-[#0F4E2E] text-white flex items-center justify-center shadow-e2">
              <span className="material-symbols-rounded text-[24px]">admin_panel_settings</span>
            </div>
            <h3 className="font-display font-bold text-xl text-[#181D19]">Admin Module</h3>
            <ul className="space-y-2 text-xs text-[#414942]">
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[#1B6E45] text-[16px]">check_circle</span>
                Comprehensive overview of all platform appointments
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[#1B6E45] text-[16px]">check_circle</span>
                Live SQL aggregate charts by specialization
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[#1B6E45] text-[16px]">check_circle</span>
                User management for lawyers &amp; clients
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[#1B6E45] text-[16px]">check_circle</span>
                Audit logs &amp; system health status
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* TECH STACK BANNER */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-[#0F4E2E] to-[#1B6E45] text-white p-8 sm:p-10 rounded-3xl shadow-e4 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#A7F2C3] mb-1">
              <span className="w-5 h-0.5 bg-[#A7F2C3] rounded-full" />
              Development Stack
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl">
              Built on a Modern, Robust Foundation
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl text-center border border-white/20 hover:bg-white/20 transition-colors">
                <span className="material-symbols-rounded text-[32px] mb-1">database</span>
                <p className="font-bold text-xs">MySQL</p>
                <p className="text-[10px] opacity-75">Database</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl text-center border border-white/20 hover:bg-white/20 transition-colors">
                <span className="material-symbols-rounded text-[32px] mb-1">bolt</span>
                <p className="font-bold text-xs">React (Vite)</p>
                <p className="text-[10px] opacity-75">Frontend</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl text-center border border-white/20 hover:bg-white/20 transition-colors">
                <span className="material-symbols-rounded text-[32px] mb-1">brush</span>
                <p className="font-bold text-xs">Tailwind + M3</p>
                <p className="text-[10px] opacity-75">Styling</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl text-center border border-white/20 hover:bg-white/20 transition-colors">
                <span className="material-symbols-rounded text-[32px] mb-1">php</span>
                <p className="font-bold text-xs">PHP (PDO)</p>
                <p className="text-[10px] opacity-75">Backend API</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl text-center border border-white/20 hover:bg-white/20 transition-colors">
                <span className="material-symbols-rounded text-[32px] mb-1">lock</span>
                <p className="font-bold text-xs">Transactions</p>
                <p className="text-[10px] opacity-75">Double-booking guard</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl text-center border border-white/20 hover:bg-white/20 transition-colors">
                <span className="material-symbols-rounded text-[32px] mb-1">dns</span>
                <p className="font-bold text-xs">XAMPP</p>
                <p className="text-[10px] opacity-75">Local Server</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Dialog Modal */}
      <BookingModal 
        lawyer={selectedLawyer}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
}
