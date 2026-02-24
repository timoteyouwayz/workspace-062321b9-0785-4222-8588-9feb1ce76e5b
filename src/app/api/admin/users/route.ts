import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await requireRole(['ADMIN']);
    const users = await db.user.findMany({ select: { id: true, name: true, email: true, role: true, department: true, phone: true, createdAt: true } });
    return NextResponse.json({ users });
  } catch (err: any) {
    console.error('Admin list users error:', err);
    return NextResponse.json({ error: err?.message || 'Forbidden' }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN']);
    const body = await request.json();
    const { name, email, password, role, department, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return NextResponse.json({ error: 'User already exists' }, { status: 400 });

    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashPassword(password),
        role: role || 'STAFF',
        department: department || null,
        phone: phone || null,
      },
    });

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err: any) {
    console.error('Admin create user error:', err);
    return NextResponse.json({ error: err?.message || 'Forbidden' }, { status: 403 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireRole(['ADMIN']);
    const body = await request.json();
    const { id, name, email, password, role, department, phone, googleId, googleEmail, googlePicture } = body;

    if (!id) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if new email is already taken by another user
    if (email && email.toLowerCase() !== user.email) {
      const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (password) updateData.password = hashPassword(password);
    if (role) updateData.role = role;
    if (department !== undefined) updateData.department = department || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (googleId) updateData.googleId = googleId;
    if (googleEmail) updateData.googleEmail = googleEmail;
    if (googlePicture) updateData.googlePicture = googlePicture;

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, department: true, phone: true, googleEmail: true }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (err: any) {
    console.error('Admin update user error:', err);
    return NextResponse.json({ error: err?.message || 'Forbidden' }, { status: 403 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole(['ADMIN']);
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if new email is already taken
    if (updates.email && updates.email.toLowerCase() !== user.email) {
      const existing = await db.user.findUnique({ where: { email: updates.email.toLowerCase() } });
      if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      updates.email = updates.email.toLowerCase();
    }

    // Hash password if provided
    if (updates.password) {
      updates.password = hashPassword(updates.password);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updates,
      select: { id: true, name: true, email: true, role: true, department: true, phone: true, googleEmail: true, createdAt: true }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (err: any) {
    console.error('Admin patch user error:', err);
    return NextResponse.json({ error: err?.message || 'Forbidden' }, { status: 403 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole(['ADMIN']);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    if (!userId) return NextResponse.json({ error: 'User id is required' }, { status: 400 });

    await db.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin delete user error:', err);
    return NextResponse.json({ error: err?.message || 'Forbidden' }, { status: 403 });
  }
}
