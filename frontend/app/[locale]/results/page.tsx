import { getDictionary } from '@/lib/i18n';
import { Locale, locales } from '@/i18n.config';
import ResultsClient from '@/components/results/ResultsClient';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const currentYear = new Date().getFullYear();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://game.oftheyear.eu';

  const title = dict?.results?.page?.title || 'Results';
  const description = dict?.results?.page?.description || `Discover the winners of GOTY ${currentYear}`;

  return {
    title,
    description,
    keywords: ['GOTY results', 'winners', currentYear.toString(), 'game awards', 'best games', 'gaming'],
    alternates: {
      canonical: `${baseUrl}/${locale}/results`,
      languages: Object.fromEntries(
        locales.map(loc => [loc, `${baseUrl}/${loc}/results`])
      ),
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${baseUrl}/${locale}/results`,
      siteName: 'Game of the Year',
      locale: locale === 'en' ? 'en_US' : locale === 'fr' ? 'fr_FR' : locale === 'es' ? 'es_ES' : 'zh_CN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ResultsPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{dict?.results?.page?.title || 'Résultats'}</h1>
        <p className="text-gray-400 mb-6">{dict?.results?.page?.description || 'Les jeux élus par catégorie pour cette année.'}</p>

        <ResultsClient dict={dict} locale={locale} />
      </div>
    </div>
  );
}
