const { PrismaClient } = require('@prisma/client');

/**
 * Single shared Prisma client instance for the entire app.
 * Prevents connection pool exhaustion in dev (hot-reload creates new instances).
 */
const globalForPrisma = global;
const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
