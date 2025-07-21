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
  title: "ShrinkIt - Free Online Image Compressor",
  description:
    "ShrinkIt is a free online image compressor that reduces PNG, JPG, and WebP file sizes by up to 80% without losing quality.",
  keywords: [
    "image compressor",
    "online image compression",
    "shrink PNG",
    "optimize JPG",
    "WebP compressor",
    "reduce image size",
    "free image optimizer",
  ],
  authors: [{ name: "ShrinkIt Team", url: "https://shrink--it.vercel.app" }],
  creator: "ShrinkIt",
  publisher: "Mahesh Thorat",
  metadataBase: new URL("https://shrink--it.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ShrinkIt - Free Online Image Compressor",
    description:
      "Compress PNG, JPG, WebP and more with lightning-fast, privacy-first compression. No uploads. Everything runs in your browser.",
    url: "https://shrink--it.vercel.app",
    siteName: "ShrinkIt",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://shrink--it.vercel.app/logo.png",
        width: 1200,
        height: 630,
        alt: "ShrinkIt - Free Online Image Compressor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShrinkIt - Free Online Image Compressor",
    description:
      "Compress your images for free. No quality loss. No uploads. Instant results.",
    images: ["https://shrink--it.vercel.app/logo.png"],
    creator: "@maheshmthorat", 
  },
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
