import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole } from '@/types/auth';
import { isTokenExpired } from '@/lib/utils';

const protectedRoutes: Record<string, UserRole[]> = {
  '/student': [UserRole.STUDENT],
  '/professor': [UserRole.INSTRUCTOR],
  '/manager': [UserRole.MANAGER],
  '/admin': [UserRole.ADMIN],
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value as UserRole | undefined;
  const mustChangePassword = request.cookies.get('mustChangePassword')?.value === 'true';
  const pathname = request.nextUrl.pathname;

  // /change-password: only accessible when authenticated AND mustChangePassword=true
  if (pathname === '/change-password') {
    if (!token || (token && isTokenExpired(token))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // If flag is already cleared, redirect to dashboard
    if (!mustChangePassword) {
      const dashboardPath =
        Object.keys(protectedRoutes).find((r) => role && protectedRoutes[r].includes(role)) || '/';
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
    return NextResponse.next();
  }

  // Check if the path is protected
  const isProtectedRoute = Object.keys(protectedRoutes).some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      response.cookies.delete('role');
      response.cookies.delete('userId');
      response.cookies.delete('mustChangePassword');
      return response;
    }

    // If mustChangePassword is set, force user to change password first
    if (mustChangePassword) {
      return NextResponse.redirect(new URL('/change-password', request.url));
    }

    // Check if user has required role
    const path = Object.keys(protectedRoutes).find((route) =>
      pathname.startsWith(route)
    );

    if (path && role && !protectedRoutes[path].includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // If user is authenticated and tries to access login page, redirect to appropriate dashboard
  if (token && role && pathname === '/login') {
    if (isTokenExpired(token)) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      response.cookies.delete('role');
      response.cookies.delete('userId');
      response.cookies.delete('mustChangePassword');
      return response;
    }

    // If mustChangePassword is set, stay on change-password
    if (mustChangePassword) {
      return NextResponse.redirect(new URL('/change-password', request.url));
    }

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
    '/change-password',
  ],
};