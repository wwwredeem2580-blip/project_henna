/**
 * Centralized API configuration
 * All requests now go through Next.js API proxy routes
 */

export const API_CONFIG = {
  // All requests go through Next.js proxy
  baseURL: '', // Empty since we use relative paths to /api/*

  // Service endpoints - these map to /api/{service} routes
  services: {
    auth: '/api/auth',
    media: '/api/media',
  },

  // Request configuration
  timeout: 10000,
  retries: 1, // We'll handle retries in the client with token refresh
} as const;

// All requests go through the proxy, so baseURL is always empty
export const getBaseURL = (): string => {
  return API_CONFIG.baseURL;
};

// Helper to build full service URLs
export const getServiceURL = (service: keyof typeof API_CONFIG.services): string => {
  return API_CONFIG.services[service];
};
