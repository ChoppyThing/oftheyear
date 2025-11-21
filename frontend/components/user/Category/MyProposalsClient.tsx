'use client';

import { useState, useEffect } from 'react';
import { categoryUserService, CategoryProposal } from '@/services/user/categoryUserService';
import Link from 'next/link';
import { toast } from 'sonner';

export default function MyProposalsClient() {
  const [proposals, setProposals] = useState<CategoryProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadProposals();
  }, [page]);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await categoryUserService.getMyCategoryProposals(page, 10);
      setProposals(data.data);
      setTotal(data.total);
    } catch (error: any) {
      toast.error('Erreur de chargement', {
        description: error.message || 'Impossible de charger vos propositions',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPhaseDisplay = (phase: CategoryProposal['phase']) => {
    const config = {
      nomination: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: 'En nomination',
        icon: '📝',
        message: 'Les utilisateurs peuvent proposer des jeux',
      },
      vote: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        label: 'En vote',
        icon: '🗳️',
        message: 'Vote en cours',
      },
      closed: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        label: 'Clôturée',
        icon: '🔒',
        message: 'Résultats disponibles',
      },
    };

    const phaseConfig = config[phase];

    return {
      badge: (
        <span className={`px-3 py-1 text-sm rounded-full font-medium ${phaseConfig.bg} ${phaseConfig.text} flex items-center gap-2`}>
          <span>{phaseConfig.icon}</span>
          {phaseConfig.label}
        </span>
      ),
      message: (
        <div className={`text-xs font-medium ${phaseConfig.text}`}>
          {phaseConfig.message}
        </div>
      ),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-200">
          {total > 0 ? `${total} proposition${total > 1 ? 's' : ''}` : 'Aucune proposition'}
        </div>
        {/*<Link
          href="/user/category/propose"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Nouvelle proposition
        </Link>*/}
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune proposition
          </h3>
          <p className="text-white mb-6">
            Vous n'avez pas encore proposé de catégorie
          </p>
          <Link
            href="/user/category/propose"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Proposer une catégorie
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {proposals.map((proposal) => {
              const phaseDisplay = getPhaseDisplay(proposal.phase);
              
              return (
                <div
                  key={proposal.id}
                  className="bg-gray-800 text-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {proposal.name}
                      </h3>
                      <p className="text-sm text-white">
                        Année : <span className="font-medium">{proposal.year}</span>
                      </p>
                    </div>
                    {phaseDisplay.badge}
                  </div>

                  {proposal.description && (
                    <p className="text-gray-200 mb-4 leading-relaxed">
                      {proposal.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-xs text-white">
                      Proposée le{' '}
                      <span className="font-medium">
                        {new Date(proposal.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {phaseDisplay.message}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {total > 10 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-sm text-white">
                Page {page} sur {Math.ceil(total / 10)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / 10)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
