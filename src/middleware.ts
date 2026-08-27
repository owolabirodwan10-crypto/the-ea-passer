import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ✅ Public routes (no login required)
  const publicRoutes = ['/', '/login', '/register', '/reset-password', '/marketplace', '/product'];
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

  // ✅ Check for session cookie
  const accessToken = request.cookies.get('sb-access-token')?.value;

  // ✅ If no access token and trying to access protected route → redirect to login
  if (!accessToken && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', path);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ If access token exists and trying to access login/register → redirect to dashboard
  if (accessToken && (path === '/login' || path === '/register')) {
    // ✅ Check the 'next' parameter to see where they came from
    const nextParam = request.nextUrl.searchParams.get('next');
    const redirectTo = nextParam && !nextParam.startsWith('/login') ? nextParam : '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};