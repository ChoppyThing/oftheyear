"use client";

import { useRouter } from "next/navigation";

export default function VoteFinishedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="text-center max-w-xl">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-white mb-4">Merci pour vos votes !</h1>
        <p className="text-gray-400 mb-6">
          Vous avez voté pour toutes les catégories. Rendez-vous pour les résultats !
        </p>

        {/*<div className="flex items-center justify-center gap-3">
          <button
            onClick={() => router.push('/user')}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Retour au tableau de bord
          </button>

          <button
            onClick={() => router.push('/results')}
            className="px-5 py-3 bg-transparent border border-gray-700 text-gray-200 rounded-lg hover:bg-gray-800"
          >
            Voir les résultats
          </button>
        </div>*/}
      </div>
    </div>
  );
}
