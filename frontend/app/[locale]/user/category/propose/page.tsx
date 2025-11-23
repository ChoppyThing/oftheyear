import ProposeCategoryClient from '@/components/user/Category/ProposeCategoryClient';
import { Metadata } from 'next';
import NextCategoryButton from '@/components/category/NextCategoryButton';
import { getDictionary } from '@/lib/i18n';

type Props = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: 'Proposer une catégorie',
  description: 'Proposez une nouvelle catégorie pour les votes',
};

export default async function ProposeCategoryPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{dict?.user?.proposeCategory || 'Proposer une catégorie'}</h1>
        <p className="text-gray-200">
          {dict?.user?.proposeCategoryDescription || 'Suggérez une nouvelle catégorie de vote pour la communauté'}
        </p>
      </div>

      <ProposeCategoryClient />
      <NextCategoryButton phase="nomination" dict={dict} />
    </div>
  );
}
