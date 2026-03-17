# Setting Up Neon Database for Vercel

## Why Choose Neon?
- ✅ Serverless PostgreSQL
- ✅ Free tier available
- ✅ Easy Vercel integration
- ✅ Automatic backups
- ✅ Branching for development

## Step 1: Create Neon Database

### Option A: Through Vercel (Easiest)
1. In your Vercel project dashboard:
   - Go to **Storage** tab
   - Click **Create Database**
   - Select **Neon** from marketplace
   - Follow the setup wizard

### Option B: Direct Neon Setup
1. Go to [neon.tech](https://neon.tech)
2. Click **Sign up** → **Continue with GitHub** (recommended)
3. Create new project:
   - Project name: `ngo-management-system`
   - Database name: `ngo_db`
   - Region: Choose closest to your users
   - PostgreSQL version: Latest (default)

## Step 2: Get Connection String

After creating database:
1. Go to Neon dashboard
2. Select your project
3. Go to **Connection Details**
4. Copy the **Connection string**
   - Format: `postgresql://user:password@host:port/dbname?sslmode=require`

## Step 3: Update Prisma Schema

Since you're switching from SQLite to PostgreSQL:

```prisma
// Update this line in prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
}
```

## Step 4: Set Environment Variable

In Vercel dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add:
   ```
   Name: DATABASE_URL
   Value: [your-neon-connection-string]
   Environments: Production, Preview, Development
   ```

## Step 5: Update Database Client

Your `src/lib/db.ts` should already handle PostgreSQL correctly:

```typescript
export const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

## Step 6: Deploy and Seed

1. Push your changes to GitHub
2. Vercel will automatically redeploy
3. After deployment, run the seed script:
   - Access your app URL
   - Login with admin credentials to create users
   - Or run production setup script if needed

## Connection String Format Examples

### Neon Connection String:
```
postgresql://john.doe:random-password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/ngo_db?sslmode=require
```

### Vercel Environment Variable:
```
DATABASE_URL=postgresql://john.doe:random-password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/ngo_db?sslmode=require
```

## Troubleshooting

### Common Issues:
- **"Connection refused"** → Check if connection string is correct
- **"SSL required"** → Add `?sslmode=require` to connection string
- **"Authentication failed"** → Verify username and password

### Test Connection:
```bash
# Test locally before deploying
DATABASE_URL="your-neon-url" npm run dev
```

## Alternative: Vercel Postgres

If you prefer Vercel's native solution:
1. In Vercel: **Storage** → **Create Database**
2. Select **Postgres**
3. Follow setup wizard
4. Use provided connection string

Both options work great with your NGO Management System!
