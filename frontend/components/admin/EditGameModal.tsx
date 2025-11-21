'use client';

import { useState } from 'react';
import { gameAdminService } from '@/services/admin/gameAdminService';
import { FaTimes } from 'react-icons/fa';
import { Game, GameStatus } from '@/types/GameType';

interface EditGameModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditGameModal({ game, isOpen, onClose, onSuccess }: EditGameModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: game.name,
    developer: game.developer,
    editor: game.editor,
    image: game.image,
    status: game.status,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await gameAdminService.update(game.id, formData);
      alert('Jeu modifié avec succès');
      onSuccess();
      onClose();
    } catch (error) {
      alert('Erreur lors de la modification');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Modifier le jeu</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du jeu
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="developer" className="block text-sm font-medium text-gray-700 mb-1">
              Développeur
            </label>
            <input
              id="developer"
              type="text"
              value={formData.developer}
              onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="editor" className="block text-sm font-medium text-gray-700 mb-1">
              Éditeur
            </label>
            <input
              id="editor"
              type="text"
              value={formData.editor}
              onChange={(e) => setFormData({ ...formData, editor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              URL de l'image
            </label>
            <input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as GameStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={GameStatus.Sent}>En attente</option>
              <option value={GameStatus.Validated}>Approuvé</option>
              <option value={GameStatus.Moderated}>Rejeté</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
