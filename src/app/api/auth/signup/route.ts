import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createSession, getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, department, phone, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    // If no users exist yet, allow creating the first user as ADMIN
    const anyUsers = await db.user.count();
    if (anyUsers === 0) {
      const user = await db.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashPassword(password),
          department: department || null,
          phone: phone || null,
          role: 'ADMIN',
        },
      });
      await createSession(user.id);
      return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }

    // Otherwise, only an ADMIN can create new users via this endpoint
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sign up is disabled. An admin must create accounts.' }, { status: 403 });
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Create user (admin-created)
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashPassword(password),
        department: department || null,
        phone: phone || null,
        role: role || 'STAFF',
      },
    });

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
