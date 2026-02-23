import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET all requisitions (with filtering)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please log in first' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const where: Record<string, unknown> = {};
    
    // Staff can only see their own requisitions
    if (session.role === 'STAFF') {
      where.userId = session.id;
    } else if (userId) {
      where.userId = userId;
    }
    
    if (status) {
      where.status = status;
    }

    const requisitions = await db.requisition.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, department: true },
        },
        checkedBy: {
          select: { id: true, name: true },
        },
        approvedBy: {
          select: { id: true, name: true },
        },
        receipts: {
          select: { id: true, fileName: true, uploadedAt: true, amount: true, verified: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate receipt totals for each requisition
    const requisitionsWithTotals = requisitions.map(req => {
      const verifiedReceipts = req.receipts?.filter(r => r.verified) || [];
      const totalReceived = verifiedReceipts.reduce((sum: number, r) => sum + (r.amount || 0), 0);
      return {
        ...req,
        totalReceived,
        remainingBalance: req.totalAmount - totalReceived,
      };
    });

    return NextResponse.json({ requisitions: requisitionsWithTotals });
  } catch (error) {
    console.error('Get requisitions error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
