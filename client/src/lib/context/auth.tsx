'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';
import { useNotification } from '@/lib/context/notification';
import { JwtTokenPayload } from '@/types/auth.type';
import { loginSchema, registerSchema } from '@/schema/auth.schema';

interface AuthContextType {
  user: JwtTokenPayload | null;
  loading: boolean;
  isHost: boolean;
  isUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JwtTokenPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { showNotification } = useNotification();

  // Set up API client auth context updater
  useEffect(() => {
    apiClient.setAuthContextUpdater((updatedUser: JwtTokenPayload) => {
      setUser(updatedUser);
    });
  }, []);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.verify();
        setUser(response);

        // If user is not verified and not on verify-email page, redirect
        if (!response.emailVerified && pathname !== '/verify-email') {
          router.push('/verify-email');
          return;
        }
      } catch (error) {
        setUser(null);

        // Only redirect if on a protected route
        const publicRoutes = ['/', '/auth', '/onboarding', '/events', '/learn', '/about', '/events/:id'];
        const isPublicRoute = publicRoutes.some(route =>
          pathname === route || pathname?.startsWith(route + '/')
        );

        if (!isPublicRoute) {
          // Store return URL for post-login redirect
          sessionStorage.setItem('authReturnUrl', pathname || '/');
          router.push('/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Validate input data
      const validatedData = loginSchema.parse({ email, password });

      // Login sets cookies, now verify to get user data
      await authService.login(validatedData);
      const userResponse = await authService.verify();
      setUser(userResponse);

      showNotification('success', 'Welcome back!', `Hello ${userResponse.firstName}!`);

      // Check if email is verified
      if (!userResponse.emailVerified) {
        router.push('/verify-email');
        return;
      }

      // Handle post-login redirect
      const returnUrl = sessionStorage.getItem('authReturnUrl');
      if (returnUrl) {
        sessionStorage.removeItem('authReturnUrl');
        router.push(returnUrl);
      } else {
        // Default redirect based on role
        if (userResponse.role === 'host') {
          router.push('/host/dashboard');
        } else if (userResponse.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } catch (error: any) {
      if (error.name === 'ZodError') {
        // Handle validation errors
        const errorMessage = error.errors[0]?.message || 'Invalid input data';
        showNotification('error', 'Validation Error', errorMessage);
      } else {
        // Handle API errors
        showNotification('error', 'Login Failed', error?.response?.data?.message || 'Invalid credentials');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      setLoading(true);

      // Validate input data
      const validatedData = registerSchema.parse(data);

      // Register sets cookies, now verify to get user data
      await authService.register(validatedData);
      const userResponse = await authService.verify();
      setUser(userResponse);
      showNotification('success', 'Welcome!', 'Account created successfully. Please verify your email.');
      
      // Always redirect to verify email page after registration
      router.push('/verify-email');
    } catch (error: any) {
      if (error.name === 'ZodError') {
        // Handle validation errors
        const errorMessage = error.errors[0]?.message || 'Invalid input data';
        showNotification('error', 'Validation Error', errorMessage);
      } else {
        // Handle API errors
        showNotification('error', 'Registration Failed', error?.response?.data?.message || 'Failed to create account');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      showNotification('info', 'Logged out', 'See you next time!');
      router.push('/landing');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const googleLogin = async () => {
    try {
      const url = await authService.googleLogin();
      window.location.href = url;
    } catch (error: any) {
      showNotification('error', 'Google Login Failed', error?.response?.data?.message || 'Failed to initiate Google login');
    }
  };

  const refreshAuth = async () => {
    try {
      const response = await authService.verify();
      setUser(response);
    } catch (error) {
      setUser(null);
      router.push('/auth');
    }
  };

  // Role-based helpers
  const isHost = user?.role === 'host';
  const isUser = user?.role === 'user';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isHost,
      isUser,
      login,
      register,
      logout,
      googleLogin,
      refreshAuth,
    }}>
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
