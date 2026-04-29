import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // Optimización de imágenes para baja conexión
  images: {
    formats: ['image/webp'],
    deviceSizes: [400, 640, 768, 1024],
    imageSizes: [32, 64, 128, 260],
  },

  // Compresión gzip/brotli para todas las respuestas — crítico para baja conexión
  compress: true,

  // Headers de cache y compresión para baja conexión
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // Cache agresivo SOLO para assets estáticos inmutables (imágenes, fuentes)
      // NO para chunks JS — esos se revalidan con hash en filename
      {
        source: "/signals/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(.*)\\.(webp|png|jpg|svg|ico|woff2|woff|ttf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Chunks JS: NO cache agresivo — permite revalidación con ETag
      // Antes: max-age=31536000, immutable → causaba que el navegador sirviera chunks viejos
      // con botón X y scroll indicator eliminados del código fuente
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      // Chunks dev: sin caché — HMR necesita revalidación constante
      {
        source: "/_next/dev/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
      // HTML: sin caché en dev — siempre fresh
      {
        source: "/",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },

  // Permitir cross-origin requests desde el panel de preview
  allowedDevOrigins: [
    "https://preview-web-f51e802b-ca59-4d1f-84fc-1989cb1896c4.space.chatglm.site",
  ],
};

export default nextConfig;
