import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { uploadFileToDriveFromPath, appendRowToSheet } from '@/lib/google';
import { sendReceiptVerificationEmail } from '@/lib/email';

// GET receipts for a requisition
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please log in first' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requisitionId = searchParams.get('requisitionId');

    if (!requisitionId) {
      return NextResponse.json({ error: 'Requisition ID is required' }, { status: 400 });
    }

    const receipts = await db.receipt.findMany({
      where: { requisitionId },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json({ receipts });
  } catch (error) {
    console.error('Get receipts error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// POST upload receipt (with partial amount tracking)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please log in first' }, { status: 401 });
    }

    const formData = await request.formData();
    const requisitionId = formData.get('requisitionId') as string;
    const description = formData.get('description') as string;
    const amountStr = formData.get('amount') as string;
    const file = formData.get('file') as File;

    if (!requisitionId || !file) {
      return NextResponse.json({ error: 'Requisition ID and file are required' }, { status: 400 });
    }

    const receiptAmount = parseFloat(amountStr) || 0;

    const requisition = await db.requisition.findUnique({
      where: { id: requisitionId },
      include: { user: { select: { name: true, department: true } } },
    });

    if (!requisition) {
      return NextResponse.json({ error: 'Requisition not found' }, { status: 404 });
    }

    // Only the requester or ACCOUNTANT/ADMIN can upload receipts
    const canUpload = 
      requisition.userId === session.id || 
      ['ACCOUNTANT', 'ADMIN'].includes(session.role);

    if (!canUpload) {
      return NextResponse.json({ error: 'You cannot upload receipts for this requisition' }, { status: 403 });
    }

    // Validate amount doesn't exceed remaining balance
    const existingReceipts = await db.receipt.findMany({
      where: { requisitionId, verified: true },
    });
    const alreadyReceived = existingReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    const remainingBalance = requisition.totalAmount - alreadyReceived;

    if (receiptAmount > remainingBalance && remainingBalance > 0) {
      return NextResponse.json({ 
        error: `Receipt amount (KES ${receiptAmount.toLocaleString()}) exceeds remaining balance (KES ${remainingBalance.toLocaleString()})` 
      }, { status: 400 });
    }

    // Save file
    const uploadsDir = path.join(process.cwd(), 'uploads', 'receipts');
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create receipt record
    const receipt = await db.receipt.create({
      data: {
        requisitionId,
        userId: session.id,
        fileName: file.name,
        filePath: fileName,
        fileSize: file.size,
        mimeType: file.type,
        description: description || null,
        amount: receiptAmount,
        verified: ['ACCOUNTANT', 'ADMIN'].includes(session.role), // Auto-verify if accountant uploads
        verifiedAt: ['ACCOUNTANT', 'ADMIN'].includes(session.role) ? new Date() : null,
        verifiedById: ['ACCOUNTANT', 'ADMIN'].includes(session.role) ? session.id : null,
      },
    });

    // Try to upload to Google Drive (service account) and append to spreadsheet if configured
    try {
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_ID || process.env.GOOGLE_SPREADSHEET;
      const localPath = path.join(process.cwd(), 'uploads', 'receipts', fileName);

      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY && folderId) {
        const driveFile = await uploadFileToDriveFromPath(localPath, `Receipt_${file.name}`, file.type, [folderId]);

        // update receipt with drive info
        await db.receipt.update({
          where: { id: receipt.id },
          data: {
            description: `${receipt.description || ''}\n\nGoogle Drive ID: ${driveFile.id}`.trim(),
            driveFileId: driveFile.id || null,
            driveLink: driveFile.webViewLink ? driveFile.webViewLink : driveFile.webContentLink ? driveFile.webContentLink : null,
          },
        });

        // Append a row to spreadsheet if configured
        if (spreadsheetId) {
          try {
            const user = await db.user.findUnique({ where: { id: session.id } });
            await appendRowToSheet(spreadsheetId, [
              new Date().toISOString(),
              requisitionId,
              requisition.reason || '',
              user?.name || '',
              user?.email || '',
              file.name,
              receiptAmount || 0,
              ['ACCOUNTANT', 'ADMIN'].includes(session.role) ? 'VERIFIED' : 'PENDING',
              `https://drive.google.com/file/d/${(driveFile && driveFile.id) || ''}/view`,
            ]);
          } catch (err) {
            console.error('Append to sheet failed:', err);
          }
        }
      }
    } catch (err) {
      console.error('Drive/service account upload error:', err);
    }

    // Check if total receipts cover the full amount
    const allReceipts = await db.receipt.findMany({
      where: { requisitionId, verified: true },
    });
    const totalReceived = allReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);

    // Update requisition status
    if (totalReceived >= requisition.totalAmount) {
      await db.requisition.update({
        where: { id: requisitionId },
        data: {
          receiptSubmitted: true,
          receiptSubmittedAt: new Date(),
          status: 'COMPLETED',
        },
      });
    }

    return NextResponse.json({ 
      receipt,
      remainingBalance: requisition.totalAmount - totalReceived,
      message: totalReceived >= requisition.totalAmount 
        ? 'All receipts received. Requisition completed!' 
        : `Receipt uploaded. Remaining balance: KES ${(requisition.totalAmount - totalReceived).toLocaleString()}`
    });
  } catch (error) {
    console.error('Upload receipt error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PUT - Verify receipt (Accountant only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['ACCOUNTANT', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Only accounts officers can verify receipts' }, { status: 403 });
    }

    const body = await request.json();
    const { receiptId, verified, amount } = body;

    if (!receiptId) {
      return NextResponse.json({ error: 'Receipt ID is required' }, { status: 400 });
    }

    const receipt = await db.receipt.findUnique({
      where: { id: receiptId },
      include: { 
        requisition: {
          include: { user: { select: { email: true, name: true } } }
        }
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // Update receipt
    const updated = await db.receipt.update({
      where: { id: receiptId },
      data: {
        verified: verified !== undefined ? verified : true,
        amount: amount !== undefined ? parseFloat(amount) : receipt.amount,
        verifiedAt: verified !== false ? new Date() : null,
        verifiedById: verified !== false ? session.id : null,
      },
    });

    // Recalculate requisition status
    const allReceipts = await db.receipt.findMany({
      where: { requisitionId: receipt.requisitionId, verified: true },
    });
    const totalReceived = allReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);

    let requisitionUpdated = false;
    if (totalReceived >= receipt.requisition.totalAmount) {
      await db.requisition.update({
        where: { id: receipt.requisitionId },
        data: {
          receiptSubmitted: true,
          receiptSubmittedAt: new Date(),
          status: 'COMPLETED',
        },
      });
      requisitionUpdated = true;
    }

    // Send email notification to requester
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
      await sendReceiptVerificationEmail(
        receipt.requisition.user.email,
        receipt.requisition.user.name,
        receipt.requisitionId,
        receipt.requisition.reason,
        updated.amount || 0,
        updated.verified,
        appUrl
      );
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ 
      receipt: updated,
      totalReceived,
      remainingBalance: receipt.requisition.totalAmount - totalReceived,
      requisitionCompleted: requisitionUpdated,
    });
  } catch (error) {
    console.error('Verify receipt error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// POST upload receipt (with partial amount tracking)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please log in first' }, { status: 401 });
    }

    const formData = await request.formData();
    const requisitionId = formData.get('requisitionId') as string;
    const description = formData.get('description') as string;
    const amountStr = formData.get('amount') as string;
    const file = formData.get('file') as File;

    if (!requisitionId || !file) {
      return NextResponse.json({ error: 'Requisition ID and file are required' }, { status: 400 });
    }

    const receiptAmount = parseFloat(amountStr) || 0;

    const requisition = await db.requisition.findUnique({
      where: { id: requisitionId },
    });

    if (!requisition) {
      return NextResponse.json({ error: 'Requisition not found' }, { status: 404 });
    }

    // Only the requester or ACCOUNTANT/ADMIN can upload receipts
    const canUpload = 
      requisition.userId === session.id || 
      ['ACCOUNTANT', 'ADMIN'].includes(session.role);

    if (!canUpload) {
      return NextResponse.json({ error: 'You cannot upload receipts for this requisition' }, { status: 403 });
    }

    // Validate amount doesn't exceed remaining balance
    const existingReceipts = await db.receipt.findMany({
      where: { requisitionId, verified: true },
    });
    const alreadyReceived = existingReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    const remainingBalance = requisition.totalAmount - alreadyReceived;

    if (receiptAmount > remainingBalance && remainingBalance > 0) {
      return NextResponse.json({ 
        error: `Receipt amount (KES ${receiptAmount.toLocaleString()}) exceeds remaining balance (KES ${remainingBalance.toLocaleString()})` 
      }, { status: 400 });
    }

    // Save file
    const uploadsDir = path.join(process.cwd(), 'uploads', 'receipts');
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create receipt record
    const receipt = await db.receipt.create({
      data: {
        requisitionId,
        userId: session.id,
        fileName: file.name,
        filePath: fileName,
        fileSize: file.size,
        mimeType: file.type,
        description: description || null,
        amount: receiptAmount,
        verified: ['ACCOUNTANT', 'ADMIN'].includes(session.role), // Auto-verify if accountant uploads
        verifiedAt: ['ACCOUNTANT', 'ADMIN'].includes(session.role) ? new Date() : null,
        verifiedById: ['ACCOUNTANT', 'ADMIN'].includes(session.role) ? session.id : null,
      },
    });

    // Try to upload to Google Drive (service account) and append to spreadsheet if configured
    try {
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_ID || process.env.GOOGLE_SPREADSHEET;
      const localPath = path.join(process.cwd(), 'uploads', 'receipts', fileName);

      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY && folderId) {
        const driveFile = await uploadFileToDriveFromPath(localPath, `Receipt_${file.name}`, file.type, [folderId]);

        // update receipt with drive info
        await db.receipt.update({
          where: { id: receipt.id },
          data: {
            description: `${receipt.description || ''}\n\nGoogle Drive ID: ${driveFile.id}`.trim(),
            driveFileId: driveFile.id || null,
            driveLink: driveFile.webViewLink ? driveFile.webViewLink : driveFile.webContentLink ? driveFile.webContentLink : null,
          },
        });

        // Append a row to spreadsheet if configured
        if (spreadsheetId) {
          try {
            const user = await db.user.findUnique({ where: { id: session.id } });
            await appendRowToSheet(spreadsheetId, [
              new Date().toISOString(),
              requisitionId,
              requisition.reason || '',
              user?.name || '',
              user?.email || '',
              file.name,
              receiptAmount || 0,
              ['ACCOUNTANT', 'ADMIN'].includes(session.role) ? 'VERIFIED' : 'PENDING',
              `https://drive.google.com/file/d/${(driveFile && driveFile.id) || ''}/view`,
            ]);
          } catch (err) {
            console.error('Append to sheet failed:', err);
          }
        }
      }
    } catch (err) {
      console.error('Drive/service account upload error:', err);
    }

    // Check if total receipts cover the full amount
    const allReceipts = await db.receipt.findMany({
      where: { requisitionId, verified: true },
    });
    const totalReceived = allReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);

    // Update requisition status
    if (totalReceived >= requisition.totalAmount) {
      await db.requisition.update({
        where: { id: requisitionId },
        data: {
          receiptSubmitted: true,
          receiptSubmittedAt: new Date(),
          status: 'COMPLETED',
        },
      });
    }

    return NextResponse.json({ 
      receipt,
      remainingBalance: requisition.totalAmount - totalReceived,
      message: totalReceived >= requisition.totalAmount 
        ? 'All receipts received. Requisition completed!' 
        : `Receipt uploaded. Remaining balance: KES ${(requisition.totalAmount - totalReceived).toLocaleString()}`
    });
  } catch (error) {
    console.error('Upload receipt error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PUT - Verify receipt (Accountant only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['ACCOUNTANT', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Only accounts officers can verify receipts' }, { status: 403 });
    }

    const body = await request.json();
    const { receiptId, verified, amount } = body;

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

    // Update receipt
    const updated = await db.receipt.update({
      where: { id: receiptId },
      data: {
        verified: verified !== undefined ? verified : true,
        amount: amount !== undefined ? parseFloat(amount) : receipt.amount,
        verifiedAt: verified !== false ? new Date() : null,
        verifiedById: verified !== false ? session.id : null,
      },
    });

    // Recalculate requisition status
    const allReceipts = await db.receipt.findMany({
      where: { requisitionId: receipt.requisitionId, verified: true },
    });
    const totalReceived = allReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);

    if (totalReceived >= receipt.requisition.totalAmount) {
      await db.requisition.update({
        where: { id: receipt.requisitionId },
        data: {
          receiptSubmitted: true,
          receiptSubmittedAt: new Date(),
          status: 'COMPLETED',
        },
      });
    }

    return NextResponse.json({ 
      receipt: updated,
      totalReceived,
      remainingBalance: receipt.requisition.totalAmount - totalReceived,
    });
  } catch (error) {
    console.error('Verify receipt error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
