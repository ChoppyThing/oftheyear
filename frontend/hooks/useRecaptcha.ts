'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

export function useRecaptcha() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      console.error('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured');
      return;
    }

    // Vérifier si le script est déjà chargé
    if (window.grecaptcha) {
      setIsLoaded(true);
      return;
    }

    // Charger le script reCAPTCHA v3
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.grecaptcha.ready(() => {
        setIsLoaded(true);
      });
    };
    script.onerror = () => {
      console.error('Failed to load reCAPTCHA script');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup si nécessaire
      const scriptElement = document.querySelector(
        `script[src^="https://www.google.com/recaptcha/api.js"]`
      );
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, []);

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    if (!isLoaded || !window.grecaptcha) {
      console.error('reCAPTCHA not loaded yet');
      return null;
    }

    if (!RECAPTCHA_SITE_KEY) {
      console.error('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      return null;
    }
  };

  return { isLoaded, executeRecaptcha };
}
