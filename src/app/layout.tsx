import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";


const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monitor-geopolitico.vercel.app";

export const metadata: Metadata = {
  title: "Monitor Geopolítico — News Connect",
  description:
    "Inteligencia geopolítica de acceso libre. Señales clasificadas en tiempo real desde la perspectiva del Sur Global.",
  keywords: [
    "geopolítica",
    "inteligencia",
    "Sur Global",
    "News Connect",
    "señales",
    "análisis",
    "multipolar",
    "Latinoamérica",
    "BRICS",
    "monitor geopolítico",
  ],
  authors: [{ name: "News Connect" }],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: {
      "es": "/",
      "en": "/en",
      "pt": "/pt",
      "ar": "/ar",
      "fr": "/fr",
    },
  },
  openGraph: {
    title: "Monitor Geopolítico — Inteligencia desde el Sur Global",
    description:
      "Señales geopolíticas clasificadas en tiempo real con análisis IA. Perspectiva multipolar, acceso libre.",
    url: SITE_URL,
    siteName: "Monitor Geopolítico",
    locale: "es_LA",
    type: "website",
    images: [
      {
        url: "/og-image.webp",
        width: 1344,
        height: 768,
        alt: "Monitor Geopolítico — News Connect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Monitor Geopolítico — Inteligencia desde el Sur Global",
    description:
      "Señales geopolíticas clasificadas en tiempo real con análisis IA.",
    images: ["/og-image.webp"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/** JSON-LD structured data for the platform */
function JsonLd() {
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Monitor Geopolítico",
    "alternateName": "Monitor Geopolítico — News Connect",
    "url": SITE_URL,
    "description": "Inteligencia geopolítica de acceso libre desde la perspectiva del Sur Global.",
    "publisher": {
      "@type": "Organization",
      "name": "News Connect",
      "url": SITE_URL,
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": SITE_URL,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Señales Geopolíticas",
        "item": `${SITE_URL}/#signals`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Análisis",
        "item": `${SITE_URL}/#analysis`,
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Hilos Geopolíticos",
        "item": `${SITE_URL}/#explorer`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Preconnect para Google Fonts — reduce latencia en baja conexión */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preconnect para placehold.co (imágenes placeholder) */}
        <link rel="preconnect" href="https://placehold.co" />
        {/* DNS prefetch para dominios de fuentes de noticias */}
        <link rel="dns-prefetch" href="https://www.aljazeera.com" />
        <link rel="dns-prefetch" href="https://www.telesurtv.net" />
        <link rel="dns-prefetch" href="https://www.trtworld.com" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
