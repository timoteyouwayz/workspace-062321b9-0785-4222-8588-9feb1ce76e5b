# Quick Database Setup Reference

## TL;DR - Quick Setup

### Development (Do this first)
```bash
# .env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"

# Setup
bun prisma db push
bun prisma db seed
```

### Production - PostgreSQL (Linux Server)
```bash
# 1. Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# 2. Create database
sudo -u postgres psql
CREATE USER requisition_user WITH PASSWORD 'strong_password';
CREATE DATABASE requisition_db OWNER requisition_user;
GRANT ALL PRIVILEGES ON DATABASE requisition_db TO requisition_user;
\q

# 3. .env
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://requisition_user:strong_password@localhost:5432/requisition_db"

# 4. Setup
bun prisma db push
bun prisma db seed
```

### Production - MySQL (cPanel)
```bash
# 1. Create in cPanel → MySQL Databases → Create New Database

# 2. Get connection string from cPanel

# 3. .env
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://user:password@localhost:3306/dbname"

# 4. Setup
bun prisma db push
bun prisma db seed
```

---

## Step-by-Step Guides

| Use Case | Guide | Time |
|----------|-------|------|
| **Development** | SQLite (current setup) | No setup needed |
| **Linux Server** | [DATABASE_SETUP.md](DATABASE_SETUP.md) - PostgreSQL Section | 15 min |
| **cPanel/Shared** | [DATABASE_SETUP.md](DATABASE_SETUP.md) - MySQL Section | 5 min |
| **AWS/DigitalOcean** | [DATABASE_SETUP.md](DATABASE_SETUP.md) - Managed Service | 10 min |

---

## Database Comparison

| Feature | SQLite | PostgreSQL | MySQL |
|---------|--------|-----------|-------|
| **Setup Time** | 0 min | 15 min | 5 min |
| **Users** | 1-3 | Unlimited | Unlimited |
| **Concurrent Connections** | ~5 | Hundreds | Hundreds |
| **Best For** | Dev/Testing | Production | cPanel |
| **Cost** | Free | Free (self) or $15+ | Free (cPanel) |
| **Backups** | Copy file | pg_dump | mysqldump |
| **Scaling** | No | Yes | Limited |

---

## Commands Reference

### PostgreSQL Commands

```bash
# Connect
psql -U requisition_user -d requisition_db -h localhost

# List users
\du

# List databases
\l

# Switch database
\c requisition_db

# List tables
\dt

# Describe table
\d "User"

# Exit
\q

# Backup
pg_dump -U requisition_user requisition_db > backup.sql

# Restore
psql -U requisition_user requisition_db < backup.sql
```

### MySQL Commands

```bash
# Connect
mysql -u requisition_user -p -h localhost requisition_db

# List databases
SHOW DATABASES;

# Use database
USE requisition_db;

# List tables
SHOW TABLES;

# Describe table
DESCRIBE User;

# Exit
exit

# Backup
mysqldump -u requisition_user -p requisition_db > backup.sql

# Restore
mysql -u requisition_user -p requisition_db < backup.sql
```

### Prisma Commands

```bash
# Push schema
bun prisma db push

# Create migration
bun prisma migrate dev --name migration_name

# Seed database
bun prisma db seed

# Verify connection
bun prisma studio

# Format schema
bun prisma format
```

---

## Troubleshooting

### "Connection refused"
- PostgreSQL not running: `sudo systemctl start postgresql`
- Wrong credentials in .env
- Wrong host/port

### "Database already exists"
- Using existing database? Use `bun prisma db push --force-reset` (WARNING: deletes data)
- Or drop manually: `DROP DATABASE requisition_db;`

### "Access denied for user"
- Check credentials in .env
- MySQL user doesn't have permissions
- Check pg_hba.conf for PostgreSQL

### "Port already in use"
- PostgreSQL running on wrong port
- Check with: `sudo netstat -tulpn | grep postgres`

### "Out of disk space"
- Check: `df -h`
- Clean backups: `rm old_backups/*`
- Increase disk space

---

## Getting Help

1. Check [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed guide
2. Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues
3. Run: `bun prisma studio` to verify database connection
4. Check server logs for errors

---

## Next Steps After Database Setup

1. ✅ Database configured
2. 📧 Configure email in .env
3. 🔐 Configure Google OAuth in .env
4. 🚀 Deploy using DEPLOYMENT.md
5. 📋 Review PRE_DEPLOYMENT_CHECKLIST.md

---

**For complete information, see:**
- 📖 [DATABASE_SETUP.md](DATABASE_SETUP.md) - Detailed database configuration
- 🚀 [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- ✅ [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- 📚 [SETUP.md](SETUP.md) - Local development setup
