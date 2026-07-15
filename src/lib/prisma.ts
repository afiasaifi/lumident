// lib/prisma.ts
import { PrismaClient } from "@/generated";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

console.log('DATABASE_URL type:', typeof process.env.DATABASE_URL, 'value:', process.env.DATABASE_URL)