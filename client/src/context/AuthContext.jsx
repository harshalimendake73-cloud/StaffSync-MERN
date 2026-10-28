import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('staffsync_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('staffsync_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('staffsync_user', JSON.stringify(res.data.user));
        } catch (error) {
          console.error('[Auth Error]: Failed to fetch profile', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('staffsync_token', receivedToken);
    localStorage.setItem('staffsync_user', JSON.stringify(receivedUser));
    return receivedUser;
  };

  const logout = async () => {
    try {
      if (token) {
        await apiClient.post('/auth/logout');
      }
    } catch (e) {
      // ignore
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('staffsync_token');
      localStorage.removeItem('staffsync_user');
    }
  };

  const updateUserProfile = (updatedProfile) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        employeeProfile: {
          ...prev.employeeProfile,
          ...updatedProfile
        }
      };
      localStorage.setItem('staffsync_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

