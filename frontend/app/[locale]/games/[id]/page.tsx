import { getDictionary } from '@/lib/i18n';
import { Locale } from '@/i18n.config';
import dynamic from 'next/dynamic';

const GamePageClient = dynamic(() => import('./GamePageClient'));

type Props = { params: { locale: Locale; id: string } };

export default async function GamePage({ params }: Props) {
  const { locale } = params || { locale: 'fr' };
  const dict = await getDictionary(locale);

  // Render the client component which will use `useParams()` reliably in the browser
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Provide locale and dictionary to client via props */}
      {/* GamePageClient will extract id from useParams on the client */}
      <GamePageClient locale={locale} dict={dict} />
    </div>
  );
}
