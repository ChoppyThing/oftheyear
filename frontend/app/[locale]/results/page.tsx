import { getDictionary } from '@/lib/i18n';
import { Locale } from '@/i18n.config';
import ResultsClient from '@/components/results/ResultsClient';

export default async function ResultsPage({ params }: { params: Promise<{ locale: Locale }> }) {
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
