# 🚀 Setup Guide — Get Running in VSCode with Google Drive

## 1. Prerequisites

| Tool | Install |
|------|---------|
| **Node.js 20+** | https://nodejs.org |
| **Bun** | `curl -fsSL https://bun.sh/install \| bash` |
| **VSCode** | https://code.visualstudio.com |

---

## 2. Open in VSCode

```bash
# Open the project folder
code .
```

When prompted, click **"Install Recommended Extensions"** — this installs Tailwind, Prisma, ESLint, and Prettier support.

---

## 3. Install dependencies

```bash
bun install
```

---

## 4. Configure environment variables

Copy `.env` (already included) and fill in the values:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

> **Leave the Google vars blank** if you just want to test locally without Drive. The app still works — receipts are stored on disk.

---

## 5. Set up the database

```bash
# Push the schema to create dev.db
bun prisma db push

# Seed with demo users (admin / staff / accountant / director)
bun prisma db seed
```

---

## 6. Start the dev server

```bash
bun run dev
```

Open → http://localhost:3000

---

## 7. Google OAuth + Drive Setup (optional but recommended)

### 7a. Create a Google Cloud project

1. Go to https://console.cloud.google.com/
2. **New Project** → give it a name
3. **APIs & Services → Enable APIs:**
   - ✅ Google Drive API
   - ✅ Google People API

### 7b. Create OAuth 2.0 credentials

1. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
2. Application type: **Web application**
3. Authorised JavaScript origins:
   ```
   http://localhost:3000
   ```
4. Authorised redirect URIs:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
5. Click **Create** → copy **Client ID** and **Client Secret**

### 7c. Configure OAuth consent screen

1. **APIs & Services → OAuth consent screen**
2. User type: **External** → fill in app name + your email
3. **Test users** → add your Gmail address
4. Scopes to add: `email`, `profile`, `openid`, `https://www.googleapis.com/auth/drive.file`

### 7d. Update `.env`

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Optional: upload receipts to a specific folder
# GOOGLE_DRIVE_FOLDER_ID=your-folder-id
```

### 7e. Migrate the database to support tokens

```bash
bun prisma db push
```

### 7f. Sign in

Click **"Sign in with Google"** in the app. After authentication, Drive uploads work automatically — no extra steps needed.

### Service Account (recommended for server-side Sheet/Drive writes)

If you prefer the app to write to a shared Drive or Sheets without per-user OAuth, create a Service Account in the Google Cloud Console, grant it access to the target shared drive and spreadsheet, then set the JSON key in your env:

```env
# Paste the entire JSON object as a single line value (escape newlines or use a secrets manager)
GOOGLE_SERVICE_ACCOUNT_KEY='{ "type": "service_account", ... }'
GOOGLE_DRIVE_FOLDER_ID=1y68aiLFsTGv-YvxnxidvE7vvtrtMmQzf
GOOGLE_SPREADSHEET_ID=16f2yBXBQXhb6NObrCS428ZNnLrDFcjvcctjBoJlgfQg
```

After setting those, the server will automatically upload receipts to the shared folder and append rows to the spreadsheet.

---

## 8. Default accounts (from seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ngo.org | admin123 |
| Director | director@ngo.org | director123 |
| Accountant | accountant@ngo.org | accountant123 |
| Staff | staff@ngo.org | staff123 |

---

## 9. VSCode Tips

- **Debug server + client**: Run → Start Debugging → `Next.js: debug full stack`
- **Prisma Studio** (DB browser): `bun prisma studio`
- **Reset DB**: `rm db/dev.db && bun prisma db push && bun prisma db seed`

---

## What was fixed

| Issue | Fix |
|-------|-----|
| Missing `.env` file | Created with all required variables + comments |
| Google OAuth callback didn't save tokens | Callback now stores `access_token`, `refresh_token`, and expiry in DB and cookie |
| Drive route required manual `accessToken` in body | Drive route now auto-resolves token from cookie → DB → refresh automatically |
| No token refresh logic | Added automatic refresh_token flow |
| VSCode not configured | Added `.vscode/settings.json`, `extensions.json`, `launch.json` |
| Prisma schema missing token fields | Added `googleAccessToken`, `googleRefreshToken`, `googleTokenExpiry` |
