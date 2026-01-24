import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Cookie options for setting cookies on frontend domain
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * Global API proxy handler
 * Routes requests to appropriate backend services and handles cookies
 */
async function proxyRequest(request: NextRequest, servicePath: string) {
  console.log('Proxying request to:', servicePath);
  const url = `${API_BASE}${servicePath}`;

  // Get cookies from the incoming request
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Build headers for the proxied request
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Forward cookies as Cookie header to the gateway
  const cookieParts: string[] = [];
  if (accessToken) cookieParts.push(`accessToken=${accessToken}`);
  if (refreshToken) cookieParts.push(`refreshToken=${refreshToken}`);
  if (cookieParts.length > 0) {
    headers['Cookie'] = cookieParts.join('; ');
  }

  // Get request body if present
  let body: string | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      const text = await request.text();
      if (text) body = text;
    } catch {
      // No body
    }
  }

  // Forward query string
  const queryString = request.nextUrl.search;
  const fullUrl = queryString ? `${url}${queryString}` : url;

  // Make the request to the gateway
  const response = await fetch(fullUrl, {
    method: request.method,
    headers,
    body,
  });

  // Parse the response
  const data = await response.json().catch(() => ({}));

  // Create the response
  const nextResponse = NextResponse.json(data, { status: response.status });

  // Handle Set-Cookie headers from the gateway
  // We need to extract tokens and set them as cookies on the frontend domain
  const setCookieHeaders = response.headers.getSetCookie?.() || [];

  for (const cookieStr of setCookieHeaders) {
    // Parse the cookie name and value
    const [cookiePart] = cookieStr.split(';');
    const [name, value] = cookiePart.split('=');

    if (name === 'accessToken' && value) {
      nextResponse.cookies.set('accessToken', value, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60, // 15 minutes
      });
    } else if (name === 'refreshToken' && value) {
      nextResponse.cookies.set('refreshToken', value, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }
  }

  // Handle cookie clearing (for logout)
  if (servicePath === '/auth/logout' && response.ok) {
    nextResponse.cookies.delete('accessToken');
    nextResponse.cookies.delete('refreshToken');
  }

  return nextResponse;
}

/**
 * Route requests to appropriate backend services
 */
function getServicePath(proxyPath: string[]): string {
  const [service, ...rest] = proxyPath;
  const subPath = rest.join('/');

  // Build the service path
  switch (service) {
    case 'auth':
      return `/auth/${subPath}`;
    case 'events':
      return `/events/${subPath}`;
    case 'host':
      return `/host/${subPath}`;
    case 'orders':
      return `/orders/${subPath}`;
    case 'tickets':
      return `/tickets/${subPath}`;
    case 'media':
      return `/media/${subPath}`;
    default:
      // Fallback for unknown services
      return `/${proxyPath.join('/')}`;
  }
}

// Handle all HTTP methods
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  const servicePath = getServicePath(proxy);
  return proxyRequest(request, servicePath);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  const servicePath = getServicePath(proxy);
  return proxyRequest(request, servicePath);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  const servicePath = getServicePath(proxy);
  return proxyRequest(request, servicePath);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  const servicePath = getServicePath(proxy);
  return proxyRequest(request, servicePath);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  const servicePath = getServicePath(proxy);
  return proxyRequest(request, servicePath);
}
