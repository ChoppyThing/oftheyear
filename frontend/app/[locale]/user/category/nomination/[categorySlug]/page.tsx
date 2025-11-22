'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Game } from '@/types/GameType';
import { apiClient } from '@/lib/api-client';
import NominationGrid from '@/components/categoryNomination/NominationGrid';

interface Category {
  id: number;
  name: string;
  slug: string;
  year: number;
  maxNominations: number;
  description?: string;
}

export default function UserCategoryNominationPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.categorySlug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Récupérer la catégorie par slug
      const categoryData = await apiClient.get<Category>(`/category/slug/${slug}`);
      setCategory(categoryData);

      // 2. Récupérer tous les jeux de l'année de la catégorie
      const gamesData = await apiClient.get<Game[]>(`/game?year=${categoryData.year}`);
      setGames(gamesData || []);

    } catch (err: any) {
      console.error('Erreur chargement:', err);
      setError(err.response?.data?.message || 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Oups, une erreur est survenue
          </h1>
          <p className="text-gray-400 mb-6">
            {error || 'Catégorie introuvable'}
          </p>
          <button
            onClick={() => router.push('/fr/user/categories')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Retour aux catégories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-400 text-lg mb-2">
              {category.description}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>Année : {category.year}</span>
            <span>•</span>
            <span>Max {category.maxNominations} nominations</span>
          </div>
        </div>

        {/* Grille de nomination */}
        <NominationGrid
          categoryId={category.id}
          games={games}
          maxNominations={category.maxNominations || 5}
        />
      </div>
    </div>
  );
}
