import React from 'react';
import { Link } from 'react-router-dom';

export default function LawyerCard({ lawyer, onQuickBook }) {
  const initials = lawyer.initials || 
    (lawyer.name ? lawyer.name.replace('Adv. ', '').split(' ').map(n=>n[0]).slice(0,2).join('') : 'LW');

  const rating = Number(lawyer.rating || 4.8).toFixed(1);
  const reviews = lawyer.reviews_count || lawyer.reviews?.length || 85;

  return (
    <div className="card-elevated p-5 flex flex-col items-center text-center relative border border-white/60 bg-white group">
      
      {/* Verified Online Status dot */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#C6F3D6] text-[#00390F] text-[11px] font-bold px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1B6E45] animate-pulse" />
        Available
      </div>

      {/* Initials Avatar */}
      <div className="w-[76px] h-[76px] rounded-full bg-gradient-to-br from-[#dff2e6] to-[#b9e6c9] flex items-center justify-center font-display font-extrabold text-[#0F4E2E] text-2xl mb-3.5 shadow-e2 border-2 border-white">
        {initials}
      </div>

      {/* Name and Specialization */}
      <h4 className="font-bold text-[15.5px] text-[#181D19] group-hover:text-[#1B6E45] transition-colors line-clamp-1">
        {lawyer.name}
      </h4>

      <p className="text-xs text-[#414942] font-medium mt-1 mb-2">
        {lawyer.specialization} Lawyer · {lawyer.district}
      </p>

      {/* Star Rating */}
      <div className="flex items-center gap-1 text-[#C9911A] text-xs font-bold mb-3">
        <span className="material-symbols-rounded fill text-[16px]">star</span>
        <span>{rating}</span>
        <span className="text-[#71796F] font-normal">({reviews})</span>
      </div>

      {/* Badges / Experience */}
      <div className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#EFF5EE] rounded-xl text-xs text-[#414942] mb-4">
        <span><b>{lawyer.experience_years || 5}+</b> yrs exp</span>
        <span>•</span>
        <span className="font-semibold text-[#1B6E45]">৳{Number(lawyer.consultation_fee || 1500).toLocaleString()}</span>
      </div>

      {/* Actions */}
      <div className="w-full mt-auto grid grid-cols-2 gap-2">
        <Link
          to={`/lawyers/${lawyer.id}`}
          className="btn-tonal py-2 px-3 rounded-full text-xs font-semibold text-center"
        >
          View Profile
        </Link>
        <button
          type="button"
          onClick={() => onQuickBook && onQuickBook(lawyer)}
          className="btn-filled py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1"
        >
          <span className="material-symbols-rounded text-[16px]">event_available</span>
          Book
        </button>
      </div>
    </div>
  );
}
