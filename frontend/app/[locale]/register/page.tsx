import { getDictionary } from "@/lib/i18n";
import { Locale } from "@/i18n.config";
import RegisterForm from "@/components/register/RegisterForm";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <RegisterForm locale={locale} dict={dict} />;
}
