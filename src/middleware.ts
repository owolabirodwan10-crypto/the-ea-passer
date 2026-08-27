import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('sb-access-token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes (no login required)
  const publicRoutes = ['/', '/login', '/register', '/reset-password', '/marketplace', '/product'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If no session and trying to access protected route → redirect to login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If session exists and trying to access login/register → redirect to dashboard
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};