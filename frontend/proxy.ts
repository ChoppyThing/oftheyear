import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, Locale } from './i18n.config';

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) {
    return defaultLocale;
  }

  // Parser les langues acceptées avec leurs q-values (ex: "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7")
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, qValue] = lang.trim().split(';q=');
      const quality = qValue ? parseFloat(qValue) : 1.0;
      const shortLocale = locale.split('-')[0].toLowerCase(); // fr-FR → fr
      return { locale: shortLocale, quality };
    })
    .sort((a, b) => b.quality - a.quality); // Trier par préférence (q-value décroissant)

  // Trouver la première locale supportée
  for (const { locale } of languages) {
    if (locales.includes(locale as Locale)) {
      return locale;
    }
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========== 1. IGNORER LES FICHIERS STATIQUES ==========
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // ========== 2. PROTECTION DES ROUTES /user ==========
  const token = request.cookies.get('authToken')?.value;
  
  // Extraire la locale du pathname si présente
  const pathnameWithoutLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
    ? pathname.split('/').slice(2).join('/') // Enlever la locale
    : pathname;

  // Si chemin commence par /user et pas de token → rediriger vers login
  if (pathnameWithoutLocale.startsWith('user') && !token) {
    const locale = getLocale(request);
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // ========== 3. GESTION I18N ==========
  
  // Vérifier si le pathname a déjà une locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Racine '/' → rediriger vers la locale détectée du navigateur
  if (pathname === '/') {
    const locale = getLocale(request);
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Autre chemin sans locale → ajouter la locale détectée
  const locale = getLocale(request);
  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
};
