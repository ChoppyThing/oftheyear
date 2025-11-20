'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import AnimatedBackground from '@/components/layout/AnimatedBackground';
import { getDictionary } from '@/lib/i18n';
import { Locale } from '@/i18n.config';

export default function VerifyPage() {
  const params = useParams();
  const locale = params.locale as Locale;
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    getDictionary(locale).then(setDict);
  }, [locale]);

  useEffect(() => {
    if (!token || !dict) return;

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify?token=${token}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || dict.verify.error);
        }

        document.cookie = `authToken=${data.token}; path=/; max-age=86400; SameSite=Strict`;
        
        setStatus('success');
        
        setTimeout(() => {
          window.location.href = `/${locale}`;
        }, 2000);
        
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : dict.verify.unknownError);
      }
    };

    verifyEmail();
  }, [token, locale, dict]);

  if (!dict) return null;

  if (status === 'loading') {
    return (
      <>
        <AnimatedBackground />
        <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-12 border border-white/20 text-center max-w-md">
            <div className="mb-6">
              <svg
                className="w-16 h-16 text-blue-400 mx-auto animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {dict.verify.loadingTitle}
            </h2>
            <p className="text-white/70">{dict.verify.loadingMessage}</p>
          </div>
        </div>
      </>
    );
  }

  if (status === 'success') {
    return (
      <>
        <AnimatedBackground />
        <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-12 border border-white/20 text-center max-w-md">
            <div className="mb-6">
              <svg
                className="w-16 h-16 text-green-400 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {dict.verify.successTitle}
            </h2>
            <p className="text-white/70 mb-2">{dict.verify.successMessage}</p>
            <p className="text-white/50 text-sm">{dict.verify.redirecting}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-12 border border-white/20 text-center max-w-md">
          <div className="mb-6">
            <svg
              className="w-16 h-16 text-red-400 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {dict.verify.errorTitle}
          </h2>
          <p className="text-white/70 mb-6">{message}</p>
          <a
            href={`/${locale}/login`}
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            {dict.verify.backToLogin}
          </a>
        </div>
      </div>
    </>
  );
}
