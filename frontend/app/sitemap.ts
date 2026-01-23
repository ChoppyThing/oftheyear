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

async function getGamesForSitemap(year: number) {
  try {
    const response = await fetch(`${API_URL}/game?year=${year}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch games for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories();
  const currentYear = new Date().getFullYear();
  const games = await getGamesForSitemap(currentYear);

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

  // Game pages and their external links
  const gameUrls = locales.flatMap((locale) =>
    (games || []).flatMap((game: any) => {
      const page = {
        url: `${BASE_URL}/${locale}/games/${game.id}`,
        lastModified: new Date(game.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };

      const externalLinks = (game.links || []).map((l: any) => ({
        url: l.url,
        lastModified: new Date(game.updatedAt),
      }));

      return [page, ...externalLinks];
    })
  );

  return [...staticUrls, ...categoryUrls, ...gameUrls];
}
