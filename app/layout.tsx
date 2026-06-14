import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const displayFont = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
