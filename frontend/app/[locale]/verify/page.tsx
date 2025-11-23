import React, { Suspense } from 'react';
import AnimatedBackground from '@/components/layout/AnimatedBackground';
import { getDictionary } from '@/lib/i18n';
import { Locale } from '@/i18n.config';
import VerifyClient from '@/components/verify/VerifyClient';

export default async function VerifyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <>
      <AnimatedBackground />
      <Suspense fallback={<div />}>
        <VerifyClient locale={locale} dict={dict} />
      </Suspense>
    </>
  );
}
