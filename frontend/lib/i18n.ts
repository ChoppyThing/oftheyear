import { Locale, defaultLocale } from '@/i18n.config';

const dictionaries: Record<Locale, () => Promise<any>> = {
  en: () => import('@/locales/en.json').then((module) => module.default),
  fr: () => import('@/locales/fr.json').then((module) => module.default),
  es: () => import('@/locales/es.json').then((module) => module.default),
  zh: () => import('@/locales/zh.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  console.log('🔍 [getDictionary] Requested locale:', locale);
  
  // ✅ Vérification stricte
  const dictionary = dictionaries[locale];
  
  if (!dictionary) {
    console.error(`❌ [getDictionary] Locale "${locale}" not found in dictionaries`);
    console.log('Available locales:', Object.keys(dictionaries));
    throw new Error(`Dictionary for locale "${locale}" not found`);
  }

  try {
    const dict = await dictionary();
    console.log('✅ [getDictionary] Loaded dictionary for:', locale);
    console.log('Has about section:', !!dict.about);
    return dict;
  } catch (error) {
    console.error(`❌ [getDictionary] Error loading dictionary for "${locale}":`, error);
    throw error;
  }
};
