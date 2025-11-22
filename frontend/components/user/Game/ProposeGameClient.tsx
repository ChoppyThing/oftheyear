"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  gameUserService,
  CreateGameUserDto,
} from "@/services/user/gameUserService";
import ImageUpload from "@/components/admin/project/ImageUpload";

export default function ProposeGameClient() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await gameUserService.createProposal(
        formData,
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
  };

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
        <h2 className="text-2xl font-bold text-white mb-3">Limite atteinte</h2>
        <p className="text-gray-100 mb-6">
          Vous avez déjà proposé {proposalInfo?.currentCount || 5} jeux pour{" "}
          {currentYear}.<br />
          Vous ne pouvez pas proposer plus de 5 jeux par an.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compteur */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-gray-800">
        <p className="text-sm font-medium">
          Propositions restantes :{" "}
          <span className="text-blue-600 font-bold">
            {proposalInfo.remaining}/5
          </span>{" "}
          pour {currentYear}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-800"
      >
        {/* Image */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image du jeu
          </label>
          <ImageUpload
            onImageSelect={setSelectedImage}
            onImageRemove={() => setSelectedImage(null)}
          />
        </div>

        {/* Nom */}
        <div className="mb-6">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nom du jeu *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: The Legend of Zelda"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Décrivez brièvement le jeu..."
          />
        </div>

        {/* Développeur */}
        <div className="mb-6">
          <label
            htmlFor="developer"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Développeur *
          </label>
          <input
            type="text"
            id="developer"
            name="developer"
            required
            value={formData.developer}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Nintendo"
          />
        </div>

        {/* Éditeur */}
        <div className="mb-6">
          <label
            htmlFor="editor"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Éditeur *
          </label>
          <input
            type="text"
            id="editor"
            name="editor"
            required
            value={formData.editor}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Nintendo"
          />
        </div>

        {/* Année (caché) */}
        <input type="hidden" name="year" value={formData.year} />

        {/* Info */}
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
                Votre proposition sera examinée
              </h4>
              <p className="text-sm text-blue-700">
                Merci de participer aux Game of the Year !
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
            {isSubmitting ? "Envoi en cours..." : "Proposer le jeu"}
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
    </div>
  );
}
