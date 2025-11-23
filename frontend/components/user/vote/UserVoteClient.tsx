"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { categoryVoteService } from '@/services/category/vote.service';

interface Category {
  id: number;
  slug: string;
  name: string;
  year: number;
}

export default function UserVoteClient({ dict }: { dict: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    findNextCategory();
  }, []);

  const findNextCategory = async () => {
    try {
      setLoading(true);

      const currentYear = new Date().getFullYear();

      const allCategories = await apiClient.get<Category[]>(`/category?year=${currentYear}`);

      if (!allCategories || allCategories.length === 0) {
        setError(dict?.category?.vote?.noAvailable || 'Aucune catégorie disponible pour voter');
        return;
      }

      const votedCategories = await categoryVoteService.getMyVotedCategories(currentYear);
      const votedSlugs = new Set((votedCategories || []).map(c => c.slug));

      // If a previous navigation attempt failed for a specific category (e.g. 404),
      // we store it in sessionStorage under 'vote_attempted' and skip it to avoid loops.
      const attempted = typeof window !== 'undefined' ? sessionStorage.getItem('vote_attempted') : null;

      // Find the next category that isn't voted and wasn't just attempted.
      let nextCategory = allCategories.find(cat => !votedSlugs.has(cat.slug) && cat.slug !== attempted);

      // If none found but there is an attempted one that is not voted, fall back to it
      // (prevents permanently skipping if it becomes valid).
      if (!nextCategory) {
        const fallback = allCategories.find(cat => !votedSlugs.has(cat.slug));
        // If the only remaining category is the one we just attempted, avoid retry loop.
        if (fallback && attempted && fallback.slug === attempted) {
          router.push('/user/vote/finished');
          return;
        }
        nextCategory = fallback;
      }

      if (nextCategory) {
        const target = `/user/vote/${nextCategory.slug}`;
        // Avoid pushing if we're already on the target
        if (pathname !== target) {
          // mark as attempted to avoid immediate retry loops
          try {
            sessionStorage.setItem('vote_attempted', nextCategory.slug);
          } catch (e) {
            // ignore storage errors
          }
          router.push(target);
        }
      } else {
        router.push('/user/vote/finished');
      }

    } catch (err: any) {
      console.error('Erreur recherche catégorie:', err);
      setError(dict?.common?.error || 'Impossible de charger les catégories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 mt-4">{dict?.category?.vote?.searchingNext || 'Recherche de la prochaine catégorie...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">{error.includes('🎉') ? '🎉' : '😕'}</div>
          <h1 className="text-2xl font-bold text-white mb-4">{error.includes('🎉') ? (dict?.category?.vote?.congrats || 'Félicitations !') : (dict?.category?.vote?.oops || 'Oups !')}</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={() => router.push('/user')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">{dict?.common?.backToCategories || 'Retour au tableau de bord'}</button>
        </div>
      </div>
    );
  }

  return null;
}
