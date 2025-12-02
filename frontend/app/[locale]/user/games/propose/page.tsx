import ProposeGameClient from '@/components/user/Game/ProposeGameClient';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Proposer un jeu',
  description: 'Proposez un nouveau jeu pour les votes',
};

type Props = { params: Promise<{ locale: string }> };

export default async function ProposeGamePage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{dict?.user?.proposeGame || 'Proposer un jeu'}</h1>
        <p className="text-gray-200">
          {dict?.about?.proposal?.games?.description || 'Suggérez un nouveau jeu pour la communauté (maximum 5 par an)'}
        </p>
      </div>

      <ProposeGameClient dict={dict} />
    </div>
  );
}
