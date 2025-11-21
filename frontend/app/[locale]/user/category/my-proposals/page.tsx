import MyProposalsClient from '@/components/user/Category/MyProposalsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mes propositions',
  description: 'Suivez vos propositions de catégories',
};

export default function MyProposalsPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mes propositions</h1>
        <p className="text-gray-100">
          Suivez l'état de vos propositions de catégories
        </p>
      </div>

      <MyProposalsClient />
    </div>
  );
}
