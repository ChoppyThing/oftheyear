'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  IoGameController, 
  IoTrophy, 
  IoStar, 
  IoSparkles, 
  IoFlash, 
  IoHeart 
} from 'react-icons/io5';
import { Category } from '@/types/CategoryType';
import { usePathname } from 'next/navigation';
import { categoryService } from '@/services/category/category';

const categoryIcons = {
  default: IoGameController,
  trophy: IoTrophy,
  star: IoStar,
  sparkles: IoSparkles,
  zap: IoFlash,
  heart: IoHeart,
};

// Couleurs par défaut
const categoryColors = [
  'from-blue-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-green-500 to-emerald-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-purple-500 to-pink-600',
  'from-yellow-500 to-orange-600',
  'from-indigo-500 to-purple-600',
];

export default function CategoriesClient({ dict }: { dict?: any }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    loadCategories();
  }, [selectedYear]);

  const pathname = usePathname();
  const locale = pathname?.split('/')?.[1] || 'fr';

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getValidatedCategories(selectedYear);
      setCategories(data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-800/50 rounded-lg p-8 max-w-md mx-auto">
          <IoGameController className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {(
              dict?.category?.index?.empty || `Aucune catégorie disponible pour {year}`
            ).replace('{year}', String(selectedYear))}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sélecteur d'année */}
      <div className="flex justify-center gap-2 mb-8" style={{ transition: 'none' }}>
        {[2025].map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-6 py-2 rounded-lg font-semibold ${
              selectedYear === year
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Grille de catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const Icon = categoryIcons[category.icon as keyof typeof categoryIcons] || categoryIcons.default;
          const gradientColor = categoryColors[index % categoryColors.length];

          return (
            <Link
              key={category.id}
              href={`/user/category/nomination/${category.slug}`}
              className="group relative bg-gray-800 rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              {/* Gradient de fond */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              {/* Contenu */}
              <div className="relative p-6 space-y-4">
                {/* En-tête avec icône */}
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${gradientColor}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Badge phase */}
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
                    {category.phase === 'vote' && `🗳️ ${dict?.category?.phase?.vote || 'Vote'}`}
                    {category.phase === 'nomination' && `🏆 ${dict?.category?.phase?.nomination || 'Nomination'}`}
                    {category.phase === 'closed' && `📦 ${dict?.category?.phase?.closed || 'Archivé'}`}
                  </span>
                </div>

                {/* Titre */}
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  {category.translations?.[locale as keyof typeof category.translations]?.title || category.name}
                </h3>

                {/* Description */}
                {((category.translations?.[locale as keyof typeof category.translations]?.description) || category.description) && (
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {category.translations?.[locale as keyof typeof category.translations]?.description || category.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <IoGameController className="w-4 h-4" />
                    <span>{category.gamesCount || 0} {dict?.category?.card?.nominations || 'nominations'}</span>
                  </div>

                  <span className="text-blue-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                    {dict?.category?.card?.see || 'Voir →'}
                  </span>
                </div>
              </div>

              {/* Effet de brillance au survol */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
