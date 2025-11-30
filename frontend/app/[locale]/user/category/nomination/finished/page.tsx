import { getDictionary } from '@/lib/i18n';
import { Locale } from '@/i18n.config';
import Link from 'next/link';

type Props = { params: { locale: Locale } };

export default async function Finished({ params }: Props) {
  const { locale } = params;
  const dict = await getDictionary(locale);

  const title = dict?.finishedNominations?.title || 'Félicitations !';
  const message = dict?.finishedNominations?.message || "Vous avez nommé des jeux pour toutes les catégories. Rendez-vous bientôt pour les votes finaux !";
  const ctaHome = dict?.finishedNominations?.ctaHome || 'Accueil';
  const ctaResults = dict?.finishedNominations?.ctaResults || 'Résultats';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-900 text-white">
      <div className="max-w-2xl bg-gray-800/70 rounded-lg p-8 text-center border border-gray-700">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="mb-6">{message}</p>

        <div className="flex justify-center gap-4">
          <Link href={`/${locale}`} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-md">{ctaHome}</Link>
          <Link href={`/${locale}/results`} className="px-4 py-2 border border-slate-600 rounded-md">{ctaResults}</Link>
        </div>
      </div>
    </div>
  );
}
