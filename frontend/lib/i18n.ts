import { Locale, defaultLocale } from '@/i18n.config';

const dictionaries: Record<Locale, () => Promise<any>> = {
  en: () => import('@/locales/en.json').then((module) => module.default),
  fr: () => import('@/locales/fr.json').then((module) => module.default),
  es: () => import('@/locales/es.json').then((module) => module.default),
  zh: () => import('@/locales/zh.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  const dictionary = dictionaries[locale];
  
  if (!dictionary) {
    throw new Error(`Dictionary for locale "${locale}" not found`);
  }

  try {
    const dict = await dictionary();
    return dict;
  } catch (error) {
    throw error;
  }
};
