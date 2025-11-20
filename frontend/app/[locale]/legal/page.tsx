import { Locale } from '@/i18n.config';
import { Metadata } from 'next';
import AnimatedBackground from '@/components/layout/AnimatedBackground';
import { getDictionary } from '@/lib/i18n';

interface LegalPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return {
    title: dict.legal.meta.title,
    description: dict.legal.meta.description,
  };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <>
      <AnimatedBackground />
      <main className="relative z-10 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-white bg-clip-text text-transparent">
              {dict.legal.title}
            </h1>
            <p className="text-gray-400">2025-11-20</p>
          </div>

          <div className="space-y-8">
            {/* Editor Section */}
            <section className="bg-gray-800/60 rounded-xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">
                {dict.legal.editor.title}
              </h2>
              <div className="space-y-3 text-gray-200">
                <p><strong>{dict.legal.editor.projectName}:</strong> Game of the Year</p>
                <p><strong>{dict.legal.editor.nature}:</strong> {dict.legal.editor.natureDesc}</p>
                <p><strong>{dict.legal.editor.contact}:</strong> <a href="mailto:contact@gameoftheyear.com" className="text-cyan-400 hover:underline">contact@gameoftheyear.com</a></p>
              </div>
            </section>

            {/* Hosting Section */}
            <section className="bg-gray-800/60 rounded-xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">
                {dict.legal.hosting.title}
              </h2>
              <p className="text-gray-200">{dict.legal.hosting.info}</p>
            </section>

            {/* Data Section */}
            <section className="bg-gray-800/60 rounded-xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">
                {dict.legal.data.title}
              </h2>
              <div className="space-y-4 text-gray-200">
                <div>
                  <h3 className="font-semibold text-white mb-2">{dict.legal.data.collected.title}</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    {dict.legal.data.collected.items.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">{dict.legal.data.usage.title}</h3>
                  <p>{dict.legal.data.usage.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">{dict.legal.data.rights.title}</h3>
                  <p>{dict.legal.data.rights.description}</p>
                </div>
              </div>
            </section>

            {/* Cookies Section */}
            <section className="bg-gray-800/60 rounded-xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">
                {dict.legal.cookies.title}
              </h2>
              <p className="text-gray-200 mb-3">{dict.legal.cookies.description}</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-gray-200">
                {dict.legal.cookies.types.map((type: string, index: number) => (
                  <li key={index}>{type}</li>
                ))}
              </ul>
            </section>

            {/* Intellectual Property Section */}
            <section className="bg-gray-800/60 rounded-xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">
                {dict.legal.property.title}
              </h2>
              <p className="text-gray-200 mb-3">{dict.legal.property.content}</p>
              <p className="text-gray-200">{dict.legal.property.gameImages}</p>
            </section>

            {/* Liability Section */}
            <section className="bg-gray-800/60 rounded-xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">
                {dict.legal.liability.title}
              </h2>
              <p className="text-gray-200">{dict.legal.liability.description}</p>
            </section>

            {/* Contact Section */}
            <section className="rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-3 text-white">
                {dict.legal.contact.title}
              </h2>
              <p className="text-cyan-50 mb-4">{dict.legal.contact.description}</p>
              <a 
                href="mailto:contact@gameoftheyear.com" 
                className="inline-block bg-white text-cyan-600 font-bold py-3 px-6 rounded-full hover:bg-gray-100 transition-all"
              >
                contact@gameoftheyear.com
              </a>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
