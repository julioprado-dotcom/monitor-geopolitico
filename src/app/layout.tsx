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

/**
 * JSON-LD: FAQPage schema — optimizado para featured snippets
 * Responde las preguntas clave sobre el modelo epistemológico del Monitor.
 */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué es la Óptica Sur Global?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La Óptica Sur Global es un marco analítico geopolítico fundamentado en las Epistemologías del Sur de Boaventura de Sousa Santos. Propone analizar los eventos internacionales desde la perspectiva de los países y poblaciones históricamente marginalizados por el orden hegemónico occidental, priorizando la soberanía cognitiva, la justicia epistémica y el pragmatismo emancipador.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Cómo funcionan los filtros analíticos del Monitor Geopolítico?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El Monitor aplica cinco filtros analíticos: 1) Congruencia Inversa (detectar doble moral en la cobertura de conflictos), 2) Coherencia Histórica (conectar eventos actuales con raíces coloniales y neocoloniales), 3) Integridad Epistémica (criticar también opresión proveniente del Sur), 4) Confiabilidad Asimétrica (auditar el sesgo de cada fuente según su nivel), y 5) Flexibilidad Pragmática (reconocer la complejidad de alianzas cambiantes).",
      },
    },
    {
      "@type": "Question",
      "name": "¿Qué es la bidireccionalidad de la relevancia?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La bidireccionalidad de la relevancia es un concepto que evalúa cada evento geopolítico en dos dimensiones simultáneas: Amenaza (riesgo para la estabilidad, soberanía o derechos humanos) y Emancipación (potencial de transformación positiva hacia mayor autonomía del Sur Global). Esto supera el enfoque unidimensional de amenaza de los monitores convencionales.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Qué niveles de fuente utiliza el Monitor Geopolítico?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El Monitor clasifica las fuentes en cuatro niveles: Nivel A (Referencial) — alta honestidad periodística y cobertura amplia del Sur Global; Nivel B (Complementaria) — valiosa con sesgos variables que requieren contextualización; Nivel C (Contrastiva) — útil para contrastar perspectivas pero con honestidad cuestionable en ciertos temas; Nivel D (Vigilada) — patrón recurrente de desinformación verificable, mostrada para monitoreo de narrativas.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Qué regiones cubre el Monitor Geopolítico?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El Monitor cubre seis regiones: Latinoamérica, Europa, Asia-Pacífico, África, Medio Oriente y Norteamérica. Su enfoque prioritario es el Sur Global, pero analiza también eventos del Norte Global cuando tienen impacto directo o indirecto sobre las dinámicas de poder entre el Norte y el Sur.",
      },
    },
  ],
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
      "description": "Plataforma de inteligencia geopolítica con perspectiva del Sur Global",
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

  /** Organization schema con más detalle para E-E-A-T */
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "News Connect",
    "alternateName": "Monitor Geopolítico — News Connect",
    "url": SITE_URL,
    "description": "Plataforma de inteligencia geopolítica con perspectiva del Sur Global. Análisis multipolar de señales en tiempo real.",
    "sameAs": [],
    "knowsAbout": [
      "Geopolítica", "Sur Global", "Epistemologías del Sur", "Soberanía Cognitiva",
      "Análisis de fuentes", "Relaciones internacionales", "BRICS", "Multipolaridad",
    ],
  };

  /** Dataset schema — describe la base de datos de señales para Google Dataset Search */
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Señales Geopolíticas — Monitor Geopolítico",
    "description": "Base de datos de señales geopolíticas clasificadas con análisis de fuentes, relevancia bidireccional y perspectiva del Sur Global. Incluye 8 clasificadores temáticos, 6 regiones y 4 niveles de fuente.",
    "creator": {
      "@type": "Organization",
      "name": "News Connect",
    },
    "url": SITE_URL,
    "temporalCoverage": "2025/2026",
    "spatialCoverage": [
      { "@type": "Place", "name": "Latinoamérica" },
      { "@type": "Place", "name": "Europa" },
      { "@type": "Place", "name": "Asia-Pacífico" },
      { "@type": "Place", "name": "África" },
      { "@type": "Place", "name": "Medio Oriente" },
      { "@type": "Place", "name": "Norteamérica" },
    ],
    "keywords": [
      "geopolítica", "señales", "Sur Global", "análisis de fuentes",
      "BRICS", "conflictos", "inteligencia geopolítica", "multipolaridad",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
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
