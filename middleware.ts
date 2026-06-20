import { NextRequest, NextResponse } from 'next/server';

const tenantCache = new Map<string, { tenantId: string; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Prevent infinite loops when the middleware fetches the tenant resolver endpoint
  if (pathname.startsWith('/api/auth/resolve-tenant')) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  
  let tenantSlug = '';
  if (segments.length > 0) {
    const firstSegment = segments[0];
    const ignoredSegments = ['api', '_next', 'favicon.ico', 'logo.png', 'favicon.png', 'images', 'public', 'login', 'register', 'dashboard'];
    
    // Ignore static assets, next build files, and api routes
    if (!ignoredSegments.includes(firstSegment) && !firstSegment.includes('.')) {
      tenantSlug = firstSegment;
    }
  }

  // Clone headers
  const requestHeaders = new Headers(request.headers);
  let tenantId = '';

  if (tenantSlug) {
    const cached = tenantCache.get(tenantSlug);
    if (cached && cached.expiry > Date.now()) {
      tenantId = cached.tenantId;
    } else {
      try {
        // Fetch tenantId from the database resolver API
        const resolverUrl = new URL(`/api/auth/resolve-tenant?subdomain=${tenantSlug}`, request.url);
        const res = await fetch(resolverUrl.toString());
        
        if (res.ok) {
          const data = await res.json();
          tenantId = data.tenantId || '';
          if (tenantId) {
            tenantCache.set(tenantSlug, { tenantId, expiry: Date.now() + CACHE_TTL });
          }
        } else {
          // Invalid slug: redirect to home page as requested
          return NextResponse.redirect(new URL('/', request.url));
        }
      } catch (e) {
        console.warn('[Middleware] Failed to resolve tenantId for slug:', tenantSlug, e);
      }
    }
  }

  // Fallback for direct flat routes or API calls in local development if no slug present
  if (!tenantId) {
    const headerSubdomain = request.headers.get('x-tenant-subdomain') || 'shikkhadhara';
    const cached = tenantCache.get(headerSubdomain);
    if (cached && cached.expiry > Date.now()) {
      tenantId = cached.tenantId;
    } else {
      try {
        const resolverUrl = new URL(`/api/auth/resolve-tenant?subdomain=${headerSubdomain}`, request.url);
        const res = await fetch(resolverUrl.toString());
        if (res.ok) {
          const data = await res.json();
          tenantId = data.tenantId || '';
          if (tenantId) {
            tenantCache.set(headerSubdomain, { tenantId, expiry: Date.now() + CACHE_TTL });
          }
        }
      } catch (e) {
        console.warn('[Middleware] Failed default fallback tenantId resolution:', e);
      }
    }
  }

  // Inject headers
  if (tenantSlug) {
    requestHeaders.set('x-tenant-subdomain', tenantSlug);
  }
  if (tenantId) {
    requestHeaders.set('x-tenant-id', tenantId);
  }

  const token = request.cookies.get('token')?.value;

  // Perform route-based redirection/authorization check
  const actualPathname = tenantSlug 
    ? (pathname.substring(tenantSlug.length + 1) || '/') 
    : pathname;

  const publicRoutes = ['/login', '/register', '/'];

  if (publicRoutes.includes(actualPathname) || pathname.startsWith('/api/auth')) {
    // If tenantSlug is present, rewrite path internally to flat route
    if (tenantSlug) {
      const rewriteUrl = new URL(actualPathname, request.url);
      return NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders,
        },
      });
    }
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Protected routes
  if (actualPathname.startsWith('/dashboard') || (pathname.startsWith('/api') && !pathname.startsWith('/api/auth'))) {
    if (!token) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Rewrite internally if tenantSlug is present to support path-based multi-tenancy
  if (tenantSlug) {
    const rewriteUrl = new URL(actualPathname, request.url);
    return NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
