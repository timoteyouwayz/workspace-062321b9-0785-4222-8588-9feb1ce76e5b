import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { readFile } from 'fs/promises';
import path from 'path';

// Helper: get a valid Google access token for the current user.
// Falls back to cookie, then DB. Refreshes via refresh_token if expired.
async function getGoogleAccessToken(userId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('google_access_token')?.value;
  if (cookieToken) return cookieToken;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { googleAccessToken: true, googleRefreshToken: true, googleTokenExpiry: true },
  });

  if (!user?.googleAccessToken) return null;

  // Token still valid (60-second buffer)?
  if (user.googleTokenExpiry && user.googleTokenExpiry > new Date(Date.now() + 60_000)) {
    return user.googleAccessToken;
  }

  // Try to refresh
  if (user.googleRefreshToken) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) return user.googleAccessToken;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: user.googleRefreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await res.json();
    if (data.access_token) {
      const expiry = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null;
      await db.user.update({
        where: { id: userId },
        data: { googleAccessToken: data.access_token, googleTokenExpiry: expiry },
      });
      cookieStore.set('google_access_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.expires_in || 3600,
        path: '/',
      });
      return data.access_token;
    }
  }

  return user.googleAccessToken; // best-effort
}

// GET – Return Drive setup status
export async function GET() {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const isConfigured = !!(clientId && clientSecret);

    return NextResponse.json({
      configured: isConfigured,
      message: isConfigured
        ? 'Google Drive is ready! Your receipts will be automatically backed up.'
        : 'Google Drive is not configured. Receipts are stored locally.',
      setupInstructions: !isConfigured
        ? [
            '1. Go to https://console.cloud.google.com/',
            '2. Create or select a project',
            '3. Enable Google Drive API + Google People API',
            '4. Create OAuth 2.0 credentials (Web Application)',
            '   Redirect URI: http://localhost:3000/api/auth/google/callback',
            '5. Fill in GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env',
            '6. Sign in with Google — Drive access is granted automatically',
          ]
        : null,
    });
  } catch (error) {
    console.error('Drive status error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// POST – Upload a receipt to Google Drive
// Body: { receiptId: string }
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please log in first' }, { status: 401 });
    }

    const body = await request.json();
    const { receiptId } = body;

    if (!receiptId) {
      return NextResponse.json({ error: 'Receipt ID is required' }, { status: 400 });
    }

    const receipt = await db.receipt.findUnique({
      where: { id: receiptId },
      include: { requisition: true },
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        message: 'Google Drive is not configured. File is stored locally only.',
        localPath: receipt.filePath,
      });
    }

    // Automatically resolve access token — no need to pass it in the request
    const accessToken = await getGoogleAccessToken(session.id);

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            'No Google access token found. Please sign in with Google to enable Drive uploads.',
          localPath: receipt.filePath,
        },
        { status: 401 }
      );
    }

    const filePath = path.join(process.cwd(), 'uploads', 'receipts', receipt.filePath);
    const fileBuffer = await readFile(filePath);
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const metadata = {
      name: `Receipt_${receipt.fileName}`,
      parents: folderId ? [folderId] : undefined,
      description: `Receipt for requisition: ${receipt.requisition.reason}`,
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', new Blob([fileBuffer], { type: receipt.mimeType }));

    const driveResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      }
    );

    if (!driveResponse.ok) {
      const error = await driveResponse.json();
      console.error('Drive upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload to Google Drive', localPath: receipt.filePath },
        { status: 500 }
      );
    }

    const driveFile = await driveResponse.json();

    await db.receipt.update({
      where: { id: receiptId },
      data: {
        description: `${receipt.description || ''}\n\nGoogle Drive ID: ${driveFile.id}`.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Receipt uploaded to Google Drive!',
      driveFileId: driveFile.id,
      driveLink: `https://drive.google.com/file/d/${driveFile.id}/view`,
    });
  } catch (error) {
    console.error('Drive upload error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
