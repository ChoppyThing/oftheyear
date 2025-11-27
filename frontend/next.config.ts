import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Optimisation des images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 90],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 an
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.oftheyear.eu',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'votre-domaine.com',
        pathname: '/uploads/**',
      },
    ],
  },
  // Compression
  compress: true,
  // Headers pour le cache et la sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
      {
        source: '/logo/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Optimisation du bundle
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
