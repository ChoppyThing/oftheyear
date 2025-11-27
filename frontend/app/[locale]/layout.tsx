import Header from '@/components/layout/Header';
import { locales, Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { locale } = await params as { locale: Locale };
  const dict = await getDictionary(locale);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://game.oftheyear.eu';
  const currentYear = new Date().getFullYear();
  const title = dict.meta?.title || 'GOTY - Game of the Year';
  const description = dict.meta?.description || 'Vote for the best games of the year!';

  return {
    title,
    description,
    keywords: ['game of the year', 'GOTY', currentYear.toString(), 'gaming', 'vote', 'video games', 'best games', locale === 'fr' ? 'jeu de l\'année' : '', locale === 'es' ? 'juego del año' : '', locale === 'zh' ? '年度游戏' : ''].filter(Boolean),
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
      alternateLocale: locales.filter(l => l !== locale).map(l => 
        l === 'en' ? 'en_US' : l === 'fr' ? 'fr_FR' : l === 'es' ? 'es_ES' : 'zh_CN'
      ),
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
      creator: '@GameOfTheYear',
    },
  };
}

export default async function LocaleLayout({ children, params }: any) {
  const { locale } = await params as { locale: Locale };

  if (!locales.includes(locale)) {
    notFound();
  }

  const dict = await getDictionary(locale);
  const prefix = `/${locale}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://game.oftheyear.eu';
  const currentYear = new Date().getFullYear();

  // Structured Data JSON-LD pour le SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Game of the Year',
    url: `${baseUrl}/${locale}`,
    description: dict.meta?.description,
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col min-h-screen">
      <Header locale={locale} dict={dict} />
      
      <main className="grow">
        {children}
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>
            © {new Date().getFullYear()} Game of the Year — {dict.footer?.rights || 'All rights reserved'}
          </p>
          <p className="mt-2">
            {/*Contact ·*/} 
            <Link href={`${prefix}/legal`}>{dict.footer?.legal || 'Legal Notice'}</Link> {/*" · "*/}
            {/*<Link href={`${prefix}/cgu`}>{dict.footer?.cgu || 'CGU'}</Link>*/}
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}
