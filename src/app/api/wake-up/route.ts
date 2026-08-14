/**
 * Wake-up Endpoint for Render Free Tier
 * 
 * This endpoint is designed to quickly wake up the application when it sleeps.
 * It performs minimal work and returns immediately to reduce cold start time.
 * 
 * Use a service like UptimeRobot, Cron-Job.org, or Render's Cron Job to call
 * this endpoint every 5-10 minutes to prevent the app from sleeping.
 */

import { NextResponse } from "next/server";

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'awake',
    message: 'CampusCred is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Content-Type': 'application/json',
    },
  });
}

// Support HEAD requests for lightweight checks
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}
