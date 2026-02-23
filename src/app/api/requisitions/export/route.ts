import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Simple number to words converter
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? '-' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' and ' + numberToWords(num % 100) : '');
  if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
  return num.toString();
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requisitionId = searchParams.get('id');

    if (!requisitionId) {
      return NextResponse.json({ error: 'Missing requisition id' }, { status: 400 });
    }

    const requisition = await db.requisition.findUnique({
      where: { id: requisitionId },
      include: {
        user: { select: { name: true, email: true, department: true } },
        checkedBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
      },
    });

    if (!requisition) {
      return NextResponse.json({ error: 'Requisition not found' }, { status: 404 });
    }

    if (requisition.userId !== session.id && !['ACCOUNTANT', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const expenseItems = JSON.parse(requisition.expenseItems);

    // Generate HTML document (can be opened in Word)
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Request for Finance - ${requisitionId}</title>
  <style>
    body { font-family: 'Times New Roman', serif; margin: 40px; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 18pt; margin: 0; }
    .header p { font-size: 10pt; margin: 5px 0; }
    .title { text-align: center; font-size: 14pt; font-weight: bold; margin: 30px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background-color: #f0f0f0; }
    .amount { text-align: right; }
    .total-row { font-weight: bold; }
    .info-row { margin: 10px 0; }
    .label { font-weight: bold; }
    .signature-section { margin-top: 40px; }
    .signature-row { margin: 15px 0; }
    .line { border-bottom: 1px solid #000; display: inline-block; width: 150px; margin-left: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>YOUTH FOR CHRIST</h1>
    <p>P. O. BOX 27605, NAIROBI 00506, Tel. 0202 091951</p>
  </div>
  
  <div class="title">REQUEST FOR FINANCE</div>
  
  <p>I, <strong>${requisition.user.name}</strong> do request for funds for:</p>
  
  <p class="info-row"><span class="label">Reason:</span> ${requisition.reason}</p>
  <p class="info-row"><span class="label">Description:</span> ${requisition.description}</p>
  
  <table>
    <thead>
      <tr>
        <th>Expense Item</th>
        <th class="amount">Amount (KES)</th>
      </tr>
    </thead>
    <tbody>
      ${expenseItems.map((item: { item: string; amount: number }) => `
        <tr>
          <td>${item.item}</td>
          <td class="amount">${item.amount.toLocaleString()}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td>Total</td>
        <td class="amount">${requisition.totalAmount.toLocaleString()}</td>
      </tr>
    </tbody>
  </table>
  
  <p class="info-row"><span class="label">Amount in words:</span> ${numberToWords(Math.floor(requisition.totalAmount))} Kenya Shillings</p>
  <p class="info-row"><span class="label">Account to be charged:</span> ${requisition.accountToCharge || 'N/A'}</p>
  <p class="info-row"><span class="label">Event Date:</span> ${new Date(requisition.eventDate).toLocaleDateString()}</p>
  <p class="info-row"><span class="label">Date Needed:</span> ${new Date(requisition.dateNeeded).toLocaleDateString()}</p>
  ${requisition.participants ? `<p class="info-row"><span class="label">Participants:</span> ${requisition.participants}</p>` : ''}
  ${requisition.transportDistance ? `<p class="info-row"><span class="label">Transport Distance:</span> ${requisition.transportDistance}</p>` : ''}
  ${requisition.transportQuantity ? `<p class="info-row"><span class="label">Transport Quantity:</span> ${requisition.transportQuantity}</p>` : ''}
  <p class="info-row"><span class="label">Status:</span> ${requisition.status}</p>
  
  <div class="signature-section">
    <p class="signature-row"><span class="label">Checked by:</span> <span class="line">${requisition.checkedBy?.name || ''}</span> Date: <span class="line">${requisition.checkedAt ? new Date(requisition.checkedAt).toLocaleDateString() : ''}</span></p>
    <p class="signature-row"><span class="label">Approved by:</span> <span class="line">${requisition.approvedBy?.name || ''}</span> Date: <span class="line">${requisition.approvedAt ? new Date(requisition.approvedAt).toLocaleDateString() : ''}</span></p>
    <p class="signature-row"><span class="label">Account's office:</span> <span class="line"></span> Date: <span class="line">${requisition.disbursedAt ? new Date(requisition.disbursedAt).toLocaleDateString() : ''}</span></p>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'application/msword',
        'Content-Disposition': `attachment; filename="requisition-${requisitionId}.doc"`,
      },
    });
  } catch (error) {
    console.error('Export requisition error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
