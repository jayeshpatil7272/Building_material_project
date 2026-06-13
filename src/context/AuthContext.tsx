'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'client' | 'dealer' | 'supplier';
  timestamp: string;
  companyName?: string;
  gstNumber?: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserSession>;
  register: (name: string, email: string, phone: string, password: string, role: 'client' | 'dealer' | 'supplier') => Promise<UserSession>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // 1. Try to fetch the current authenticated session from the v2 API (cookie-based)
        const res = await fetch('/api/v2/auth');
        if (res.ok) {
          const dbUser = await res.json();
          const sessionUser: UserSession = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            phone: dbUser.phone,
            role: dbUser.role,
            timestamp: dbUser.createdAt || new Date().toISOString(),
            companyName: dbUser.companyName || undefined,
            gstNumber: dbUser.gstNumber || undefined,
          };
          setUser(sessionUser);
          localStorage.setItem('jsr-user-session', JSON.stringify(sessionUser));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('v2 auth check failed, falling back to local storage', err);
      }

      // 2. Fallback to localStorage if cookie check fails or user is not logged in via cookie
      const storedUser = localStorage.getItem('jsr-user-session');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error('Failed to parse stored auth session', err);
          localStorage.removeItem('jsr-user-session');
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<UserSession> => {
    try {
      // Try to log in with SQLite/v2 Auth
      const res = await fetch('/api/v2/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });

      const data = await res.json();
      if (res.ok && !data.error) {
        const sessionUser: UserSession = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          timestamp: new Date().toISOString(),
          companyName: data.companyName || undefined,
          gstNumber: data.gstNumber || undefined,
        };
        setUser(sessionUser);
        localStorage.setItem('jsr-user-session', JSON.stringify(sessionUser));
        return sessionUser;
      }
      
      // If v2 fails, try the fallback v1 (JSON based) auth
      const resFallback = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });

      const dataFallback = await resFallback.json();
      if (!resFallback.ok) {
        throw new Error(dataFallback.error || data.error || 'Login failed.');
      }

      setUser(dataFallback.user);
      localStorage.setItem('jsr-user-session', JSON.stringify(dataFallback.user));
      return dataFallback.user;
    } catch (err: any) {
      throw new Error(err.message || 'Login request failed.');
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    role: 'client' | 'dealer' | 'supplier'
  ): Promise<UserSession> => {
    try {
      // Try to register with SQLite/v2 Auth
      const res = await fetch('/api/v2/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, email, phone, password, role })
      });

      const data = await res.json();
      if (res.ok && !data.error) {
        const sessionUser: UserSession = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          timestamp: new Date().toISOString(),
          companyName: data.companyName || undefined,
          gstNumber: data.gstNumber || undefined,
        };
        setUser(sessionUser);
        localStorage.setItem('jsr-user-session', JSON.stringify(sessionUser));
        return sessionUser;
      }

      // Fallback register
      const resFallback = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, email, phone, password, role })
      });

      const dataFallback = await resFallback.json();
      if (!resFallback.ok) {
        throw new Error(dataFallback.error || data.error || 'Registration failed.');
      }

      setUser(dataFallback.user);
      localStorage.setItem('jsr-user-session', JSON.stringify(dataFallback.user));
      return dataFallback.user;
    } catch (err: any) {
      throw new Error(err.message || 'Registration request failed.');
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v2/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
    } catch (err) {
      console.error('v2 logout failed', err);
    }
    setUser(null);
    localStorage.removeItem('jsr-user-session');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

