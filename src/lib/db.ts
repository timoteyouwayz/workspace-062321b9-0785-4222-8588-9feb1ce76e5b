import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
    datasourceUrl:
      process.env.DATABASE_POSTGRES_URL || process.env.DATABASE_URL,
  });

// Enable WAL mode and busy timeout for SQLite
async function setupSQLitePragmas() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (dbUrl.startsWith("file:")) {
    // Only for SQLite
    await db.$executeRawUnsafe("PRAGMA journal_mode=WAL;");
    await db.$executeRawUnsafe("PRAGMA busy_timeout = 5000;");
  }
}

setupSQLitePragmas();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
