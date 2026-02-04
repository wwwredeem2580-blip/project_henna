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
}

export interface ScannerDevice {
  _id: string;
  deviceName: string;
  totalScans: number;
  lastSeen: string;
  isOnline: boolean;
  createdAt: string;
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
   * Get session details with devices and stats
   */
  async getSessionDetails(sessionId: string): Promise<SessionDetailsResponse> {
    return await apiClient.get(`/api/scanner/session/${sessionId}`);
  }

  /**
   * Close a scanner session
   */
  async closeSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.post(`/api/scanner/session/${sessionId}/close`, {});
  }
}

export const scannerService = new ScannerService();

