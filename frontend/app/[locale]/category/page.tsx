import CategoriesClient from "@/components/categories/CategoriesClient";
import { getDictionary } from '@/lib/i18n';

type Props = { params: Promise<{ locale: string }> };

export default async function CategoryPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {dict?.category?.index?.title || 'Catégories de vote'}
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          {dict?.category?.index?.description || 'Découvrez toutes les catégories disponibles pour voter pour vos jeux préférés'}
        </p>
      </div>

      <CategoriesClient dict={dict} />
    </div>
  );
}
