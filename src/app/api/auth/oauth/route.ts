import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';

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

type OAuthProvider = 'google' | 'github' | 'linkedin';

const providerIdField: Record<OAuthProvider, string> = {
  google: 'googleId',
  github: 'githubId',
  linkedin: 'linkedinId',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, providerId, email, name, avatar } = body;

    if (!provider || !providerId || !email) {
      return NextResponse.json(
        { error: 'Provider, providerId, and email are required' },
        { status: 400 }
      );
    }

    if (!['google', 'github', 'linkedin'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid OAuth provider. Supported: google, github, linkedin' },
        { status: 400 }
      );
    }

    const oauthProvider = provider as OAuthProvider;
    const idField = providerIdField[oauthProvider];

    // Check if a user exists with the matching provider ID
    const existingUser = await db.user.findFirst({
      where: {
        [idField]: providerId,
      },
    });

    // Also check by email in case they already have an account
    const existingEmailUser = !existingUser
      ? await db.user.findUnique({
          where: { email: email.toLowerCase() },
        })
      : null;

    let user = existingUser || existingEmailUser;
    let isNewUser = false;

    if (user) {
      // Existing user - update OAuth fields if not already set
      const updateData: Record<string, unknown> = {};
      if (!user[idField as keyof typeof user]) {
        updateData[idField] = providerId;
      }
      if (avatar && !user.oauthAvatar) {
        updateData.oauthAvatar = avatar;
      }

      if (Object.keys(updateData).length > 0) {
        user = await db.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    } else {
      // New user - create account
      isNewUser = true;
      const randomPassword = crypto.randomUUID().replace(/-/g, '') + Math.random().toString(36).substring(2, 6);
      const passwordHash = await hashPassword(randomPassword);

      user = await db.user.create({
        data: {
          fullName: name || email.split('@')[0],
          email: email.toLowerCase(),
          passwordHash,
          role: 'student',
          level: 'Starter',
          points: 0,
          streakDays: 0,
          isVerified: true, // OAuth users are considered verified
          [idField]: providerId,
          oauthAvatar: avatar || null,
          profilePhoto: avatar || null,
        },
      });
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

    // Parse device info from user-agent
    const userAgent = req.headers.get('user-agent');
    const { deviceName, deviceInfo } = parseDeviceInfo(userAgent);

    // Get IP address
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null;

    // Create session
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
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

    // Create login history record
    await db.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: ipAddress?.split(',')[0]?.trim() || null,
        device: deviceName,
        success: true,
      },
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
      level: user.level,
      campusCredUsername: user.campusCredUsername,
    };

    const response = NextResponse.json({
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      user: userData,
      token: accessToken,
      refreshToken,
      ...(isNewUser && { isNewUser: true }),
    });

    // Set refresh token as HttpOnly cookie
    response.cookies.set('cc_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    });

    return response;
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
