import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import TopBar from './components/TopBar';
import Footer from './components/Footer';
import Toast from './components/Toast';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchLawyersPage from './pages/SearchLawyersPage';
import LawyerProfilePage from './pages/LawyerProfilePage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import ClientEditProfilePage from './pages/ClientEditProfilePage';
import IncomingRequestsPage from './pages/IncomingRequestsPage';
import LawyerEditProfilePage from './pages/LawyerEditProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#F5FAF5] text-[#181D19]">
          <TopBar />
          
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/lawyers" element={<SearchLawyersPage />} />
              <Route path="/lawyers/:id" element={<LawyerProfilePage />} />
              <Route path="/book" element={<BookAppointmentPage />} />
              <Route path="/book/:id" element={<BookAppointmentPage />} />

              {/* Client Module Routes */}
              <Route path="/client/appointments" element={<MyAppointmentsPage />} />
              <Route path="/client/profile" element={<ClientEditProfilePage />} />

              {/* Lawyer Module Routes */}
              <Route path="/lawyer/requests" element={<IncomingRequestsPage />} />
              <Route path="/lawyer/profile" element={<LawyerEditProfilePage />} />

              {/* Admin Module Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <Footer />
          <Toast />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
