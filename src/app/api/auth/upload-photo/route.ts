import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { uploadSupabaseObject } from '@/lib/supabase-storage';

const isVercel = process.env.VERCEL === '1';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No photo provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, and WEBP images are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image must be less than 5MB' },
        { status: 400 }
      );
    }

    const ext = file.type.split('/')[1];
    const filename = `avatar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    if (isVercel) {
      // Vercel's filesystem is ephemeral. Store uploaded photos durably in Supabase.
      const bytes = Buffer.from(await file.arrayBuffer());
      const url = await uploadSupabaseObject(`avatars/${filename}`, bytes, file.type);

      return NextResponse.json(
        { url, message: 'Photo uploaded successfully' },
        { status: 200 }
      );
    } else {
      // On VPS/local: save to public uploads directory
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
      await mkdir(uploadsDir, { recursive: true });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filepath = path.join(uploadsDir, filename);
      await writeFile(filepath, buffer);

      const photoUrl = `/uploads/avatars/${filename}`;

      return NextResponse.json(
        { url: photoUrl, message: 'Photo uploaded successfully' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
