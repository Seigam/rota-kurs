import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isPostgres =
  process.env.DATABASE_URL?.startsWith('postgres://') ||
  process.env.DATABASE_URL?.startsWith('postgresql://');

function createPrismaClient() {
  if (isPostgres) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  const rawUrl = process.env.DATABASE_URL ? String(process.env.DATABASE_URL) : 'file:./dev.db';
  const dbPath = rawUrl.replace(/^file:/, '');
  const adapter = new PrismaBetterSqlite3({ url: dbPath });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
