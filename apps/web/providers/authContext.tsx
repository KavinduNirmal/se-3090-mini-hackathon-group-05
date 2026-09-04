'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authStorage, authApi, AuthSession, LoginPayload, CharityRegisterPayload } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: AuthSession['user'] | null;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  registerCharity: (data: CharityRegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSession['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = authStorage.getUser();
    if (savedUser) {
      setUser(savedUser);
      // Verify token freshness silently
      authApi.getMe()
        .then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
          }
        })
        .catch(() => {
          // If token expired, clear session
          authStorage.clearSession();
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: LoginPayload) => {
    const res = await authApi.login(data);
    if (res.data) {
      authStorage.setSession(res.data);
      setUser(res.data.user);
      if (res.data.user.role === 'CHARITY') {
        router.push('/charity/dashboard');
      } else if (res.data.user.role === 'DONOR') {
        router.push('/donor/dashboard');
      } else {
        router.push('/');
      }
    }
  };

  const registerCharity = async (data: CharityRegisterPayload) => {
    const res = await authApi.registerCharity(data);
    if (res.data) {
      authStorage.setSession(res.data);
      setUser(res.data.user);
      router.push('/charity/dashboard');
    }
  };

  const logout = () => {
    authStorage.clearSession();
    setUser(null);
    router.push('/sign-in');
  };


  return (
    <AuthContext.Provider value={{ user, isLoading, login, registerCharity, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
