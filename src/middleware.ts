import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    const role = token.role;

    // Admin rotaları sadece ADMIN içindir
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
      if (role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Öğretmen rotaları TEACHER veya ADMIN içindir
    if (path.startsWith('/teacher') || path.startsWith('/api/teacher')) {
      if (role !== 'TEACHER' && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Öğrenci rotaları STUDENT veya ADMIN içindir
    if (path.startsWith('/student') || path.startsWith('/api/student')) {
      if (role !== 'STUDENT' && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/',
    },
  }
);

export const config = {
  matcher: [
    '/student/:path*',
    '/teacher/:path*',
    '/admin/:path*',
    '/api/student/:path*',
    '/api/teacher/:path*',
    '/api/admin/:path*',
  ],
};
