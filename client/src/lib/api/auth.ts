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

  // Google OAuth Registration (with business data)
  initiateGoogleRegister: async (businessData: {
    businessName: string;
    businessEmail: string;
    phoneNumber: string;
    website?: string;
    companyType: string;
  }): Promise<{ url: string; state: string }> => {
    return await apiClient.post('/api/auth/google/register/initiate', businessData);
  },

  sendVerification: async (email?: string): Promise<{ success: boolean; message: string }> => {
    return await apiClient.post('/api/auth/email/send-verification', { email });
  },

  verifyEmail: async (token: string): Promise<{ success: boolean; message: string }> => {
    return await apiClient.post('/api/auth/email/verify', { token });
  },

  resendVerification: async (): Promise<{ success: boolean; message: string }> => {
    return await apiClient.post('/api/auth/email/resend-verification');
  }

};
