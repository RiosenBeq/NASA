import type { Metadata, Viewport } from "next";
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
  title: "NASA Space Bioscience Explorer | NextGenLAB",
  description: "AI-powered semantic search across 608 NASA space bioscience publications. Real-time summaries, Q&A, and knowledge graph visualization for space biology research.",
  keywords: ["NASA", "space biology", "bioscience", "research", "AI", "semantic search", "publications", "space exploration"],
  authors: [{ name: "NextGenLAB" }],
  creator: "NextGenLAB",
  publisher: "NextGenLAB",
  robots: "index, follow",
  openGraph: {
    title: "NASA Space Bioscience Explorer",
    description: "AI-powered semantic search across 608 NASA space bioscience publications",
    type: "website",
    locale: "en_US",
    siteName: "NextGenLAB Space Bioscience Explorer",
  },
  twitter: {
    card: "summary_large_image",
    title: "NASA Space Bioscience Explorer",
    description: "AI-powered semantic search across 608 NASA space bioscience publications",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#a78bfa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="starfield" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
