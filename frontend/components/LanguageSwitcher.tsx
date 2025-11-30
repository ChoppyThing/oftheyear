
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { locales, Locale, localeNames, localeFlags, defaultLocale } from '@/i18n.config';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleScrollOrResize() {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, left: rect.right - rect.width, width: rect.width });
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, []);

  const switchLocale = (newLocale: Locale) => {
    console.log('🔄 Switching locale');
    console.log('Current locale:', currentLocale);
    console.log('New locale:', newLocale);
    console.log('Current pathname:', pathname);

    // ✅ Retirer TOUTES les locales possibles du pathname
    let pathWithoutLocale = pathname;
    for (const locale of locales) {
      // Supprimer /locale au début du chemin
      const localePrefix = `/${locale}`;
      if (pathWithoutLocale.startsWith(localePrefix)) {
        pathWithoutLocale = pathWithoutLocale.slice(localePrefix.length);
        break; // Important : sortir après avoir trouvé
      }
    }

    // Si le chemin est vide, mettre '/'
    if (!pathWithoutLocale || pathWithoutLocale === '') {
      pathWithoutLocale = '/';
    }

    console.log('Path without locale:', pathWithoutLocale);

    // ✅ Construire la nouvelle URL
    let newPath: string;
    if (newLocale === defaultLocale) {
      // Anglais = pas de préfixe
      newPath = pathWithoutLocale;
    } else {
      // Autres langues = ajouter le préfixe
      newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    }

    console.log('New path:', newPath);

    // ✅ Sauvegarder la préférence
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    
    setIsOpen(false);
    router.push(newPath);
  };

  return (
    <div className="relative" >
      <button
        ref={buttonRef}
        onClick={() => {
          const willOpen = !isOpen;
          setIsOpen(willOpen);
          if (willOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({ top: rect.bottom + 8, left: rect.left, width: rect.width });
          }
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        aria-label="Change language"
      >
        <span className="text-xl">{localeFlags[currentLocale]}</span>
        <span className="text-white text-sm">{localeNames[currentLocale]}</span>
        <svg
          className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && coords && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: coords.top, left: coords.left, minWidth: coords.width }}
          className="rounded-lg bg-gray-800 shadow-lg border border-gray-700 overflow-hidden z-50"
        >
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLocale(locale)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors ${
                locale === currentLocale ? 'bg-gray-700' : ''
              }`}
              disabled={locale === currentLocale} // ✅ Désactiver la locale actuelle
            >
              <span className="text-xl">{localeFlags[locale]}</span>
              <span className="text-white text-sm">{localeNames[locale]}</span>
              {locale === currentLocale && (
                <svg className="w-4 h-4 text-blue-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
