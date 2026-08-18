import React from 'react';

export default function StatusBadge({ status }) {
  const norm = (status || 'pending').toLowerCase();

  const configs = {
    pending: {
      bg: 'bg-[#FFE3AD]',
      text: 'text-[#7A5300]',
      icon: 'schedule',
      label: 'Pending'
    },
    accepted: {
      bg: 'bg-[#C6F3D6]',
      text: 'text-[#00390F]',
      icon: 'check_circle',
      label: 'Accepted'
    },
    rejected: {
      bg: 'bg-[#FFDAD6]',
      text: 'text-[#410002]',
      icon: 'cancel',
      label: 'Rejected'
    },
    completed: {
      bg: 'bg-[#DCE6FF]',
      text: 'text-[#0B3D8F]',
      icon: 'task_alt',
      label: 'Completed'
    },
    cancelled: {
      bg: 'bg-[#E3EBE1]',
      text: 'text-[#414942]',
      icon: 'block',
      label: 'Cancelled'
    }
  };

  const current = configs[norm] || configs.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${current.bg} ${current.text}`}>
      <span className="material-symbols-rounded text-[15px]">{current.icon}</span>
      {current.label}
    </span>
  );
}
