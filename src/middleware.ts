import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware to handle subdomain routing
export function middleware(req: NextRequest) {
  const username = req.nextUrl.username;

  // Check for the subdomain
  if (username === 'app') {
    const path = req.nextUrl.pathname;
    return NextResponse.redirect(new URL(`/dapp${path}`, req.url));
  }
  if (req.nextUrl.pathname.startsWith('/assets/')) {
    return NextResponse.next({
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  // Default behavior: continue to the original request
  return NextResponse.next();
}

// Specify the paths where the middleware applies
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
