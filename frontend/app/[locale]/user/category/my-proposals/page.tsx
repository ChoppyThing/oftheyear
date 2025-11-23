import MyProposalsClient from '@/components/user/Category/MyProposalsClient';
import { Metadata } from 'next';
import NextCategoryButton from '@/components/category/NextCategoryButton';
import { getDictionary } from '@/lib/i18n';

type Props = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: 'Mes propositions',
  description: 'Suivez vos propositions de catégories',
};

export default async function MyProposalsPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{dict?.user?.myProposals || 'Mes propositions'}</h1>
        <p className="text-gray-100">
          {dict?.user?.myProposalsDescription || "Suivez l'état de vos propositions de catégories"}
        </p>
      </div>

      <MyProposalsClient />
      <NextCategoryButton phase="nomination" dict={dict} />
    </div>
  );
}
