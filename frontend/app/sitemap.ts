import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_HOST || 'https://oftheyear.eu';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.oftheyear.eu';

async function getCategories() {
  try {
    const response = await fetch(`${API_URL}/category`, {
      next: { revalidate: 3600 }, // Revalider toutes les heures
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch categories for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories();
  const locales = ['fr', 'en'];

  // Pages statiques
  const staticPages = [
    '',
    '/about',
    '/login',
    '/register',
    '/propose',
    '/results',
    '/cgu',
    '/confidentiality',
    '/legal',
  ];

  // Générer les URLs pour chaque locale
  const staticUrls = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1.0 : 0.8,
    }))
  );

  // URLs des catégories dynamiques
  const categoryUrls = locales.flatMap((locale) =>
    categories.map((category: { slug: string; updatedAt: string }) => ({
      url: `${BASE_URL}/${locale}/category/${category.slug}`,
      lastModified: new Date(category.updatedAt),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))
  );

  return [...staticUrls, ...categoryUrls];
}
