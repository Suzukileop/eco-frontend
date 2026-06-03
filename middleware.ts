import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get('refresh_token');

  if (pathname.startsWith('/dashboard')) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Role-based access is enforced at the page level after client-side auth
  }

  return NextResponse.next();
}

/** Couvre /dashboard, /dashboard/ecosystem/*, /dashboard/requests/*, /dashboard/agent, etc. */
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
