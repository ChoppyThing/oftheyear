import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  const subdomain = hostname
    .replace(/:\d+$/, '')
    .split('.')[0];
  
  if (subdomain === 'localhost' || subdomain === '127') {
    return NextResponse.next();
  }
  
  const response = NextResponse.next();
  response.headers.set('x-subdomain', subdomain);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
