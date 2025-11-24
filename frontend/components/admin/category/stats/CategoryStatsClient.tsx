"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { VotePhaseStatsResponse } from "@/types/CategoryType";
import { categoryAdminService } from "@/services/admin/categoryAdminService";

interface Props {
  initialYear?: number;
}

export default function CategoryStatsClient({ initialYear }: Props) {
  const router = useRouter();
  const [stats, setStats] = useState<VotePhaseStatsResponse | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    initialYear || new Date().getFullYear()
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Record<number, "all" | "top5">>(
    {}
  );

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    loadStats(selectedYear);
  }, [selectedYear]);

  const loadStats = async (year?: number) => {
    setLoading(true);
    try {
      const data = await categoryAdminService.getVotePhaseStats(year);
      setStats(data);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    router.push(`?year=${year}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <>
      {/* Sélecteur d'année */}
      <div className="flex justify-end">
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Stats globales */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Total Catégories
            </h3>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <div className="text-2xl font-bold">{stats.totalCategories}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Votes</h3>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="text-2xl font-bold">{stats.totalVotes}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Moyenne/Catégorie
            </h3>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div className="text-2xl font-bold">
            {stats.totalCategories > 0
              ? Math.round(stats.totalVotes / stats.totalCategories)
              : 0}
          </div>
        </div>
      </div>

      {/* Liste des catégories */}
      <div className="space-y-4">
        {stats.categories.map((category) => {
          const currentTab = activeTab[category.categoryId] || "all";
          // Pour "Tous les jeux" : afficher nominationVotes si disponible, sinon nominees
          // Pour "Top 5" : toujours afficher nominees (les votes finaux)
          const allGames = category.nominationVotes || category.nominees || [];
          const top5Games = category.nominees || [];
          const displayGames = currentTab === "top5" ? top5Games : allGames;

          return (
            <div
              key={category.categoryId}
              className="bg-white rounded-lg border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {category.categoryName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Phase : {category.phase} • {category.totalVotes} votes
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                  <button
                    onClick={() =>
                      setActiveTab({
                        ...activeTab,
                        [category.categoryId]: "all",
                      })
                    }
                    className={`px-4 py-2 -mb-px font-medium transition-colors ${
                      currentTab === "all"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Tous les jeux
                  </button>
                  <button
                    onClick={() =>
                      setActiveTab({
                        ...activeTab,
                        [category.categoryId]: "top5",
                      })
                    }
                    className={`px-4 py-2 -mb-px font-medium transition-colors ${
                      currentTab === "top5"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Top 5
                  </button>
                </div>

                {/* Liste des jeux */}
                <div className="space-y-4">
                  {displayGames && displayGames.length > 0 ? (
                    displayGames.map((game, index) => (
                      <div key={game.gameId} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {currentTab === "top5" && (
                              <span className="flex items-center justify-center w-6 h-6 text-xs font-bold bg-blue-100 text-blue-600 rounded-full">
                                {index + 1}
                              </span>
                            )}
                            <span className="font-medium">{game.gameName}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500">
                              {game.voteCount} votes
                            </span>
                            <span className="px-2 py-1 text-xs border border-gray-300 rounded">
                              {game.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${game.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Aucun jeu dans cette catégorie</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
