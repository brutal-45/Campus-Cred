import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma Client Singleton
 *
 * - In development: reuse client on hot-reload (store on globalThis)
 * - In production (serverless/Vercel): create new client per cold start
 *   but reuse within the same function invocation
 * - In production (VPS/standalone): single long-lived client
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
  })

// In development, persist client across hot-reloads
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
