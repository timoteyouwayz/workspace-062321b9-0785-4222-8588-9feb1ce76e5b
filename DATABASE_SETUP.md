# PostgreSQL Production Database Setup

This guide explains how to migrate from SQLite to PostgreSQL for production deployment.

## Why PostgreSQL for Production?

| Feature          | SQLite                  | PostgreSQL                   |
| ---------------- | ----------------------- | ---------------------------- |
| Concurrent Users | Up to ~3-5              | Hundreds/Thousands           |
| Data Integrity   | Basic                   | Advanced (ACID compliance)   |
| Performance      | Good for small datasets | Optimized for large datasets |
| Multiple Servers | Not suitable            | Fully supported              |
| Backups          | File-based              | Native backup tools          |
| Scaling          | Limited                 | Highly scalable              |
| Security         | Limited                 | Enterprise-grade             |

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

**PostgreSQL:**

### CONNECTION POOLING

2. Check port is correct: `sudo netstat -tulpn | grep 5432`
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
