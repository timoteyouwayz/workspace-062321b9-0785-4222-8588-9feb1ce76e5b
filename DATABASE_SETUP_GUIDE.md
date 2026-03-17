# Database Setup Guide for Vercel Deployment

## Recommended: Neon (Serverless Postgres)

### Why Neon?
- ✅ Serverless and auto-scaling
- ✅ Free tier available
- ✅ Easy Vercel integration
- ✅ PostgreSQL (better than SQLite for production)
- ✅ Automatic backups
- ✅ Branching for development

## Step-by-Step Setup

### 1. Create Neon Database

#### Option A: Through Vercel (Easiest)
1. In your Vercel project dashboard:
   - Go to **Storage** tab
   - Click **Create Database**
   - Select **Neon** from the list
   - Follow the setup wizard

#### Option B: Direct on Neon
1. Go to [neon.tech](https://neon.tech)
2. Click **Sign up** (use GitHub for easy integration)
3. Click **New Project**
4. Choose:
   - **Region**: Closest to your users (e.g., Frankfurt)
   - **PostgreSQL version**: Latest (default)
   - **Project name**: `ngo-management-system`
5. Click **Create Project**

### 2. Get Connection String

After creating the database:
1. Go to Neon dashboard
2. Select your project
3. Go to **Connection Details**
4. Copy the **Connection string** (looks like):
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```

### 3. Update Prisma Schema

Since you're switching from SQLite to PostgreSQL:

```prisma
// In prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 4. Set Environment Variable in Vercel

1. Go to your Vercel project
2. **Settings** → **Environment Variables**
3. Add:
   ```
   Name: DATABASE_URL
   Value: [paste your Neon connection string]
   Environments: Production, Preview, Development
   ```

### 5. Update Database Client

Update `src/lib/db.ts` to work with PostgreSQL:

```typescript
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Remove SQLite-specific pragmas for PostgreSQL
async function setupDatabasePragmas() {
  // PostgreSQL doesn't need WAL mode pragmas
  console.log('Database connected successfully');
}

setupDatabasePragmas();
```

### 6. Deploy and Test

1. Push your changes to GitHub
2. Vercel will automatically redeploy
3. After deployment, run the setup script:
   - Visit: `https://your-app.vercel.app/api/setup-db`
   - Or run manually in Vercel console

## Alternative Database Options

### Prisma Postgres (Also Recommended)
- Integrated with Prisma
- Optimized for Prisma queries
- Similar setup to Neon

### Supabase
- PostgreSQL + additional features
- Built-in auth possible
- Free tier available

### Upstash Redis
- Good for caching, not main data
- Use alongside PostgreSQL
- Fast key-value storage

## Migration from SQLite to PostgreSQL

### Data Migration (if you have existing data)

```sql
-- Export from SQLite
sqlite3 dev.db .dump > backup.sql

-- Import to PostgreSQL (may need adjustments)
psql $DATABASE_URL < backup.sql
```

### Simpler Approach (Recommended)
1. Use fresh PostgreSQL database
2. Run the seed script to create users
3. Start fresh with production-ready setup

## Testing Your Setup

1. **Local Testing**:
   ```bash
   DATABASE_URL="your-neon-connection-string" npm run dev
   ```

2. **Production Testing**:
   - Deploy to Vercel
   - Try logging in with default users
   - Check Vercel logs for any errors

## Troubleshooting

### Common Issues:
- **"Connection refused"** → Check connection string format
- **"SSL required"** → Add `?sslmode=require` to connection string
- **"Timeout"** → Check region selection
- **"Permission denied"** → Verify username/password

### Connection String Format:
```
postgresql://username:password@host:port/database?sslmode=require
```

## Next Steps

After database setup:
1. ✅ Update Prisma schema provider
2. ✅ Set environment variables
3. ✅ Test connection locally
4. ✅ Deploy to Vercel
5. ✅ Run production seed script
6. ✅ Test all user roles

Your NGO Management System will be production-ready with a reliable PostgreSQL database!
