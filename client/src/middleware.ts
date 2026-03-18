import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { ironSessionOptions } from '@/lib/sessionLib'

interface SessionData {
  isLoggedIn: boolean;
  userId?: string;
  accessToken?: string;
  username?: string;
  name?: string;
  email?: string;
  roles?: string[];
  profileImageUrl?: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle root path redirects
  if (pathname === '/') {
    try {
      const session = await getIronSession<SessionData>(request, new NextResponse(), ironSessionOptions)
      if (!session.isLoggedIn) {
        return NextResponse.redirect(new URL('/login', request.url))
      } else {
        // Redirect to dashboard based on primary role
        const primaryRole = session.roles?.[0]
        const dashboardUrl = primaryRole === 'ADMIN' ? '/admin-dashboard' : primaryRole === 'STAFF' ? '/staff/dashboard' : '/student/dashboard'
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
      }
    } catch (error) {
      console.error('Middleware error on root redirect:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/api']
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // API routes are handled separately
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  try {
    const session = await getIronSession<SessionData>(request, new NextResponse(), ironSessionOptions)

    // If user is not authenticated and trying to access protected route
    if (!session.isLoggedIn && !isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Note: Login/signup page redirection is handled by the page component itself
    // to avoid conflicts with programmatic navigation during login process

    // Role-based access control for dashboards
    if (pathname.startsWith('/admin-dashboard') && !session.roles?.includes('ADMIN')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (pathname.startsWith('/staff') && !session.roles?.includes('STAFF')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (pathname.startsWith('/student') && !session.roles?.includes('STUDENT')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Handle dashboard redirects
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to login for protected routes
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}
