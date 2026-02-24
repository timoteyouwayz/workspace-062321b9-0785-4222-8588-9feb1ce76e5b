# 📚 Complete Documentation Guide

## Where to Start?

### 🚀 **I want to deploy on cPanel**
→ **[CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md)** ← Start here!
- 18 step-by-step instructions
- From zero to fully working in ~1 hour
- Includes troubleshooting

### 💻 **I want to develop locally**
→ **[SETUP.md](SETUP.md)**
- Local development setup
- VSCode configuration
- How to test locally

### 🗄️ **I need to choose a database**
→ **[DATABASE_QUICK_REFERENCE.md](DATABASE_QUICK_REFERENCE.md)**
- Quick 1-page guide
- Compare SQLite vs PostgreSQL vs MySQL
- Copy-paste ready commands

### 🔧 **I need detailed database setup**
→ **[DATABASE_SETUP.md](DATABASE_SETUP.md)**
- PostgreSQL installation & setup
- MySQL on cPanel
- Backups & recovery
- Performance tuning

### 🚀 **I'm deploying on VPS/Linux server**
→ **[DEPLOYMENT.md](DEPLOYMENT.md)**
- Step-by-step for Linux
- PostgreSQL setup
- SSL configuration
- Monitoring & logs

### ✅ **Before going live**
→ **[PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)**
- 90+ verification items
- Security checks
- Performance testing
- Sign-off form

### 📡 **I need API documentation**
→ **[API.md](API.md)**
- All endpoints documented
- Request/response examples
- Error handling
- Example workflows

---

## File Reference

| File | Purpose | Read Time |
|------|---------|-----------|
| **README.md** | Project overview | 5 min |
| **CPANEL_DEPLOYMENT.md** | cPanel deployment (START HERE for cPanel) | 30 min |
| **SETUP.md** | Local development | 10 min |
| **DATABASE_QUICK_REFERENCE.md** | Database cheat sheet | 5 min |
| **DATABASE_SETUP.md** | Complete database guide | 30 min |
| **DEPLOYMENT.md** | VPS/Linux deployment | 30 min |
| **PRE_DEPLOYMENT_CHECKLIST.md** | Pre-launch verification | 20 min |
| **API.md** | API reference | 20 min |
| **.env.example** | Environment template | 10 min |

---

## Decision Matrix: Which Guide?

```
                     cPanel?
                      ├─ Yes → CPANEL_DEPLOYMENT.md
                      └─ No
                          ├─ Linux/VPS
                          │  ├─ PostgreSQL → DATABASE_SETUP.md + DEPLOYMENT.md
                          │  └─ MySQL → DATABASE_QUICK_REFERENCE.md + DEPLOYMENT.md
                          └─ Developing locally
                             └─ SETUP.md
```

---

## Most Common Scenarios

### Scenario A: "I have cPanel and want to go live TODAY"
```
1. Follow: CPANEL_DEPLOYMENT.md (Step 1-18)
   ↓
2. Follow: PRE_DEPLOYMENT_CHECKLIST.md
   ↓
3. You're live! ✅
Time: ~1-2 hours
```

### Scenario B: "I have a Linux VPS and want PostgreSQL"
```
1. Prepare: DATABASE_SETUP.md (PostgreSQL section)
   ↓
2. Deploy: DEPLOYMENT.md (Step 1-10)
   ↓
3. Verify: PRE_DEPLOYMENT_CHECKLIST.md
   ↓
4. You're live! ✅
Time: ~2-3 hours
```

### Scenario C: "I want to develop locally then push to production"
```
1. Setup: SETUP.md
   ↓
2. Develop locally (bun run dev)
   ↓
3. Choose hosting method (A or B above)
   ↓
4. Deploy
```

---

## Quick Command Reference

### Setup (Any Platform)
```bash
# Install dependencies
bun install

# Create database
bun prisma db push

# Seed demo data
bun prisma db seed
```

### Development
```bash
# Run locally
bun run dev

# Then visit: http://localhost:3000
```

### Production Build
```bash
# Build
bun run build

# Start
bun start

# Check it's running
curl http://localhost:3000
```

---

## Deployment Methods Comparison

| Method | Difficulty | Time | Cost | Support |
|--------|-----------|------|------|---------|
| **cPanel** | Very Easy | 1-2 hrs | $5-15/mo | CPANEL_DEPLOYMENT.md |
| **Linux VPS** | Medium | 2-3 hrs | $5-20/mo | DEPLOYMENT.md |
| **AWS/DigitalOcean** | Hard | 3-4 hrs | $10-50/mo | DEPLOYMENT.md |
| **Heroku** | Easy | 30 min | $7-50/mo | SETUP.md |
| **Local Dev** | Very Easy | 5 min | Free | SETUP.md |

---

## Getting Help

### If something doesn't work:

1. **Check the right guide** for your deployment method
   - cPanel → [CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md#troubleshooting)
   - VPS → [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting)
   - Database → [DATABASE_SETUP.md](DATABASE_SETUP.md)

2. **Check the error logs**
   ```bash
   # cPanel
   tail -f ~/public_html/subdomain/server.log
   
   # VPS
   systemctl status requisition-app
   pm2 logs
   ```

3. **Verify prerequisites**
   - Node.js installed? `node --version`
   - Bun installed? `bun --version`
   - Database running? `mysql -u user -p`
   - .env file created? `cat .env`

4. **Check PRE_DEPLOYMENT_CHECKLIST.md**
   - Verify all 90+ items are checked

---

## Features by Platform

### ✅ Supported on All Platforms
- User management (Admin panel)
- Requisition workflow
- Receipt uploads to disk
- Email notifications (SMTP)
- Google OAuth login

### ✅ Enhanced with Google Services (All Platforms)
- Receipts saved to Google Drive
- Requisitions synced to Google Sheets
- Real-time sheet updates

### ✅ Recommended Architecture
```
cPanel                  VPS + PostgreSQL       AWS/DigitalOcean
├─ MySQL              ├─ PostgreSQL          ├─ RDS (PostgreSQL)
├─ Node.js app        ├─ Node.js app         ├─ App Server x2+
├─ Auto SSL           ├─ Let's Encrypt SSL   ├─ Load Balancer
├─ Daily backups      ├─ Daily pg_dump       ├─ Auto scaling
└─ $5-15/mo          └─ $15-30/mo           └─ $50+/mo
```

---

## Next Steps

**Choose your path:**

1. **cPanel users:** [→ CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md)
2. **VPS users:** [→ DEPLOYMENT.md](DEPLOYMENT.md)
3. **Local dev:** [→ SETUP.md](SETUP.md)
4. **Database help:** [→ DATABASE_QUICK_REFERENCE.md](DATABASE_QUICK_REFERENCE.md)

---

## Checklist Before Starting

Before following any guide, have these ready:

- [ ] Hosting account (cPanel, VPS, etc.)
- [ ] Domain/subdomain configured
- [ ] SSH access (for cPanel: cPanel login is enough)
- [ ] Text editor (for .env file)
- [ ] 1-2 hours of time
- [ ] This repository cloned/downloaded
- [ ] Know your hosting: cPanel? VPS? Cloud?

**Then pick your guide above ↑↑↑**

---

## Documentation Updates

All guides are updated for:
- ✅ Node.js 20+
- ✅ Next.js 16+
- ✅ Prisma ORM
- ✅ PostgreSQL, MySQL, SQLite
- ✅ Google Drive & Sheets integration
- ✅ Email notifications
- ✅ Production ready

Last updated: February 23, 2026

---

**Questions? See [CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md#troubleshooting) or [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting) troubleshooting sections.**
