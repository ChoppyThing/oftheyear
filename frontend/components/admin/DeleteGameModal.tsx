'use client';

import { useState } from 'react';
import { gameAdminService } from '@/services/admin/gameAdminService';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { Game } from '@/types/GameType';

interface DeleteGameModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteGameModal({ game, isOpen, onClose, onSuccess }: DeleteGameModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);

    try {
      await gameAdminService.delete(game.id);
      alert('Jeu supprimé avec succès');
      onSuccess();
      onClose();
    } catch (error) {
      alert('Erreur lors de la suppression');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-red-600">Confirmer la suppression</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="text-3xl text-red-600" />
            </div>
            <div>
              <p className="text-gray-700 mb-2">
                Êtes-vous sûr de vouloir supprimer le jeu :
              </p>
              <p className="font-semibold text-lg">{game.name}</p>
              <p className="text-sm text-gray-500 mt-2">
                Cette action est irréversible.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Suppression...' : 'Supprimer définitivement'}
          </button>
        </div>
      </div>
    </div>
  );
}
