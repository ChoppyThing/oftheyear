'use client';

import { useState, useEffect } from 'react';
import { categoryAdminService } from '@/services/admin/categoryAdminService';
import { FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import { Category, CategoriesListResponse, CategoryPhase } from '@/types/CategoryType';
import { formatDate } from '@/lib/date-utils';
import CategoryPhaseBadge from '@/components/admin/category/CategoryPhaseBadge';
import CreateCategoryModal from '@/components/admin/category/CreateCategoryModal';
import EditCategoryModal from '@/components/admin/category/EditCategoryModal';
import DeleteCategoryModal from '@/components/admin/category/DeleteCategoryModal';

export default function AdminCategoriesPage() {
  const [data, setData] = useState<CategoriesListResponse | null>(null);
  const [stats, setStats] = useState<{ total: number; nomination: number; vote: number; closed: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  // Filtres
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<CategoryPhase | ''>('');
  const [yearFilter, setYearFilter] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const [categoriesResponse, statsResponse] = await Promise.all([
        categoryAdminService.list({
          page,
          limit,
          search: search || undefined,
          phase: phaseFilter || undefined,
          year: yearFilter || undefined,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        }),
        categoryAdminService.getGlobalStats(),
      ]);
      setData(categoriesResponse);
      setStats(statsResponse);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      alert('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, phaseFilter, yearFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCategories();
  };

  // Années disponibles
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestion des catégories
            </h1>
            <p className="text-gray-600">
              {data?.total || 0} catégories au total
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FaPlus />
            Nouvelle catégorie
          </button>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Nominations</p>
                <p className="text-2xl font-bold text-purple-900">{stats.nomination}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Votes</p>
                <p className="text-2xl font-bold text-green-900">{stats.vote}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium">Clôturées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher une catégorie..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </form>

            {/* Filtre phase */}
            <select
              value={phaseFilter}
              onChange={(e) => {
                setPhaseFilter(e.target.value as CategoryPhase | '');
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les phases</option>
              <option value={CategoryPhase.Nomination}>Nominations</option>
              <option value={CategoryPhase.Vote}>Vote</option>
              <option value={CategoryPhase.Closed}>Clôturées</option>
            </select>

            {/* Filtre année */}
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value ? parseInt(e.target.value) : '');
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les années</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Année
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ordre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phase
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Auteur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de création
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            #{category.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{category.year}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{category.sort ?? 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <CategoryPhaseBadge phase={category.phase} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {category.author.pseudo}
                          </div>
                          <div className="text-sm text-gray-500">
                            {category.author.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {category._count?.votes || 0} votes
                          </div>
                          <div className="text-sm text-gray-500">
                            {category._count?.nominees || 0} nominés
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(category.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditCategory(category)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => setDeleteCategory(category)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-4 mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {data.page} sur {data.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">Aucune catégorie trouvée</p>
          </div>
        )}
      </div>

      {/* Modales */}
      <CreateCategoryModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchCategories}
      />
      <EditCategoryModal
        category={editCategory}
        open={!!editCategory}
        onOpenChange={(open) => !open && setEditCategory(null)}
        onSuccess={fetchCategories}
      />
      <DeleteCategoryModal
        category={deleteCategory}
        open={!!deleteCategory}
        onOpenChange={(open) => !open && setDeleteCategory(null)}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
