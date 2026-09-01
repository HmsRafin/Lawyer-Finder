import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('sadia@gmail.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user?.role === 'lawyer') {
          navigate('/lawyer/requests');
        } else if (res.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/client/appointments');
        }
      } else {
        setErrorMsg(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setErrorMsg('Login request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md surface-card p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B6E45] to-[#0F4E2E] text-white flex items-center justify-center mx-auto shadow-e2">
            <span className="material-symbols-rounded text-[26px]">lock</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-[#181D19]">Welcome Back</h2>
          <p className="text-xs text-[#414942]">Log in to access your appointments and cases.</p>
        </div>

        {/* Quick Demo Logins Banner */}
        <div className="p-3 bg-[#E9F0E7] rounded-2xl border border-[#C1C9BC]/60 space-y-2">
          <p className="text-[11px] font-bold text-[#71796F] uppercase tracking-wider">Quick Fill Test Accounts:</p>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('sadia@gmail.com', 'password123')}
              className="py-1.5 px-2 bg-white rounded-lg font-semibold text-[#181D19] border border-[#C1C9BC] hover:border-[#1B6E45]"
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('rahim@lawyer.com', 'password123')}
              className="py-1.5 px-2 bg-white rounded-lg font-semibold text-[#181D19] border border-[#C1C9BC] hover:border-[#1B6E45]"
            >
              Lawyer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@lawyerfinder.com', 'password123')}
              className="py-1.5 px-2 bg-white rounded-lg font-semibold text-[#181D19] border border-[#C1C9BC] hover:border-[#1B6E45]"
            >
              Admin
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FFDAD6] text-[#410002] text-xs flex items-center gap-2">
            <span className="material-symbols-rounded text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Email Address</label>
            <div className="flex items-center gap-2 bg-[#F5FAF5] px-3.5 py-2.5 rounded-xl border border-[#C1C9BC] focus-within:border-[#1B6E45] focus-within:ring-1 focus-within:ring-[#1B6E45]">
              <span className="material-symbols-rounded text-[#1B6E45] text-[20px]">mail</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. sadia@gmail.com"
                required
                className="w-full bg-transparent text-xs text-[#181D19] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#414942]">Password</label>
            <div className="flex items-center gap-2 bg-[#F5FAF5] px-3.5 py-2.5 rounded-xl border border-[#C1C9BC] focus-within:border-[#1B6E45] focus-within:ring-1 focus-within:ring-[#1B6E45]">
              <span className="material-symbols-rounded text-[#1B6E45] text-[20px]">key</span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-transparent text-xs text-[#181D19] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-filled py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span className="material-symbols-rounded text-[18px]">login</span>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-[#414942] pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#1B6E45] hover:underline">
            Register as Client or Lawyer
          </Link>
        </div>

      </div>
    </div>
  );
}
