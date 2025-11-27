import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import { ToastProvider } from "@/components/providers/ToastProvider";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1a1a1a',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://game.oftheyear.eu'),
  title: {
    default: "GOTY - Game of the Year",
    template: "%s | GOTY"
  },
  description: "Vote for the best games of the year! Join the largest independent gaming community and elect the Game of the Year together.",
  keywords: ['game of the year', 'GOTY', 'gaming', 'vote', 'video games', 'best games', 'gaming community', 'game awards'],
  authors: [{ name: 'Game of the Year' }],
  creator: 'Game of the Year',
  publisher: 'Game of the Year',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
  other: {
    'author': 'Game of the Year',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.oftheyear.eu" />
        <link rel="dns-prefetch" href="https://api.oftheyear.eu" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${roboto.className} antialiased`}>
        <AnimatedBackground />
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
