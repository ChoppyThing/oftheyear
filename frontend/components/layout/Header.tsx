'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import AnimatedBackground from './AnimatedBackground';
import UserButton from '../UserButton';
import { Locale, defaultLocale } from '@/i18n.config';
import LanguageSwitcher from '../LanguageSwitcher';
import { getPhaseInfo } from '@/lib/phases';

export default function Header({ locale, dict }: { locale: Locale; dict: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  
  // Calculer la phase actuelle
  const phaseInfo = useMemo(() => getPhaseInfo(dict), [dict]);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0062bd] shadow-lg backdrop-blur-sm uppercase font-bold">
      <div className="absolute">
        <AnimatedBackground />
      </div>

      <nav className="container mx-auto px-4">
        <div className="flex h-22 items-center justify-between">
          <div className="flex-1 md:block hidden"></div>

          {/* Navigation Links - Center (Desktop) */}
          <div className="hidden md:flex items-center space-x-16 flex-1 justify-center font-bold">
            <Link 
              href={`${prefix}/`}
              className="text-white hover:text-blue-200 transition-colors duration-350 text-lg tracking-wider"
            >
              {dict.header.home}
            </Link>
            <Link 
              href={`${prefix}/about`}
              className="text-white hover:text-blue-200 transition-colors duration-350 text-lg tracking-wider"
            >
              {dict.header.about}
            </Link>
            
            {/* Lien dynamique selon la phase */}
            <Link 
              href={`${prefix}/${phaseInfo.link}`}
              className="text-white hover:text-blue-200 transition-colors duration-350 text-lg tracking-wider"
            >
              {phaseInfo.label}
            </Link>
          </div>

          <div className="hidden md:flex items-center flex-1 justify-end">
            <LanguageSwitcher currentLocale={locale} />
            <UserButton dict={dict} />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white focus:outline-none ml-auto"
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
          <div className="md:hidden py-4 border-t border-blue-900">
            <div className="flex flex-col space-y-3 text-center">
              <Link 
                href={`${prefix}/`}
                className="text-white hover:text-blue-200 transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {dict.header.home}
              </Link>
              <Link 
                href={`${prefix}/about`}
                className="text-white hover:text-blue-200 transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {dict.header.about}
              </Link>
              
              {/* Lien dynamique mobile */}
              <Link 
                href={`${prefix}/${phaseInfo.link}`}
                className="text-white hover:text-blue-200 transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {phaseInfo.label}
              </Link>
              
              <div className="pt-2">
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
