import { getDictionary } from "@/lib/i18n";
import { Locale } from "@/i18n.config";
import GameCard from "@/components/GameCard";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.oftheyear.eu';

interface Game {
  id: number;
  name: string;
  image?: string;
  year: number;
  publishAt: string;
}

async function getLatestGames(): Promise<Game[]> {
  try {
    const response = await fetch(`${API_URL}/game/latest?limit=3`, {
      next: { revalidate: 300 }, // Revalider toutes les 5 minutes
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch latest games:', error);
    return [];
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const latestGames = await getLatestGames();

  return (
    <div className="relative min-h-screen text-gray-100">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        {/* legacy user gradient (defined in globals.css) */}
        <div className="gradient absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none mix-blend-screen opacity-80" />

        {/* subtle radial overlay to enhance contrast */}
        <div className="absolute inset-0 -z-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.06)_0%,rgba(100,150,200,0.02)_35%),radial-gradient(ellipse_at_bottom_right,rgba(255,200,150,0.05)_0%,rgba(20,30,40,0)_40%)] mix-blend-screen" />
      </div>

      <div className="relative z-10">
        <header className="grid grid-cols-1 md:grid-cols-2 p-10">
          <div className="text-center m-auto">
            <Image src="/logo/logo.png" width="350" height="350" alt="Logo" priority />
          </div>
          <div className="text-white text-4xl md:text-5xl text-center m-auto uppercase font-bold">
            <p id="stars" className="text-yellow-400 mb-2">
              <span>&#9733;</span>
              <span className="mx-1">&#9733;</span>
              <span className="mx-1">&#9733;</span>
              <span className="mx-1">&#9733;</span>
              <span>&#9733;</span>
            </p>
            <p id="title">
              <span>{dict.home.title}</span>
            </p>
            <p id="slogan" className="text-lg md:text-2xl mt-4">
              <span className="font-semibold">{dict.home.slogan}</span>
            </p>
          </div>
        </header>

        <main className="p-6 md:p-10 max-w-6xl mx-auto">
          {/* Pitch principal */}
          <section className="mb-8 bg-gray-800/60 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-3">
              {dict.home.pitch.title}
            </h2>
            <p>
              {dict.home.pitch.description}
            </p>
          </section>

          {/* Derniers jeux ajoutés */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{dict.home.latestGames.title}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {latestGames.length > 0 ? (
                latestGames.map((game) => (
                  <GameCard
                    key={game.id}
                    image={game.image ? `${API_URL}/${game.image}` : "/logo/logo.png"}
                    title={game.name}
                    year={game.year}
                    releaseDate={game.publishAt}
                  />
                ))
              ) : (
                <p className="col-span-3 text-center text-gray-400">
                  {dict.home.latestGames.noGames || "Aucun jeu disponible pour le moment"}
                </p>
              )}
            </div>
          </section>
        </main>

        {/*<p className="mt-4 text-gray-300 text-center">{dict.home.currentLocale} {locale}</p>*/}
      </div>
    </div>
  );
}
