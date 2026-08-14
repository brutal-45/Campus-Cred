import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployments (Render, etc.)
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  turbopack: {},
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  serverExternalPackages: ["@prisma/client", "puppeteer", "sharp", "bcryptjs", "canvas"],
  // Ensure API routes are properly optimized
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize for serverless environments (Vercel)
    serverComponents: true,
  },
  // Prevent hydration errors during session restoration
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
};

export default nextConfig;
