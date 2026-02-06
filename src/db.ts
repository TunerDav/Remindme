import { PrismaClient } from '@prisma/client'

function createPrismaClient() {
  // Prisma v7 requires passing the database URL to the constructor
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  return new PrismaClient({
    datasourceUrl: databaseUrl,
  })
}

declare global {
  var __prisma: PrismaClient | undefined
}

export const db = globalThis.__prisma ?? createPrismaClient()
export const prisma = db // Alias for compatibility

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = db
}
