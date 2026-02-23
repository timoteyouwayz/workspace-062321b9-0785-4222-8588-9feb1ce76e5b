import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';

// Simple in-memory token store (in production, use database)
const resetTokens = new Map<string, { email: string; expires: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if user exists or not
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists with this email, you will receive reset instructions.' 
      });
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour

    resetTokens.set(token, { email: user.email, expires });

    // In production, send email with reset link
    // For demo, we'll return the token
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?reset=${token}`;

    console.log(`Password reset for ${email}: ${resetUrl}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Reset instructions sent! Check your email.',
      // For demo purposes, show the reset link
      demoResetUrl: resetUrl,
      demoToken: token,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export { resetTokens };
