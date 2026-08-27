import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public routes (no login required)
  const publicRoutes = ['/', '/login', '/register', '/reset-password', '/marketplace', '/product'];
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

  // Check for session cookie
  const session = request.cookies.get('sb-access-token')?.value;

  // If no session and trying to access protected route → redirect to login
  if (!session && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', path);
    return NextResponse.redirect(loginUrl);
  }

  // If session exists and trying to access login/register → redirect to dashboard
  if (session && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};