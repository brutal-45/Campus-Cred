import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';

// ─── Admin Configuration ───
const ADMIN_EMAIL = 'creatorsports81@gmail.com';
const ADMIN_PASSWORD = 'Viraj@133';

function parseDeviceInfo(userAgent: string | null): { deviceName: string; deviceInfo: string } {
  if (!userAgent) return { deviceName: 'Unknown Device', deviceInfo: 'Unknown' };
  const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
  const isChrome = /Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent);
  const isFirefox = /Firefox/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
  const isEdge = /Edge|Edg/i.test(userAgent);
  const isWindows = /Windows/i.test(userAgent);
  const isMac = /Mac OS/i.test(userAgent);
  const isLinux = /Linux/i.test(userAgent);

  let browser = 'Unknown Browser';
  if (isChrome) browser = 'Chrome';
  else if (isFirefox) browser = 'Firefox';
  else if (isSafari) browser = 'Safari';
  else if (isEdge) browser = 'Edge';

  let os = 'Unknown OS';
  if (isWindows) os = 'Windows';
  else if (isMac) os = 'macOS';
  else if (isLinux) os = 'Linux';
  if (isMobile) os = /iPhone/i.test(userAgent) ? 'iOS' : 'Android';

  return {
    deviceName: `${browser} on ${os}${isMobile ? ' (Mobile)' : ''}`,
    deviceInfo: userAgent.substring(0, 255),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    let user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // ─── Admin Auto-Create: If admin email doesn't exist, create it ───
    if (!user && email.toLowerCase() === ADMIN_EMAIL) {
      if (password === ADMIN_PASSWORD) {
        const passwordHash = await hashPassword(ADMIN_PASSWORD);
        user = await db.user.create({
          data: {
            fullName: 'Admin',
            email: ADMIN_EMAIL,
            passwordHash,
            role: 'admin',
            isVerified: true,
            level: 'Legend',
            points: 999,
            campusCredScore: 1000,
          },
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ─── Admin Lock: Only creatorsports81@gmail.com can login as admin ───
    if (user.role === 'admin' && user.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Access denied. Admin login is restricted.' },
        { status: 403 }
      );
    }

    // ─── Admin Direct Login: Allow admin with hardcoded password ───
    if (user.email === ADMIN_EMAIL && user.role === 'admin') {
      // For admin, verify against the configured password
      if (password !== ADMIN_PASSWORD) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      // Admin authenticated — skip bcrypt check, proceed to token generation below
    } else {
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        // Log failed login attempt
        const userAgent = req.headers.get('user-agent');
        const { deviceName } = parseDeviceInfo(userAgent);
        const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null;

        await db.loginHistory.create({
          data: {
            userId: user.id,
            ipAddress: ipAddress?.split(',')[0]?.trim() || null,
            device: deviceName,
            success: false,
          },
        });

        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Parse device info from user-agent header
    const userAgent = req.headers.get('user-agent');
    const { deviceName, deviceInfo } = parseDeviceInfo(userAgent);
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null;

    // Determine session duration based on remember me
    const sessionDurationMs = rememberMe
      ? 30 * 24 * 60 * 60 * 1000  // 30 days
      : 24 * 60 * 60 * 1000;       // 24 hours
    const sessionExpiresAt = new Date(Date.now() + sessionDurationMs);

    // Create Session record
    await db.session.create({
      data: {
        userId: user.id,
        refreshToken,
        deviceName,
        deviceInfo,
        ipAddress: ipAddress?.split(',')[0]?.trim() || null,
        userAgent: userAgent?.substring(0, 255) || null,
        expiresAt: sessionExpiresAt,
      },
    });

    // Create LoginHistory record for successful login
    await db.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: ipAddress?.split(',')[0]?.trim() || null,
        device: deviceName,
        success: true,
      },
    });

    // Update user's lastActiveAt
    await db.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const userData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      college: user.college,
      city: user.city,
      degree: user.degree,
      branch: user.branch,
      year: user.year,
      profilePhoto: user.profilePhoto,
      isVerified: user.isVerified,
      streakDays: user.streakDays,
      points: user.points,
      campusCredScore: user.campusCredScore,
      level: user.level,
      referralCode: user.referralCode,
      campusCredUsername: user.campusCredUsername,
    };

    const response = NextResponse.json({
      message: 'Login successful',
      user: userData,
      token: accessToken,
      refreshToken,
    });

    // Set the refresh token as an HttpOnly cookie
    response.cookies.set('cc_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 24 hours in seconds
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
