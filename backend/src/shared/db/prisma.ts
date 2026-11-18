import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for Prisma-backed persistence.");
  if (!prisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}
