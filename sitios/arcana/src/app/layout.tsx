import type { Metadata } from "next";
import { Crimson_Pro, JetBrains_Mono } from "next/font/google";
import { GAME } from "@/lib/config";
import { GameProviders } from "@/components/providers/GameProviders";
import { AmbientAudio } from "@/components/audio/AmbientAudio";
import "./globals.css";

const crimson = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: GAME.name,
  description: "Este archivo no fue construido para ti.",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${crimson.variable} ${jetbrains.variable} h-full`}>
      <body className="grain min-h-full flex flex-col">
        <GameProviders>
          <AmbientAudio />
          {children}
        </GameProviders>
      </body>
    </html>
  );
}
