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
