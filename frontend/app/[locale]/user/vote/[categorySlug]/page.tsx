import { getDictionary } from "@/lib/i18n";
import { Locale } from "@/i18n.config";
import CategoryVoteClient from "@/components/categoryVote/CategoryVoteClient";

export default async function Page({ params }: { params: Promise<{ locale: Locale; categorySlug: string }> }) {
  const { locale, categorySlug } = await params;
  const dict = await getDictionary(locale);

  return <CategoryVoteClient categorySlug={categorySlug} dict={dict} />;
}
