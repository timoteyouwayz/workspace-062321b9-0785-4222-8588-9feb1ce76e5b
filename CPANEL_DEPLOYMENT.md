# cPanel Complete Deployment Guide (Step-by-Step from Zero)

This guide walks you through deploying the entire requisition system on cPanel from scratch. Follow each step in order.

---

## Prerequisites

Before starting, you need:

- ✅ cPanel account (usually from web hosting provider)
- ✅ Domain or subdomain configured in cPanel
- ✅ SSH access enabled in cPanel (ask hosting provider if needed)
- ✅ This project folder ready to upload

---

## STEP 1: Upload Project Files to cPanel

### Option A: Using cPanel File Manager (Easy for Beginners)

1. **Login to cPanel**
   - Go to: `https://yourdomain.com:2083`
   - Enter username and password

2. **Navigate to Your Folder**
   - Click **File Manager**
   - Navigate to: **public_html** (for main domain) OR **public_html/subdomain** (for subdomain)

3. **Upload Files**
   - Click **Upload** button
   - Drag and drop the entire project folder here (or select files)
   - Wait for upload to complete

4. **Extract Archive** (if uploaded as .zip)
   - Right-click the .zip file
   - Select **Extract**
   - Delete the .zip file when done

### Option B: Using FTP (More Reliable for Large Projects)

1. **Get FTP Credentials from cPanel**
   - In cPanel: Look for **FTP Accounts** section
   - Click **Configure FTP Client**
   - Download recommended FTP software (FileZilla)

2. **Connect in FileZilla**
   - Host: `yourdomain.com`
   - Username: From cPanel
   - Password: From cPanel
   - Port: 21
   - Click **Quickconnect**

3. **Upload Files**
   - Left side: Your computer folder with project files
   - Right side: /public_html/ (or subdomain folder)
   - Drag and drop files to right side
   - Wait for upload

### Option C: Using SSH & Git (Fastest for Developers)

1. **SSH into Your Server**
   ```bash
   ssh cpanel_username@yourdomain.com
   # Enter password
   ```

2. **Navigate to Web Folder**
   ```bash
   cd public_html
   # or for subdomain:
   cd public_html/subdomain
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/your-repository.git .
   cd your-project
   ```

---

## STEP 2: Check Node.js and Bun are Available

### Check Node.js Version

```bash
node --version
# Should be v20 or higher. If not, ask hosting provider to upgrade
```

### Check/Install Bun

```bash
# Check if bun is installed
which bun

# If not found, install it
curl -fsSL https://bun.sh/install | bash

# Add to PATH
export PATH=$HOME/.bun/bin:$PATH

# Verify
bun --version
```

---

## STEP 3: Install Project Dependencies

Navigate to your project folder via SSH:

```bash
cd ~/public_html/subdomain  # Change path based on where you uploaded

# Install dependencies
bun install

# Wait 2-5 minutes for completion
# You should see "added X packages"
```

---

## STEP 4: Create Database (MySQL on cPanel)

### Step A: Create Database in cPanel

1. **Login to cPanel**
2. Go to **MySQL Databases**
3. **Create New Database**
   - Database name: `requisition_db`
   - Click **Create Database**

4. **Create Database User**
   - Username: `requisition_user`
   - Password: Use cPanel generator (copy it somewhere safe)
   - Click **Create User**

5. **Add User to Database**
   - Select both user and database
   - Permissions: Check **ALL PRIVILEGES**
   - Click **Make Changes**

### Step B: Get Connection String

Your connection string will be:
```
mysql://requisition_user:your_password@localhost:3306/cpanel_username_requisition_db
```

**Note:** cPanel prefixes database names with your username. Check the exact name in MySQL Databases section.

---

## STEP 5: Create .env File

### Step A: Via cPanel File Manager

1. **Navigate to Project Folder** in File Manager
2. **Create New File** button
3. Name it: `.env`
4. **Edit** it and paste the content below

### Step B: Via SSH

```bash
cd ~/public_html/subdomain

# Create .env file
cat > .env << 'EOF'
# Database
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://requisition_user:YOUR_PASSWORD@localhost:3306/cpanel_username_requisition_db"

# Application
NEXT_PUBLIC_APP_URL="https://yourdomain.com/subdomain"
APP_URL="https://yourdomain.com/subdomain"
NODE_ENV="production"

# Google OAuth (Leave blank for now, fill later)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="https://yourdomain.com/subdomain/api/auth/google/callback"

# Google Service Account (Leave blank for now)
GOOGLE_SERVICE_ACCOUNT_KEY="{}"

# Google Drive & Sheets (Fill after setup)
GOOGLE_DRIVE_FOLDER_ID=""
GOOGLE_SHEETS_ID=""
GOOGLE_SHEETS_NAME="Sheet1"

# Email (Gmail example - use App Password)
EMAIL_SMTP_HOST="smtp.gmail.com"
EMAIL_SMTP_PORT="587"
EMAIL_SMTP_USER="your-email@gmail.com"
EMAIL_SMTP_PASSWORD="xxxx xxxx xxxx xxxx"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="Your Organization"
ADMIN_EMAIL="admin@yourdomain.com"
EOF

# Verify file was created
cat .env
```

### Step C: Update.env with Correct Values

Edit the `.env` file:

Find these lines and replace:

```
# Replace with your actual database connection:
DATABASE_URL="mysql://requisition_user:YOUR_PASSWORD@localhost:3306/cpanel_username_requisition_db"

# Replace with your domain:
NEXT_PUBLIC_APP_URL="https://yourdomain.com/subdomain"
APP_URL="https://yourdomain.com/subdomain"

# Replace with your email:
EMAIL_SMTP_USER="your-email@gmail.com"
EMAIL_SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="Your Company Name"
ADMIN_EMAIL="admin-email@yourdomain.com"
```

---

## STEP 6: Set Up Database Schema

```bash
cd ~/public_html/subdomain

# Create database tables
bun prisma db push

# Seed with demo users
bun prisma db seed

# You should see:
# ✓ admin@example.com (ADMIN)
# ✓ staff@example.com (STAFF)
# ✓ accountant@example.com (ACCOUNTANT)
# ✓ director@example.com (DIRECTOR)
```

---

## STEP 7: Build the Application

```bash
cd ~/public_html/subdomain

# Build for production
bun run build

# Wait for build to complete (2-3 minutes)
# You should see: "✓ Compiled successfully"
```

---

## STEP 8: Create Upload Directories

```bash
cd ~/public_html/subdomain

# Create folders for uploads
mkdir -p uploads/receipts
mkdir -p data
mkdir -p logs

# Set permissions
chmod -R 755 uploads/
chmod -R 755 data/
chmod -R 755 logs/

# Verify
ls -la | grep "uploads\|data\|logs"
```

---

## STEP 9: Configure cPanel to Run Your App

### Option A: Using Node.js App Manager (Easiest)

1. **Login to cPanel**
2. Find **Node.js App Manager** or **Node.js Selector**
3. **Create Node.js Application**
   - Node.js version: Select latest LTS (v20+)
   - Application mode: Production
   - Application startup file: `server.js` (or `.next/standalone/server.js`)
   - Application URL: `https://yourdomain.com/subdomain`
   - Application root: `/home/cpanel_username/public_html/subdomain`

4. **Click Create**
5. The app should start automatically

### Option B: Manual Setup with PM2

```bash
cd ~/public_html/subdomain

# Install PM2 globally
npm install -g pm2

# Start the app
pm2 start "bun start" --name "requisition-app"

# Make it survive server restarts
pm2 startup
# Copy the command it outputs and run it
pm2 save

# Check status
pm2 status
pm2 logs requisition-app
```

### Option C: Using systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/requisition.service
```

Paste this content:
```ini
[Unit]
Description=Requisition Management System
After=network.target

[Service]
Type=simple
User=cpanel_username
WorkingDirectory=/home/cpanel_username/public_html/subdomain
ExecStart=/home/cpanel_username/.bun/bin/bun start
Restart=always
RestartSec=10
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable requisition.service
sudo systemctl start requisition.service
sudo systemctl status requisition.service
```

---

## STEP 10: Configure DNS and SSL

### Step A: Point Domain to cPanel

If not already done:
1. Update domain nameservers to point to your hosting provider
2. Or update A records to your server IP

### Step B: Enable SSL Certificate

1. **cPanel → AutoSSL** (or **Let's Encrypt**)
2. Check for available certificates
3. Install SSL for your domain

4. **Verify SSL in browser**
   - Visit: `https://yourdomain.com/subdomain`
   - Should show green lock icon

---

## STEP 11: Verify Application is Running

```bash
# Check if app is listening
curl http://localhost:3000

# Check processes
ps aux | grep bun
# or
pm2 status

# Check logs
cd ~/public_html/subdomain
tail -f server.log

# or with PM2
pm2 logs requisition-app
```

---

## STEP 12: Test the Application

### Via Browser

1. Visit: `https://yourdomain.com/subdomain`
2. You should see the login page
3. Login with:
   - **Email:** `admin@example.com`
   - **Password:** `admin123`

### If Page Doesn't Load

**Check cPanel Error Logs:**
```bash
tail -f ~/public_html/subdomain/server.log
# or
tail -f ~/logs/error_log
```

**Common Issues:**
- Port 3000 in use: Kill process and restart
- Database not connected: Check DATABASE_URL in .env
- Node.js not found: Check it's installed

---

## STEP 13: Configure Google Services (Optional but Recommended)

### For Receipts in Google Drive + Sheets Sync:

1. **Create Google Cloud Project**
   - Go to: https://console.cloud.google.com
   - Create new project

2. **Enable APIs**
   - Google Drive API
   - Google Sheets API
   - Google People API

3. **Create OAuth Credentials**
   - Type: Web application
   - Authorized origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/subdomain/api/auth/google/callback`
   - Copy Client ID and Secret to .env

4. **Create Service Account**
   - Download JSON key
   - Copy entire JSON to `GOOGLE_SERVICE_ACCOUNT_KEY` in .env

5. **Create Google Drive Folder**
   - Go to Google Drive: https://drive.google.com
   - Create folder for receipts
   - Share with service account email
   - Copy folder ID to `GOOGLE_DRIVE_FOLDER_ID` in .env

6. **Create Google Sheet**
   - Create new spreadsheet
   - Share with service account email
   - Copy sheet ID to `GOOGLE_SHEETS_ID` in .env

7. **Update .env and Restart**
   ```bash
   cd ~/public_html/subdomain
   # Update .env with Google credentials
   nano .env
   
   # Restart app
   pm2 restart requisition-app
   # or
   systemctl restart requisition.service
   ```

---

## STEP 14: Configure Email (Optional but Important)

### Using Gmail (Easiest)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select Mail + Windows Computer
   - Generate password (16 chars)
   - Copy it

3. **Update .env**
   ```
   EMAIL_SMTP_HOST="smtp.gmail.com"
   EMAIL_SMTP_PORT="587"
   EMAIL_SMTP_USER="your-gmail@gmail.com"
   EMAIL_SMTP_PASSWORD="xxxx xxxx xxxx xxxx"
   ```

4. **Restart App**
   ```bash
   pm2 restart requisition-app
   # or
   systemctl restart requisition.service
   ```

---

## STEP 15: Change Default Passwords

1. **Login to Application**
   - Email: `admin@example.com`
   - Password: `admin123`

2. **Change Admin Password**
   - Click on account settings
   - Change password to something strong

3. **Create Real User Accounts**
   - Admin panel → Users
   - Delete demo users
   - Create real staff, accountant, director accounts

---

## STEP 16: Test All Features

### Test Login
```bash
curl -X POST https://yourdomain.com/subdomain/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Test Requisition Creation
1. Login as staff
2. Create a requisition
3. Check it appears (and if Google Sheets set up, check sheet)

### Test Email
1. Try "Forgot Password"
2. Check your email for reset link

### Test Receipt Upload
1. Create and approve a requisition
2. Upload a receipt file
3. Check it appears in Google Drive (if configured)

---

## STEP 17: Setup Backups

### Automatic Database Backups

Create backup script:
```bash
mkdir -p ~/backups
cat > ~/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/backups"
DB_NAME="cpanel_username_requisition_db"
DB_USER="requisition_user"
DB_PASS="your_password"
DB_HOST="localhost"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
mysqldump -u $DB_USER -p$DB_PASS -h $DB_HOST $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
EOF

chmod +x ~/bin/backup-db.sh
```

Add to crontab:
```bash
crontab -e
# Add this line (run daily at 2 AM):
0 2 * * * ~/bin/backup-db.sh
```

---

## STEP 18: Monitor Application

### Check Status Regularly

```bash
# Check if app is running
ps aux | grep bun

# Check recent errors
tail -20 ~/public_html/subdomain/server.log

# Check disk space
df -h

# Check memory usage
free -h

# Check if port is listening
netstat -tlnp | grep 3000
```

### Setup Log Rotation

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/requisition-app
```

Paste:
```
/home/cpanel_username/public_html/subdomain/server.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 cpanel_username cpanel_username
    sharedscripts
}
```

---

## TROUBLESHOOTING

### App Won't Start

```bash
# Check Node.js version
node --version

# Check if port 3000 is in use
lsof -i :3000

# Kill and restart
pm2 kill
pm2 start "bun start" --name "requisition-app"

# Check logs
pm2 logs requisition-app
```

### Database Connection Error

```bash
# Verify connection string
cat ~/.env | grep DATABASE_URL

# Test MySQL connection
mysql -u requisition_user -p -h localhost -e "SHOW DATABASES;"

# Verify database exists
mysql -u requisition_user -p -h localhost -e "SHOW DATABASES LIKE 'requisition_db';"
```

### Page Not Loading

```bash
# Check if app is running
curl http://localhost:3000

# Check cPanel error logs
tail -f ~/logs/error_log
tail -f ~/logs/access_log

# Check .env file exists and is readable
cat ~/.env | head -5
```

### Email Not Sending

```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Verify .env has correct email settings
cat ~/.env | grep EMAIL
```

### Upload/Receipts Not Working

```bash
# Check upload directory permissions
ls -la ~/public_html/subdomain/uploads/

# Fix if needed
chmod -R 755 ~/public_html/subdomain/uploads/
chmod -R 755 ~/public_html/subdomain/data/
```

---

## SUCCESS CHECKLIST

- [ ] Files uploaded to cPanel
- [ ] Dependencies installed with `bun install`
- [ ] MySQL database created
- [ ] `.env` file created with correct values
- [ ] Database schema initialized: `bun prisma db push`
- [ ] Demo users seeded: `bun prisma db seed`
- [ ] Application built: `bun run build`
- [ ] Upload directories created with proper permissions
- [ ] App started and running (check via `pm2 status`)
- [ ] SSL certificate enabled
- [ ] Application loads at `https://yourdomain.com/subdomain`
- [ ] Can login with admin@example.com / admin123
- [ ] Changed default admin password
- [ ] Created real user accounts
- [ ] Google services configured (optional)
- [ ] Email configured (optional)
- [ ] Backups configured
- [ ] All tests passed

---

## NEXT STEPS

1. **Test Everything** - Follow STEP 16 test procedures
2. **Security Hardening** - Change all default passwords
3. **Train Users** - Show staff how to use the system
4. **Monitor** - Check logs regularly for errors
5. **Backup** - Verify backups are running
6. **Scale** - If performance issues, upgrade to PostgreSQL

---

## SUPPORT COMMANDS

```bash
# Navigate to project
cd ~/public_html/subdomain

# Check app status
pm2 status

# View app logs
pm2 logs requisition-app

# Restart app
pm2 restart requisition-app

# Stop app
pm2 stop requisition-app

# Start app
pm2 start "bun start" --name "requisition-app"

# View .env
cat .env

# Check disk space
df -h

# Check MySQL
mysql -u requisition_user -p -e "SHOW DATABASES;"

# Restart from SSH
ssh cpanel_username@yourdomain.com
cd ~/public_html/subdomain
pm2 restart all
```

---

**You're done! Your application is now live on cPanel.** 🎉

For documentation, see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - General deployment guide
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database details
- [API.md](API.md) - API endpoints
- [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md) - Verification checklist
