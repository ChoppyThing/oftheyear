'use client';

import { categoryNomineeService } from '@/services/category/nominee.service';
import { Game, GameStatus } from '@/types/GameType';
import { useState, useEffect } from 'react';

interface NominationGridProps {
  categoryId: number;
  games: Game[];
  maxNominations: number;
  dict?: any;
}

export default function NominationGrid({
  categoryId,
  games,
  maxNominations,
  dict,
}: NominationGridProps) {
  const [nominatedGameIds, setNominatedGameIds] = useState<number[]>([]);
  const [processingGameId, setProcessingGameId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNominations();
  }, [categoryId]);

  const loadNominations = async () => {
    try {
      const status = await categoryNomineeService.getUserNominations(categoryId);
      setNominatedGameIds(status.gameIds);
    } catch (err) {
      console.error('Erreur chargement nominations:', err);
    }
  };

  const handleToggleNomination = async (gameId: number) => {
    const isNominated = nominatedGameIds.includes(gameId);

    if (!isNominated && nominatedGameIds.length >= maxNominations) {
      setError(`Maximum ${maxNominations} nominations atteint`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setProcessingGameId(gameId);
    setError(null);

    try {
      if (isNominated) {
        await categoryNomineeService.removeNomination(categoryId, gameId);
        setNominatedGameIds((prev) => prev.filter((id) => id !== gameId));
      } else {
        await categoryNomineeService.addNomination(categoryId, gameId);
        setNominatedGameIds((prev) => [...prev, gameId]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la nomination');
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingGameId(null);
    }
  };

  const eligibleGames = (games || []).filter(
    (game) => game.status === GameStatus.Validated
  );

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white">
          {dict?.category?.nomination?.title || 'Votez pour vos jeux favoris'}
        </h2>
        <div className="text-sm text-gray-400 mt-2">
          {nominatedGameIds.length} / {maxNominations} nominations
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Message si pas de jeux */}
      {eligibleGames.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          {dict?.category?.nomination?.noValidatedGames || 'Aucun jeu validé disponible pour cette catégorie'}
        </div>
      )}

      {/* Grille de jeux */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {eligibleGames.map((game) => {
          const isNominated = nominatedGameIds.includes(game.id);
          const nominationIndex = nominatedGameIds.indexOf(game.id);
          const isProcessing = processingGameId === game.id;

          return (
            <button
              key={game.id}
              onClick={() => handleToggleNomination(game.id)}
              disabled={isProcessing}
              className={`
                group relative rounded-lg overflow-hidden transition-all
                ${isNominated ? 'ring-4 ring-blue-500 shadow-xl' : 'hover:shadow-lg'}
                ${isProcessing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
              `}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-gray-800">
                {game.image ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${game.image}`}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    {dict?.common?.noImage || 'Pas d\'image'}
                  </div>
                )}

                {/* Badge de position */}
                {isNominated && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
                    {nominationIndex + 1}
                  </div>
                )}

                {/* Overlay hover avec coeur */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  {isNominated ? (
                    <svg className="w-8 h-8 text-red-500 drop-shadow-lg fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </div>

                {/* Spinner */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {/* Infos jeu */}
              <div className="p-3 bg-gray-800">
                <h3 className="font-semibold text-sm line-clamp-2 text-white">
                  {game.name}
                </h3>
                {game.developer && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                    {game.developer}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
