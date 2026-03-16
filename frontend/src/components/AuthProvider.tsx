"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';

type User = {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  enrollment_id?: string;
  department?: string;
  year?: number;
  section?: string;
  qr_code_id?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (token: string, redirectUrl?: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  fetchUser: async () => {},
});

// Demo auto-login credentials (admin by default)
const DEMO_EMAIL = "admin@school.edu";
const DEMO_PASSWORD = "admin123";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) throw new Error('No token');
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (error) {
      // Try auto-login with demo credentials
      try {
        const formData = new URLSearchParams();
        formData.append('username', DEMO_EMAIL);
        formData.append('password', DEMO_PASSWORD);
        const loginRes = await api.post('/auth/token', formData.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        const token = loginRes.data.access_token;
        Cookies.set('token', token, { expires: 1 });
        const meRes = await api.get('/auth/me');
        setUser(meRes.data);
      } catch (autoLoginError) {
        console.error('Auto-login failed:', autoLoginError);
        setUser(null);
        Cookies.remove('token');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Auto-redirect to dashboard once logged in
  useEffect(() => {
    if (!loading && user) {
      const dashboardRoutes = ['/admin/dashboard', '/teacher/dashboard', '/student/dashboard'];
      const isOnLoginOrRegister = pathname === '/login' || pathname === '/register' || pathname === '/';
      if (isOnLoginOrRegister) {
        if (user.role === 'admin') router.push('/admin/dashboard');
        else if (user.role === 'teacher') router.push('/teacher/dashboard');
        else router.push('/student/dashboard');
      }
    }
  }, [loading, user, pathname]);

  const login = (token: string, redirectUrl?: string) => {
    Cookies.set('token', token, { expires: 1 });
    fetchUser().then(() => {
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    });
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
