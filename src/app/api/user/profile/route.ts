import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

// Generate CampusCred username: firstname.branch.randomnumber
function generateCampusCredUsername(fullName: string, branch: string): string {
  const firstName = fullName.trim().split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
  const branchShort = branch
    ? branch.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6)
    : 'gen';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${firstName}.${branchShort}.${randomNum}`;
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      college, city, state, phone, degree, branch, year, bio, skills, socialLinks,
      isVerified, collegeVerified, fullName, profilePhoto,
      // College-specific fields
      collegeName, address, naacRating, nirfRank, collegeWebsite, totalStudents,
      // Mentor-specific fields
      designation, organization, experience, expertise, hourlyRate, mentorBio,
    } = body;

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    if (college !== undefined) updateData.college = college;
    if (city !== undefined) updateData.city = city;
    if (phone !== undefined) updateData.phone = phone;
    if (degree !== undefined) updateData.degree = degree;
    if (branch !== undefined) updateData.branch = branch;
    if (year !== undefined) updateData.year = year;
    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = typeof skills === 'string' ? skills : JSON.stringify(skills);
    if (socialLinks !== undefined) updateData.socialLinks = typeof socialLinks === 'string' ? socialLinks : JSON.stringify(socialLinks);
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (state !== undefined) updateData.state = state;

    const user = await db.user.update({
      where: { id: payload.userId },
      data: updateData,
    });

    // Update role-specific models
    if (user.role === 'college') {
      const collegeUpdateData: Record<string, unknown> = {};
      if (collegeName !== undefined) collegeUpdateData.collegeName = collegeName;
      if (address !== undefined) collegeUpdateData.address = address;
      if (naacRating !== undefined) collegeUpdateData.naacRating = naacRating;
      if (nirfRank !== undefined) collegeUpdateData.nirfRank = nirfRank;
      if (collegeWebsite !== undefined) collegeUpdateData.website = collegeWebsite;
      if (totalStudents !== undefined) collegeUpdateData.totalStudents = totalStudents;
      if (city !== undefined) collegeUpdateData.city = city;
      if (state !== undefined) collegeUpdateData.state = state;

      if (Object.keys(collegeUpdateData).length > 0) {
        await db.college.updateMany({
          where: { userId: user.id },
          data: collegeUpdateData,
        });
      }
    }

    if (user.role === 'mentor') {
      const mentorUpdateData: Record<string, unknown> = {};
      if (designation !== undefined) mentorUpdateData.designation = designation;
      if (organization !== undefined) mentorUpdateData.organization = organization;
      if (experience !== undefined) mentorUpdateData.experience = experience;
      if (expertise !== undefined) mentorUpdateData.expertise = typeof expertise === 'string' ? expertise : JSON.stringify(expertise);
      if (hourlyRate !== undefined) mentorUpdateData.hourlyRate = hourlyRate;
      if (mentorBio !== undefined) mentorUpdateData.bio = mentorBio;

      if (Object.keys(mentorUpdateData).length > 0) {
        await db.mentor.updateMany({
          where: { userId: user.id },
          data: mentorUpdateData,
        });
      }
    }

    // Generate campusCredUsername if not already set
    if (!user.campusCredUsername && user.role === 'student' && user.branch) {
      let username = generateCampusCredUsername(user.fullName, user.branch);
      // Ensure uniqueness
      let existing = await db.user.findUnique({ where: { campusCredUsername: username } });
      let attempts = 0;
      while (existing && attempts < 10) {
        username = generateCampusCredUsername(user.fullName, user.branch);
        existing = await db.user.findUnique({ where: { campusCredUsername: username } });
        attempts++;
      }
      if (!existing) {
        await db.user.update({
          where: { id: user.id },
          data: { campusCredUsername: username },
        });
        user.campusCredUsername = username;
      }
    }

    const userData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      college: user.college,
      city: user.city,
      state: user.state,
      degree: user.degree,
      branch: user.branch,
      year: user.year,
      bio: user.bio,
      profilePhoto: user.profilePhoto,
      isVerified: user.isVerified,
      streakDays: user.streakDays,
      points: user.points,
      campusCredScore: user.campusCredScore,
      level: user.level,
      campusCredUsername: user.campusCredUsername,
      skills: user.skills,
      socialLinks: user.socialLinks,
    };

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        user: userData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
