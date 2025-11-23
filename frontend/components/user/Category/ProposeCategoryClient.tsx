'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { categoryUserService, CreateCategoryDto } from '@/services/user/categoryUserService';
import Link from 'next/link';

export default function ProposeCategoryClient() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  
  const [checking, setChecking] = useState(true);
  const [alreadyProposed, setAlreadyProposed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    description: '',
    year: currentYear,
  });

  // ✅ Vérifier au chargement
  useEffect(() => {
    checkProposal();
  }, []);

  const checkProposal = async () => {
    try {
      const hasProposed = await categoryUserService.hasProposed(currentYear);
      setAlreadyProposed(hasProposed);
    } catch (error) {
      console.error('Erreur vérification:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await categoryUserService.createCategory(formData);

      toast.success('Catégorie proposée avec succès !', {
        description: 'Elle sera examinée par les administrateurs',
      });

      // Redirection après succès
      /*setTimeout(() => {
        router.push('/');
      }, 1500);*/

    } catch (error: any) {
      toast.error('Erreur lors de la proposition', {
        description: error.message || 'Une erreur est survenue',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value,
    }));
  };

  // ✅ État de chargement
  if (checking) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ✅ Si déjà proposé
  if (alreadyProposed) {
    return (
      <div className="bg-sky-900 border-2 border-sky-900 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Catégorie déjà proposée
        </h2>
        <p className="text-gray-100 mb-6">
          Vous avez déjà proposé une catégorie pour {currentYear}.<br />
          Nous vons en remercions !
        </p>
      </div>
    );
  }

  // ✅ Formulaire
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-800">
      {/* Nom de la catégorie */}
      <div className="mb-6">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nom de la catégorie *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Meilleur jeu indépendant"
        />
      </div>

      {/* Description */}
      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Décrivez brièvement la catégorie..."
        />
      </div>

      {/* Année */}
      <div className="mb-6 hidden">
        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
          Année *
        </label>
        <input
          type="number"
          id="year"
          name="year"
          required
          min="2000"
          max={new Date().getFullYear() + 1}
          value={formData.year}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Informations */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Nous allons voir si cette catégorie peut-être intégrée
            </h4>
            <p className="text-sm text-blue-700">
              Nous vous remercions de participer aux game of the year ! 
            </p>
          </div>
        </div>
      </div>

      {/* Boutons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Envoi en cours...
            </span>
          ) : (
            'Proposer la catégorie'
          )}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
