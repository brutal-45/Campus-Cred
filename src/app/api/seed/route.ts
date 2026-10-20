import { NextResponse } from 'next/server';

/**
 * Database seeding must only be run from a trusted CLI environment. This route
 * used to create an administrator with a hard-coded password and is disabled.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Remote database seeding is disabled. Run the Prisma seed command from a trusted environment.' },
    { status: 410 }
  );
}

export async function POST() {
  return GET();
}
