'use client';

import { useState, useEffect } from 'react';
import { gameAdminService } from '@/services/admin/gameAdminService';
import GameStatusBadge from '@/components/admin/GameStatusBadge';
import EditGameModal from '@/components/admin/EditGameModal';
import DeleteGameModal from '@/components/admin/DeleteGameModal';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { Game, GamesListResponse, GameStatus } from '@/types/GameType';
import { formatDate } from '@/lib/date-utils';

export default function AdminGamesPage() {
  const [data, setData] = useState<GamesListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [deleteGame, setDeleteGame] = useState<Game | null>(null);

  // Filtres
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<GameStatus | ''>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchGames = async () => {
    setLoading(true);
    try {
      const response = await gameAdminService.list({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setData(response);
    } catch (error) {
      console.error('Erreur lors du chargement des jeux:', error);
      alert('Erreur lors du chargement des jeux');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchGames();
  };

  const handleApprove = async (game: Game) => {
    if (!confirm(`Approuver le jeu "${game.name}" ?`)) return;

    try {
      await gameAdminService.approve(game.id);
      alert('Jeu approuvé avec succès');
      fetchGames();
    } catch (error) {
      alert('Erreur lors de l\'approbation');
      console.error(error);
    }
  };

  const handleReject = async (game: Game) => {
    if (!confirm(`Rejeter le jeu "${game.name}" ?`)) return;

    try {
      await gameAdminService.reject(game.id);
      alert('Jeu rejeté');
      fetchGames();
    } catch (error) {
      alert('Erreur lors du rejet');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des jeux
          </h1>
          <p className="text-gray-600">
            {data?.pagination?.total || 0} jeux au total
          </p>
        </div>

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
                  placeholder="Rechercher un jeu..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </form>

            {/* Filtre statut */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as GameStatus | '');
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value={GameStatus.Sent}>En attente</option>
              <option value={GameStatus.Validated}>Approuvés</option>
              <option value={GameStatus.Moderated}>Rejetés</option>
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
                        Jeu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Développeur / Éditeur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Auteur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
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
                    {data.data.map((game) => (
                      <tr key={game.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={"http://localhost:3000/" + game.image}
                              alt={game.name}
                              className="h-12 w-12 rounded object-cover"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {game.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                #{game.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{game.developer}</div>
                          <div className="text-sm text-gray-500">{game.editor}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {game.author.pseudo}
                          </div>
                          <div className="text-sm text-gray-500">
                            {game.author.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <GameStatusBadge status={game.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(new Date(game.createdAt))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {game.status === GameStatus.Sent && (
                              <>
                                <button
                                  onClick={() => handleApprove(game)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Approuver"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={() => handleReject(game)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Rejeter"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setEditGame(game)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => setDeleteGame(game)}
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
            {data?.pagination?.totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-4 mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {data.pagination.page} sur {data.pagination.totalPages}
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
                    onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
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
            <p className="text-gray-500">Aucun jeu trouvé</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {editGame && (
        <EditGameModal
          game={editGame}
          isOpen={!!editGame}
          onClose={() => setEditGame(null)}
          onSuccess={fetchGames}
        />
      )}

      {deleteGame && (
        <DeleteGameModal
          game={deleteGame}
          isOpen={!!deleteGame}
          onClose={() => setDeleteGame(null)}
          onSuccess={fetchGames}
        />
      )}
    </div>
  );
}
