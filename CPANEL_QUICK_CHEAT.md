# cPanel Deployment Quick Cheat Sheet

## 🎯 Complete cPanel Deployment in One Page

### Phase 1: Preparation (15 min)

```bash
# Gather information you'll need:
☐ cPanel login credentials
☐ Domain name
☐ Hosting control panel URL
☐ Project files (git clone or upload)
```

---

### Phase 2: Upload Files (5 min)

**Via cPanel File Manager (Easiest):**
1. Login to cPanel
2. File Manager → public_html (or subdomain folder)
3. Upload project files
4. Extract if .zip

**Via SSH (Fastest):**
```bash
ssh cpanel_username@yourdomain.com
cd public_html
git clone https://github.com/yourusername/repo.git .
```

> 💡 *Tip:* the repository can include the built bundle so that the host never
> needs to run `next build`. See the notes below about committing `.next/standalone`
> or using the provided GitHub Action which automatically does this on every push.

---

### Phase 3: Install & Setup (30 min)

```bash
# Navigate to project
cd ~/public_html/subdomain

# Install dependencies (takes 2-3 min)
bun install

# If bun not found, install it:
curl -fsSL https://bun.sh/install | bash
export PATH=$HOME/.bun/bin:$PATH
```

**In cPanel: Create MySQL Database**
1. MySQL Databases section
2. Create database: `requisition_db`
3. Create user: `requisition_user` + strong password
4. Add user to database (ALL PRIVILEGES)

**Get connection string:**
```
mysql://requisition_user:PASSWORD@localhost:3306/cpanelname_requisition_db
```

---

### Phase 4: Configure App (10 min)

**Create .env file:**

```bash
cat > .env << 'EOF'
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://requisition_user:YOUR_PASSWORD@localhost:3306/cpanelname_requisition_db"
NEXT_PUBLIC_APP_URL="https://yourdomain.com/subdomain"
APP_URL="https://yourdomain.com/subdomain"
NODE_ENV="production"

# Gmail example (use App Password)
EMAIL_SMTP_HOST="smtp.gmail.com"
EMAIL_SMTP_PORT="587"
EMAIL_SMTP_USER="your-email@gmail.com"
EMAIL_SMTP_PASSWORD="xxxx xxxx xxxx xxxx"
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="Your Organization"
ADMIN_EMAIL="admin@yourdomain.com"

# Leave these blank initially (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_SERVICE_ACCOUNT_KEY="{}"
GOOGLE_DRIVE_FOLDER_ID=""
GOOGLE_SHEETS_ID=""
EOF
```

**Replace these values:**
- `YOUR_PASSWORD` - Your database password
- `yourdomain.com/subdomain` - Your actual domain
- `your-email@gmail.com` - Your email
- `cpanelname` - Your cPanel username (prefix)

---

### Phase 5: Database Setup (5 min)

```bash
cd ~/public_html/subdomain

# Create tables
bun prisma db push

# Add demo users
bun prisma db seed
```

### Phase 6: Build App (3 min)

This step may fail on low‑memory shared hosts – if you see an “out of memory”
error during `next build`, simply build locally and push the resulting
`.next/standalone` folder instead (the repository is configured to allow that).
You can also enable the GitHub Action `build-for-cpanel.yml` which will run
`npm run build` on every push and commit the standalone bundle for you.

```bash
cd ~/public_html/subdomain
bun run build           # or npm run build
```

When building locally the steps look like:

```bash
# on your own machine
git clone … && cd repo
bun install             # or npm install
bun run build           # produces .next/standalone
# commit the standalone directory so cPanel gets it
```
**Demo Credentials:**
- admin@example.com / admin123
- staff@example.com / staff123
- accountant@example.com / acct123
- director@example.com / dir123

---

### Phase 6: Build App (3 min)

```bash
cd ~/public_html/subdomain
bun run build
```

---

### Phase 7: Create Upload Directories (2 min)

```bash
mkdir -p uploads/receipts data logs
chmod -R 755 uploads data logs
```

---

### Phase 8: Start Application (5 min)

**Option A: cPanel Node.js App Manager (Easiest)**
1. cPanel → Node.js App Manager
2. Create Node.js Application
3. Node version: Latest LTS (v20+)
4. Startup file/command: `node .next/standalone/server.js` (or simply
   `npm start` if you’ve installed bun and wish to keep using it)
5. Click Create

**Option B: Manual PM2 (if available)**
```bash
npm install -g pm2
pm2 start "npm start" --name "requisition-app"
pm2 startup
pm2 save
```

---

### Phase 9: Enable SSL (2 min)

1. cPanel → AutoSSL or Let's Encrypt
2. Check for certificates
3. Install SSL

---

## ✅ Test It Works

```bash
# Test app is running
curl http://localhost:3000

# Visit in browser
https://yourdomain.com/subdomain

# Login
Email: admin@example.com
Password: admin123
```

---

## 🔐 Security

```bash
# Change default admin password immediately
# In app: Login → Settings → Change Password

# Create real user accounts
# Admin panel → Users → Delete demo accounts
```

---

## 📧 Email Setup (Optional)

**Gmail:**
1. Enable 2FA on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add to .env

**Other:** Update SMTP settings in .env

---

## 🗄️ Backups (Important!)

**Manual backup:**
```bash
mkdir -p ~/backups
mysqldump -u requisition_user -p requisition_db | gzip > ~/backups/backup_$(date +%Y%m%d).sql.gz
```

**Auto daily backup in cron:**
```bash
crontab -e
# Add: 0 2 * * * mysqldump -u user -ppass db | gzip > ~/backups/backup_$(date +\%Y\%m\%d).sql.gz
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Port in use" | `ps aux \| grep bun`, kill process, restart |
| "Can't connect" | Check .env DATABASE_URL |
| "Page not loading" | `tail -f ~/public_html/subdomain/server.log` |
| "Email not sending" | Verify SMTP credentials in .env |
| "Upload fails" | `chmod -R 755 uploads/` |

---

## 📊 Status Check

```bash
# App running?
curl http://localhost:3000

# Database working?
mysql -u requisition_user -p -h localhost

# Disk space?
df -h

# Recent errors?
tail -20 ~/public_html/subdomain/server.log
```

---

## 🔑 Useful Paths

```
~/public_html/subdomain/          # Project root
~/public_html/subdomain/.env      # Configuration
~/public_html/subdomain/server.log # Application log
~/public_html/subdomain/uploads/  # Receipt files
~/public_html/subdomain/data/     # SQLite (if used)
~/logs/error_log                   # cPanel errors
~/logs/access_log                  # cPanel access
```

---

## 📋 Deployment Checklist

- [ ] Files uploaded
- [ ] `bun install` completed
- [ ] MySQL database created
- [ ] `.env` file configured correctly
- [ ] `bun prisma db push` successful
- [ ] `bun prisma db seed` successful
- [ ] `bun run build` successful
- [ ] Upload directories created
- [ ] App started (check via curl)
- [ ] SSL enabled
- [ ] Can login to `https://yourdomain.com/subdomain`
- [ ] Changed default admin password
- [ ] Created real user accounts
- [ ] Backups configured
- [ ] Email tested (forgot password)

**All checked? You're live! 🎉**

---

## 📞 If Something Goes Wrong

1. **Check email configuration** → EMAIL section in .env
2. **Check database connection** → DATABASE_URL in .env
3. **Check logs** → `tail -f server.log`
4. **Check app status** → `curl http://localhost:3000`
5. **Read full guide** → [CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md)

---

## 🔗 Useful Links

- **cPanel**: https://yourdomain.com:2083
- **App**: https://yourdomain.com/subdomain
- **phpmyadmin**: https://yourdomain.com:2083/phpmyadmin
- **Full Guide**: [CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md)
- **Troubleshooting**: [CPANEL_DEPLOYMENT.md#troubleshooting](CPANEL_DEPLOYMENT.md#troubleshooting)

---

**Estimated Total Time: 1-2 hours from zero to live ⏱️**

For detailed instructions, see: **[CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md)**
