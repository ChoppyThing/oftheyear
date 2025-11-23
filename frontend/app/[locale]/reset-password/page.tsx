import React, { Suspense } from 'react';
import ResetPasswordForm from '@/components/reset-password/ResetPasswordForm';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/i18n';

export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <Suspense fallback={<div /> }>
      <ResetPasswordForm locale={locale} dict={dict} />
    </Suspense>
  );
}
