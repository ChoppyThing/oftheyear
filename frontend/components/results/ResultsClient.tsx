"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from '@/lib/api-client';

export default function ResultsClient({ dict, locale }: { dict: any; locale?: string }) {
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchResults = async () => {
      try {
        setLoading(true);
        const year = new Date().getFullYear();
        const res = await apiClient.get<any[]>(`/results`, { params: { year, locale } });
        if (mounted) setResults(res || []);
      } catch (err: any) {
        console.error('Error fetching results (client):', err);
        if (mounted) setError(dict?.results?.fetchError || 'Impossible de charger les résultats');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchResults();

    return () => { mounted = false; };
  }, [dict]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-40 p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mr-4"></div>
        <div className="text-gray-400">{dict?.results?.loading || 'Chargement...'}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-gray-400">{error}</div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">{dict?.results?.noResults || 'Aucun résultat pour le moment'}</div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-700">
        {results.map((r) => (
          <li key={r.categoryId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
            <div className="flex-1">
              <div className="font-semibold text-lg truncate">{r.categoryName}</div>
              <div className="text-sm text-gray-400">{r.year}</div>
            </div>

            <div className="flex items-start sm:items-center gap-4 mt-2 sm:mt-0">
              {r.winner ? (
                <>
                  <div className="w-full h-48 sm:w-16 sm:h-20 bg-gray-700 overflow-hidden rounded-md shrink-0">
                    {r.winner.gameImage ? (
                      <img src={`${r.winner.gameImage.startsWith('http') ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/')}${r.winner.gameImage}`} alt={r.winner.gameName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No image</div>
                    )}
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="font-medium truncate max-w-[40ch]">{r.winner.gameName}</div>
                    <div className="text-sm text-gray-400">{(r.winner.finalVoteCount ?? 0) + ' votes'}</div>
                  </div>
                </>
              ) : (
                <div className="text-gray-400">{dict?.results?.noWinner || 'Pas de gagnant'}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
