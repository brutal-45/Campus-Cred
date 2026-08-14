/**
 * Health Check API Endpoint for Render
 * 
 * This endpoint helps Render determine if the application is healthy.
 * It checks database connectivity and returns appropriate status.
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Create a single Prisma client instance for health checks
const prisma = new PrismaClient({
  log: [],
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connectivity
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || 'unknown',
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Also support HEAD requests for lightweight health checks
export async function HEAD() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
    });
  } finally {
    await prisma.$disconnect();
  }
}
