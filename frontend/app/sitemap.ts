import { MetadataRoute } from 'next';
import { locales } from '@/i18n.config';

const BASE_URL = 'https://game.oftheyear.eu';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.oftheyear.eu';

async function getCategories() {
  try {
    const response = await fetch(`${API_URL}/category/nominated`, {
      next: { revalidate: 3600 }, // Revalider toutes les heures
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch categories for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories();
  const currentYear = new Date().getFullYear();

  // Pages statiques principales
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/about', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/category', priority: 0.95, changeFrequency: 'daily' as const },
    { path: '/results', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/login', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/register', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/legal', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  // Générer les URLs pour chaque locale
  const staticUrls = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  );

  // URLs des catégories dynamiques (page nomination)
  const categoryUrls = locales.flatMap((locale) =>
    categories.map((category: { slug: string; updatedAt: string; name: string }) => ({
      url: `${BASE_URL}/${locale}/user/category/nomination/${category.slug}`,
      lastModified: new Date(category.updatedAt),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))
  );

  return [...staticUrls, ...categoryUrls];
}
