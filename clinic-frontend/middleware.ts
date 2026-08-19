// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

const ROLE_ROUTES: Record<string, string[]> = {
  SUPER_ADMIN: ['/super-admin'],
  CLINIC_ADMIN: ['/clinic-admin'],
  DOCTOR: ['/doctor'],
  PATIENT: ['/patient'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('token')?.value;
  const userCookie = request.cookies.get('user')?.value;

  const isProtectedArea = ['/super-admin', '/clinic-admin', '/doctor', '/patient'].some((prefix) =>
    pathname.startsWith(prefix)
  );

  // Un-authenticated User Redirection
  if (isProtectedArea && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(loginUrl);
  }

  // Role Access Check
  if (isProtectedArea && userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      const userRole = user?.role;

      const allowedPaths = ROLE_ROUTES[userRole] || [];
      const hasAccess = allowedPaths.some((path) => pathname.startsWith(path));

      if (!hasAccess) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// ALWAYS ADD DEFAULT EXPORT TO PREVENT COMPILER ERRORS
export default middleware;

export const config = {
  matcher: ['/super-admin/:path*', '/clinic-admin/:path*', '/doctor/:path*', '/patient/:path*'],
};