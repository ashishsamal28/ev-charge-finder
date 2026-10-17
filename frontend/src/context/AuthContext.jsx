import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ev_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on startup if token exists
  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem('ev_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res?.data?.user) {
        setUser(res.data.user);
      } else {
        throw new Error('Invalid user response');
      }
    } catch (err) {
      console.warn('Authentication token invalid or expired:', err.message);
      localStorage.removeItem('ev_token');
      localStorage.removeItem('ev_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    const { user: loggedInUser, access_token } = res.data;
    localStorage.setItem('ev_token', access_token);
    localStorage.setItem('ev_user', JSON.stringify(loggedInUser));
    setToken(access_token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    const { user: registeredUser, access_token } = res.data;
    localStorage.setItem('ev_token', access_token);
    localStorage.setItem('ev_user', JSON.stringify(registeredUser));
    setToken(access_token);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore API failure on logout
    } finally {
      localStorage.removeItem('ev_token');
      localStorage.removeItem('ev_user');
      setUser(null);
      setToken(null);
    }
  };

  const updateProfile = async (payload) => {
    const res = await authApi.updateProfile(payload);
    const updated = res.data.user;
    setUser(updated);
    localStorage.setItem('ev_user', JSON.stringify(updated));
    return updated;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    refreshUser: loadUser,
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
