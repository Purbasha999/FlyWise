import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('flywise_token');
    const stored = localStorage.getItem('flywise_user');
    if (token && stored) {
      setUser(JSON.parse(stored));
      // Verify token still valid
      getMe()
        .then(res => setUser(res.data.user))
        .catch(() => { logout(); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('flywise_token', token);
    localStorage.setItem('flywise_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (name, email, password, phone) => {
    const res = await registerUser({ name, email, password, phone });
    const { token, user } = res.data;
    localStorage.setItem('flywise_token', token);
    localStorage.setItem('flywise_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('flywise_token');
    localStorage.removeItem('flywise_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
