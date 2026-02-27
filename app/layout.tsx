import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GamePedia TG — L'esport togolais",
  description:
    "La référence de l'esport au Togo. Suivez les tournois, les joueurs et les classements des meilleures compétitions gaming.",
  keywords: ["esport", "togo", "gaming", "tournoi", "classement", "valorant", "fifa", "free fire"],
  openGraph: {
    title: "GamePedia TG — L'esport togolais",
    description: "La référence de l'esport au Togo.",
    locale: "fr_TG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
