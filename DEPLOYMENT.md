# 🚀 Deployment Guide

> 👉 **Using cPanel?** Go to **[CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md)** for step-by-step instructions (18 easy steps, ~1 hour to fully deployed)

This guide covers deployment on Linux VPS, self-managed servers, and cloud platforms.

## Prerequisites

Before deployment, ensure you have:

- Node.js 20+ installed ([nodejs.org](https://nodejs.org))
- Bun package manager (`curl -fsSL https://bun.sh/install | bash`)
- A domain/subdomain configured
- SSH access to your server
- PostgreSQL/MySQL or SQLite database
- Google Cloud project with OAuth credentials (optional)
- SMTP email service (Gmail, SendGrid, etc.)

---

## Quick Reference: Choose Your Path

| Hosting Type | Guide |
|--------------|-------|
| **cPanel (Easiest)** | [CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md) ⭐ |
| Linux VPS + PostgreSQL | Continue with this guide |
| AWS/DigitalOcean | Continue with this guide |
| Managed hosting | [CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md) |

---

## Step 1: Upload Files to cPanel or Server

### Option A: Using cPanel File Manager (Easiest for beginners)

1. **Login to cPanel** → **File Manager**
2. Navigate to your **public_html** folder (or subdomain folder)
3. **Upload** your project files using the upload feature
4. Extract/unzip the files if needed

### Option B: Using Git (Recommended for developers)

```bash
# SSH into your server
ssh user@yourdomain.com

# Navigate to your web directory
cd ~/public_html/subdomain

# Clone your repository
git clone https://github.com/yourusername/yourrepo.git .
```

### Option C: Using FTP/SFTP

Use an FTP client (FileZilla, WinSCP, etc.) to upload files to your **public_html** folder.

---

## Step 2: Install Dependencies

SSH into your server and run:

```bash
# Navigate to project folder
cd ~/public_html/subdomain

# Install dependencies
bun install

# Or use npm if bun not available
npm install
```

### If Bun is not available:

```bash
# Install from CDN
curl -fsSL https://bun.sh/install | bash

# Add bun to PATH
export PATH=$HOME/.bun/bin:$PATH

# Then try bun install again
```

---

## Step 3: Configure Environment Variables

### Create .env file

```bash
# Copy the example file
cp .env.example .env

# Edit with nano or vi
nano .env
```

### Essential Variables to Configure

#### Database

⚠️ **For Production:** SQLite is not recommended for multiple concurrent users. Use **PostgreSQL or MySQL**.

See **[DATABASE_SETUP.md](DATABASE_SETUP.md)** for complete database setup instructions.

**Option A: Development (SQLite only)**
```env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
```

**Option B: Production with PostgreSQL (Recommended)**
```env
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://username:password@localhost:5432/requisition_db"
```

See DATABASE_SETUP.md for PostgreSQL setup on Linux or managed services.

**Option C: cPanel/Shared Hosting with MySQL**
```env
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
```

Get credentials from cPanel → MySQL Databases

#### Application Settings
```env
NEXT_PUBLIC_APP_URL="https://yourdomain.com/subdomain"
APP_URL="https://yourdomain.com/subdomain"
NODE_ENV="production"
```

#### Google OAuth (Get from Google Cloud Console)
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="https://yourdomain.com/subdomain/api/auth/google/callback"
```

#### Google Service Account (for Server API calls)
```env
# Download from Google Cloud Console → Service Accounts
# Copy entire JSON as one line:
GOOGLE_SERVICE_ACCOUNT_KEY="{\"type\":\"service_account\",\"project_id\":\"...\",\"private_key\":\"...\",\"client_email\":\"...\",...}"

# Google Drive folder for receipts
GOOGLE_DRIVE_FOLDER_ID="your-folder-id-from-url"

# Google Sheets for requisition tracking
GOOGLE_SHEETS_ID="your-sheet-id-from-url"
GOOGLE_SHEETS_NAME="Sheet1"
```

#### Email Configuration (SMTP)
```env
# Gmail example (use App Password, not your regular password)
EMAIL_SMTP_HOST="smtp.gmail.com"
EMAIL_SMTP_PORT="587"
EMAIL_SMTP_USER="your-email@gmail.com"
EMAIL_SMTP_PASSWORD="your-app-password"

# Other providers
# Outlook/Office 365: smtp.office365.com:587
# SendGrid: smtp.sendgrid.net:587

EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="Your Organization"
ADMIN_EMAIL="admin@yourdomain.com"
```

---

## Step 4: Setup Database

### For SQLite (Development/Small Deployments)

```bash
# Create database and schema
bun prisma db push

# Seed with demo users (optional)
bun prisma db seed
```

### For PostgreSQL (Production - Recommended)

**Before running these commands, set up PostgreSQL first:**

```bash
# 1. Follow DATABASE_SETUP.md PostgreSQL section to:
#    - Install PostgreSQL
#    - Create database and user
#    - Update DATABASE_URL in .env

# 2. Then initialize schema:
bun prisma db push

# 3. Seed with demo users
bun prisma db seed
```

### For MySQL on cPanel

```bash
# 1. Create database via cPanel MySQL Databases
# 2. Update DATABASE_PROVIDER and DATABASE_URL in .env
# 3. Initialize:
bun prisma db push
bun prisma db seed
```

### Created Users

This creates default users for testing:
- **Admin user** (ADMIN role): Full system access
- **Staff user** (STAFF role): Can create and submit requisitions
- **Accountant** (ACCOUNTANT role): Can check and verify requisitions
- **Director** (DIRECTOR role): Can approve requisitions

**Important:** Change default passwords after first login!

**See DATABASE_SETUP.md for:**
- PostgreSQL installation on Linux
- PostgreSQL on managed services
- MySQL setup on cPanel
- Backup and recovery procedures
- Performance tuning

---

## Step 5: Configure Google Services

### 5.1 Google Cloud Project Setup

1. **Create a project** at [console.cloud.google.com](https://console.cloud.google.com)

2. **Enable APIs:**
   - Google Drive API
   - Google Sheets API
   - Google People API

3. **Create OAuth 2.0 Credentials:**
   - Type: **Web application**
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/subdomain/api/auth/google/callback`

4. **Create Service Account (for server operations):**
   - Go to **Service Accounts**
   - Create new service account
   - Create a JSON key
   - Copy the entire JSON content to `GOOGLE_SERVICE_ACCOUNT_KEY` in .env

5. **Share Google resources with Service Account:**
   - Share the Drive folder with the service account email
   - Share the Google Sheet with the service account email

### 5.2 Get IDs from URLs

**Google Drive Folder ID:**
```
https://drive.google.com/drive/folders/0AJux2tLy5Bf_Uk9PVA
                                       ↑ This is your FOLDER_ID
```

**Google Sheets ID:**
```
https://docs.google.com/spreadsheets/d/16f2yBXBQXhb6NObrCS428ZNnLrDFcjvcctjBoJlgfQg/edit
                                       ↑ This is your SHEETS_ID
```

---

## Step 6: Configure Email Service

### 6.1 Gmail Setup (Easiest)

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer"
3. Generate an **App Password** (16 characters)
4. Use this password in .env:

```env
EMAIL_SMTP_HOST="smtp.gmail.com"
EMAIL_SMTP_PORT="587"
EMAIL_SMTP_USER="your-email@gmail.com"
EMAIL_SMTP_PASSWORD="xxxx xxxx xxxx xxxx"  # The 16-char app password
```

### 6.2 Custom Domain Email (cPanel)

If using cPanel email:

```env
EMAIL_SMTP_HOST="mail.yourdomain.com"
EMAIL_SMTP_PORT="587"  # or 465 for SSL
EMAIL_SMTP_USER="admin@yourdomain.com"
EMAIL_SMTP_PASSWORD="your-email-password"
```

---

## Step 7: Build and Deploy

### Build the application

```bash
# Production build
bun run build

# This creates an optimized version in .next/
```

### Create a startup script (systemd service)

Create `/etc/systemd/system/requisition-app.service`:

```ini
[Unit]
Description=Requisition Management System
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/user/public_html/subdomain
ExecStart=/root/.bun/bin/bun start
Restart=always
RestartSec=10
User=user
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable requisition-app
sudo systemctl start requisition-app
sudo systemctl status requisition-app
```

### Alternative: Using PM2 (Recommended)

```bash
# Install PM2 globally
bun install -g pm2

# Start the app
pm2 start "bun start" --name "requisition-app"

# Make it persistent
pm2 startup
pm2 save

# Monitor
pm2 monit
```

---

## Step 8: Configure cPanel (Optional but Recommended)

### Setup Reverse Proxy

If running on a different port (e.g., 3000), configure cPanel to proxy requests:

1. cPanel → **Addon Domains** → Configure
2. Set up reverse proxy to `localhost:3000`

OR

Set up Nginx/Apache configuration to forward traffic.

---

## Step 9: SSL Certificate

### Using Auto SSL in cPanel

1. cPanel → **Auto SSL** → Check for SSL
2. Or use Let's Encrypt for free certificates

### For manual setup:

```bash
# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d subdomain.yourdomain.com

# Configure in .env
NEXT_PUBLIC_APP_URL="https://yourdomain.com/subdomain"
```

---

## Step 10: Verify Installation

### Test the application

```bash
# Visit your domain
https://yourdomain.com/subdomain

# Test login
# Default credentials (if seeded):
# Email: admin@example.com
# Password: admin123
```

### Check logs

```bash
# View logs
tail -f server.log

# Check for errors
tail -f /var/log/syslog
```

---

## Troubleshooting

### Issue: "Port Already in Use"

```bash
# Find and kill process using port 3000
lsof -i :3000
kill -9 [PID]
```

### Issue: "Cannot find module 'nodemailer'"

```bash
bun install nodemailer
# or
npm install nodemailer
```

### Issue: "Google Service Account Not Working"

1. Verify JSON is valid:
```bash
echo $GOOGLE_SERVICE_ACCOUNT_KEY | jq .
```

2. Check folder/sheet is shared with service account email
3. Verify scopes are correct in Google Cloud Console

### Issue: "Email Not Sending"

1. Verify credentials in .env
2. Check SMTP host/port are correct
3. Test with:
```bash
npm install -g mailhog
mailhog
# Then configure EMAIL_SMTP_HOST=localhost:1025
```

### Issue: "Database Connection Error"

```bash
# Check database file exists
ls -la data/
ls -la dev.db

# Reset database if needed
bun prisma db push --force-reset
bun prisma db seed
```

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `NEXT_PUBLIC_APP_URL` to your actual domain
- [ ] Configure all environment variables (.env)
- [ ] Test database connection
- [ ] Test email sending
- [ ] Test Google OAuth login
- [ ] Test Google Drive/Sheets integration
- [ ] Setup SSL certificate
- [ ] Configure backups
- [ ] Setup monitoring
- [ ] Test password reset flow
- [ ] Test receipt upload to Drive
- [ ] Verify admin panel access

---

## Regular Maintenance

### Backup Your Data

```bash
# Backup database
cp data/dev.db data/dev.db.backup.$(date +%Y%m%d)

# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Upload to cloud storage
```

### Update Dependencies

```bash
bun install -u
# Review changes
git diff package.json
# Rebuild
bun run build
```

### Monitor Logs

```bash
# Check for errors
grep ERROR server.log | tail -20

# Monitor in real-time
tail -f server.log
```

---

## Getting Help

- Check logs in `server.log`
- Review error messages in browser console
- Test individual components separately
- Consult the repository documentation
- Contact your hosting provider for infrastructure issues

---

## Security Tips

1. **Change default passwords** after first login
2. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
3. **Enable SSL/TLS** (HTTPS only)
4. **Keep Node.js updated** to latest stable version
5. **Use environment variables** - never commit .env to git
6. **Regularly backup data** to secure location
7. **Monitor access logs** for suspicious activity
8. **Use API keys** for external services (Google, SendGrid, etc.)
9. **Set up rate limiting** for APIs
10. **Implement CORS** restrictions if needed

---

## Support

For issues or questions:
1. Review this guide thoroughly
2. Check the troubleshooting section
3. Review server logs
4. Test with minimal configuration first
5. Contact your hosting provider for infrastructure support

Good luck with your deployment! 🚀
