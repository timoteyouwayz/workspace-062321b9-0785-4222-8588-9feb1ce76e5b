import { google } from 'googleapis';
import { readFile } from 'fs/promises';

let cachedAuth: any = null;

function getServiceAccountAuth() {
  if (cachedAuth) return cachedAuth;
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) return null;
  let key: any;
  try {
    key = typeof keyJson === 'string' ? JSON.parse(keyJson) : keyJson;
  } catch (err) {
    console.error('Invalid GOOGLE_SERVICE_ACCOUNT_KEY JSON');
    return null;
  }

  const scopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets',
  ];

  const jwtClient = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes,
  } as any);

  cachedAuth = jwtClient;
  return jwtClient;
}

export async function uploadFileToDriveFromPath(filePath: string, name: string, mimeType: string, parents?: string[]) {
  const auth = getServiceAccountAuth();
  if (!auth) throw new Error('Service account not configured (GOOGLE_SERVICE_ACCOUNT_KEY)');
  const drive = google.drive({ version: 'v3', auth });
  const buffer = await readFile(filePath);

  const res = await drive.files.create({
    requestBody: {
      name,
      parents,
    },
    media: {
      mimeType,
      body: Buffer.from(buffer),
    },
    fields: 'id,webViewLink,webContentLink',
  } as any);

  return res.data;
}

export async function appendRowToSheet(spreadsheetId: string, values: Array<string | number | boolean>) {
  const auth = getServiceAccountAuth();
  if (!auth) throw new Error('Service account not configured (GOOGLE_SERVICE_ACCOUNT_KEY)');
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  } as any);

  return res.data;
}

/**
 * Add or update requisition in Google Sheets
 */
export async function syncRequisitionToSheet(spreadsheetId: string, requisition: any) {
  const auth = getServiceAccountAuth();
  if (!auth) throw new Error('Service account not configured (GOOGLE_SERVICE_ACCOUNT_KEY)');
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // Ensure header row exists
    const headerCheck = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:M1',
    } as any);

    if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
      // Add headers
      const headers = [
        'ID',
        'User',
        'Email',
        'Department',
        'Reason',
        'Description',
        'Total Amount',
        'Status',
        'Date Needed',
        'Created At',
        'Updated At',
        'Checked By',
        'Approved By',
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1:M1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers],
        },
      } as any);
    }

    // Append the requisition row
    const row = [
      requisition.id,
      requisition.user?.name || 'Unknown',
      requisition.user?.email || 'Unknown',
      requisition.user?.department || '',
      requisition.reason,
      requisition.description,
      requisition.totalAmount,
      requisition.status,
      new Date(requisition.dateNeeded).toLocaleDateString(),
      new Date(requisition.createdAt).toLocaleString(),
      new Date(requisition.updatedAt).toLocaleString(),
      requisition.checkedBy?.name || '',
      requisition.approvedBy?.name || '',
    ];

    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    } as any);

    return appendRes.data;
  } catch (error) {
    console.error('Error syncing requisition to sheet:', error);
    throw error;
  }
}

/**
 * Update requisition status in Google Sheets (find and update the row)
 */
export async function updateRequisitionInSheet(spreadsheetId: string, requisitionId: string, status: string) {
  const auth = getServiceAccountAuth();
  if (!auth) throw new Error('Service account not configured (GOOGLE_SERVICE_ACCOUNT_KEY)');
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // Get all data to find the requisition
    const allData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1',
    } as any);

    if (!allData.data.values) return;

    // Find row with matching ID
    const rowIndex = allData.data.values.findIndex((row: any) => row[0] === requisitionId);
    if (rowIndex === -1) return; // Not found

    // Update the status in column H (index 7)
    const cellRange = `Sheet1!H${rowIndex + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: cellRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[status]],
      },
    } as any);

    // Also update the "Updated At" field in column K (index 10)
    const updatedAtRange = `Sheet1!K${rowIndex + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updatedAtRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[new Date().toLocaleString()]],
      },
    } as any);
  } catch (error) {
    console.error('Error updating requisition in sheet:', error);
    throw error;
  }
}
