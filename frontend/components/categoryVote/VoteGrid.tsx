'use client';

import { categoryVoteService } from '@/services/category/vote.service';
import { Game } from '@/types/GameType';
import { useState, useEffect } from 'react';

interface VoteGridProps {
  categorySlug: string;
  nominees: Game[];
  year: number;
  onVoteSuccess?: () => void;
}

export default function VoteGrid({ 
  categorySlug, 
  nominees, 
  year,
  onVoteSuccess 
}: VoteGridProps) {
  const [votedGameId, setVotedGameId] = useState<number | null>(null);
  const [processingGameId, setProcessingGameId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMyVote();
  }, [categorySlug, year]);

  const loadMyVote = async () => {
    try {
      const myVote = await categoryVoteService.getMyVote(categorySlug, year);
      setVotedGameId(myVote?.gameId || null);
    } catch (err) {
      console.error('Erreur chargement vote:', err);
      setVotedGameId(null);
    }
  };

  const handleVote = async (gameId: number) => {
    const isCurrentVote = votedGameId === gameId;

    setProcessingGameId(gameId);
    setError(null);

    try {
      if (isCurrentVote) {
        await categoryVoteService.removeVote(categorySlug, year);
        setVotedGameId(null);
      } else {
        await categoryVoteService.vote(categorySlug, gameId, year);
        setVotedGameId(gameId);

        if (onVoteSuccess) {
          setTimeout(() => {
            onVoteSuccess();
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du vote');
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingGameId(null);
    }
  };

  if (nominees.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        Aucun jeu nominé pour cette catégorie
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white">
          Votez pour votre jeu favori
        </h2>
        <div className="text-sm text-gray-400 mt-2">
          {votedGameId ? '✅ Vous avez voté !' : 'Aucun vote pour le moment'}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {votedGameId && !processingGameId && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-600 rounded-lg text-green-400 text-sm text-center">
          Vote enregistré ! Redirection vers la prochaine catégorie...
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {nominees.map((game) => {
          const isVoted = votedGameId === game.id;
          const isProcessing = processingGameId === game.id;

          return (
            <button
              key={game.id}
              onClick={() => handleVote(game.id)}
              disabled={isProcessing}
              className={`
                group relative rounded-lg overflow-hidden transition-all
                ${isVoted ? 'ring-4 ring-green-500 shadow-xl scale-105' : 'hover:shadow-lg hover:scale-105'}
                ${isProcessing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
              `}
            >
              <div className="relative aspect-[3/4] bg-gray-800">
                {game.image ? (
                  <img
                    src={`http://localhost:3000/${game.image}`}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs p-2">
                    Pas d'image
                  </div>
                )}

                {isVoted && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Voté
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  {isVoted ? (
                    <span className="text-white font-bold text-sm drop-shadow-lg">
                      Retirer mon vote
                    </span>
                  ) : (
                    <span className="text-white font-bold text-sm drop-shadow-lg">
                      Voter pour ce jeu
                    </span>
                  )}
                </div>

                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              <div className="p-2 sm:p-3 bg-gray-800">
                <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 text-white">
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
