import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Petaluma Script (Steinberg, SIL OFL — see fonts/OFL.txt): Real Book-style hand lettering.
const displayFont = localFont({
  src: "./fonts/PetalumaScript.woff2",
  variable: "--font-display",
  fallback: ["DM Sans", "ui-sans-serif", "sans-serif"],
});

const sansFont = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const monoFont = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Chord Thrower",
  description: "Chord Thrower drills chords and jazz patterns to practice improvisation, with a built-in metronome.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="px-4 py-6 text-center text-xs text-foreground/40">
          Chord Thrower — chord drills, jazz patterns &amp; metronome for improvisers.
        </footer>
      </body>
    </html>
  );
}
