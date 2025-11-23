import CategoryStatsClient from '@/components/admin/category/stats/CategoryStatsClient';
import { Suspense } from 'react';

export default async function CategoryStatsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const { locale } = await params;
  const { year } = await searchParams;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistiques des Votes</h1>
          <p className="text-gray-500">Analyse des votes par catégorie et phase</p>
        </div>
      </div>

      <Suspense fallback={<LoadingStats />}>
        <CategoryStatsClient initialYear={year ? parseInt(year) : undefined} />
      </Suspense>
    </div>
  );
}

function LoadingStats() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
