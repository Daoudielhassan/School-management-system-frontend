import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole } from '@/types/auth';

const protectedRoutes: Record<string, UserRole[]> = {
  '/student': [UserRole.ETUDIANT],
  '/professor': [UserRole.PROFESSEUR],
  '/manager': [UserRole.MANAGER],
  '/admin': [UserRole.ADMINISTRATEUR],
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value as UserRole | undefined;

  // Check if the path is protected
  const isProtectedRoute = Object.keys(protectedRoutes).some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has required role
    const path = Object.keys(protectedRoutes).find((route) =>
      request.nextUrl.pathname.startsWith(route)
    );

    if (path && role && !protectedRoutes[path].includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // If user is authenticated and tries to access login page, redirect to appropriate dashboard
  if (token && role && request.nextUrl.pathname === '/login') {
    const dashboardPath = Object.keys(protectedRoutes).find(route => protectedRoutes[route].includes(role)) || '/';
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/student/:path*',
    '/professor/:path*',
    '/manager/:path*',
    '/admin/:path*',
    '/login',
  ],
};