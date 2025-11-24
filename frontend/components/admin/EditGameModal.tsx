'use client';

import { useState } from 'react';
import { gameAdminService } from '@/services/admin/gameAdminService';
import { FaTimes } from 'react-icons/fa';
import { Game, GameStatus } from '@/types/GameType';
import ImageUpload from './project/ImageUpload';

interface EditGameModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditGameModal({ game, isOpen, onClose, onSuccess }: EditGameModalProps) {
  const isCreating = !game.id;
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [formData, setFormData] = useState({
    name: game.name || '',
    developer: game.developer || '',
    editor: game.editor || '',
    description: game.description || '',
    year: game.year || new Date().getFullYear(),
    status: game.status || 'sent',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('year', formData.year.toString());
      if (formData.developer) submitData.append('developer', formData.developer);
      if (formData.editor) submitData.append('editor', formData.editor);
      if (formData.description) submitData.append('description', formData.description);
      submitData.append('status', formData.status);

      if (imageFile) {
        submitData.append('image', imageFile);
      } else if (removeImage && !isCreating) {
        submitData.append('removeImage', 'true');
      }

      if (isCreating) {
        await gameAdminService.create(submitData);
        alert('Jeu créé avec succès');
      } else {
        await gameAdminService.update(game.id, submitData);
        alert('Jeu modifié avec succès');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      alert(isCreating ? 'Erreur lors de la création' : 'Erreur lors de la modification');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {isCreating ? 'Créer un jeu' : 'Modifier le jeu'}
          </h2>
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
              Nom du jeu *
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              />
            </div>
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Année *
            </label>
            <input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1980"
              max={new Date().getFullYear() + 2}
            />
          </div>

          <ImageUpload
            currentImage={game.image}
            onImageSelect={(file) => {
              setImageFile(file);
              setRemoveImage(false);
            }}
            onImageRemove={() => {
              setImageFile(null);
              setRemoveImage(true);
            }}
          />

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
              <option value={GameStatus.Validated}>Validé</option>
              <option value={GameStatus.Moderated}>Modéré</option>
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
