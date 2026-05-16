import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

// Routes that don't require authentication
const publicPatterns = ['/login', '/register', '/auth']

function isPublicPath(pathname: string): boolean {
  // Strip the locale prefix to get the bare path
  const segments = pathname.split('/')
  // pathname looks like /en/login or /login
  const withoutLocale =
    segments.length >= 3 && routing.locales.includes(segments[1] as 'en' | 'ka')
      ? '/' + segments.slice(2).join('/')
      : pathname

  return publicPatterns.some(
    (pattern) =>
      withoutLocale === pattern ||
      withoutLocale.startsWith(pattern + '/') ||
      withoutLocale.startsWith(pattern),
  )
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always run the intl middleware first (handles locale detection/redirect)
  const intlResponse = intlMiddleware(request)

  // For protected routes: since we use in-memory tokens (not cookies),
  // full auth protection happens client-side in the dashboard page.
  // Middleware only handles locale routing.
  // OAuth callback routes are always public.
  if (pathname.includes('/auth/callback') || isPublicPath(pathname)) {
    return intlResponse
  }

  return intlResponse
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (Next.js internals)
  // - _vercel (Vercel internals)
  // - all root files (e.g. favicon.ico)
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
}
