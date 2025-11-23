import { Locale, defaultLocale, locales } from '@/i18n.config';
import { cookies } from 'next/headers';

const dictionaries: Record<Locale, () => Promise<any>> = {
  en: () => import('@/locales/en.json').then((module) => module.default),
  fr: () => import('@/locales/fr.json').then((module) => module.default),
  es: () => import('@/locales/es.json').then((module) => module.default),
  zh: () => import('@/locales/zh.json').then((module) => module.default),
};

export const getDictionary = async (localeInput?: any) => {
  // Support flexible inputs: string locale, object { locale }, or Promise that resolves to either
  try {
    if (localeInput && typeof localeInput.then === 'function') {
      // It's a Promise (some pages pass `params` as a Promise), await and recurse
      const resolved = await localeInput;
      return getDictionary(resolved);
    }

    let localeStr: string | undefined;

    if (typeof localeInput === 'string') {
      localeStr = localeInput;
    } else if (localeInput && typeof localeInput === 'object' && typeof localeInput.locale === 'string') {
      localeStr = localeInput.locale;
    }

    let loc = (localeStr && (locales as readonly string[]).includes(localeStr)) ? (localeStr as Locale) : undefined;

    // If no locale from input, try cookie (server-side)
    if (!loc) {
      try {
        const cookieLocale = cookies().get('NEXT_LOCALE')?.value;
        if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
          loc = cookieLocale as Locale;
        }
      } catch (e) {
        // ignore: cookies() may fail in non-server context
      }
    }

    if (!loc) loc = defaultLocale;

    const dictionary = dictionaries[loc];
    if (!dictionary) {
      throw new Error(`Dictionary for locale "${loc}" not found`);
    }

    const dict = await dictionary();
    return dict;
  } catch (err) {
    // In case of unexpected error, fallback to default locale dictionary
    try {
      return await dictionaries[defaultLocale]();
    } catch (e) {
      throw err;
    }
  }
};
