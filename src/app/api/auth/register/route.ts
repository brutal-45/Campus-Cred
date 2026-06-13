import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      password,
      profilePhoto,
      role,
      companyName,
      industry,
      website,
      expertise,
      designation,
      organization,
      experience,
      collegeName,
      address,
      state,
      naacRating,
    } = body;

    // ─── Validation ───
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }

    // Stronger password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must include at least one uppercase letter' },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must include at least one lowercase letter' },
        { status: 400 }
      );
    }

    if (!/\d/.test(password)) {
      return NextResponse.json(
        { error: 'Password must include at least one number' },
        { status: 400 }
      );
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must include at least one special character' },
        { status: 400 }
      );
    }

    // ─── Admin Lock: Nobody can register as admin via the API ───
    const validRoles = ['student', 'company', 'mentor', 'college'];
    const userRole = validRoles.includes(role) ? role : 'student';

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        profilePhoto: profilePhoto || null,
        passwordHash,
        role: userRole,
        level: userRole === 'student' ? 'Starter' : undefined,
        points: userRole === 'student' ? 0 : undefined,
        campusCredScore: userRole === 'student' ? 0 : undefined,
        streakDays: userRole === 'student' ? 0 : undefined,
        isVerified: false,
      },
    });

    // Create role-specific records
    if (userRole === 'company' && companyName) {
      await db.company.create({
        data: {
          userId: user.id,
          companyName,
          email: email.toLowerCase(),
          industry: industry || null,
          website: website || null,
        },
      });
    }

    if (userRole === 'mentor') {
      await db.mentor.create({
        data: {
          userId: user.id,
          expertise: expertise ? JSON.stringify(Array.isArray(expertise) ? expertise : [expertise]) : null,
          designation: designation || null,
          organization: organization || null,
          experience: experience || null,
        },
      });
    }

    if (userRole === 'college' && collegeName) {
      await db.college.create({
        data: {
          userId: user.id,
          collegeName,
          address: address || null,
          state: state || null,
          naacRating: naacRating || null,
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

    // Return user data (without password)
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
      campusCredUsername: user.campusCredUsername,
    };

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: userData,
        token: accessToken,
        refreshToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
