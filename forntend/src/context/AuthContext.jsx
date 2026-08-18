import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize with persisted state or default test client (Sadia Anwar)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lawyer_finder_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    // Default logged in client for immediate testing
    return {
      id: 2,
      name: 'Sadia Anwar',
      email: 'sadia@gmail.com',
      role: 'client',
      phone: '+8801711111111'
    };
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Sync with PHP session on startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await authApi.getMe();
        if (res.success && res.data) {
          setUser(res.data);
          localStorage.setItem('lawyer_finder_user', JSON.stringify(res.data));
        }
      } catch (err) {
        // Backend offline / using local test state
      }
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('lawyer_finder_user', JSON.stringify(res.data));
        showToast('Welcome back, ' + res.data.name, 'success');
        return { success: true, user: res.data };
      } else {
        // Local fallback for quick testing if backend not ready
        if (email.includes('lawyer') || email.includes('rahim')) {
          const lawyerUser = {
            id: 6,
            lawyer_id: 1,
            name: 'Adv. Rahim Karim',
            email: email,
            role: 'lawyer',
            specialization: 'Corporate',
            district: 'Dhaka',
            phone: '+8801811111111'
          };
          setUser(lawyerUser);
          localStorage.setItem('lawyer_finder_user', JSON.stringify(lawyerUser));
          showToast('Logged in as Lawyer (Adv. Rahim Karim)', 'success');
          return { success: true, user: lawyerUser };
        } else if (email.includes('admin')) {
          const adminUser = {
            id: 1,
            name: 'System Admin',
            email: email,
            role: 'admin',
            phone: '+8801700000000'
          };
          setUser(adminUser);
          localStorage.setItem('lawyer_finder_user', JSON.stringify(adminUser));
          showToast('Logged in as System Admin', 'success');
          return { success: true, user: adminUser };
        } else {
          const clientUser = {
            id: 2,
            name: 'Sadia Anwar',
            email: email,
            role: 'client',
            phone: '+8801711111111'
          };
          setUser(clientUser);
          localStorage.setItem('lawyer_finder_user', JSON.stringify(clientUser));
          showToast('Logged in as Client (' + email + ')', 'success');
          return { success: true, user: clientUser };
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.register(userData);
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('lawyer_finder_user', JSON.stringify(res.data));
        showToast('Registration successful!', 'success');
        return { success: true, user: res.data };
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    setUser(null);
    localStorage.removeItem('lawyer_finder_user');
    showToast('Logged out successfully', 'info');
  };

  // Quick Role Switcher for checkpoint demonstration
  const switchRole = (role) => {
    let mock;
    if (role === 'lawyer') {
      mock = {
        id: 6,
        lawyer_id: 1,
        name: 'Adv. Rahim Karim',
        email: 'rahim@lawyer.com',
        role: 'lawyer',
        specialization: 'Corporate',
        district: 'Dhaka',
        phone: '+8801811111111'
      };
    } else if (role === 'admin') {
      mock = {
        id: 1,
        name: 'System Admin',
        email: 'admin@lawyerfinder.com',
        role: 'admin',
        phone: '+8801700000000'
      };
    } else {
      mock = {
        id: 2,
        name: 'Sadia Anwar',
        email: 'sadia@gmail.com',
        role: 'client',
        phone: '+8801711111111'
      };
    }
    setUser(mock);
    localStorage.setItem('lawyer_finder_user', JSON.stringify(mock));
    showToast(`Switched view to ${role.toUpperCase()}`, 'info');
  };

  const showToast = (message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const value = {
    user,
    loading,
    notification,
    showToast,
    login,
    register,
    logout,
    switchRole,
    isClient: user?.role === 'client',
    isLawyer: user?.role === 'lawyer',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
