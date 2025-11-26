"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Game } from '@/types/GameType';
import NominationGrid from '@/components/categoryNomination/NominationGrid';
import NextCategoryButton from '@/components/category/NextCategoryButton';

interface Category {
  id: number;
  name: string;
  slug: string;
  year: number;
  maxNominations: number;
  description?: string;
}

export default function CategoryNominationClient({
  slug,
  dict,
}: {
  slug: string;
  dict: any;
}) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [slug]);

  const pathname = usePathname();
  const locale = pathname?.split('/')?.[1] || 'fr';

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const categoryData = await apiClient.get<Category>(`/category/slug/${slug}`);
      // Ensure category belongs to current year (only redirect if year is known)
      const currentYear = new Date().getFullYear();
      if (typeof categoryData.year === 'number' && categoryData.year !== currentYear) {
        router.push('/user');
        return;
      }
      setCategory(categoryData);

      // Utiliser le nouvel endpoint qui applique le filtrage des restrictions
      const gamesData = await apiClient.get<Game[]>(`/category/slug/${slug}/games/${categoryData.year}`);
      setGames(gamesData || []);
    } catch (err: any) {
      console.error('Erreur chargement:', err);
      setError(err.response?.data?.message || (dict?.common?.error || 'Impossible de charger les données'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">{dict?.common?.loading || 'Chargement...'}</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">{dict?.common?.error || 'Oups, une erreur est survenue'}</h1>
          <p className="text-gray-400 mb-6">{error || 'Catégorie introuvable'}</p>
          <button onClick={() => router.push('/user')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">{dict?.common?.backToCategories || 'Retour aux catégories'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">{(category as any).translations?.[locale]?.title || category.name}</h1>
          {((category as any).translations?.[locale]?.description || category.description) && <p className="text-gray-400 text-lg mb-2">{(category as any).translations?.[locale]?.description || category.description}</p>}
          <div
            className="flex items-center justify-center gap-4 text-sm text-gray-500"
            style={{ transition: 'none', transform: 'none' }}
          >
            <span style={{ transition: 'none', transform: 'none' }}>Année : {category.year}</span>
            <span style={{ transition: 'none', transform: 'none' }}>•</span>
            <span style={{ transition: 'none', transform: 'none' }}>Max {category.maxNominations} nominations</span>
          </div>
        </div>

        <NominationGrid categoryId={category.id} games={games} maxNominations={category.maxNominations || 5} dict={dict} />
      </div>

      <NextCategoryButton currentSlug={category.slug} year={category.year} phase="nomination" targetPathPrefix="/user/category/nomination" fallbackPath="/user" dict={dict} />
    </div>
  );
}
