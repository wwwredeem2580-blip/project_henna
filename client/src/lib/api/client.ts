import axios from 'axios';
import { getBaseURL, API_CONFIG } from './config';
import { z } from 'zod';

interface AuthContextUpdater {
  (user: any): void;
}

class ApiClient {
  private client: any;
  private authContextUpdater: AuthContextUpdater | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: getBaseURL(),
      timeout: API_CONFIG.timeout,
      withCredentials: true, // Important for cookie-based auth
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // Set the auth context updater function
  setAuthContextUpdater(updater: AuthContextUpdater) {
    this.authContextUpdater = updater;
  }

  private setupInterceptors() {
    // Request interceptor - add auth headers, etc.
    this.client.interceptors.request.use(
      (config: any) => {
        // Add any additional headers here if needed
        // For example, JWT tokens from localStorage could be added here
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor - handle token cycling on 401
    this.client.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const { config, response } = error;

        // Handle 401 (Unauthorized) - implement token cycling
        if (response?.status === 401 && !config._retry) {
          config._retry = true;

          try {
            // Attempt token refresh cycle
            await this.refreshTokenCycle();

            // Retry the original request
            return this.client.request(config);
          } catch (refreshError) {
            // Refresh failed - let the error propagate
            // Auth context will handle redirect to login
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshTokenCycle() {
    // 1. Hit refresh endpoint (sets new cookies via proxy)
    await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    // 2. Verify to get updated user data
    const verifyResponse = await fetch('/api/auth/verify', {
      method: 'POST',
      credentials: 'include'
    });

    if (verifyResponse.ok) {
      const userData = await verifyResponse.json();

      // 3. Update auth context if updater is set
      if (this.authContextUpdater && userData.user) {
        this.authContextUpdater(userData.user);
      }
    } else {
      // Refresh failed
      throw new Error('Token refresh failed');
    }
  }

  // Generic request method with validation
  async request<T>(
    config: any & {
      requestSchema?: z.ZodSchema;
      responseSchema?: z.ZodSchema;
    }
  ): Promise<T> {
    const { requestSchema, responseSchema, ...axiosConfig } = config;

    // Validate request data if schema provided
    if (requestSchema && axiosConfig.data) {
      const validation = requestSchema.safeParse(axiosConfig.data);
      if (!validation.success) {
        throw new Error(`Request validation failed: ${validation.error.message}`);
      }
      axiosConfig.data = validation.data;
    }

    const response = await this.client.request(axiosConfig);

    // Validate response data if schema provided
    if (responseSchema && response.data) {
      const validation = responseSchema.safeParse(response.data);
      if (!validation.success) {
        throw new Error(`Response validation failed: ${validation.error.message}`);
      }
      return validation.data as T;
    }

    return response.data as T;
  }

  // Convenience methods
  async get<T>(
    url: string,
    config?: any & { responseSchema?: z.ZodSchema }
  ): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      ...config,
    });
  }

  async post<T>(
    url: string,
    data?: any,
    config?: any & {
      requestSchema?: z.ZodSchema;
      responseSchema?: z.ZodSchema;
    }
  ): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }

  async put<T>(
    url: string,
    data?: any,
    config?: any & {
      requestSchema?: z.ZodSchema;
      responseSchema?: z.ZodSchema;
    }
  ): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    });
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: any & {
      requestSchema?: z.ZodSchema;
      responseSchema?: z.ZodSchema;
    }
  ): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config,
    });
  }

  async delete<T>(
    url: string,
    config?: any & { responseSchema?: z.ZodSchema }
  ): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
