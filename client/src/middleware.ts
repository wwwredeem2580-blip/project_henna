import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Define the scanner subdomain
  const scannerSubdomain = 'scanner.zenvy.com.bd';
  
  // Check if we are on the scanner subdomain
  const isScannerSubdomain = hostname === scannerSubdomain;

  // ---------------------------------------------------------
  // 1. Rewrite Subdomain to /scanner path
  // ---------------------------------------------------------
  if (isScannerSubdomain) {
    // If the user requests the root of the subdomain, rewrite to /scanner
    // If they request /some-path, rewrite to /scanner/some-path
    url.pathname = `/scanner${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // ---------------------------------------------------------
  // 2. Redirect /scanner path to Subdomain (Canonical URL)
  // ---------------------------------------------------------
  // If we are on the main domain (not scanner subdomain) and trying to access /scanner directly
  if (!isScannerSubdomain && url.pathname.startsWith('/scanner')) {
    // Construct the new URL using the scanner subdomain
    const newUrl = new URL(url.pathname.replace(/^\/scanner/, '') || '/', `https://${scannerSubdomain}`);
    newUrl.search = url.search; // Preserve query parameters
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Apply to all routes except api, static files, images, favicon
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
