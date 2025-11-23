import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      // ✅ Pour la production
      {
        protocol: 'https',
        hostname: 'votre-domaine.com',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
