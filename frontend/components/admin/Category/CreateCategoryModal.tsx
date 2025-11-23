'use client';

import { useState } from 'react';
import { categoryAdminService } from '@/services/admin/categoryAdminService';
import { CategoryPhase } from '@/types/CategoryType';
import { FaTimes } from 'react-icons/fa';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateCategoryModal({ open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear(),
    phase: CategoryPhase.Nomination,
    sort: 0,
  });

  const [translations, setTranslations] = useState({
    fr: { title: '', description: '' },
    en: { title: '', description: '' },
    es: { title: '', description: '' },
    zh: { title: '', description: '' },
  });
  const [activeLang, setActiveLang] = useState<'fr'|'en'|'es'|'zh'>('fr');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // prune empty translation entries
      const prunedTranslations: any = {};
      Object.entries(translations).forEach(([lang, vals]) => {
        const title = (vals as any).title?.trim();
        const description = (vals as any).description?.trim();
        if (title || description) prunedTranslations[lang] = { title: title || undefined, description: description || undefined };
      });

      await categoryAdminService.create({ ...formData, translations: Object.keys(prunedTranslations).length ? prunedTranslations : undefined });
      alert('Catégorie créée avec succès');
      onSuccess();
      onOpenChange(false);
      setFormData({ name: '', year: new Date().getFullYear(), phase: CategoryPhase.Nomination, sort: 0 });
      setTranslations({ fr: { title: '', description: '' }, en: { title: '', description: '' }, es: { title: '', description: '' }, zh: { title: '', description: '' } });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] sm:max-h-[80vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Créer une catégorie</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phase" className="block text-sm font-medium text-gray-700 mb-1">
              Phase
            </label>
            <select
              id="phase"
              value={formData.phase}
              onChange={(e) => setFormData({ ...formData, phase: e.target.value as CategoryPhase })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={CategoryPhase.Nomination}>Nominations</option>
              <option value={CategoryPhase.Vote}>Vote</option>
              <option value={CategoryPhase.Closed}>Clôturée</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Ordre (sort)
            </label>
            <input
              id="sort"
              type="number"
              value={formData.sort}
              onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value || '0') })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        
        {/* Translations - Tabbed */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Traductions</h3>
          <div className="border rounded-md bg-gray-50">
            <div className="flex space-x-1 bg-gray-100 p-2">
              {(['fr', 'en', 'es', 'zh'] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setActiveLang(loc)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${activeLang === loc ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  {loc.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="p-4">
              <div className="text-sm font-semibold mb-2">{activeLang.toUpperCase()}</div>
              <input
                type="text"
                placeholder="Titre"
                value={(translations as any)[activeLang]?.title || ''}
                onChange={(e) => setTranslations({ ...translations, [activeLang]: { ...(translations as any)[activeLang], title: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
              />
              <textarea
                placeholder="Description"
                value={(translations as any)[activeLang]?.description || ''}
                onChange={(e) => setTranslations({ ...translations, [activeLang]: { ...(translations as any)[activeLang], description: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
              />
            </div>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
}
