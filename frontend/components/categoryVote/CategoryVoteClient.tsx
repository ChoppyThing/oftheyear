"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { categoryVoteService } from "@/services/category/vote.service";
import { Game } from "@/types/GameType";

interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  year: number;
}

export default function CategoryVoteClient({
  categorySlug,
  dict,
}: {
  categorySlug: string;
  dict: any;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')?.[1] || 'fr';

  const [category, setCategory] = useState<Category | null>(null);
  const [nominees, setNominees] = useState<Game[]>([]);
  const [votedGameId, setVotedGameId] = useState<number | null>(null);
  const [processingGameId, setProcessingGameId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    if (categorySlug) loadData();
  }, [categorySlug]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const categoryData = await apiClient.get<Category>(
        `/category/slug/${categorySlug}`
      );
      // Ensure category belongs to current year (only redirect if year is known)
      const currentYear = new Date().getFullYear();
      if (typeof categoryData.year === 'number' && categoryData.year !== currentYear) {
        // Do not display categories from previous years — redirect to vote list
        router.push('/user/vote');
        return;
      }
      setCategory(categoryData);

      // If this category loads successfully, clear any 'attempted' marker
      try {
        if (typeof window !== 'undefined') {
          const attempted = sessionStorage.getItem('vote_attempted');
          if (attempted && attempted === categoryData.slug) {
            sessionStorage.removeItem('vote_attempted');
          }
        }
      } catch (e) {
        // ignore storage errors
      }

      const nomineesData = await apiClient.get<Game[]>(
        `/category-nominee/category/${categorySlug}/finalists?year=${categoryData.year}`
      );
      setNominees(nomineesData);

      const myVote = await categoryVoteService.getMyVote(
        categorySlug,
        categoryData.year
      );
      setVotedGameId(myVote?.gameId || null);
    } catch (err) {
      console.error("Erreur chargement:", err);
      setError(dict?.common?.error || "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  const handleNextCategoryClick = async () => {
    if (!category) return;
    try {
      setNavigating(true);

      const [allCategories, votedCategories] = await Promise.all([
        apiClient.get<Category[]>(`/category?year=${category.year}`),
        categoryVoteService.getMyVotedCategories(category.year),
      ]);

      const votedSlugs = new Set((votedCategories || []).map((c) => c.slug).filter(Boolean));
      votedSlugs.add(category.slug);

      const remaining = allCategories.filter((c) => !votedSlugs.has(c.slug));

      if (remaining.length > 0) {
        router.push(`/user/vote/${remaining[0].slug}`);
      } else {
        router.push('/user/vote/finished');
      }
    } catch (err) {
      console.error('Erreur navigation next category:', err);
      router.push('/user/vote');
    } finally {
      setNavigating(false);
    }
  };

  const handleVote = async (gameId: number) => {
    if (!category || processingGameId) return;

    try {
      setProcessingGameId(gameId);

      if (votedGameId === gameId) {
        await categoryVoteService.removeVote(categorySlug, category.year);
        setVotedGameId(null);
      } else {
        await categoryVoteService.vote(categorySlug, gameId, category.year);
        setVotedGameId(gameId);

        // Après vote, chercher la prochaine catégorie non votée et y rediriger
        try {
          const [allCategories, votedCategories] = await Promise.all([
            apiClient.get<Category[]>(`/category?year=${category.year}`),
            categoryVoteService.getMyVotedCategories(category.year),
          ]);

          const votedSlugs = new Set(
            (votedCategories || []).map((c) => c.slug).filter(Boolean)
          );
          votedSlugs.add(categorySlug);

          const remaining = allCategories.filter((c) => !votedSlugs.has(c.slug));

          setTimeout(() => {
            if (remaining.length > 0) {
              router.push(`/user/vote/${remaining[0].slug}`);
            } else {
              router.push('/user/vote/finished');
            }
          }, 1500);
        } catch (err) {
          console.error('Erreur navigation après vote:', err);
          setTimeout(() => router.push('/user/vote'), 1500);
        }
      }
    } catch (err: any) {
      console.error("Erreur vote:", err);
      alert(err.response?.data?.message || (dict?.common?.error ?? "Erreur lors du vote"));
    } finally {
      setProcessingGameId(null);
    }
  };

  const handleSkip = () => router.push("/user/vote");

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">{dict?.common?.loading || "Chargement..."}</p>
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
          <p className="text-gray-400 mb-6">{error || dict?.category?.vote?.notFound || 'Catégorie introuvable'}</p>
          <button
            onClick={() => router.push('/user/vote')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            {dict?.common?.backToCategories || 'Retour aux votes'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{(category as any).translations?.[locale]?.title || category.name}</h1>

          {((category as any).translations?.[locale]?.description || category.description) && (
            <p className="text-gray-400 text-lg">{(category as any).translations?.[locale]?.description || category.description}</p>
          )}

          <p className="text-sm text-gray-500 mt-2">Année : {category.year} • Slug : {categorySlug}</p>
        </div>

        {/* Bouton passer */}
        {/*<div className="mb-6">
          <button
            onClick={handleSkip}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            {dict?.category?.vote?.skipButton || 'Passer cette catégorie →'}
          </button>
        </div>*/}

        {/* Grille des jeux */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {nominees.map((item: any, index: number) => {
            const game = item?.game ?? item;
            const isVoted = votedGameId === game.id;
            const isProcessing = processingGameId === game.id;

            return (
              <button
                key={game.id ?? index}
                onClick={() => handleVote(game.id)}
                disabled={isProcessing}
                className="group relative bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform disabled:opacity-50"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-700 overflow-hidden">
                  {game.image ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${game.image}`}
                      alt={game.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      {dict?.common?.noImage || 'Pas d\'image'}
                    </div>
                  )}

                  {/* Badge "Voté" */}
                  {isVoted && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {dict?.category?.vote?.votedBadge || 'Voté'}
                    </div>
                  )}

                  {/* Overlay hover */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <span className="text-white font-bold text-sm drop-shadow-lg">
                      {isVoted ? (dict?.category?.vote?.removeVote || 'Retirer mon vote') : (dict?.category?.vote?.voteForThis || 'Voter pour ce jeu')}
                    </span>
                  </div>

                  {/* Spinner */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="p-2 sm:p-3 bg-gray-800">
                  <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 text-white">{game.name}</h3>

                  {game.developer && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{game.developer}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

          {nominees.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">{dict?.category?.vote?.noFinalists || 'Aucun jeu finalisé pour cette catégorie'}</p>
            </div>
          )}
        </div>

        {/* Fixed next category button (bottom-right) */}
        <button
          onClick={handleNextCategoryClick}
          disabled={navigating}
          aria-label={dict?.navigation?.nextAria || 'Passer à la catégorie suivante'}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-white/6 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm transition"
        >
          {navigating ? (
            <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-2a6 6 0 110-12V4a8 8 0 01-8 8z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
  );
}
