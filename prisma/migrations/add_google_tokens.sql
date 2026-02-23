-- Migration: add Google OAuth token fields to User
-- Run manually with: npx prisma db push  (or bun prisma db push)
-- OR let `prisma migrate dev` handle it.

ALTER TABLE "User" ADD COLUMN "googleAccessToken"  TEXT;
ALTER TABLE "User" ADD COLUMN "googleRefreshToken" TEXT;
ALTER TABLE "User" ADD COLUMN "googleTokenExpiry"  DATETIME;
