import { Locale } from '@/i18n.config';
import Link from 'next/link';
import { Metadata } from 'next';
import AnimatedBackground from '@/components/layout/AnimatedBackground';
import { getDictionary } from '@/lib/i18n';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { GiFireworkRocket } from 'react-icons/gi';

interface AboutPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://game.oftheyear.eu';
  
  return {
    title: dict.about.meta.title,
    description: dict.about.meta.description,
    alternates: {
      canonical: `${baseUrl}/${locale}/about`,
      languages: {
        'en': `${baseUrl}/en/about`,
        'fr': `${baseUrl}/fr/about`,
        'es': `${baseUrl}/es/about`,
        'zh': `${baseUrl}/zh/about`,
      },
    },
    openGraph: {
      title: dict.about.meta.title,
      description: dict.about.meta.description,
      url: `${baseUrl}/${locale}/about`,
      type: 'website',
      locale: locale === 'en' ? 'en_US' : locale === 'fr' ? 'fr_FR' : locale === 'es' ? 'es_ES' : 'zh_CN',
    },
    twitter: {
      card: 'summary',
      title: dict.about.meta.title,
      description: dict.about.meta.description,
    },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <>
      <AnimatedBackground />
      <main className="relative z-10 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-white bg-clip-text text-transparent">
              {dict.about.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300">
              {dict.about.hero.subtitle}
            </p>
          </section>

          {/* Independence Section */}
          <section className="mb-16 bg-gray-800/60 rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-6 text-sky-300">
              {dict.about.independence.title}
            </h2>
            <div className="space-y-4 text-gray-200 text-lg leading-relaxed">
              <p>{dict.about.independence.intro}</p>
              <p>{dict.about.independence.freedom}</p>
              <p className="font-semibold text-white">{dict.about.independence.community}</p>
            </div>
          </section>

          {/* Proposal Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-sky-300">
              {dict.about.proposal.title}
            </h2>
            <p className="text-gray-200 text-lg mb-8 text-center">
              {dict.about.proposal.intro}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Games */}
              <div className="bg-linear-to-r from-gray-800/80 to-gray-900/80 rounded-xl p-6 backdrop-blur-sm border border-cyan-500/20">
                <h3 className="text-2xl font-bold mb-4 text-cyan-300">
                  {dict.about.proposal.games.title}
                </h3>
                <p className="text-gray-300 mb-4">{dict.about.proposal.games.description}</p>
                <p className="text-md text-gray-300">{dict.about.proposal.games.validation}</p>
              </div>

              {/* Categories */}
              <div className="bg-linear-to-r from-gray-800/80 to-gray-900/80 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20">
                <h3 className="text-2xl font-bold mb-4 text-purple-300">
                  {dict.about.proposal.categories.title}
                </h3>
                <p className="text-gray-300 mb-4">{dict.about.proposal.categories.description}</p>
                <p className="text-md text-gray-300 mb-2">{dict.about.proposal.categories.validation}</p>
                <p className="text-sm font-semibold text-purple-400">{dict.about.proposal.categories.limit}</p>
              </div>
            </div>
          </section>

          {/* Voting Section */}
          <section className="mb-16 bg-gray-800/60 rounded-xl p-8 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-8 text-center text-sky-300">
              {dict.about.voting.title}
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3 text-white flex items-center gap-2">
                  <span className="text-2xl"><FaRegCalendarAlt /></span>
                  {dict.about.voting.opening.title}
                </h3>
                <p className="text-gray-200 text-lg">{dict.about.voting.opening.description}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-white flex items-center gap-2">
                  <span className="text-2xl"><GiFireworkRocket /></span>
                  {dict.about.voting.reveal.title}
                </h3>
                <p className="text-gray-200 text-lg mb-2">{dict.about.voting.reveal.description}</p>
                <p className="text-cyan-300 font-semibold">{dict.about.voting.reveal.date}</p>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-sky-300">
              {dict.about.values.title}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {dict.about.values.items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="bg-linear-to-r from-gray-800/60 to-gray-900/60 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:border-cyan-400/50 transition-all"
                >
                  <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center  rounded-xl p-12">
            <h2 className="text-3xl font-bold mb-4 text-white">
              {dict.about.cta.title}
            </h2>
            <p className="text-xl text-cyan-50 mb-8">
              {dict.about.cta.description}
            </p>
            <Link
              href={`/${locale}/register`}
              className="inline-block bg-white text-cyan-600 font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
            >
              {dict.about.cta.button}
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
