import CategoriesClient from "@/components/categories/CategoriesClient";

export default function CategoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Catégories de vote
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Découvrez toutes les catégories disponibles pour voter pour vos jeux préférés
        </p>
      </div>

      <CategoriesClient />
    </div>
  );
}
