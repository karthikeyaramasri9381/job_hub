import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        try {
          const res = await authService.getCurrentUser();
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            localStorage.clear();
            setUser(null);
            setToken(null);
          }
        } catch {
          localStorage.clear();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const saveAuthSession = (data) => {
    const accessToken = data.access;
    const refreshToken = data.refresh;
    const userData = data.user;

    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
  };

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.data) {
      saveAuthSession(res.data);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data) {
      saveAuthSession(res.data);
    }
    return res;
  };

  const googleLogin = async (idToken, role) => {
    const res = await authService.googleLogin(idToken, role);
    if (res.success && res.data) {
      saveAuthSession(res.data);
    }
    return res;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    await authService.logout(refreshToken);
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    role: user?.role,
    isCandidate: user?.role === 'CANDIDATE',
    isRecruiter: user?.role === 'RECRUITER',
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    googleLogin,
    logout,
    setUser,
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
