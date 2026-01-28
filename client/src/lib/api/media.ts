import { apiClient } from './client';

interface ImageKitAuth {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

interface TrackUploadData {
  fileId: string;
  url: string;
  filename: string;
  type: string;
  status: 'temp' | 'permanent';
}

interface UploadResponse {
  success: boolean;
  fileId?: string;
  urls?: string[];
}

class MediaService {
  /**
   * Get ImageKit authentication parameters
   */
  async getImageKitAuth(): Promise<ImageKitAuth> {
    return await apiClient.get('/api/media/imagekit/auth');
  }

  /**
   * Track ImageKit upload in backend
   */
  async trackImageKitUpload(data: TrackUploadData): Promise<UploadResponse> {
    return await apiClient.post('/api/media/imagekit/track', data);
  }

  /**
   * Get user's uploads
   */
  async getUserUploads(type?: string): Promise<any[]> {
    const params = type ? { type } : {};
    return await apiClient.get('/api/media/imagekit/uploads', { params });
  }

  /**
   * Upload documents to Backblaze (backend handles the upload)
   */
  async uploadDocuments(files: File[]): Promise<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('documents', file);
    });

    return await apiClient.post('/api/media/backblaze/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const mediaService = new MediaService();
