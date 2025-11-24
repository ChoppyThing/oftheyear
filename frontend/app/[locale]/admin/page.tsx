'use client';

import { useState, useEffect } from 'react';
import { gameAdminService } from '@/services/admin/gameAdminService';
import { categoryAdminService } from '@/services/admin/categoryAdminService';
import { userAdminService } from '@/services/admin/userAdminService';

export default function AdminDashboard() {
  const [gameStats, setGameStats] = useState<{ total: number; validated: number; pending: number; rejected: number } | null>(null);
  const [categoryStats, setCategoryStats] = useState<{ total: number; nomination: number; vote: number; closed: number } | null>(null);
  const [userStats, setUserStats] = useState<{ total: number; verified: number; unverified: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [games, categories, users] = await Promise.all([
          gameAdminService.getStats(),
          categoryAdminService.getGlobalStats(),
          userAdminService.getStats(),
        ]);
        setGameStats(games);
        setCategoryStats(categories);
        setUserStats(users);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques des jeux */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Jeux</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <h3 className="text-blue-600 text-sm font-medium">Total Jeux</h3>
            <p className="text-3xl font-bold text-blue-900 mt-2">{gameStats?.total || 0}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg shadow p-6">
            <h3 className="text-green-600 text-sm font-medium">Validés</h3>
            <p className="text-3xl font-bold text-green-900 mt-2">{gameStats?.validated || 0}</p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <h3 className="text-yellow-600 text-sm font-medium">En attente</h3>
            <p className="text-3xl font-bold text-yellow-900 mt-2">{gameStats?.pending || 0}</p>
          </div>
          
          <div className="bg-red-50 rounded-lg shadow p-6">
            <h3 className="text-red-600 text-sm font-medium">Rejetés</h3>
            <p className="text-3xl font-bold text-red-900 mt-2">{gameStats?.rejected || 0}</p>
          </div>
        </div>
      </div>

      {/* Statistiques des catégories */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Catégories</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <h3 className="text-blue-600 text-sm font-medium">Total</h3>
            <p className="text-3xl font-bold text-blue-900 mt-2">{categoryStats?.total || 0}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg shadow p-6">
            <h3 className="text-purple-600 text-sm font-medium">Nominations</h3>
            <p className="text-3xl font-bold text-purple-900 mt-2">{categoryStats?.nomination || 0}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg shadow p-6">
            <h3 className="text-green-600 text-sm font-medium">Votes</h3>
            <p className="text-3xl font-bold text-green-900 mt-2">{categoryStats?.vote || 0}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium">Clôturées</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{categoryStats?.closed || 0}</p>
          </div>
        </div>
      </div>

      {/* Statistiques des utilisateurs */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Utilisateurs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <h3 className="text-blue-600 text-sm font-medium">Total</h3>
            <p className="text-3xl font-bold text-blue-900 mt-2">{userStats?.total || 0}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg shadow p-6">
            <h3 className="text-green-600 text-sm font-medium">Vérifiés</h3>
            <p className="text-3xl font-bold text-green-900 mt-2">{userStats?.verified || 0}</p>
          </div>
          
          <div className="bg-orange-50 rounded-lg shadow p-6">
            <h3 className="text-orange-600 text-sm font-medium">Non vérifiés</h3>
            <p className="text-3xl font-bold text-orange-900 mt-2">{userStats?.unverified || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
