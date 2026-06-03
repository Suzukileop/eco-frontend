'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { LoginData, Role, SignupData, User } from '@/types/auth';
import {
  loginApi,
  logoutApi,
  signupApi,
  clearRefreshCookie,
  setRefreshCookie,
} from '@/lib/auth';
import { setAccessToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On mount, attempt silent refresh to restore session from httpOnly cookie
    const tryRestore = async () => {
      try {
        const axiosModule = await import('axios');
        const response = await axiosModule.default.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
        if (response.data.refreshToken) {
          await setRefreshCookie(response.data.refreshToken);
        }
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    tryRestore();
  }, []);

  const login = useCallback(async (data: LoginData) => {
    const authResponse = await loginApi(data);
    setAccessToken(authResponse.accessToken);
    setUser(authResponse.user);
    if (authResponse.refreshToken) {
      await setRefreshCookie(authResponse.refreshToken);
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    const authResponse = await signupApi(data);
    setAccessToken(authResponse.accessToken);
    setUser(authResponse.user);
    if (authResponse.refreshToken) {
      await setRefreshCookie(authResponse.refreshToken);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Continue with local logout even if API call fails
    }
    await clearRefreshCookie();
    setAccessToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (role: Role) => user?.roles.includes(role) ?? false,
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        signup,
        logout,
        hasRole,
      }}
    >
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
