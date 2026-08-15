import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// `DATABASE_POOL_MAX` is only set for the local `prisma dev` database, whose
// embedded engine drops connections under light concurrency. Leave unset in
// production (Neon) to use the driver's normal pool sizing.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.DATABASE_POOL_MAX
    ? { max: Number(process.env.DATABASE_POOL_MAX) }
    : {}),
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
