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
  async uploadDocuments(files: File[], documentType: string = 'verification_doc'): Promise<{ files: Array<{ objectKey: string; filename: string; uploadedAt: Date }> }> {
    const formData = new FormData();
    
    // Append all files
    files.forEach((file) => {
      formData.append('documents', file);
    });
    
    // Append document type
    formData.append('documentType', documentType);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/media/backblaze/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } catch (e) {
          errorMessage = `Upload failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Ensure we return the correct structure
      if (!data.files || !Array.isArray(data.files)) {
        console.error('Invalid response:', data);
        throw new Error('Invalid response format from server');
      }
      
      return data;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * Delete document from Backblaze
   */
  async deleteDocument(objectKey: string): Promise<{ success: boolean }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/media/backblaze/delete`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ objectKey }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete document');
    }

    return response.json();
  }
}

export const mediaService = new MediaService();
