import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import { ToastProvider } from "@/components/providers/ToastProvider";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GOTY - Game of the Year",
  description: "Game of the year " + new Date().getFullYear() + "!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={`${roboto.className} antialiased`}>
        <AnimatedBackground />
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
