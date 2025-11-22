import ProposeGameClient from '@/components/user/Game/ProposeGameClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proposer un jeu',
  description: 'Proposez un nouveau jeu pour les votes',
};

export default function ProposeGamePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Proposer un jeu</h1>
        <p className="text-gray-200">
          Suggérez un nouveau jeu pour la communauté (maximum 5 par an)
        </p>
      </div>

      <ProposeGameClient />
    </div>
  );
}
