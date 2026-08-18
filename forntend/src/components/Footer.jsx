import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#2C322C] text-[#EDF2EA] pt-14 pb-8 border-t border-white/10">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 font-bold text-xl text-white">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1B6E45] to-[#0F4E2E] flex items-center justify-center text-white shadow-e1">
                <span className="material-symbols-rounded fill text-[19px]">balance</span>
              </div>
              <span>Lawyer&nbsp;Finder</span>
            </div>
            <p className="text-xs text-[#EDF2EA]/75 leading-relaxed max-w-[280px]">
              A database-driven web application connecting clients with verified lawyers by specialization and district.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#EDF2EA]/60 mb-3.5">Navigation</h5>
            <ul className="space-y-2 text-xs text-[#EDF2EA]/85">
              <li><Link to="/lawyers" className="hover:text-white transition-colors">Find Lawyers</Link></li>
              <li><Link to="/client/appointments" className="hover:text-white transition-colors">My Appointments</Link></li>
              <li><Link to="/lawyer/requests" className="hover:text-white transition-colors">Lawyer Case Manager</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Core Modules */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#EDF2EA]/60 mb-3.5">Platform Modules</h5>
            <ul className="space-y-2 text-xs text-[#EDF2EA]/85">
              <li>Client Module (Booking &amp; Search)</li>
              <li>Lawyer Module (Case Reviews)</li>
              <li>Admin Module (Platform Metrics)</li>
              <li>Normalized SQL Appointments Hub</li>
            </ul>
          </div>

          {/* Project Details */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#EDF2EA]/60 mb-3.5">CSE 3104 Project</h5>
            <ul className="space-y-1.5 text-xs text-[#EDF2EA]/80 font-mono">
              <li>ID: 20230204041</li>
              <li>ID: 20230204037</li>
              <li>ID: 20210204007</li>
              <li>ID: 20210104034</li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs text-[#EDF2EA]/60">
          <span>&copy; {new Date().getFullYear()} Lawyer Finder — AUST CSE 3104 Database Systems Lab</span>
          <span>Ahsanullah University of Science and Technology · Dept. of CSE</span>
        </div>
      </div>
    </footer>
  );
}
