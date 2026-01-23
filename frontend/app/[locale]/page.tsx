import { getDictionary } from "@/lib/i18n";
import { Locale, locales } from "@/i18n.config";
import { getCurrentPhase } from "@/lib/phases";
import dynamic from 'next/dynamic';
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

// Lazy load GameCard pour améliorer le First Contentful Paint
const GameCard = dynamic(() => import('@/components/GameCard'), {
  loading: () => <div className="aspect-4/3 bg-gray-800 animate-pulse rounded-lg" />,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.oftheyear.eu";

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
      cache: 'force-cache', // SSG : génère une page statique au build
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch latest games:", error);
    return [];
  }
}

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const currentYear = new Date().getFullYear();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://game.oftheyear.eu';

  const title = dict.meta?.title || 'GOTY - Game of the Year';
  const description = dict.meta?.description || 'Vote for the best games of the year!';

  // Structured Data JSON-LD pour la page d'accueil
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Game of the Year',
    url: `${baseUrl}/${locale}`,
    description: description,
    inLanguage: locale,
    publisher: {
      '@type': 'Organization',
      name: 'Game of the Year',
      url: baseUrl,
    },
    potentialAction: {
      '@type': 'VoteAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/user/category`,
      },
    },
  };

  return {
    title,
    description,
    keywords: ['game of the year', 'GOTY', currentYear.toString(), 'gaming', 'vote', 'video games', 'best games', 'gaming community', 'game awards', locale === 'fr' ? 'jeu de l\'année' : ''],
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: Object.fromEntries(
        locales.map(loc => [loc, `${baseUrl}/${loc}`])
      ),
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${baseUrl}/${locale}`,
      siteName: 'Game of the Year',
      locale: locale === 'en' ? 'en_US' : locale === 'fr' ? 'fr_FR' : locale === 'es' ? 'es_ES' : 'zh_CN',
      images: [{
        url: `${baseUrl}/logo/goty-og.png`,
        width: 1200,
        height: 630,
        alt: 'Game of the Year',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/logo/goty-og.png`],
    },
    other: {
      'application-name': 'Game of the Year',
      'og:site_name': 'Game of the Year',
    },
  };
}

export default async function Home({
  params,
}: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const latestGames = await getLatestGames();
  
  // Déterminer le lien selon la phase
  const currentPhase = getCurrentPhase();
  const participateLink = currentPhase === 'vote' 
    ? `/${locale}/vote` 
    : currentPhase === 'results'
    ? `/${locale}/results`
    : `/${locale}/category`;

  return (
    <div className="relative min-h-screen text-gray-100">
      {/* Prefetch des pages importantes */}
      <link rel="prefetch" href={`/${locale}/category`} />
      <link rel="prefetch" href={`/${locale}/about`} />
      <link rel="prerender" href={participateLink} />
      
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        {/* legacy user gradient (defined in globals.css) */}
        <div className="gradient absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none mix-blend-screen opacity-80" />

        {/* subtle radial overlay to enhance contrast */}
        <div className="absolute inset-0 -z-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.06)_0%,rgba(100,150,200,0.02)_35%),radial-gradient(ellipse_at_bottom_right,rgba(255,200,150,0.05)_0%,rgba(20,30,40,0)_40%)] mix-blend-screen" />
      </div>

      <div className="relative z-10">
        <header className="grid grid-cols-1 md:grid-cols-2 p-10">
          <div className="text-center m-auto">
            <Image
              src="/logo/logo.png"
              width={350}
              height={350}
              alt="Game of the Year Logo"
              priority
              quality={75}
              sizes="(max-width: 768px) 250px, 350px"
              placeholder="empty"
              style={{ backgroundColor: 'transparent' }}
            />
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

                    {/* Small dynamic phase panel under the main header */}
        <div className="max-w-6xl mx-auto px-6 md:px-10 text-sm mt-6">
          <div className="">
            {currentPhase === 'nomination' && (
              <div className="bg-emerald-600/10 border border-emerald-600/20 text-emerald-300 px-4 py-3 text-center rounded-md">
                {dict.home?.phasePanel?.nomination || 'Les nominations sont en cours ! Allez vite nominer vos jeux'}
              </div>
            )}

            {currentPhase === 'vote' && (
              <div className="bg-blue-700/10 border border-blue-700/20 text-blue-200 px-4 py-3 text-center rounded-md">
                {dict.home?.phasePanel?.vote || "La phase de votes des jeux de l'année est ouverte"}
              </div>
            )}

            {currentPhase === 'results' && (
              <div className="bg-yellow-700/10 border border-yellow-700/20 text-yellow-200 px-4 py-3 text-center rounded-md">
                {dict.home?.phasePanel?.results || "Retrouvez dès à présent les résultats des jeux de l'année"}
              </div>
            )}
          </div>
        </div>
          </div>
        </header>



        <main className="p-6 md:p-10 max-w-6xl mx-auto">
          {/* Pitch principal */}
          <section className="mb-8 bg-gray-800/60 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-3">{dict.home.pitch.title}</h2>
            <p>{dict.home.pitch.description}</p>
          </section>

          <section className="mb-8 bg-gray-800/60 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-3">
              {dict.home.howitworks.title}
            </h2>

            <p className="mb-4">{dict.home.howitworks.intro}</p>

            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>{dict.home.howitworks.phase1}</li>
              <li>{dict.home.howitworks.phase2}</li>
              <li>{dict.home.howitworks.phase3}</li>
            </ul>

            <p className="mb-6">{dict.home.howitworks.extra}</p>

            <div className="flex justify-center">
              <Link 
                href={participateLink}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-sky-400 uppercase rounded-lg text-lg font-semibold border border-sky-400 hover:bg-sky-400 hover:text-gray-200 transition-colors"
              >
                {dict.home.howitworks.cta}
              </Link>
            </div>
          </section>

          {/* Derniers jeux ajoutés */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {dict.home.latestGames.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {latestGames.length > 0 ? (
                latestGames.map((game) => (
                  <div key={game.id}>
                    <Link href={`/${locale}/games/${game.id}`} className="block">
                      <GameCard
                        image={
                          game.image ? `${API_URL}/${game.image}` : "/logo/logo.png"
                        }
                        title={game.name}
                        year={game.year}
                        releaseDate={game.publishAt}
                      />
                    </Link>

                    {game.links && game.links.length > 0 && (
                      <div className="mt-2 text-sm text-gray-300">
                        <ul className="list-disc list-inside">
                          {game.links.map((l: { label: string; url: string }, idx: number) => (
                            <li key={idx}>
                              <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline">
                                {l.label || l.url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="col-span-3 text-center text-gray-400">
                  {dict.home.latestGames.noGames ||
                    "Aucun jeu disponible pour le moment"}
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
