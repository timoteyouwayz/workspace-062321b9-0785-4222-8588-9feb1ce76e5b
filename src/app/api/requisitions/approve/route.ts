import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { updateRequisitionInSheet } from '@/lib/google';

// POST approve/reject/check/disburse requisition with role-based permissions
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please log in first' }, { status: 401 });
    }

    const body = await request.json();
    const { requisitionId, action, rejectionReason } = body;

    if (!requisitionId || !action) {
      return NextResponse.json({ error: 'Requisition ID and action are required' }, { status: 400 });
    }

    const requisition = await db.requisition.findUnique({
      where: { id: requisitionId },
    });

    if (!requisition) {
      return NextResponse.json({ error: 'Requisition not found' }, { status: 404 });
    }

    let updateData: Record<string, unknown> = {};
    const now = new Date();

    switch (action) {
      case 'CHECK':
        // Only ACCOUNTANT or ADMIN can check
        if (!['ACCOUNTANT', 'ADMIN'].includes(session.role)) {
          return NextResponse.json({ 
            error: 'Only the Accounts Officer can check requisitions' 
          }, { status: 403 });
        }
        if (requisition.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Can only check pending requisitions' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'CHECKED',
          checkedById: session.id,
          checkedAt: now,
        };
        break;

      case 'APPROVE':
        // Only DIRECTOR or ADMIN can approve
        if (!['DIRECTOR', 'ADMIN'].includes(session.role)) {
          return NextResponse.json({ 
            error: 'Only the National Director can approve requisitions' 
          }, { status: 403 });
        }
        if (requisition.status !== 'CHECKED') {
          return NextResponse.json(
            { error: 'Can only approve checked requisitions' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'APPROVED',
          approvedById: session.id,
          approvedAt: now,
        };
        break;

      case 'DISBURSE':
        // Only ACCOUNTANT or ADMIN can disburse (mark money as sent)
        if (!['ACCOUNTANT', 'ADMIN'].includes(session.role)) {
          return NextResponse.json({ 
            error: 'Only the Accounts Officer can mark money as sent' 
          }, { status: 403 });
        }
        if (requisition.status !== 'APPROVED') {
          return NextResponse.json(
            { error: 'Can only disburse approved requisitions' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'DISBURSED',
          disbursedAt: now,
          disbursedBy: session.id,
        };
        break;

      case 'REJECT':
        // ACCOUNTANT can reject pending, DIRECTOR can reject checked
        if (requisition.status === 'PENDING' && !['ACCOUNTANT', 'ADMIN'].includes(session.role)) {
          return NextResponse.json({ 
            error: 'Only the Accounts Officer can reject pending requisitions' 
          }, { status: 403 });
        }
        if (requisition.status === 'CHECKED' && !['DIRECTOR', 'ADMIN'].includes(session.role)) {
          return NextResponse.json({ 
            error: 'Only the National Director can reject checked requisitions' 
          }, { status: 403 });
        }
        if (!['PENDING', 'CHECKED'].includes(requisition.status)) {
          return NextResponse.json(
            { error: 'Can only reject pending or checked requisitions' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'REJECTED',
          rejectionReason: rejectionReason || 'No reason provided',
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const updated = await db.requisition.update({
      where: { id: requisitionId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Sync status update to Google Sheets if configured
    if (process.env.GOOGLE_SHEETS_ID && updated.status) {
      try {
        await updateRequisitionInSheet(process.env.GOOGLE_SHEETS_ID, requisitionId, updated.status);
      } catch (error) {
        console.error('Failed to update requisition in Google Sheets:', error);
        // Don't fail the request if sheet update fails
      }
    }

    return NextResponse.json({ requisition: updated });
  } catch (error) {
    console.error('Approve requisition error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
