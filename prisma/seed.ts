import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample congregation
  const congregation = await prisma.congregation.create({
    data: {
      name: 'Sample Congregation',
      city: 'Sample City',
    },
  })

  // Create sample tags
  const tag1 = await prisma.tag.create({ data: { name: 'Friend', color: '#3b82f6' } })
  const tag2 = await prisma.tag.create({ data: { name: 'Family', color: '#ef4444' } })

  // Create sample family
  const family = await prisma.family.create({
    data: {
      name: 'Smith Family',
      phone: '123-456-7890',
      congregationId: congregation.id,
    },
  })

  // Create sample contacts
  await prisma.contact.createMany({
    data: [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        congregationId: congregation.id,
        familyId: family.id,
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        congregationId: congregation.id,
      },
    ],
  })

  console.log('✅ Seeding completed successfully')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
