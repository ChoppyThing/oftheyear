'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { FiUpload, FiX, FiEdit } from 'react-icons/fi';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  currentImage?: string;
  onImageRemove?: () => void;
}

export default function ImageUpload({
  onImageSelect,
  currentImage,
  onImageRemove,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Fonction pour obtenir l'URL complète de l'image
  const getImageUrl = (path: string): string => {
    if (!path) return '';

    // Si c'est déjà une URL complète
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Si c'est un blob/data URL
    if (path.startsWith('blob:') || path.startsWith('data:')) {
      return path;
    }

    // Sinon, construire l'URL avec le backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return `${backendUrl}/${path}`;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 5 MB");
      return;
    }

    // Créer l'aperçu
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  };

  const handleClickChange = () => {
    fileInputRef.current?.click();
  };

  // ✅ Déterminer quelle image afficher
  const displayImage = preview || (currentImage ? getImageUrl(currentImage) : null);

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
      />

      {displayImage ? (
        <div className="relative group">
          {/* Image container */}
          <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
            <Image
              src={displayImage}
              alt="Aperçu"
              fill
              className="object-cover"
              unoptimized
            />
            
            {/* Overlay avec boutons au survol */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={handleClickChange}
                className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                title="Changer l'image"
              >
                <FiEdit size={20} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                title="Supprimer l'image"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Boutons alternatifs toujours visibles en bas */}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handleClickChange}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <FiEdit size={16} />
              Changer
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              <FiX size={16} />
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50"
        >
          <FiUpload size={48} className="text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">
            Cliquez pour uploader une image
          </p>
          <p className="text-gray-400 text-sm mt-2">
            PNG, JPG, WebP (max. 5 MB)
          </p>
        </label>
      )}
    </div>
  );
}
