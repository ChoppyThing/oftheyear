import Image from 'next/image';

type Props = {
  image: string;
  title: string;
  year: number;
  releaseDate: string;
};

export default function GameCard({ image, title, year, releaseDate }: Props) {
  return (
    <article className="bg-gray-800/60 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="w-full aspect-[4/3] relative bg-gray-700/40">
        <Image 
          src={image} 
          alt={title} 
          fill 
          className="object-cover" 
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized={image.includes('api.oftheyear.eu')}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-white">{title}</h3>
        <p className="text-sm text-gray-300 mt-2">{year}</p>
      </div>
    </article>
  );
}
