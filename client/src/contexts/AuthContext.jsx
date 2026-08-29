import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../services/auth.js';
import { setAccessToken } from '../lib/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await authService.refreshToken();
        const { accessToken, user } = response.data;
        setAccessToken(accessToken);
        setUser(user);
      } catch (error) {
        // Silently fail if no session
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const getDashboardRoute = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return '/dashboard/super-admin';
      case 'ADMIN': return '/dashboard/admin';
      case 'ASST_CHIEF_CONVENOR': return '/dashboard/asst-chief';
      case 'DEPT_CONVENOR': return '/dashboard/dept-convenor';
      case 'DEPT_ASST_CONVENOR': return '/dashboard/dept-convenor';
      case 'COORDINATOR': return '/dashboard/coordinator';
      case 'MEMBER': return '/dashboard/member';
      default: return '/';
    }
  };

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const { accessToken, user } = response.data;
    setAccessToken(accessToken);
    setUser(user);
    navigate(getDashboardRoute(user.role));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      navigate('/');
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
