import { getDictionary } from '@/lib/i18n';
import { Locale } from '@/i18n.config';
import CategoryNominationClient from '@/components/categoryNomination/CategoryNominationClient';
import { categoryService } from '@/services/category/category';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: Locale; categorySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, categorySlug } = await params;
  const dict = await getDictionary(locale);
  const currentYear = new Date().getFullYear();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://game.oftheyear.eu';
  
  try {
    // Récupérer les informations de la catégorie
    const category = await categoryService.getCategoryBySlug(categorySlug);
    
    const title = dict?.category?.nomination?.meta?.title?.replace('{categoryName}', category.name)
      || category.name;
    const description = dict?.category?.nomination?.meta?.description
      ?.replace('{categoryName}', category.name)
      ?.replace('{year}', currentYear.toString())
      || `Vote for your favorite game in ${category.name}`;

    return {
      title,
      description,
      keywords: [category.name, 'GOTY', currentYear.toString(), 'vote', 'nomination', 'gaming', 'video games'],
      alternates: {
        canonical: `${baseUrl}/${locale}/user/category/nomination/${categorySlug}`,
        languages: {
          'en': `${baseUrl}/en/user/category/nomination/${categorySlug}`,
          'fr': `${baseUrl}/fr/user/category/nomination/${categorySlug}`,
          'es': `${baseUrl}/es/user/category/nomination/${categorySlug}`,
          'zh': `${baseUrl}/zh/user/category/nomination/${categorySlug}`,
        },
      },
      openGraph: {
        title,
        description,
        url: `${baseUrl}/${locale}/user/category/nomination/${categorySlug}`,
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
  } catch (error) {
    // Fallback si la catégorie n'est pas trouvée
    return {
      title: dict?.category?.nomination?.title || 'Category',
      description: dict?.category?.nomination?.meta?.description?.replace('{year}', currentYear.toString()) || 'Vote for your favorite games',
    };
  }
}

export default async function Page({ params }: Props) {
  const { locale, categorySlug } = await params;
  const dict = await getDictionary(locale);

  return <CategoryNominationClient slug={categorySlug} dict={dict} />;
}
 