import Image from 'next/image';

type Props = {
  image: string;
  title: string;
  releaseDate: string;
};

export default function GameCard({ image, title, releaseDate }: Props) {
  return (
    <article className="bg-gray-800/60 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="w-full h-48 relative bg-gray-700/40">
        <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-white">{title}</h3>
        <p className="text-sm text-gray-300 mt-2">Sortie : {new Date(releaseDate).toLocaleDateString('fr-FR')}</p>
      </div>
    </article>
  );
}
