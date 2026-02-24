# Pre-Deployment Checklist

Use this checklist to ensure your system is properly configured before going live.

## Environment Configuration

- [ ] `.env` file created and configured
- [ ] `NEXT_PUBLIC_APP_URL` set to your actual domain
- [ ] `NODE_ENV` set to `"production"`
- [ ] `DATABASE_URL` configured
  - [ ] For SQLite: `file:./data/dev.db`
  - [ ] For MySQL/PostgreSQL: Connection string configured

## Google Services

### Google OAuth Setup
- [ ] Google Cloud Project created
- [ ] OAuth 2.0 credentials generated
  - [ ] `GOOGLE_CLIENT_ID` configured
  - [ ] `GOOGLE_CLIENT_SECRET` configured
  - [ ] `GOOGLE_REDIRECT_URI` set correctly (https://yourdomain.com/api/auth/google/callback)
- [ ] OAuth consent screen configured
- [ ] Test users added to project

### Google Service Account
- [ ] Service account created
- [ ] Service account JSON key downloaded
- [ ] `GOOGLE_SERVICE_ACCOUNT_KEY` configured as JSON string
- [ ] Service account email (in JSON) has:
  - [ ] Editor access to receipts folder
  - [ ] Editor access to requisitions sheet

### Google Drive & Sheets Integration
- [ ] Receipts folder created in Google Drive
- [ ] `GOOGLE_DRIVE_FOLDER_ID` extracted and configured
- [ ] Requisitions Google Sheet created
  - [ ] Shared with service account email
- [ ] `GOOGLE_SHEETS_ID` extracted and configured
- [ ] `GOOGLE_SHEETS_NAME` set (usually "Sheet1")

## Email Configuration

### SMTP Credentials
- [ ] SMTP provider chosen (Gmail, SendGrid, custom, etc.)
- [ ] `EMAIL_SMTP_HOST` configured
- [ ] `EMAIL_SMTP_PORT` configured (typically 587 or 465)
- [ ] `EMAIL_SMTP_USER` configured
- [ ] `EMAIL_SMTP_PASSWORD` configured
  - [ ] For Gmail: App password generated and configured
  - [ ] Not your regular Gmail password

### Email Settings
- [ ] `EMAIL_FROM` set to a valid email address
- [ ] `EMAIL_FROM_NAME` set to your organization name
- [ ] `ADMIN_EMAIL` set for receiving notifications

## Database Setup

- [ ] Database file created at `data/dev.db`
- [ ] Database schema pushed: `bun prisma db push`
- [ ] Demo data seeded: `bun prisma db seed`
- [ ] Admin account created with strong password
- [ ] Default users exist:
  - [ ] Admin (ADMIN role)
  - [ ] Staff member (STAFF role)
  - [ ] Accountant (ACCOUNTANT role)
  - [ ] Director (DIRECTOR role)

## Application Build & Runtime

- [ ] Dependencies installed: `bun install`
- [ ] Application builds successfully: `bun run build`
- [ ] Build output in `.next/` directory
  - [ ] `.next/standalone` folder created
  - [ ] `.next/static` copied to standalone folder
  - [ ] `public` folder copied to standalone folder
- [ ] Upload directories exist:
  - [ ] `uploads/receipts` folder created
  - [ ] Proper permissions set (writable by app)

## Security Checks

- [ ] `.env` file NOT committed to git
- [ ] `.gitignore` includes `.env` and sensitive files
- [ ] SSL/TLS certificate configured
  - [ ] Domain uses HTTPS only
  - [ ] Certificate not expired
- [ ] Default passwords changed
  - [ ] Admin password changed from demo
  - [ ] Test users deleted or reset
- [ ] CORS configured if needed
- [ ] API rate limiting considered
- [ ] Input validation enabled on all endpoints

## Testing

### Authentication Testing
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials fails properly
- [ ] Logout works
- [ ] Session persists correctly
- [ ] Google OAuth login works (if configured)

### User Management Testing
- [ ] Admin can view all users
- [ ] Admin can create new users
- [ ] Admin can update user details
- [ ] Admin can delete users

### Requisition Workflow Testing
- [ ] Staff can create requisition
- [ ] Cannot create requisition if receipts pending
- [ ] Accountant can check requisition
- [ ] Director can approve checked requisition
- [ ] Accountant can disburse approved requisition
- [ ] Status updates reflected in Google Sheets

### Receipt & Verification Testing
- [ ] Can upload receipt file
- [ ] Receipt amount validated
- [ ] Receipt file uploaded to Google Drive
- [ ] Receipt link accessible
- [ ] Accountant can verify receipt
- [ ] User cannot create new requisition until receipts verified
- [ ] Email notification sent when verified

### Password Reset Testing
- [ ] Forgot password request sends email
- [ ] Email received by user
- [ ] Reset link in email works
- [ ] New password accepted
- [ ] Can login with new password

### Google Integration Testing
- [ ] Requisitions appear in Google Sheets
- [ ] Sheet updates when status changes
- [ ] Receipt file appears in Google Drive folder
- [ ] Drive folder link accessible

### Email Testing
- [ ] Password reset email received
- [ ] Receipt verification email received
- [ ] Email format looks professional
- [ ] Email links work correctly
- [ ] From name/address correct

## Performance & Monitoring

- [ ] Application starts without errors
- [ ] Application responds to requests (< 2s)
- [ ] CPU usage reasonable during operation
- [ ] Memory usage stable
- [ ] No console errors in browser
- [ ] No errors in server logs
- [ ] Upload large files successfully

## Documentation

- [ ] `.env.example` updated with all variables
- [ ] `DEPLOYMENT.md` reviewed for accuracy
- [ ] `README.md` reflects current setup
- [ ] `API.md` documentation complete
- [ ] Setup instructions clear and tested

## Backup & Maintenance

- [ ] Automatic backup system configured
  - [ ] Database backed up regularly
  - [ ] Uploads backed up regularly
  - [ ] Backup storage secure
- [ ] Log rotation configured
- [ ] Monitoring/alerting system configured
  - [ ] Error tracking (Sentry, etc.)
  - [ ] Uptime monitoring
  - [ ] Email alerts configured

## Production Deployment

- [ ] Server uptime monitoring configured
- [ ] SSL certificate auto-renewal configured (Let's Encrypt)
- [ ] PM2 or systemd service configured to start on boot
- [ ] Process manager running (`pm2 status` or `systemctl status`)
- [ ] Firewall configured (port 80, 443 open; others blocked)
- [ ] API keys rotated from development
- [ ] Test login works after deployment
- [ ] Admin panel accessible
- [ ] Users can access the system

## Post-Deployment

- [ ] Communicate new system to users
- [ ] Provide login credentials to admins
- [ ] Run user training (if needed)
- [ ] Monitor logs for first 24 hours
- [ ] Verify all workflows working
- [ ] Document any issues encountered
- [ ] Create runbook for common tasks
- [ ] Set up support procedures

## Rollback Plan

- [ ] Previous version backed up
- [ ] Rollback procedure documented
- [ ] Know how to:
  - [ ] Stop the application
  - [ ] Restore database from backup
  - [ ] Restore previous source code
  - [ ] Restart the application

---

## Sign-Off

- [ ] All checks completed
- [ ] All tests passed
- [ ] Ready for production deployment

**Date:** _________________

**Checked by:** _________________

**Notes:**
```
[Add any additional notes or issues found]


```

---

If any item is not checked, review the DEPLOYMENT.md guide before proceeding.

Good luck with your deployment! 🚀
