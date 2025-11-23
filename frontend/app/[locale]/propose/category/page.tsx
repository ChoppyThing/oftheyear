import { getDictionary } from '@/lib/i18n';

type Props = { params: Promise<{ locale: string }> };

export default async function ProposeCategory({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <>{dict?.user?.proposeCategory || 'Proposer une catégorie'}</>;
}