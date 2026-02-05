import type { NextRequest } from 'next/server';
import { proxy } from './proxy';

export default function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = {
  matcher: ['/((?!_next|api|internal|favicon.ico|.*\\..*).*)'],
};
