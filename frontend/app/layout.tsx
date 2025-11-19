import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto_Mono } from "next/font/google";
import { Roboto } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import Header from "@/components/layout/Header";
import AnimatedBackground from "@/components/layout/AnimatedBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

const currentYear: number = new Date().getFullYear();

export const metadata: Metadata = {
  title: "GOTY - Game of the Year",
  description: "Game of the year " + currentYear + "!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} antialiased`}>
        <AnimatedBackground />
        <div className="">
          <Header />

          {children}
        </div>

        <footer className="bg-gray-900 border-t border-gray-800 py-6 mt-8">
          <div className="max-w-6xl mx-auto px-6 text-center text-gray-400 text-sm">
            <p>
              © {new Date().getFullYear()} Game of the Year — Tous droits
              réservés
            </p>
            <p className="mt-2">
              Contact · Mentions légales · Politique de confidentialité
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
