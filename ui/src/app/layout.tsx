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
  title: "NextGenLAB - Space Bioscience Explorer",
  description: "AI-powered platform for exploring NASA space bioscience research. Search 608 publications, generate summaries, and discover insights with knowledge graph visualization.",
  keywords: ["NASA", "space bioscience", "research", "AI", "knowledge graph", "semantic search", "publications"],
  authors: [{ name: "NextGenLAB" }],
  openGraph: {
    title: "NextGenLAB - Space Bioscience Explorer",
    description: "Explore 608 NASA space bioscience publications with AI-powered search and summaries",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextGenLAB - Space Bioscience Explorer",
    description: "AI-powered NASA space bioscience research platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="starfield" aria-hidden="true" />
        <div className="logo-background-glow" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
