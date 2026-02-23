import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { cookies } from 'next/headers';

// Google OAuth callback handler
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/?auth_error=no_code', appUrl));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${appUrl}/api/auth/google/callback`;

    // ── Demo / unconfigured mode ────────────────────────────────────────
    if (!clientId || !clientSecret) {
      const demoEmail = 'demo.google@gmail.com';
      let user = await db.user.findUnique({ where: { email: demoEmail } });
      if (!user) {
        user = await db.user.create({
          data: { email: demoEmail, name: 'Google Demo User', password: '', role: 'STAFF' },
        });
      }
      await createSession(user.id);
      return NextResponse.redirect(new URL('/', appUrl));
    }

    // ── Exchange code for tokens ────────────────────────────────────────
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      console.error('Token exchange failed:', tokens);
      return NextResponse.redirect(new URL('/?auth_error=token_failed', appUrl));
    }

    // ── Get Google user info ────────────────────────────────────────────
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userResponse.json();

    if (!googleUser.email) {
      return NextResponse.redirect(new URL('/?auth_error=no_email', appUrl));
    }

    // ── Find or create user, always update tokens ───────────────────────
    const tokenExpiry = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null;

    let user = await db.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.id }, { email: googleUser.email }],
      },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || googleUser.email,
          password: '',
          role: 'STAFF',
          googleId: googleUser.id,
          googleEmail: googleUser.email,
          googlePicture: googleUser.picture || null,
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token || null,
          googleTokenExpiry: tokenExpiry,
        },
      });
    } else {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.id,
          googleEmail: googleUser.email,
          googlePicture: googleUser.picture || null,
          googleAccessToken: tokens.access_token,
          ...(tokens.refresh_token && { googleRefreshToken: tokens.refresh_token }),
          googleTokenExpiry: tokenExpiry,
        },
      });
    }

    // ── Create session; store access token in cookie for Drive API calls ─
    await createSession(user.id);

    const cookieStore = await cookies();
    cookieStore.set('google_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 3600,
      path: '/',
    });

    return NextResponse.redirect(new URL('/', appUrl));
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/?auth_error=oauth_failed', appUrl));
  }
}
