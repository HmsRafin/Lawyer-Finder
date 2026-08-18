import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LawyerCard from '../components/LawyerCard';
import BookingModal from '../components/BookingModal';
import { lawyersApi } from '../api/lawyers';

const SPECIALIZATIONS = ['All', 'Corporate', 'Criminal', 'Family', 'Property', 'Tax', 'Labor'];
const DISTRICTS = ['All', 'Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi'];

export default function SearchLawyersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialSpec = searchParams.get('specialization') || 'All';
  const initialDist = searchParams.get('district') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [selectedSpec, setSelectedSpec] = useState(initialSpec);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDist);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    const fetchLawyers = async () => {
      setLoading(true);
      try {
        const res = await lawyersApi.list({
          specialization: selectedSpec,
          district: selectedDistrict,
          search: searchQuery
        });
        if (res.success && res.data) {
          let list = [...res.data];
          if (sortBy === 'rating') {
            list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          } else if (sortBy === 'experience') {
            list.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
          } else if (sortBy === 'fee_asc') {
            list.sort((a, b) => (a.consultation_fee || 0) - (b.consultation_fee || 0));
          }
          setLawyers(list);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, [selectedSpec, selectedDistrict, searchQuery, sortBy]);

  const handleQuickBook = (lawyer) => {
    setSelectedLawyer(lawyer);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1B6E45]">
          <span className="w-5 h-0.5 bg-[#1B6E45] rounded-full" />
          Lawyer Directory
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#181D19]">
          Find Verified Lawyers
        </h1>
        <p className="text-xs sm:text-sm text-[#414942]">
          Browse verified legal counsel by specialization, district, experience, and client feedback.
        </p>
      </div>

      {/* Filter Surface Card */}
      <div className="surface-card p-5 space-y-4">
        
        {/* Search Bar Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 flex items-center gap-2 bg-[#F5FAF5] px-3.5 py-2.5 rounded-xl border border-[#C1C9BC] focus-within:border-[#1B6E45]">
            <span className="material-symbols-rounded text-[#1B6E45] text-[20px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by lawyer name, keyword, or law practice..."
              className="w-full bg-transparent text-xs text-[#181D19] focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-rounded text-[18px]">close</span>
              </button>
            )}
          </div>

          <div className="md:col-span-3 flex items-center gap-2 bg-[#F5FAF5] px-3.5 py-2.5 rounded-xl border border-[#C1C9BC]">
            <span className="material-symbols-rounded text-[#1B6E45] text-[20px]">location_on</span>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-[#181D19] focus:outline-none cursor-pointer"
            >
              {DISTRICTS.map(d => (
                <option key={d} value={d}>District: {d}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-2 bg-[#F5FAF5] px-3.5 py-2.5 rounded-xl border border-[#C1C9BC]">
            <span className="material-symbols-rounded text-[#1B6E45] text-[20px]">sort</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-[#181D19] focus:outline-none cursor-pointer"
            >
              <option value="rating">Sort: Highest Rated</option>
              <option value="experience">Sort: Most Experienced</option>
              <option value="fee_asc">Sort: Lowest Fee</option>
            </select>
          </div>
        </div>

        {/* Specialization Filter Chips */}
        <div className="space-y-1.5 pt-2 border-t border-[#E3EBE1]">
          <p className="text-[11px] font-bold text-[#71796F] uppercase tracking-wider">Filter Specialization:</p>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map(spec => (
              <button
                key={spec}
                type="button"
                onClick={() => setSelectedSpec(spec)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedSpec === spec
                    ? 'bg-[#1B6E45] text-white shadow-e1'
                    : 'bg-[#EFF5EE] text-[#414942] hover:bg-[#E3EBE1]'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Lawyers Grid */}
      <div>
        <div className="flex items-center justify-between text-xs text-[#414942] font-semibold mb-4">
          <span>Showing {lawyers.length} lawyers</span>
          <span>Verified Bar Council Advocates</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#71796F]">
            <span className="material-symbols-rounded animate-spin text-[32px] text-[#1B6E45]">sync</span>
            <p className="text-xs font-semibold mt-2">Loading verified lawyers...</p>
          </div>
        ) : lawyers.length === 0 ? (
          <div className="py-20 text-center surface-card p-10 space-y-3">
            <span className="material-symbols-rounded text-[40px] text-[#71796F]">search_off</span>
            <h3 className="font-bold text-lg text-[#181D19]">No lawyers match your criteria</h3>
            <p className="text-xs text-[#414942]">Try clearing filters or selecting another district.</p>
            <button
              type="button"
              onClick={() => { setSelectedSpec('All'); setSelectedDistrict('All'); setSearchQuery(''); }}
              className="btn-tonal px-4 py-2 rounded-full text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lawyers.map(lawyer => (
              <LawyerCard
                key={lawyer.id}
                lawyer={lawyer}
                onQuickBook={handleQuickBook}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        lawyer={selectedLawyer}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
}
