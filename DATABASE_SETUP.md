# PostgreSQL Production Database Setup

This guide explains how to migrate from SQLite to PostgreSQL for production deployment.

## Why PostgreSQL for Production?

| Feature | SQLite | PostgreSQL |
|---------|--------|-----------|
| Concurrent Users | Up to ~3-5 | Hundreds/Thousands |
| Data Integrity | Basic | Advanced (ACID compliance) |
| Performance | Good for small datasets | Optimized for large datasets |
| Multiple Servers | Not suitable | Fully supported |
| Backups | File-based | Native backup tools |
| Scaling | Limited | Highly scalable |
| Security | Limited | Enterprise-grade |

**SQLite** is perfect for development and small deployments. **PostgreSQL** is recommended for production.

---

## Option 1: PostgreSQL on Linux Server (Recommended)

### Step 1: Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**CentOS/RHEL:**
```bash
sudo yum install postgresql-server postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 2: Create Database and User

```bash
# Connect to PostgreSQL as admin
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE USER requisition_user WITH PASSWORD 'strong_password_here';

CREATE DATABASE requisition_db OWNER requisition_user;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE requisition_db TO requisition_user;

# Exit PostgreSQL
\q
```

### Step 3: Configure PostgreSQL for Network Access

Edit `/etc/postgresql/*/main/postgresql.conf`:

```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Find and uncomment:
```
listen_addresses = 'localhost'  # or '*' if connecting from other servers
```

Edit `/etc/postgresql/*/main/pg_hba.conf`:

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Add this line for local connections:
```
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### Step 4: Test Connection

```bash
# Test as the new user
psql -U requisition_user -d requisition_db -h localhost
```

---

## Option 2: PostgreSQL on cPanel (Shared Hosting)

### Step 1: Use cPanel to Create Database

1. Login to cPanel
2. Go to **MySQL Databases** (or **PostgreSQL Databases** if available)
3. Click **Create New Database**
4. Enter database name: `requisition_db`
5. Click **Create Database**

### Step 2: Create Database User

1. Scroll to **MySQL Users** section
2. Click **Create New User**
3. Username: `requisition_user`
4. Password: Generate strong password
5. Click **Create User**

### Step 3: Add User to Database

1. Scroll to **Add User to Database**
2. Select user and database
3. Click **Add**
4. Grant all privileges
5. Click **Make Changes**

### Step 4: Get Connection String

cPanel provides connection details. Format:
```
mysql://requisition_user:password@localhost:3306/prefix_requisition_db
```

---

## Step 5: Update Environment Configuration

### Update .env File

```bash
# For PostgreSQL:
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://requisition_user:your_password@localhost:5432/requisition_db"

# For MySQL on cPanel:
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://requisition_user:your_password@localhost:3306/dbname"
```

### For Development (Keep SQLite):

```bash
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
```

---

## Step 6: Update Prisma Schema

The schema is already configured to use `DATABASE_PROVIDER` environment variable. No changes needed!

If you want to be explicit in the schema, it can detect the provider automatically from the `DATABASE_URL`.

---

## Step 7: Migrate Database

### Option A: Fresh Start (Recommended for First Setup)

```bash
# Backup current SQLite database (if any)
cp dev.db dev.db.backup

# Push schema to new PostgreSQL database
bun prisma db push --force-reset

# Seed with demo users
bun prisma db seed

# Verify connection
bun prisma studio
```

### Option B: Migrate Existing Data

If you have existing data in SQLite that needs to be migrated:

```bash
# Create migration
bun prisma migrate dev --name migrate_to_postgres

# This creates a migration file for your changes
# Review the migration file before applying
```

---

## Step 8: Verify PostgreSQL Connection

Test with Prisma Studio:

```bash
bun prisma studio
```

This opens a web interface where you can:
- View all database records
- Test queries
- Verify connection is working

Or test via Node:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.user.findMany().then(users => {
  console.log('✓ Database connection works!');
  console.log('Users:', users);
  process.exit(0);
}).catch(err => {
  console.error('✗ Database error:', err.message);
  process.exit(1);
});
"
```

---

## Important Notes

### Connection String Format

**PostgreSQL:**
```
postgresql://username:password@host:port/database
postgresql://user:pass@localhost:5432/mydb
```

**MySQL:**
```
mysql://username:password@host:port/database
mysql://user:pass@localhost:3306/mydb
```

### PASSWORD SECURITY

- Use strong passwords (16+ characters, mixed case, symbols, numbers)
- Never commit `.env` to git
- Rotate passwords regularly
- Don't use the same password for multiple services

### CONNECTION POOLING

For production with many concurrent connections, use PgBouncer:

```bash
sudo apt install pgbouncer
```

Configure in `/etc/pgbouncer/pgbouncer.ini`:

```ini
[databases]
requisition_db = host=localhost port=5432 user=requisition_user password=your_password dbname=requisition_db

[pgbouncer]
listen_port = 6432
listen_addr = 127.0.0.1
mode = transaction
max_client_conn = 100
default_pool_size = 25
```

Update connection string to use pgbouncer:
```env
DATABASE_URL="postgresql://requisition_user:password@localhost:6432/requisition_db"
```

---

## Backup PostgreSQL Database

### Manual Backup

```bash
# Full database backup
pg_dump -U requisition_user -h localhost requisition_db > backup.sql

# Compress backup
gzip backup.sql

# Restore from backup
gunzip backup.sql.gz
psql -U requisition_user -h localhost requisition_db < backup.sql
```

### Automated Backups (Daily)

Create backup script `/home/user/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/user/backups"
DB_NAME="requisition_db"
DB_USER="requisition_user"
DB_HOST="localhost"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

pg_dump -U $DB_USER -h $DB_HOST $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE.sql.gz"
```

Make executable and add to crontab:

```bash
chmod +x /home/user/backup-db.sh

# Edit crontab
crontab -e

# Add this line to run daily at 2 AM:
0 2 * * * /home/user/backup-db.sh
```

---

## Troubleshooting PostgreSQL

### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Check port is correct: `sudo netstat -tulpn | grep 5432`
3. Check `.env` DATABASE_URL is correct
4. Verify credentials are correct

### Authentication Failed

```
Error: FATAL: Ident authentication failed for user "requisition_user"
```

**Solution:**
- Check password is correct
- Verify pg_hba.conf has `md5` or `password` auth method

### Database Already Exists

```
Error: database "requisition_db" already exists
```

**Solution:**
- Drop and recreate: `DROP DATABASE requisition_db;`
- Or connect to existing database and run: `bun prisma db push`

### Out of Memory

PostgreSQL using too much RAM:

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf

# Adjust these values based on your server RAM:
# Typical: RAM / 4
# Minimum: 256MB
shared_buffers = 256MB

# Typically: RAM / 16
effective_cache_size = 1GB

# Restart
sudo systemctl restart postgresql
```

---

## Performance Tuning

For better performance in production:

```sql
-- Connect as admin
sudo -u postgres psql requisition_db

-- Create indexes for frequently queried fields
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_requisition_status ON "Requisition"(status);
CREATE INDEX idx_requisition_created ON "Requisition"("createdAt");
CREATE INDEX idx_receipt_requisition ON "Receipt"("requisitionId");

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM "Requisition" WHERE status = 'PENDING';
```

---

## Rollback to SQLite

If you need to go back to SQLite:

```bash
# Update .env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"

# Rebuild
bun prisma db push

# Seed if needed
bun prisma db seed
```

---

## Comparison: Setup Time

| Method | Time | Complexity |
|--------|------|-----------|
| SQLite (Dev) | 5 min | Very Easy |
| PostgreSQL (Self-hosted) | 15 min | Medium |
| PostgreSQL (Managed Service) | 5 min | Easy |
| MySQL (cPanel) | 5 min | Very Easy |

---

## Recommended Production Setup

1. **Small Site (<100 users):** SQLite or MySQL on cPanel
2. **Medium Site (100-1000 users):** PostgreSQL on VPS
3. **Large Site (>1000 users):** PostgreSQL with backups + monitoring

---

## Support Commands

```bash
# Check PostgreSQL version
psql --version

# List all databases
psql -U postgres -l

# Connect to database
psql -U requisition_user -h localhost -d requisition_db

# In PostgreSQL prompt:
\l              # List databases
\dt             # List tables
\du             # List users
\d table_name   # Describe table structure
\q              # Quit
```

---

For more information, visit:
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Prisma PostgreSQL: https://www.prisma.io/docs/reference/database-reference/connection-urls#postgresql
- cPanel Database: https://cpanel.net/

