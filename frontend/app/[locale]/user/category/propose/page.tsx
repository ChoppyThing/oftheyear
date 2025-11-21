import ProposeCategoryClient from '@/components/user/Category/ProposeCategoryClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proposer une catégorie',
  description: 'Proposez une nouvelle catégorie pour les votes',
};

export default function ProposeCategoryPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Proposer une catégorie</h1>
        <p className="text-gray-200">
          Suggérez une nouvelle catégorie de vote pour la communauté
        </p>
      </div>

      <ProposeCategoryClient />
    </div>
  );
}
