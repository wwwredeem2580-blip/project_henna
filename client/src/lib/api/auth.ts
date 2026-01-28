import { apiClient } from './client';
import { LoginPayload, RegisterPayload, JwtTokenPayload } from '@/types/auth.type';

interface AuthResponse {
  user: JwtTokenPayload;
}


export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', payload) as AuthResponse;
    return response;
  },

  // Host registration (multi-step with business data)
  registerHost: async (payload: any): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/register/host', payload) as AuthResponse;
    return response;
  },

  // User registration (simple)
  registerUser: async (payload: any): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/register/user', payload) as AuthResponse;
    return response;
  },

  // Backward compatibility
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/register', payload) as AuthResponse;
    return response;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  verify: async (): Promise<JwtTokenPayload> => {
    const response = await apiClient.post('/api/auth/verify') as JwtTokenPayload;
    return response;
  },

  refresh: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/refresh') as AuthResponse;
    return response;
  },

  googleLogin: async (): Promise<string> => {
    const response = await apiClient.get(`/api/auth/google/login`) as { url: string };
    return response.url;
  },

  // Google OAuth Registration (with role and optional business data)
  initiateGoogleRegister: async (role: 'host' | 'user', businessData?: any): Promise<{ url: string; state: string }> => {
    return await apiClient.post('/api/auth/google/register/initiate', {
      role,
      ...businessData
    });
  },

  sendVerification: async (email?: string): Promise<{ success: boolean; message: string }> => {
    return await apiClient.post('/api/auth/email/send-verification', { email });
  },

  verifyEmail: async (token: string): Promise<{ success: boolean; message: string }> => {
    // Use plain fetch instead of apiClient to avoid authentication requirement
    // This allows verification from different browsers/devices without cookies
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/email/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Still include credentials to set new cookie if user is logged in
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Verification failed');
    }

    return await response.json();
  },

  resendVerification: async (): Promise<{ success: boolean; message: string }> => {
    return await apiClient.post('/api/auth/email/resend-verification');
  },

  checkVerificationStatus: async (): Promise<{ verified: boolean; email: string }> => {
    return await apiClient.get('/api/auth/email/check-status');
  }

};
