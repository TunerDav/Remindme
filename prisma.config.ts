import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Load .env file if it exists
config()

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  // Don't require DATABASE_URL during generation
  // It will be provided to PrismaClient constructor at runtime
})
