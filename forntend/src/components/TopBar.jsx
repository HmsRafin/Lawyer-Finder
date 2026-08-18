import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TopBar() {
  const { user, logout, switchRole } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSwitch = (role) => {
    switchRole(role);
    if (role === 'lawyer') {
      navigate('/lawyer/requests');
    } else if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/client/appointments');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F5FAF5]/90 backdrop-blur-md border-b border-[#C1C9BC]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-[#181D19]">
            <div className="w-[38px] h-[38px] rounded-[11px] bg-gradient-to-br from-[#1B6E45] to-[#0F4E2E] flex items-center justify-center text-white shadow-e2 border-t border-white/30">
              <span className="material-symbols-rounded fill text-[22px]">balance</span>
            </div>
            <span>Lawyer&nbsp;Finder</span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-[14.5px] font-medium text-[#414942]">
            <Link 
              to="/lawyers" 
              className={`px-3.5 py-2 rounded-full transition-colors hover:bg-[#E3EBE1] hover:text-[#181D19] ${isActive('/lawyers') ? 'bg-[#E3EBE1] text-[#181D19] font-semibold' : ''}`}
            >
              Find Lawyers
            </Link>
            
            {user?.role === 'client' && (
              <Link 
                to="/client/appointments" 
                className={`px-3.5 py-2 rounded-full transition-colors hover:bg-[#E3EBE1] hover:text-[#181D19] ${isActive('/client/appointments') ? 'bg-[#E3EBE1] text-[#181D19] font-semibold' : ''}`}
              >
                My Appointments
              </Link>
            )}

            {user?.role === 'lawyer' && (
              <Link 
                to="/lawyer/requests" 
                className={`px-3.5 py-2 rounded-full transition-colors hover:bg-[#E3EBE1] hover:text-[#181D19] ${isActive('/lawyer/requests') ? 'bg-[#E3EBE1] text-[#181D19] font-semibold' : ''}`}
              >
                Lawyer Dashboard
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link 
                to="/admin/dashboard" 
                className={`px-3.5 py-2 rounded-full transition-colors hover:bg-[#E3EBE1] hover:text-[#181D19] ${isActive('/admin/dashboard') ? 'bg-[#E3EBE1] text-[#181D19] font-semibold' : ''}`}
              >
                Admin Panel
              </Link>
            )}

            <Link 
              to="/#modules" 
              className="px-3.5 py-2 rounded-full transition-colors hover:bg-[#E3EBE1] hover:text-[#181D19]"
            >
              How it Works
            </Link>
          </nav>

          {/* View Switcher Pill (Google Material 3 design signature) */}
          <div className="hidden md:flex items-center gap-1 bg-[#E3EBE1] p-1 rounded-full shadow-inner border border-[#C1C9BC]/50">
            <button
              onClick={() => handleRoleSwitch('client')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                user?.role === 'client'
                  ? 'bg-[#1B6E45] text-white shadow-e2'
                  : 'text-[#414942] hover:text-[#181D19]'
              }`}
            >
              <span className="material-symbols-rounded text-[17px]">person</span>
              Client
            </button>
            <button
              onClick={() => handleRoleSwitch('lawyer')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                user?.role === 'lawyer'
                  ? 'bg-[#1B6E45] text-white shadow-e2'
                  : 'text-[#414942] hover:text-[#181D19]'
              }`}
            >
              <span className="material-symbols-rounded text-[17px]">gavel</span>
              Lawyer
            </button>
            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                user?.role === 'admin'
                  ? 'bg-[#1B6E45] text-white shadow-e2'
                  : 'text-[#414942] hover:text-[#181D19]'
              }`}
            >
              <span className="material-symbols-rounded text-[17px]">admin_panel_settings</span>
              Admin
            </button>
          </div>

          {/* User Section / Action */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={user.role === 'lawyer' ? '/lawyer/profile' : '/client/profile'}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#E9F0E7] hover:bg-[#E3EBE1] transition-colors border border-[#C1C9BC]/60"
                  title="Edit Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1B6E45] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {user.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold leading-tight line-clamp-1">{user.name}</p>
                    <p className="text-[10px] text-[#414942] capitalize">{user.role}</p>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#414942] hover:bg-[#FFDAD6] hover:text-[#BA1A1A] transition-colors"
                  title="Sign Out"
                >
                  <span className="material-symbols-rounded text-[20px]">logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 rounded-full text-sm font-semibold text-[#1B6E45] hover:bg-[#A7F2C3]/40 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="btn-filled px-4 py-2 rounded-full text-sm font-semibold">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#414942] hover:bg-[#E3EBE1]"
            >
              <span className="material-symbols-rounded">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs lg:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div 
            className="fixed inset-y-0 right-0 w-[82vw] max-w-[320px] bg-[#FFFFFF] shadow-e5 p-6 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#C1C9BC]">
              <div className="flex items-center gap-2 font-bold text-base">
                <span className="material-symbols-rounded text-[#1B6E45]">balance</span>
                Menu
              </div>
              <button 
                onClick={() => setDrawerOpen(false)} 
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#E3EBE1]"
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <Link 
              to="/lawyers" 
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm hover:bg-[#E9F0E7]"
            >
              <span className="material-symbols-rounded text-[#1B6E45]">search</span>
              Find Lawyers
            </Link>

            <Link 
              to="/client/appointments" 
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm hover:bg-[#E9F0E7]"
            >
              <span className="material-symbols-rounded text-[#1B6E45]">event</span>
              My Appointments (Client)
            </Link>

            <Link 
              to="/lawyer/requests" 
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm hover:bg-[#E9F0E7]"
            >
              <span className="material-symbols-rounded text-[#1B6E45]">inbox</span>
              Incoming Requests (Lawyer)
            </Link>

            <Link 
              to="/admin/dashboard" 
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm hover:bg-[#E9F0E7]"
            >
              <span className="material-symbols-rounded text-[#1B6E45]">admin_panel_settings</span>
              Admin Dashboard
            </Link>

            <hr className="my-2 border-[#C1C9BC]" />

            <p className="text-[11px] font-bold text-[#71796F] uppercase tracking-wider px-3">Switch Role View</p>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#E3EBE1] rounded-2xl">
              <button
                onClick={() => { handleRoleSwitch('client'); setDrawerOpen(false); }}
                className={`py-2 rounded-xl text-xs font-bold ${user?.role === 'client' ? 'bg-[#1B6E45] text-white shadow' : 'text-[#414942]'}`}
              >
                Client
              </button>
              <button
                onClick={() => { handleRoleSwitch('lawyer'); setDrawerOpen(false); }}
                className={`py-2 rounded-xl text-xs font-bold ${user?.role === 'lawyer' ? 'bg-[#1B6E45] text-white shadow' : 'text-[#414942]'}`}
              >
                Lawyer
              </button>
              <button
                onClick={() => { handleRoleSwitch('admin'); setDrawerOpen(false); }}
                className={`py-2 rounded-xl text-xs font-bold ${user?.role === 'admin' ? 'bg-[#1B6E45] text-white shadow' : 'text-[#414942]'}`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
