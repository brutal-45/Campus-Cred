import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No "output: standalone" — Render runs next start directly
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  turbopack: {},
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["@prisma/client", "puppeteer", "sharp", "bcryptjs", "canvas"],
};

export default nextConfig;
