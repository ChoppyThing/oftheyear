"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  gameUserService,
  CreateGameUserDto,
} from "@/services/user/gameUserService";
import ImageUpload from "@/components/admin/project/ImageUpload";
import debounce from "lodash/debounce";

export default function ProposeGameClient({ dict }: { dict?: any }) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [checking, setChecking] = useState(true);
  const [proposalInfo, setProposalInfo] = useState<{
    canPropose: boolean;
    currentCount: number;
    remaining: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState<CreateGameUserDto>({
    name: "",
    description: "",
    developer: "",
    editor: "",
    year: currentYear,
  });

  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);

  // Recherche de jeux existants
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    checkProposal();
  }, []);

  const checkProposal = async () => {
    try {
      const info = await gameUserService.canPropose(currentYear);
      setProposalInfo(info);
    } catch (error) {
      console.error("Erreur vérification:", error);
    } finally {
      setChecking(false);
    }
  };

  // Recherche avec debounce
  const searchGames = useCallback(
    debounce(async (query: string) => {
      if (query.length < 5) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await gameUserService.searchGames(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Erreur recherche:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await gameUserService.createProposal(
        { ...formData, links },
        selectedImage || undefined
      );

      toast.success("Jeu proposé avec succès !", {
        description: "Il sera examiné par les administrateurs",
      });

      // Recharger les infos
      await checkProposal();

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        description: "",
        developer: "",
        editor: "",
        year: currentYear,
      });
      setSelectedImage(null);
      setLinks([]);

      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error: any) {
      toast.error("Erreur lors de la proposition", {
        description: error.message || "Une erreur est survenue",
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
      [name]: name === "year" ? parseInt(value) : value,
    }));

    // Lancer la recherche quand le nom change
    if (name === "name") {
      searchGames(value);
    }
  };

  const addLink = () => setLinks((s) => [...s, { label: '', url: '' }]);
  const updateLink = (index: number, key: 'label' | 'url', value: string) =>
    setLinks((s) => s.map((l, i) => (i === index ? { ...l, [key]: value } : l)));
  const removeLink = (index: number) => setLinks((s) => s.filter((_, i) => i !== index));

  if (checking) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!proposalInfo?.canPropose) {
    return (
      <div className="bg-sky-900 border-2 border-sky-900 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          {dict?.user?.proposeLimitTitle || 'Limite atteinte'}
        </h2>
        <p className="text-gray-100 mb-6">
          {dict?.user?.proposeLimitMessage
            ? dict.user.proposeLimitMessage
                .replace('{count}', String(proposalInfo?.currentCount || 5))
                .replace('{year}', String(currentYear))
            : `Vous avez déjà proposé ${proposalInfo?.currentCount || 5} jeux pour ${currentYear}.\nVous ne pouvez pas proposer plus de 5 jeux par an.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compteur */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-gray-800">
        <p className="text-sm font-medium">
          {dict?.user?.remainingProposalsLabel
            ? dict.user.remainingProposalsLabel
                .replace('{remaining}', String(proposalInfo.remaining))
                .replace('{year}', String(currentYear))
            : (
              <>Propositions restantes : <span className="text-blue-600 font-bold">{proposalInfo.remaining}/5</span> pour {currentYear}</>
            )}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-800"
      >
        {/* Image */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {dict?.user?.imageLabel || 'Image du jeu'}
          </label>
          <ImageUpload
            onImageSelect={setSelectedImage}
            onImageRemove={() => setSelectedImage(null)}
          />
          <p className="text-xs text-gray-500 mt-2">{dict?.user?.uploadHint || 'Cliquez pour uploader une image'}</p>
          <p className="text-xs text-gray-400">{dict?.user?.formatsHint || 'PNG, JPG, WebP (max. 5 MB)'}</p>
        </div>

        {/* Nom */}
        <div className="mb-6">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {dict?.user?.nameLabel || 'Nom du jeu *'}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            placeholder={dict?.user?.namePlaceholder || 'Ex: The Legend of Zelda'}
          />
          
          {/* Résultats de recherche */}
          {isSearching && (
            <div className="mt-2 text-sm text-gray-500">
              Recherche en cours...
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2 mb-3">
                <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-yellow-800 mb-1">
                    Attention ! Ces jeux existent déjà :
                  </p>
                  <p className="text-xs text-yellow-700 mb-3">
                    Si le jeu que vous souhaitez ajouter est dans cette liste, c'est qu'il existe déjà ! Vous le retrouverez pour les votes.
                  </p>
                  <div className="space-y-2">
                    {searchResults.map((game) => (
                      <div key={game.id} className="flex items-center gap-3 text-sm bg-white p-2 rounded border border-yellow-300">
                        {game.image && (
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL}/${game.image}`} 
                            alt={game.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{game.name}</p>
                          <p className="text-xs text-gray-600">
                            {game.year} • {game.developer || game.editor || 'Développeur inconnu'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {dict?.user?.descriptionLabel || 'Description'}
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={dict?.user?.descriptionPlaceholder || 'Décrivez brièvement le jeu...'}
          />
        </div>

        {/* Développeur */}
        <div className="mb-6">
          <label
            htmlFor="developer"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {dict?.user?.developerLabel || 'Développeur *'}
          </label>
          <input
            type="text"
            id="developer"
            name="developer"
            required
            value={formData.developer}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={dict?.user?.developerPlaceholder || 'Ex: Nintendo'}
          />
        </div>

        {/* Éditeur */}
        <div className="mb-6">
          <label
            htmlFor="editor"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {dict?.user?.editorLabel || 'Éditeur *'}
          </label>
          <input
            type="text"
            id="editor"
            name="editor"
            required
            value={formData.editor}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={dict?.user?.editorPlaceholder || 'Ex: Nintendo'}
          />
        </div>

        {/* Links */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Liens</label>
          <p className="text-xs text-gray-500 mb-2">Ajoutez des liens externes (Steam, site officiel...)</p>
          <div className="space-y-2">
            {links.map((link, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => updateLink(idx, 'label', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="url"
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => updateLink(idx, 'url', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <button type="button" onClick={() => removeLink(idx)} className="px-3 py-2 bg-red-500 text-white rounded">Suppr</button>
              </div>
            ))}
            <button type="button" onClick={addLink} className="px-3 py-2 bg-gray-100 rounded">+ Ajouter un lien</button>
          </div>
        </div>

        {/* Année (caché) */}
        <input type="hidden" name="year" value={formData.year} />

        {/* Info */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
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
                {dict?.user?.reviewTitle || 'Votre proposition sera examinée'}
              </h4>
              <p className="text-sm text-blue-700">
                {dict?.user?.reviewMessage || 'Merci de participer aux Game of the Year !'}
              </p>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {isSubmitting ? (dict?.common?.loading || 'Envoi en cours...') : (dict?.user?.submitGame || 'Proposer le jeu')}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {dict?.user?.cancel || 'Annuler'}
          </button>
        </div>
      </form>
    </div>
  );
}
