import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// DELETE requisition
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please log in first' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requisitionId = searchParams.get('id');

    if (!requisitionId) {
      return NextResponse.json({ error: 'Requisition ID is required' }, { status: 400 });
    }

    const requisition = await db.requisition.findUnique({
      where: { id: requisitionId },
    });

    if (!requisition) {
      return NextResponse.json({ error: 'Requisition not found' }, { status: 404 });
    }

    // Staff can only delete their own pending/rejected requisitions
    // Admin can delete anything
    if (session.role === 'STAFF') {
      if (requisition.userId !== session.id) {
        return NextResponse.json({ error: 'You can only delete your own requisitions' }, { status: 403 });
      }
      if (!['PENDING', 'REJECTED'].includes(requisition.status)) {
        return NextResponse.json({ error: 'Cannot delete a requisition that is being processed' }, { status: 400 });
      }
    }

    // Delete associated receipts first
    await db.receipt.deleteMany({
      where: { requisitionId },
    });

    // Delete the requisition
    await db.requisition.delete({
      where: { id: requisitionId },
    });

    return NextResponse.json({ success: true, message: 'Requisition deleted successfully' });
  } catch (error) {
    console.error('Delete requisition error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PUT - Update requisition (Admin only can edit anything, others have restrictions)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please log in first' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      requisitionId, 
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
      status,
      rejectionReason,
    } = body;

    if (!requisitionId) {
      return NextResponse.json({ error: 'Requisition ID is required' }, { status: 400 });
    }

    const requisition = await db.requisition.findUnique({
      where: { id: requisitionId },
    });

    if (!requisition) {
      return NextResponse.json({ error: 'Requisition not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    
    // Admin can edit anything
    if (session.role === 'ADMIN') {
      if (reason) updateData.reason = reason;
      if (description) updateData.description = description;
      if (eventDate) updateData.eventDate = new Date(eventDate);
      if (dateNeeded) updateData.dateNeeded = new Date(dateNeeded);
      if (participants !== undefined) updateData.participants = participants || null;
      if (transportDistance !== undefined) updateData.transportDistance = transportDistance || null;
      if (transportQuantity !== undefined) updateData.transportQuantity = transportQuantity || null;
      if (expenseItems) updateData.expenseItems = JSON.stringify(expenseItems);
      if (totalAmount !== undefined) updateData.totalAmount = parseFloat(totalAmount);
      if (accountToCharge !== undefined) updateData.accountToCharge = accountToCharge || null;
      if (status) updateData.status = status;
      if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason || null;
    }

    const updated = await db.requisition.update({
      where: { id: requisitionId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, department: true } },
      },
    });

    return NextResponse.json({ requisition: updated, message: 'Requisition updated successfully' });
  } catch (error) {
    console.error('Update requisition error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
