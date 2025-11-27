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
      <div className="w-full aspect-4/3 relative bg-gray-700/40">
        <Image 
          src={image} 
          alt={`${title} - ${year}`}
          fill 
          className="object-cover" 
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          loading="lazy"
          quality={75}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          unoptimized={image.includes('api.oftheyear.eu') || image.includes('localhost')}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-white line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-300 mt-2">{year}</p>
      </div>
    </article>
  );
}
