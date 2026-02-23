import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// POST create new requisition
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      reason,
      description,
      eventDate,
      dateNeeded,
      participants,
      transportDistance,
      transportQuantity,
      expenseItems,
      totalAmount,
      accountToCharge,
    } = body;

    // Validate required fields
    if (!reason || !description || !eventDate || !dateNeeded || !expenseItems || totalAmount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user has pending requisitions that need receipts
    const pendingReceiptRequisitions = await db.requisition.findMany({
      where: {
        userId: session.id,
        status: 'DISBURSED',
        receiptSubmitted: false,
        eventDate: { lt: new Date() },
      },
    });

    if (pendingReceiptRequisitions.length > 0) {
      return NextResponse.json(
        {
          error: 'You have pending requisitions that require receipt submission before creating a new one.',
          pendingRequisitions: pendingReceiptRequisitions.map(r => ({
            id: r.id,
            reason: r.reason,
            eventDate: r.eventDate,
          })),
        },
        { status: 400 }
      );
    }

    const requisition = await db.requisition.create({
      data: {
        userId: session.id,
        reason,
        description,
        eventDate: new Date(eventDate),
        dateNeeded: new Date(dateNeeded),
        participants: participants || null,
        transportDistance: transportDistance || null,
        transportQuantity: transportQuantity || null,
        expenseItems: JSON.stringify(expenseItems),
        totalAmount: parseFloat(totalAmount),
        accountToCharge: accountToCharge || null,
        status: 'PENDING',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, department: true },
        },
      },
    });

    return NextResponse.json({ requisition });
  } catch (error) {
    console.error('Create requisition error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
