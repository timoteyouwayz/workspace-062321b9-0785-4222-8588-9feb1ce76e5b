# Vercel Deployment Guide

## Environment Variables

Set these in your Vercel dashboard under Project Settings > Environment Variables:

### Required Variables
- `DATABASE_URL`: Your database connection string
  - For development: `file:./dev.db`
  - For production: Use Vercel Postgres or external database

### Optional Variables
- `NEXTAUTH_URL`: Your deployed URL (e.g., `https://your-app.vercel.app`)
- `NEXTAUTH_SECRET`: Random secret string for NextAuth
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID (if using Google login)
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

## Database Setup

### Option 1: Vercel Postgres (Recommended)
1. In Vercel dashboard, go to Storage > Create Database
2. Choose Postgres
3. Copy the connection string to `DATABASE_URL`
4. Run the setup script after deployment

### Option 2: External Database
1. Set up your preferred database (PostgreSQL, MySQL, etc.)
2. Add connection string to `DATABASE_URL`
3. Update `prisma/schema.prisma` provider if needed

## Initial Setup

After first deployment:

1. **Access your app** at the Vercel-provided URL
2. **Login with admin credentials**:
   - Email: `helpdesk@kenyayfc.org`
   - Password: `admin2024`
3. **Create additional users** through the admin panel

## Default Users

The system creates these default users:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | helpdesk@kenyayfc.org | admin2024 | Full system access |
| Director | shem@kenyayfc.org | director2024 | Approve requisitions |
| Accountant | accounts@kenyayfc.org | accounts2024 | Check, disburse, verify receipts |
| Staff | staff@kenyayfc.org | staff2024 | Create requisitions |

## Troubleshooting

### Login Issues
1. Check if users exist in database
2. Verify password hashing is working
3. Check environment variables

### Database Issues
1. Ensure `DATABASE_URL` is correctly set
2. Run `npm run setup:prod` to create users
3. Check Prisma client generation

### Styling Issues
1. Ensure Tailwind CSS is properly built
2. Check that globals.css is imported in layout
3. Verify CSS variables are set correctly

## Production Checklist

- [ ] Set production `DATABASE_URL`
- [ ] Set `NEXTAUTH_URL` to your domain
- [ ] Generate secure `NEXTAUTH_SECRET`
- [ ] Configure Google OAuth (if needed)
- [ ] Test all user roles and permissions
- [ ] Verify file uploads work correctly
- [ ] Test email notifications (if configured)
- [ ] Set up monitoring and error tracking
