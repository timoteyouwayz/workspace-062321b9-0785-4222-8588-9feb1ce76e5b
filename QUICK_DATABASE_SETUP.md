# Quick Database Setup for Vercel

## Your Schema is Ready! ✅

Your `prisma/schema.prisma` is already configured for PostgreSQL.

## Fastest Setup: Neon Database

### Step 1: Create Neon Database (2 minutes)
1. Go to [vercel.com](https://vercel.com) → Your Project → **Storage**
2. Click **Create Database** → Select **Neon**
3. Click **Install Neon** → **Continue**
4. Choose **Create new project** → **Continue**
5. Name: `ngo-management-system` → **Create**

### Step 2: Get Connection String
Neon will automatically:
- Create the database
- Provide connection string
- Set up `DATABASE_URL` in Vercel

### Step 3: Deploy
1. Push your code to GitHub
2. Vercel will auto-deploy with the new database
3. Database will be ready automatically

## Alternative: Manual Neon Setup

If you prefer setting up directly:

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create new project
4. Copy connection string
5. Add to Vercel: **Settings** → **Environment Variables**
   ```
   Name: DATABASE_URL
   Value: postgresql://user:pass@host/db?sslmode=require
   ```

## Test Your Setup

After deployment:
1. Visit your app URL
2. Login with: `helpdesk@kenyayfc.org` / `admin2024`
3. If login works → Database is connected! ✅

## Connection String Format
```
postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
```

## Your Database Will Include:
- ✅ Users table (with roles)
- ✅ Requisitions table
- ✅ Receipts table  
- ✅ Audit logs
- ✅ All relationships and indexes

**Ready to go! Just create the Neon database and deploy.**
