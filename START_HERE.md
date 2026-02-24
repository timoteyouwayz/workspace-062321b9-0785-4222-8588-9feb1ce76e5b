# 🗺️ Start Here - Complete Roadmap

## What's Your Situation?

### 1️⃣ "I have cPanel and want to deploy to my subdomain"

**YOU ARE HERE → Follow this path:**

```
START
  ↓
1. Read: CPANEL_QUICK_CHEAT.md (5 min overview)
  ↓
2. Follow: CPANEL_DEPLOYMENT.md (Step-by-step, 1-2 hours)
  ↓
3. Verify credentials work at: https://yourdomain.com/subdomain
  ↓
4. Verify with: PRE_DEPLOYMENT_CHECKLIST.md
  ↓
5. Change admin password + create real users
  ↓
✅ YOU'RE LIVE!
```

**Files you'll use:**
- 📄 CPANEL_QUICK_CHEAT.md ← Start here
- 📄 CPANEL_DEPLOYMENT.md ← Detailed steps (18 steps)
- 📄 PRE_DEPLOYMENT_CHECKLIST.md ← Before going live
- 📄 TROUBLESHOOTING section in CPANEL_DEPLOYMENT.md ← If issues

---

### 2️⃣ "I want to deploy on Linux VPS or Cloud"

**Path:**

```
START
  ↓
1. Choose database:
   PostgreSQL (recommended) OR MySQL
   ↓
2. Setup database:
   Read: DATABASE_SETUP.md (choose your DB type)
   ↓
3. Deploy application:
   Read: DEPLOYMENT.md (full VPS guide)
   ↓
4. Verify:
   PRE_DEPLOYMENT_CHECKLIST.md
   ↓
✅ YOU'RE LIVE!
```

**Files you'll use:**
- DATABASE_QUICK_REFERENCE.md ← Pick database
- DATABASE_SETUP.md ← Setup chosen database
- DEPLOYMENT.md ← Deploy to VPS/Linux
- PRE_DEPLOYMENT_CHECKLIST.md ← Verification

---

### 3️⃣ "I want to develop locally first"

**Path:**

```
START
  ↓
1. Clone project
  ↓
2. Follow: SETUP.md (local dev setup)
  ↓
3. Run: bun run dev
  ↓
4. Develop locally (test everything)
  ↓
5. Ready to deploy?
   → Choose path #1 (cPanel) OR path #2 (VPS)
  ↓
✅ DEPLOYED!
```

**Files you'll use:**
- SETUP.md ← Local development
- Then follow path #1 or #2

---

### 4️⃣ "I just need API documentation"

**Path:**

```
START
  ↓
Read: API.md
  ↓
✅ All endpoints documented!
```

---

## Quick Decision Tree

```
                Are you using cPanel?
                     /                    \
                   YES                    NO
                    |                      |
        CPANEL_QUICK_CHEAT.md      Do you have Linux/VPS?
                    |                      /            \
                    |                    YES             NO
                    |                     |               |
            CPANEL_DEPLOYMENT.md   DEPLOYMENT.md      AWS/Cloud?
                    |                  +                  |
                    |         DATABASE_SETUP.md      DEPLOYMENT.md
                    |                                     |
                    └─────────────→ YOU'RE LIVE! ←────────┘
```

---

## File Reference by Use Case

### For cPanel Users 🚀

**MUST READ (in order):**
1. [`CPANEL_QUICK_CHEAT.md`](CPANEL_QUICK_CHEAT.md) - 5 min overview
2. [`CPANEL_DEPLOYMENT.md`](CPANEL_DEPLOYMENT.md) - 18 steps, detailed
3. [`PRE_DEPLOYMENT_CHECKLIST.md`](PRE_DEPLOYMENT_CHECKLIST.md) - Verify everything

**NICE TO HAVE:**
- `DATABASE_QUICK_REFERENCE.md` - DB info (MySQL already chosen)
- `TROUBLESHOOTING` in CPANEL_DEPLOYMENT.md - If issues
- `API.md` - If integrating with other systems

### For VPS/Linux Users 🖥️

**MUST READ (in order):**
1. [`DATABASE_QUICK_REFERENCE.md`](DATABASE_QUICK_REFERENCE.md) - Choose DB
2. [`DATABASE_SETUP.md`](DATABASE_SETUP.md) - Setup chosen database
3. [`DEPLOYMENT.md`](DEPLOYMENT.md) - Deploy application
4. [`PRE_DEPLOYMENT_CHECKLIST.md`](PRE_DEPLOYMENT_CHECKLIST.md) - Verify

### For Local Development 💻

**MUST READ:**
1. [`SETUP.md`](SETUP.md) - Local setup guide
2. Then proceed to cPanel or VPS guides when ready to deploy

---

## Time Estimates

| Task | Time |
|------|------|
| Read CPANEL_QUICK_CHEAT.md | ~5 min |
| Follow CPANEL_DEPLOYMENT.md (no issues) | ~1 hour |
| Deploy + test | ~30 min |
| Troubleshoot (if issues) | ~30-60 min |
| **Total** | **~2-3 hours** |

---

## What You'll Have at the End

✅ **Authentication**
- Admin panel for user management
- Login/signup with Google OAuth (optional)
- Password reset via email

✅ **Requisition Management**
- Create requisitions
- Workflow: Check → Approve → Disburse
- Real-time Google Sheets sync (optional)

✅ **Receipt Management**
- Upload receipts
- Verification workflow
- Auto Google Drive backup (optional)
- Users blocked from new requisitions until receipts verified

✅ **Email Notifications**
- Password reset emails
- Receipt verification emails
- New requisition notifications

✅ **Admin Features**
- View all users
- Create/edit/delete users
- Manage all requisitions
- Admin dashboard

---

## Prerequisites Checklist

Before you start, verify you have:

- [ ] cPanel account (and login credentials)
- [ ] Domain/subdomain configured in cPanel
- [ ] SSH access (or willing to use File Manager)
- [ ] ~1-2 hours of time
- [ ] This project cloned/downloaded
- [ ] Text editor (for editing .env)
- [ ] Strong password ready (for admin account)

---

## Key Decisions You'll Make

1. **Hosting**: cPanel ✓ (this guide) / VPS / Cloud
2. **Database**: MySQL (cPanel) / PostgreSQL (VPS) / SQLite (dev only)
3. **Google Services**: Full integration / Basic / None
4. **Email**: Gmail SMTP / Custom SMTP / None (basic auth only)

---

## Support Resources

### If you're stuck:

1. **Check the right section:**
   - Using cPanel? → CPANEL_DEPLOYMENT.md#troubleshooting
   - Using VPS? → DEPLOYMENT.md#troubleshooting
   - Database help? → DATABASE_SETUP.md

2. **Check the logs:**
   ```bash
   # cPanel:
   tail -f ~/public_html/subdomain/server.log
   
   # VPS:
   journalctl -u requisition-app -f
   ```

3. **Verify prerequisites:**
   - Node.js installed? `node --version`
   - Bun installed? `bun --version`
   - .env file exists? `cat .env`
   - Database running? `mysql -u user -p` (cPanel)

---

## Next Step

Choose your situation above and click the first link:

1. **cPanel?** → [`CPANEL_QUICK_CHEAT.md`](CPANEL_QUICK_CHEAT.md)
2. **VPS?** → [`DATABASE_QUICK_REFERENCE.md`](DATABASE_QUICK_REFERENCE.md)
3. **Local Dev?** → [`SETUP.md`](SETUP.md)
4. **API Help?** → [`API.md`](API.md)
5. **Need Overview?** → [`README.md`](README.md)

---

## Document Map

```
CURRENT LOCATION (You are here)
    ↓
START_HERE.md ← YOU ARE HERE
    ├─ For cPanel: CPANEL_QUICK_CHEAT.md → CPANEL_DEPLOYMENT.md
    ├─ For VPS: DATABASE_SETUP.md → DEPLOYMENT.md
    ├─ For Local: SETUP.md
    ├─ For API: API.md
    ├─ For Verification: PRE_DEPLOYMENT_CHECKLIST.md
    └─ For Help: DOCUMENTATION_GUIDE.md
```

---

**Ready?** Pick your path above and let's get started! 🚀

Remember: You can do this. Estimated time: 1-2 hours. Let's go! 💪
