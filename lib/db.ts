/**
 * Prisma client with church-scoped helpers.
 * Always use churchId from requireChurch() — never from request body/query.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Set app.church_id for RLS (Supabase Row-Level Security).
 * Call at the start of a transaction when using RLS.
 */
export async function setChurchContext(
  tx: { $executeRawUnsafe: (query: string, ...values: unknown[]) => Promise<unknown> },
  churchId: string
) {
  await tx.$executeRawUnsafe(
    "SELECT set_config('app.church_id', $1, true)",
    churchId
  );
}
