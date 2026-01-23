'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { gameUserService } from '@/services/user/gameUserService';
import { getCurrentPhase } from '@/lib/phases';

export default function GamePageClient({ locale, dict }: any) {
  const params = useParams();
  const id = params?.id as string | undefined;
  const clientLocale = (locale as string) || (params as any)?.locale || 'fr';
  const [game, setGame] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!id) {
        setError('Missing game id');
        setLoading(false);
        return;
      }
      try {
        const g = await gameUserService.getById(id);
        if (mounted) setGame(g);
      } catch (e: any) {
        if (mounted) setError(e.message || JSON.stringify(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false };
  }, [id]);

  const currentYear = new Date().getFullYear();
  const phase = getCurrentPhase();

  if (loading) return <div className="text-white">Chargement...</div>;
  if (error) return (
    <div className="mb-6 p-4 bg-red-700/10 border border-red-700/20 rounded">
      <p className="font-semibold text-red-300">Erreur lors de la récupération du jeu</p>
      <pre className="text-xs text-white whitespace-pre-wrap max-h-48 overflow-auto">{error}</pre>
    </div>
  );

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          {game?.image ? (
            <div className="w-full aspect-4/3 relative bg-gray-700/20 rounded-lg overflow-hidden">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}/${game.image}`}
                alt={game.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
                unoptimized={true}
              />
            </div>
          ) : (
            <div className="w-full aspect-4/3 bg-gray-700/20 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">{dict.common.noImage}</span>
            </div>
          )}
        </div>

        <div className="col-span-2">
          <h1 className="text-3xl font-bold mb-2 text-white">{game?.name || '—'}</h1>
          <p className="text-sm text-white mb-4">{game?.year || '—'}</p>
          <div className="prose text-white mb-6">{game?.description}</div>

          {game?.links && game.links.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-white">{dict.game?.linksTitle || 'Liens du jeu'}</h2>
              <ul className="list-disc list-inside space-y-1">
                {game.links.map((l: { label: string; url: string }, idx: number) => (
                  <li key={idx}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline">
                      {l.label || l.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {game?.year === currentYear && (
            <div className="mt-6">
              <Link href={phase === 'vote' ? `/${clientLocale}/vote` : `/${clientLocale}/category`} className="inline-block px-5 py-3 bg-primary-600 text-white rounded-lg font-semibold">
                {dict?.game?.voteNow || 'Votez maintenant pour ce jeu !'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
