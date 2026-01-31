import { apiClient } from './client';

// Phone OTP API
interface PhoneOTPResponse {
  success: boolean;
  message: string;
  phoneNumber?: string;
}

export const phoneOTPAPI = {
  sendOTP: async (phoneNumber: string): Promise<PhoneOTPResponse> => {
    return await apiClient.post('/api/auth/phone/send', { phoneNumber });
  },

  verifyOTP: async (otp: string): Promise<PhoneOTPResponse> => {
    return await apiClient.post('/api/auth/phone/verify', { otp });
  },

  resendOTP: async (phoneNumber: string): Promise<PhoneOTPResponse> => {
    return await apiClient.post('/api/auth/phone/resend', { phoneNumber });
  }
};
