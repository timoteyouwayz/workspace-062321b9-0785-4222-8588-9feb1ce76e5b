import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// POST - Sync requisitions to Google Sheets
// This creates a CSV format that can be easily imported to Google Sheets
// For full Google Sheets API integration, you would need to set up OAuth2 credentials

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'ACCOUNTANT'].includes(session.role)) {
      return NextResponse.json({ error: 'Only admins and accountants can export to sheets' }, { status: 403 });
    }

    const body = await request.json();
    const { requisitionIds } = body;

    let requisitions;

    if (requisitionIds && requisitionIds.length > 0) {
      // Export specific requisitions
      requisitions = await db.requisition.findMany({
        where: { id: { in: requisitionIds } },
        include: {
          user: { select: { name: true, email: true, department: true } },
          checkedBy: { select: { name: true } },
          approvedBy: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Export all requisitions
      requisitions = await db.requisition.findMany({
        include: {
          user: { select: { name: true, email: true, department: true } },
          checkedBy: { select: { name: true } },
          approvedBy: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Generate CSV content
    const headers = [
      'Requisition ID',
      'Requester Name',
      'Requester Email',
      'Department',
      'Reason',
      'Description',
      'Total Amount (KES)',
      'Event Date',
      'Date Needed',
      'Participants',
      'Transport Distance',
      'Transport Quantity',
      'Account to Charge',
      'Status',
      'Checked By',
      'Checked Date',
      'Approved By',
      'Approved Date',
      'Disbursed Date',
      'Receipt Submitted',
      'Receipt Date',
      'Created Date',
    ];

    const rows = requisitions.map((req) => {
      const expenseItems = JSON.parse(req.expenseItems);
      const itemsList = expenseItems.map((i: { item: string; amount: number }) => `${i.item}: ${i.amount}`).join('; ');

      return [
        req.id,
        req.user.name,
        req.user.email,
        req.user.department || '',
        req.reason,
        req.description.replace(/"/g, '""'), // Escape quotes
        req.totalAmount.toString(),
        new Date(req.eventDate).toLocaleDateString(),
        new Date(req.dateNeeded).toLocaleDateString(),
        req.participants || '',
        req.transportDistance || '',
        req.transportQuantity || '',
        req.accountToCharge || '',
        req.status,
        req.checkedBy?.name || '',
        req.checkedAt ? new Date(req.checkedAt).toLocaleDateString() : '',
        req.approvedBy?.name || '',
        req.approvedAt ? new Date(req.approvedAt).toLocaleDateString() : '',
        req.disbursedAt ? new Date(req.disbursedAt).toLocaleDateString() : '',
        req.receiptSubmitted ? 'Yes' : 'No',
        req.receiptSubmittedAt ? new Date(req.receiptSubmittedAt).toLocaleDateString() : '',
        new Date(req.createdAt).toLocaleDateString(),
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Return CSV for Google Sheets import
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="requisitions-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export to sheets error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

// GET - Return data for Google Sheets integration instructions
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please log in first' }, { status: 401 });
    }

    return NextResponse.json({
      instructions: {
        title: 'How to Connect to Google Sheets',
        steps: [
          '1. Click "Export to CSV" button to download all requisitions',
          '2. Open Google Sheets (sheets.google.com)',
          '3. Create a new spreadsheet or open an existing one',
          '4. Go to File > Import',
          '5. Click "Upload" and select the downloaded CSV file',
          '6. Click "Import data"',
          '7. Your requisitions will now be in Google Sheets!',
        ],
        tip: 'For automatic syncing, you would need to set up Google Sheets API credentials. Contact your IT administrator for this setup.',
      },
    });
  } catch (error) {
    console.error('Get sheets instructions error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
