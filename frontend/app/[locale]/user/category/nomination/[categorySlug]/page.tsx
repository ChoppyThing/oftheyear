import { getDictionary } from '@/lib/i18n';
import { Locale } from '@/i18n.config';
import CategoryNominationClient from '@/components/categoryNomination/CategoryNominationClient';

export default async function Page({ params }: { params: Promise<{ locale: Locale; categorySlug: string }> }) {
  const { locale, categorySlug } = await params;
  const dict = await getDictionary(locale);

  return <CategoryNominationClient slug={categorySlug} dict={dict} />;
}
 