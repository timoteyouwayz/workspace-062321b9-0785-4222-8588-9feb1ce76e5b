# Step 2: Setting Environment Variables in Vercel

## Quick Setup Guide

### 1. Access Vercel Dashboard
- Go to [vercel.com](https://vercel.com)
- Login to your account
- Find your project in the dashboard

### 2. Navigate to Environment Variables
- Click on your project
- Go to **Settings** tab
- Click on **Environment Variables** in the left sidebar

### 3. Add Required Variables

#### A. Database URL (Required)
```
Name: DATABASE_URL
Value: [Your database connection string]
Environments: Production, Preview, Development
```

**Database Options:**
1. **Vercel Postgres (Recommended)**
   - In Vercel, go to **Storage** → **Create Database**
   - Choose **Postgres**
   - Copy the connection string provided
   - Example: `postgres://user:password@host:port/dbname`

2. **External Database**
   - Use your existing PostgreSQL/MySQL connection string
   - Example: `mysql://user:password@host:port/dbname`

3. **For Testing Only**
   - `file:./dev.db` (SQLite - not recommended for production)

#### B. NextAuth Configuration
```
Name: NEXTAUTH_URL
Value: https://your-app-name.vercel.app
Environments: Production, Preview
```

```
Name: NEXTAUTH_SECRET
Value: [Generate random 32+ character string]
Environments: Production, Preview, Development
```

**Generate Secret:**
- Go to [openssl.org](https://www.openssl.org/docs/)
- Or use: `openssl rand -base64 32` in terminal
- Example: `your-super-secret-random-string-here`

#### C. Google OAuth (Optional)
```
Name: NEXT_PUBLIC_GOOGLE_CLIENT_ID
Value: [Your Google OAuth Client ID]
Environments: Production, Preview, Development
```

```
Name: GOOGLE_CLIENT_SECRET
Value: [Your Google OAuth Client Secret]
Environments: Production, Preview
```

### 4. Save and Deploy
1. Click **Save** after adding each variable
2. Trigger a new deployment:
   - Go to **Deployments** tab
   - Click **Redeploy** or push new code to GitHub

### 5. Verify Setup
After deployment:
1. Visit your app URL
2. Try logging in with: `helpdesk@kenyayfc.org` / `admin2024`
3. Check if database connection works

## Troubleshooting

### Common Issues:
- **"Database connection failed"** → Check `DATABASE_URL` format
- **"Auth error"** → Verify `NEXTAUTH_URL` matches your domain
- **"Build failed"** → Missing required environment variables

### Quick Test Commands:
```bash
# Test locally with production variables
DATABASE_URL="your-production-url" npm run dev
```

### Need Help?
- Check Vercel logs: **Deployments** → [Your deployment] → **View Logs**
- Database connection: Verify credentials and network access
- Auth issues: Ensure URLs are correct (no trailing slashes)

## Next Steps
After setting variables:
1. ✅ Deployment should work automatically
2. ✅ Test login functionality
3. ✅ Create additional users if needed
4. ✅ Configure any additional features

Your app will be ready for production use!
