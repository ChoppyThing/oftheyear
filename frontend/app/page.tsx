import { headers } from "next/headers";
import Image from "next/image";
import GameCard from "../components/GameCard";
import StatsToggle from "../components/StatsToggle";

export default async function Home() {
  const headersList = await headers();
  const subdomain = headersList.get("x-subdomain");

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
          <Image src="/logo/logo.png" width="350" height="350" alt="Logo" />
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
            <span>Game of the Year</span>
          </p>
          <p id="slogan" className="text-lg md:text-2xl mt-4">
            <span className="font-semibold">Vote</span> pour le jeu qui t'a le plus animé.
          </p>
        </div>
      </header>

      <main className="p-6 md:p-10 max-w-6xl mx-auto">
        {/* Pitch principal */}
        <section className="mb-8 bg-gray-800/60 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-3">Redonner le pouvoir du vote aux joueurs</h2>
          <p>
            Ici, chacun peut voter pour son jeu préféré de l'année — le jeu qui
            l'a le plus fait vibrer, surpris ou rassemblé. L'idée : une communauté
            qui partage ses coups de cœur et élit le meilleur jeu.
          </p>
        </section>

        {/* Derniers jeux ajoutés */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Derniers jeux ajoutés</h2>
            <p className="text-sm text-gray-400">(template - remplacé par l'API plus tard)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { id: 1, title: 'Aurora Drift', image: '/logo/logo.png', releaseDate: '2025-09-12' },
              { id: 2, title: 'Shadow Garden', image: '/logo/logo.png', releaseDate: '2024-11-03' },
              { id: 3, title: 'Neon Rally', image: '/logo/logo.png', releaseDate: '2023-06-21' },
            ].map((g) => (
              <GameCard key={g.id} image={g.image} title={g.title} releaseDate={g.releaseDate} />
            ))}
          </div>
        </section>

        {/* Statistiques */}
        {/*<section className="mb-12 bg-gray-800/60 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-3">Statistiques</h2>
          <p className="text-sm text-gray-400 mb-4">Les chiffres clés du site (masqués au départ).</p>
          <StatsToggle />
        </section>*/}
      </main>


      </div>
    </div>
  );
}
