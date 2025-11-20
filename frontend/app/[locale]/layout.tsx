import Header from '@/components/layout/Header';
import { locales, Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: Locale }> 
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return {
    title: dict.meta?.title || 'GOTY',
    description: dict.meta?.description || 'Game of the Year',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const dict = await getDictionary(locale);
  const prefix = `/${locale}`;

  return (
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
  );
}
