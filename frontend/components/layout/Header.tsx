'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
import UserButton from '../UserButton';
import { Locale, defaultLocale } from '@/i18n.config';
import LanguageSwitcher from '../LanguageSwitcher';
import { getPhaseInfo } from '@/lib/phases';
import { usePathname } from 'next/navigation';

export default function Header({ locale, dict }: { locale: Locale; dict: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  // Calculer la phase actuelle
  const phaseInfo = useMemo(() => getPhaseInfo(dict), [dict]);

  // Fermer le menu au changement de page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Fermer le menu au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-800 bg-opacity-80 shadow-lg backdrop-blur-sm uppercase font-bold">
      <nav className="container mx-auto px-4 relative z-10" ref={menuRef}>
        <div className="flex items-center justify-between">
          <div className="flex-1 md:block hidden"></div>

          {/* Navigation Links - Center (Desktop) */}
          <div className="hidden md:flex items-stretch flex-1 justify-center font-bold">
            <Link 
              href={`${prefix}/`}
              className="flex items-center px-10 py-6 text-white transition-colors text-lg tracking-wider whitespace-nowrap"
            >
              {dict.header.home}
            </Link>
            <Link 
              href={`${prefix}/about`}
              className="flex items-center px-10 py-6 text-white transition-colors text-lg tracking-wider whitespace-nowrap"
            >
              {dict.header.about}
            </Link>
            
            {/* Lien dynamique selon la phase */}
            <Link 
              href={`${prefix}/${phaseInfo.link}`}
              className="flex items-center px-10 py-6 text-white transition-colors text-lg tracking-wider whitespace-nowrap"
            >
              {phaseInfo.label}
            </Link>
          </div>

          <div className="hidden md:flex items-center flex-1 justify-end py-4">
            <LanguageSwitcher currentLocale={locale} />
            <UserButton dict={dict} />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white focus:outline-none ml-auto py-6"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-blue-900">
            <div className="flex flex-col">
              <Link 
                href={`${prefix}/`}
                className="block w-full text-white transition-colors font-medium py-6 px-4 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {dict.header.home}
              </Link>
              <Link 
                href={`${prefix}/about`}
                className="block w-full text-white transition-colors font-medium py-6 px-4 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {dict.header.about}
              </Link>
              
              {/* Lien dynamique mobile */}
              <Link 
                href={`${prefix}/${phaseInfo.link}`}
                className="block w-full text-white transition-colors font-medium py-6 px-4 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {phaseInfo.label}
              </Link>
              
              <div className="px-4 py-4">
                <LanguageSwitcher currentLocale={locale} />
                <UserButton dict={dict} />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
