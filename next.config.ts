import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Arena's proxied development preview host to load HMR/dev assets.
  allowedDevOrigins: ['*.e2b.app'],
  // Let Vercel package App Router routes as serverless/edge functions itself.
  // `output: 'standalone'` is intended for custom Docker/server deployments.
  // Type errors must block the build (the codebase type-checks cleanly);
  // `npm run typecheck` + CI enforce this.
  reactStrictMode: true,
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  serverExternalPackages: ["@prisma/client", "puppeteer", "sharp", "bcryptjs"],
  // Ensure API routes are properly optimized
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Prevent hydration errors during session restoration
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
};

export default nextConfig;
