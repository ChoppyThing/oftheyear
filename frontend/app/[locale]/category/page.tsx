import CategoriesClient from "@/components/categories/CategoriesClient";
import { getDictionary } from '@/lib/i18n';
import type { Metadata } from 'next';
import { Locale } from '@/i18n.config';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const currentYear = new Date().getFullYear();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://game.oftheyear.eu';
  
  const title = dict?.category?.index?.meta?.title?.replace('{year}', currentYear.toString()) 
    || `Game of the Year: GOTY ${currentYear} Categories`;
  const description = dict?.category?.index?.meta?.description?.replace('{year}', currentYear.toString())
    || `Discover all GOTY ${currentYear} categories!`;

  return {
    title,
    description,
    keywords: ['GOTY categories', 'game categories', currentYear.toString(), 'vote', 'gaming awards', 'best games', locale === 'fr' ? 'catégories' : ''],
    alternates: {
      canonical: `${baseUrl}/${locale}/category`,
      languages: {
        'en': `${baseUrl}/en/category`,
        'fr': `${baseUrl}/fr/category`,
        'es': `${baseUrl}/es/category`,
        'zh': `${baseUrl}/zh/category`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/category`,
      type: 'website',
      locale: locale === 'en' ? 'en_US' : locale === 'fr' ? 'fr_FR' : locale === 'es' ? 'es_ES' : 'zh_CN',
      siteName: 'Game of the Year',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {dict?.category?.index?.title || 'Catégories de vote'}
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          {dict?.category?.index?.description || 'Découvrez toutes les catégories disponibles pour voter pour vos jeux préférés'}
        </p>
      </div>

      <CategoriesClient dict={dict} />
    </div>
  );
}
