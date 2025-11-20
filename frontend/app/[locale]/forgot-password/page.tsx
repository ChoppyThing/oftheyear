import ForgotPasswordForm from '@/components/forgot-password/ForgotPasswordForm';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/i18n';

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <ForgotPasswordForm locale={locale} dict={dict} />;
}
