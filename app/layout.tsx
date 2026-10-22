import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Kalam } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Kalam: hand lettering for chords and titles. Only the bold face is loaded, so all display text uses it.
const handFont = Kalam({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: "700",
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
      className={`${handFont.variable} ${sansFont.variable} ${monoFont.variable} h-full antialiased`}
      // data-theme is set by the init script before hydration, so the server markup won't match it.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
