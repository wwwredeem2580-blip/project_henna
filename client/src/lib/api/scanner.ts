import { apiClient } from './client';

export interface ScannerSession {
  _id: string;
  eventId: string;
  eventTitle?: string;
  sessionStatus: 'active' | 'closed';
  maxDevices: number;
  activeDeviceCount: number;
  expiresAt: string;
  createdAt: string;
  pairingOTP?: {
    code: string;
    expiresAt: Date;
    used: boolean;
  };
}

export interface ScannerDevice {
  _id: string;
  deviceName: string;
  totalScans: number;
  lastSeen: string;
  isOnline: boolean;
  createdAt: string;
  status?: 'active' | 'disabled';
  revokedAt?: string;
}

export interface ScanStats {
  total: number;
  success: number;
  duplicate: number;
  invalid: number;
  expired: number;
  cancelled: number;
  refunded: number;
}

export interface SessionDetailsResponse {
  session: ScannerSession;
  devices: ScannerDevice[];
  stats: ScanStats;
}

export interface CreateSessionResponse {
  success: boolean;
  session: ScannerSession;
  scannerUrl: string;
  accessToken: string;
}

class ScannerService {
  /**
   * Create a new scanner session for an event
   */
  async createSession(eventId: string, maxDevices: number = 5): Promise<CreateSessionResponse> {
    return await apiClient.post('/api/scanner/session/create', { eventId, maxDevices });
  }

  /**
   * Get active scanner session for an event
   */
  async getActiveSessionByEvent(eventId: string): Promise<SessionDetailsResponse & { scannerUrl?: string } | null> {
    return await apiClient.get(`/api/scanner/session/event/${eventId}`);
  }

  /**
   * Get session details with devices and stats
   */
  async getSessionDetails(sessionId: string): Promise<SessionDetailsResponse> {
    return await apiClient.get(`/api/scanner/session/${sessionId}`);
  }

  /**
   * Join a scanner session (device registration)
   */
  async joinSession(accessToken: string, deviceName: string): Promise<{
    success: boolean;
    device: {
      _id: string;
      deviceName: string;
      totalScans: number;
      createdAt: string;
    };
    session: {
      _id: string;
      eventId: string;
      eventTitle: string;
      eventDate: string;
      expiresAt: string;
    };
  }> {
    return await apiClient.post('/api/scanner/session/join', {
      accessToken,
      deviceName,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
    });
  }

  /**
   * Verify a ticket scan
   */
  async verifyTicket(qrData: string, accessToken: string, deviceId: string): Promise<{
    valid: boolean;
    reason?: string;
    message: string;
    ticket?: {
      ticketNumber: string;
      ticketType: string;
      eventTitle: string;
      checkedInAt: Date;
    };
    checkedInAt?: Date;
  }> {
    return await apiClient.post('/api/scanner/verify', {
      qrData,
      accessToken,
      deviceId
    });
  }

  /**
   * Get tickets for offline caching
   */
  async getTicketsForCache(sessionId: string, deviceId: string): Promise<{
    tickets: Array<{
      ticketId: string;
      ticketNumber: string;
      ticketType: string;
      status: string;
      holderName?: string;
      eventId: string;
    }>;
    eventId: string;
    cachedAt: Date;
  }> {
    return await apiClient.get(`/api/scanner/tickets/${sessionId}?deviceId=${deviceId}`);
  }

  /**
   * Generate OTP for device pairing
   */
  async generateOTP(sessionId: string): Promise<{
    success: boolean;
    otp: string;
    expiresAt: Date;
    validFor: number;
  }> {
    return await apiClient.post(`/api/scanner/session/${sessionId}/generate-otp`, {});
  }

  /**
   * Verify OTP before joining session
   */
  async verifyOTP(accessToken: string, otpCode: string): Promise<{
    success: boolean;
    message: string;
    sessionId: string;
    eventId: string;
  }> {
    return await apiClient.post('/api/scanner/session/verify-otp', {
      accessToken,
      otpCode
    });
  }

  /**
   * Disable a device
   */
  async disableDevice(deviceId: string, sessionId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return await apiClient.put(`/api/scanner/device/${deviceId}/disable`, { sessionId });
  }

  /**
   * Re-enable a disabled device
   */
  async enableDevice(deviceId: string, sessionId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return await apiClient.put(`/api/scanner/device/${deviceId}/enable`, { sessionId });
  }

  /**
   * Force logout a device
   */
  async forceLogoutDevice(deviceId: string, sessionId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return await apiClient.post(`/api/scanner/device/${deviceId}/logout`, { sessionId });
  }

  /**
   * Update device status (battery, gate, last scan)
   */
  async updateDeviceStatus(deviceId: string, updates: {
    battery?: number;
    gate?: string;
    lastScanAt?: Date;
  }): Promise<{
    success: boolean;
    message: string;
  }> {
    return await apiClient.put(`/api/scanner/device/${deviceId}/status`, updates);
  }

  /**
   * Close a scanner session
   */
  async closeSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.post(`/api/scanner/session/${sessionId}/close`, {});
  }
}

export const scannerService = new ScannerService();

