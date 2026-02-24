import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

// In-memory token store (for single-server deployments; use Redis for multi-server)
const resetTokens = new Map<string, { email: string; expires: number }>();

// Cleanup old tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of resetTokens.entries()) {
    if (data.expires < now) {
      resetTokens.delete(token);
    }
  }
}, 60000); // Every minute

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

    // Don't reveal if user exists or not (security)
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

    // Send email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const emailSent = await sendPasswordResetEmail(user.email, user.name, token, appUrl);

    // For demo/testing: Return reset link in response if email fails
    if (!emailSent && process.env.NODE_ENV === 'development') {
      const resetUrl = `${appUrl}/reset-password?token=${token}`;
      return NextResponse.json({ 
        success: true, 
        message: 'Reset instructions sent!',
        demoResetUrl: resetUrl, // Only shown in dev mode
        demoToken: token,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists with this email, you will receive reset instructions.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || !resetTokens.has(token)) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const tokenData = resetTokens.get(token)!;
    
    // Check if token is expired
    if (tokenData.expires < Date.now()) {
      resetTokens.delete(token);
      return NextResponse.json({ error: 'Reset token has expired' }, { status: 400 });
    }

    return NextResponse.json({ 
      valid: true, 
      email: tokenData.email 
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export { resetTokens };
