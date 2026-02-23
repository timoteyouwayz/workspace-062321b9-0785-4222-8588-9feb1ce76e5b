import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// DELETE a requisition
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to delete a requisition' }, { status: 401 });
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

    // Only the owner or admin can delete
    if (requisition.userId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'You can only delete your own requisitions' }, { status: 403 });
    }

    // Can only delete if status is PENDING or REJECTED
    if (!['PENDING', 'REJECTED'].includes(requisition.status)) {
      return NextResponse.json({ 
        error: 'Cannot delete a requisition that is already being processed. Please contact an administrator.' 
      }, { status: 400 });
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
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

// PUT - Update a requisition (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only administrators can edit requisitions' }, { status: 403 });
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

    const updated = await db.requisition.update({
      where: { id: requisitionId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, department: true } },
      },
    });

    return NextResponse.json({ requisition: updated });
  } catch (error) {
    console.error('Update requisition error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
