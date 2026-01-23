'use client';

import { useState, useEffect } from 'react';
import { gameAdminService } from '@/services/admin/gameAdminService';
import { categoryService } from '@/services/category/category';
import { FaTimes } from 'react-icons/fa';
import { Game, GameStatus } from '@/types/GameType';
import { Category } from '@/types/CategoryType';
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState({
    name: game.name || '',
    developer: game.developer || '',
    editor: game.editor || '',
    description: game.description || '',
    year: game.year || currentYear,
    status: game.status || 'sent',
  });
  const [links, setLinks] = useState<{ label: string; url: string }[]>(game.links || []);

  // Charger les catégories et restrictions au montage
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (!isCreating) {
        loadCategoryRestrictions();
      }
    }
  }, [isOpen, isCreating, game.id]);

  const loadCategories = async () => {
    try {
      const cats = await categoryService.getValidatedCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const loadCategoryRestrictions = async () => {
    if (!game.id) return;
    setLoadingCategories(true);
    try {
      const { categoryIds } = await gameAdminService.getCategoryRestrictions(game.id);
      setSelectedCategories(categoryIds);
    } catch (error) {
      console.error('Erreur chargement restrictions:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

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
      if (links && links.length > 0) {
        submitData.append('links', JSON.stringify(links));
      }
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
        // Mettre à jour les restrictions de catégories
        await gameAdminService.updateCategoryRestrictions(game.id, selectedCategories);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Liens</label>
            <p className="text-xs text-gray-500 mb-2">Ajoutez des liens externes (Steam, site officiel...)</p>
            <div className="space-y-2">
              {links.map((link, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) => setLinks((s) => s.map((l, i) => i === idx ? { ...l, label: e.target.value } : l))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => setLinks((s) => s.map((l, i) => i === idx ? { ...l, url: e.target.value } : l))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button type="button" onClick={() => setLinks((s) => s.filter((_, i) => i !== idx))} className="px-3 py-2 bg-red-500 text-white rounded">Suppr</button>
                </div>
              ))}
              <button type="button" onClick={() => setLinks((s) => [...s, { label: '', url: '' }])} className="px-3 py-2 bg-gray-100 rounded">+ Ajouter un lien</button>
            </div>
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
              <option value={GameStatus.Validated}>Validé</option>
              <option value={GameStatus.Moderated}>Modéré</option>
            </select>
          </div>

          {!isCreating && (
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restrictions de catégories
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Si aucune catégorie n'est sélectionnée, le jeu sera visible dans toutes les catégories.
                Si au moins une catégorie est sélectionnée, le jeu ne sera visible QUE dans ces catégories.
              </p>
              {loadingCategories ? (
                <p className="text-sm text-gray-500">Chargement...</p>
              ) : (
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {category.translations?.fr?.title || category.name} ({category.year})
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {selectedCategories.length > 0 && (
                <p className="text-xs text-blue-600 mt-2">
                  ✓ Ce jeu sera visible uniquement dans {selectedCategories.length} catégorie(s) sélectionnée(s)
                </p>
              )}
            </div>
          )}

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
