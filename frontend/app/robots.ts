import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/user/',
          '/api/',
          '/*?token=*', // Bloquer les URLs avec tokens (verify, reset-password)
        ],
      },
    ],
    sitemap: 'https://game.oftheyear.eu/sitemap.xml',
  };
}
