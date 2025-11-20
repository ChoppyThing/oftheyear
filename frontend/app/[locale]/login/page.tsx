import { getDictionary } from "@/lib/i18n";
import { Locale } from "@/i18n.config";
import LoginForm from "@/components/login/LoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <LoginForm locale={locale} dict={dict} />;
}
