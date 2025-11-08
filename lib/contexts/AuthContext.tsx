'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = apiClient.getToken();
      if (token) {
        const currentUser = await apiClient.getCurrentUser();
        if (currentUser.is_staff || currentUser.is_superuser) {
          setUser(currentUser);
        } else {
          apiClient.setToken(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiClient.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await apiClient.login(email, password);
      const currentUser = await apiClient.getCurrentUser();
      
      if (!currentUser.is_staff && !currentUser.is_superuser) {
        apiClient.setToken(null);
        throw new Error('Admin privileges required');
      }
      
      setUser(currentUser);
    } catch (error) {
      apiClient.setToken(null);
      throw error;
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
