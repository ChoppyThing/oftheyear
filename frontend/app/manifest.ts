import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Game of the Year - GOTY',
    short_name: 'GOTY',
    description: 'Vote for the best games of the year! Join the largest independent gaming community.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1a1a',
    theme_color: '#1a1a1a',
    icons: [
      {
        src: '/logo/logo.png',
        sizes: '350x350',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['entertainment', 'games', 'social'],
    lang: 'en',
    dir: 'ltr',
    orientation: 'portrait-primary',
  };
}
