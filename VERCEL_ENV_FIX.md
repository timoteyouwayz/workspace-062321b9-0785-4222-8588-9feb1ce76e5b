# Fix Vercel Environment Variable Error

## Problem: 
Vercel deployment failed because `DATABASE_URL` references a secret that doesn't exist.

## Solution Steps:

### 1. Check Your Vercel Environment Variables
Go to your Vercel project:
- Project Dashboard → Settings → Environment Variables
- Look for `DATABASE_URL`

### 2. If DATABASE_URL is missing, add it:

**Option A: Use your Neon connection string**
```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_cRqfN7iK1hpv@ep-late-mountain-ad4c2oke-pooler.c-2.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
Environments: Production, Preview, Development
```

**Option B: If you connected Neon through Vercel Storage**
- Go to Storage tab in Vercel
- Click on your Neon database
- Copy the connection string
- Add it as `DATABASE_URL` in Environment Variables

### 3. Add Other Required Variables:
```
Name: NEXTAUTH_URL
Value: https://your-app-name.vercel.app
Environments: Production, Preview

Name: NEXTAUTH_SECRET
Value: ngo-management-system-secret-key-32-chars-long
Environments: Production, Preview, Development
```

### 4. After Adding Variables:
1. Click "Save" for each variable
2. Trigger a new deployment:
   - Go to Deployments tab
   - Click "Redeploy"
   - Or push a new commit to GitHub

### 5. Alternative: Use Vercel CLI
If you have Vercel CLI installed:
```bash
vercel env add DATABASE_URL
# Choose Production, Preview, Development
# Paste your Neon connection string

vercel env add NEXTAUTH_URL
# Paste your Vercel URL

vercel env add NEXTAUTH_SECRET
# Paste the secret key
```

### 6. Quick Test
After fixing, your deployment should succeed and you can:
- Visit your Vercel URL
- Login with: helpdesk@kenyayfc.org / admin2024

## Why This Happened:
- When you connected Neon through Vercel, it might not have automatically set the `DATABASE_URL`
- The deployment is looking for this variable to connect to your Neon database
- Without it, the app can't start

## Next Steps:
1. Add the environment variables in Vercel dashboard
2. Redeploy
3. Test your live application
