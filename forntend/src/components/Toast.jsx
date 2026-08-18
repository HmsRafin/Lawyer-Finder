import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Toast() {
  const { notification } = useAuth();
  if (!notification) return null;

  const { message, type } = notification;

  const bg = type === 'success' 
    ? 'bg-[#1B6E45] text-white' 
    : type === 'error' 
    ? 'bg-[#BA1A1A] text-white' 
    : 'bg-[#2C322C] text-white';

  const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-e4 border border-white/20 ${bg}`}>
        <span className="material-symbols-rounded fill">{icon}</span>
        <p className="text-sm font-medium pr-2">{message}</p>
      </div>
    </div>
  );
}
