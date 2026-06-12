import type { NextConfig } from "next";

const isVercel = process.env.VERCEL === "1";
const isRender = process.env.RENDER === "1";

const nextConfig: NextConfig = {
  // "standalone" is for Docker/VPS only — Vercel/Render use their own runtime
  ...(isVercel || isRender ? {} : { output: "standalone" }),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  turbopack: {},
  // Allow platforms to handle images properly
  images: {
    unoptimized: true,
  },
  // Serverless external packages (needed for Prisma, Puppeteer, etc.)
  serverExternalPackages: ["@prisma/client", "puppeteer", "sharp", "bcryptjs", "canvas"],
};

export default nextConfig;
