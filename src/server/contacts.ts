import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/db'
import { z } from 'zod'
import type { ReminderType } from '@prisma/client'

// ============================================
// Type Definitions
// ============================================

export type ContactFlat = {
  id: number
  first_name: string
  last_name: string
  phone: string | null
  email: string | null
  address: string | null
  congregation_id: number | null
  congregation_name: string | null
  family_id: number | null
  family_name: string | null
  birthday: string | null
  wedding_anniversary: string | null
  notes: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export type ContactWithTags = ContactFlat & {
  tags: {
    id: number
    name: string
    color: string
  }[]
}

export type FamilyFlat = {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  congregation_id: number | null
  congregation_name: string | null
  notes: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export type FamilyWithMembers = FamilyFlat & {
  members: ContactFlat[]
}

export type PeopleGrouped = {
  families: FamilyWithMembers[]
  individuals: ContactFlat[]
}

export type CongregationFlat = {
  id: number
  name: string
  city: string | null
  created_at: string
}

// ============================================
// Helpers
// ============================================

function toDateStr(d: Date | null): string | null {
  if (!d) return null
  return d.toISOString().split('T')[0]
}

function flattenContact(c: any): ContactFlat {
  return {
    id: c.id,
    first_name: c.firstName,
    last_name: c.lastName,
    phone: c.phone,
    email: c.email,
    address: c.address,
    congregation_id: c.congregationId,
    congregation_name: c.congregation?.name ?? null,
    family_id: c.familyId,
    family_name: c.family?.name ?? null,
    birthday: toDateStr(c.birthday),
    wedding_anniversary: toDateStr(c.weddingAnniversary),
    notes: c.notes,
    photo_url: c.photoUrl,
    created_at: c.createdAt?.toISOString?.() ?? '',
    updated_at: c.updatedAt?.toISOString?.() ?? '',
  }
}

function flattenContactWithTags(c: any): ContactWithTags {
  return {
    ...flattenContact(c),
    tags: (c.tags ?? []).map((ct: any) => {
      const t = ct.tag ?? ct
      return { id: t.id, name: t.name, color: t.color }
    }),
  }
}

function flattenFamily(f: any): FamilyFlat {
  return {
    id: f.id,
    name: f.name,
    phone: f.phone,
    email: f.email,
    address: f.address,
    congregation_id: f.congregationId,
    congregation_name: f.congregation?.name ?? null,
    notes: f.notes,
    photo_url: f.photoUrl,
    created_at: f.createdAt?.toISOString?.() ?? '',
    updated_at: f.updatedAt?.toISOString?.() ?? '',
  }
}

function flattenFamilyWithMembers(f: any): FamilyWithMembers {
  return {
    ...flattenFamily(f),
    members: (f.members ?? []).map(flattenContact),
  }
}

// ============================================
// Congregation Server Functions
// ============================================

export const getCongregations = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CongregationFlat[]> => {
    try {
      const rows = await prisma.congregation.findMany({
        orderBy: { name: 'asc' },
      })
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        city: r.city,
        created_at: r.createdAt.toISOString(),
      }))
    } catch {
      return []
    }
  }
)

const createCongregationSchema = z.object({
  name: z.string().min(1),
  city: z.string().optional(),
})

export const createCongregation = createServerFn({ method: 'POST' })
  .inputValidator(createCongregationSchema)
  .handler(async ({ data }) => {
    await prisma.congregation.create({
      data: { name: data.name, city: data.city ?? null },
    })
    return { success: true }
  })

// ============================================
// Contact Server Functions
// ============================================

// Get all contacts with tags
export const getContactsWithTags = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ContactWithTags[]> => {
    try {
      const rows = await prisma.contact.findMany({
        include: {
          congregation: true,
          family: true,
          tags: { include: { tag: true } },
        },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      })
      return rows.map(flattenContactWithTags)
    } catch {
      return []
    }
  }
)

// Get contact by ID
const getContactByIdSchema = z.object({
  id: z.number(),
})

export const getContactById = createServerFn({ method: 'GET' })
  .inputValidator(getContactByIdSchema)
  .handler(async ({ data }): Promise<ContactWithTags | null> => {
    try {
      const contact = await prisma.contact.findUnique({
        where: { id: data.id },
        include: {
          congregation: true,
          family: true,
          tags: { include: { tag: true } },
        },
      })
      return contact ? flattenContactWithTags(contact) : null
    } catch {
      return null
    }
  })

// Get people grouped (families + individuals)
export const getPeopleGrouped = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PeopleGrouped> => {
    try {
      const families = await prisma.family.findMany({
        include: {
          congregation: true,
          members: { orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }] },
        },
        orderBy: { name: 'asc' },
      })

      const individuals = await prisma.contact.findMany({
        where: { familyId: null },
        include: { congregation: true, family: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      })

      return {
        families: families.map(flattenFamilyWithMembers),
        individuals: individuals.map(flattenContact),
      }
    } catch {
      return { families: [], individuals: [] }
    }
  }
)

// Create contact with automatic birthday/anniversary reminders
const createContactSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  congregation_id: z.number().optional().nullable(),
  family_id: z.number().optional().nullable(),
  birthday: z.string().optional().nullable(),
  wedding_anniversary: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

async function createReminderFromDate(
  contactId: number,
  dateStr: string,
  type: ReminderType,
  title: string
) {
  const date = new Date(dateStr)
  const today = new Date()
  let nextOccurrence = new Date(
    today.getFullYear(),
    date.getMonth(),
    date.getDate()
  )
  if (nextOccurrence < today) {
    nextOccurrence = new Date(
      today.getFullYear() + 1,
      date.getMonth(),
      date.getDate()
    )
  }

  const reminder = await prisma.reminder.create({
    data: { type, title, dueDate: nextOccurrence, repeat: 'yearly' },
  })

  await prisma.reminderContact.create({
    data: { reminderId: reminder.id, contactId },
  })
}

export const createContact = createServerFn({ method: 'POST' })
  .inputValidator(createContactSchema)
  .handler(async ({ data }) => {
    const contact = await prisma.contact.create({
      data: {
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone ?? null,
        email: data.email || null,
        address: data.address ?? null,
        congregationId: data.congregation_id ?? null,
        familyId: data.family_id ?? null,
        birthday: data.birthday ? new Date(data.birthday) : null,
        weddingAnniversary: data.wedding_anniversary
          ? new Date(data.wedding_anniversary)
          : null,
        notes: data.notes ?? null,
      },
    })

    // Create automatic reminders for birthday and anniversary
    if (data.birthday) {
      await createReminderFromDate(
        contact.id,
        data.birthday,
        'birthday',
        `Geburtstag: ${data.first_name} ${data.last_name}`
      )
    }
    if (data.wedding_anniversary) {
      await createReminderFromDate(
        contact.id,
        data.wedding_anniversary,
        'wedding_anniversary',
        `Hochzeitstag: ${data.first_name} ${data.last_name}`
      )
    }

    return { success: true, id: contact.id }
  })

// Update contact
const updateContactSchema = z.object({
  id: z.number(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  congregation_id: z.number().optional().nullable(),
  family_id: z.number().optional().nullable(),
  birthday: z.string().optional().nullable(),
  wedding_anniversary: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const updateContact = createServerFn({ method: 'POST' })
  .inputValidator(updateContactSchema)
  .handler(async ({ data }) => {
    await prisma.contact.update({
      where: { id: data.id },
      data: {
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone ?? null,
        email: data.email || null,
        address: data.address ?? null,
        congregationId: data.congregation_id ?? null,
        familyId: data.family_id ?? null,
        birthday: data.birthday ? new Date(data.birthday) : null,
        weddingAnniversary: data.wedding_anniversary
          ? new Date(data.wedding_anniversary)
          : null,
        notes: data.notes ?? null,
      },
    })
    return { success: true }
  })

// Delete contact
const deleteContactSchema = z.object({
  id: z.number(),
})

export const deleteContact = createServerFn({ method: 'POST' })
  .inputValidator(deleteContactSchema)
  .handler(async ({ data }) => {
    await prisma.contact.delete({ where: { id: data.id } })
    return { success: true }
  })

/**
 * Get all reminders for a contact
 */
export const getContactReminders = createServerFn({ method: 'GET' })
  .inputValidator((contactId: number) => z.number().int().positive().parse(contactId))
  .handler(async ({ data: contactId }) => {
    try {
      const reminders = await prisma.reminder.findMany({
        where: {
          contacts: {
            some: { contactId },
          },
        },
        include: {
          contacts: { include: { contact: true } },
          families: { include: { family: true } },
        },
        orderBy: { dueDate: 'desc' },
      })
      // You'll need to import flattenReminder from reminders.ts or redefine it here
      return reminders
    } catch (error) {
      console.error('Error fetching contact reminders:', error)
      return []
    }
  })

