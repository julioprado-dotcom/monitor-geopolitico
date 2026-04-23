import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    '@libsql/client',
    'z-ai-web-dev-sdk',
  ],
};

export default nextConfig;
