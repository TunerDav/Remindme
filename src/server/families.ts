import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../db'
import type { Contact } from '@prisma/client'

// ============================================
// Types
// ============================================

export type FamilyFlat = {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  congregation_id: number | null
  congregation_name: string | null
  notes: string | null
  member_count: number
  created_at: Date
  updated_at: Date
}

export type FamilyWithTags = FamilyFlat & {
  tags: Array<{ id: number; name: string; color: string }>
}

export type FamilyWithMembers = FamilyFlat & {
  members: Array<{
    id: number
    first_name: string
    last_name: string
    phone: string | null
    email: string | null
  }>
}

// ============================================
// Helper Functions
// ============================================

function flattenFamily(f: any): FamilyFlat {
  return {
    id: f.id,
    name: f.name,
    phone: f.phone ?? null,
    email: f.email ?? null,
    address: f.address ?? null,
    congregation_id: f.congregationId ?? null,
    congregation_name: f.congregation?.name ?? null,
    notes: f.notes ?? null,
    member_count: f._count?.members ?? 0,
    created_at: f.createdAt,
    updated_at: f.updatedAt,
  }
}

function flattenFamilyWithTags(f: any): FamilyWithTags {
  return {
    ...flattenFamily(f),
    tags: f.tags?.map((ft: any) => ({
      id: ft.tag.id,
      name: ft.tag.name,
      color: ft.tag.color,
    })) ?? [],
  }
}

function flattenFamilyWithMembers(f: any): FamilyWithMembers {
  return {
    ...flattenFamily(f),
    members: f.members?.map((c: Contact) => ({
      id: c.id,
      first_name: c.firstName,
      last_name: c.lastName,
      phone: c.phone ?? null,
      email: c.email ?? null,
    })) ?? [],
  }
}

// ============================================
// Server Functions - Read
// ============================================

/**
 * Get all families with member count
 */
export const getFamilies = createServerFn({ method: 'GET' })
  .handler(async (): Promise<FamilyFlat[]> => {
    try {
      const families = await db.family.findMany({
        include: {
          congregation: true,
          _count: { select: { members: true } },
        },
        orderBy: { name: 'asc' },
      })
      return families.map(flattenFamily)
    } catch (error) {
      console.error('Error fetching families:', error)
      return []
    }
  })

/**
 * Get all families with tags
 */
export const getFamiliesWithTags = createServerFn({ method: 'GET' })
  .handler(async (): Promise<FamilyWithTags[]> => {
    try {
      const families = await db.family.findMany({
        include: {
          congregation: true,
          tags: { include: { tag: true } },
          _count: { select: { members: true } },
        },
        orderBy: { name: 'asc' },
      })
      return families.map(flattenFamilyWithTags)
    } catch (error) {
      console.error('Error fetching families with tags:', error)
      return []
    }
  })

/**
 * Get family by ID with members
 */
export const getFamilyById = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => z.number().int().positive().parse(id))
  .handler(async ({ data: id }): Promise<FamilyWithMembers | null> => {
    try {
      const family = await db.family.findUnique({
        where: { id },
        include: {
          congregation: true,
          members: {
            orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
          },
          _count: { select: { members: true } },
        },
      })
      if (!family) return null
      return flattenFamilyWithMembers(family)
    } catch (error) {
      console.error('Error fetching family:', error)
      return null
    }
  })

/**
 * Get family members (contacts)
 */
export const getFamilyMembers = createServerFn({ method: 'GET' })
  .inputValidator((familyId: number) => z.number().int().positive().parse(familyId))
  .handler(async ({ data: familyId }) => {
    try {
      const contacts = await db.contact.findMany({
        where: { familyId },
        include: { congregation: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      })
      return contacts.map(c => ({
        id: c.id,
        first_name: c.firstName,
        last_name: c.lastName,
        phone: c.phone ?? null,
        email: c.email ?? null,
        address: c.address ?? null,
        congregation_id: c.congregationId ?? null,
        congregation_name: c.congregation?.name ?? null,
      }))
    } catch (error) {
      console.error('Error fetching family members:', error)
      return []
    }
  })

// ============================================
// Server Functions - Create/Update/Delete
// ============================================

const FamilySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  congregation_id: z.number().int().positive().optional(),
  notes: z.string().optional(),
})

/**
 * Create a new family
 */
export const createFamily = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => FamilySchema.parse(data))
  .handler(async ({ data }): Promise<number> => {
    try {
      const family = await db.family.create({
        data: {
          name: data.name,
          phone: data.phone ?? null,
          email: data.email || null,
          address: data.address ?? null,
          congregationId: data.congregation_id ?? null,
          notes: data.notes ?? null,
        },
      })
      return family.id
    } catch (error) {
      console.error('Error creating family:', error)
      throw new Error('Failed to create family')
    }
  })

/**
 * Update an existing family
 */
export const updateFamily = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => 
    z.object({
      id: z.number().int().positive(),
      ...FamilySchema.shape,
    }).parse(data)
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await db.family.update({
        where: { id: data.id },
        data: {
          name: data.name,
          phone: data.phone ?? null,
          email: data.email || null,
          address: data.address ?? null,
          congregationId: data.congregation_id ?? null,
          notes: data.notes ?? null,
        },
      })
    } catch (error) {
      console.error('Error updating family:', error)
      throw new Error('Failed to update family')
    }
  })

/**
 * Delete a family
 */
export const deleteFamily = createServerFn({ method: 'POST' })
  .inputValidator((id: number) => z.number().int().positive().parse(id))
  .handler(async ({ data: id }): Promise<void> => {
    try {
      await db.family.delete({ where: { id } })
    } catch (error) {
      console.error('Error deleting family:', error)
      throw new Error('Failed to delete family')
    }
  })

// ============================================
// Server Functions - Contact Assignment
// ============================================

/**
 * Add contact to family
 */
export const addContactToFamily = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => 
    z.object({
      contact_id: z.number().int().positive(),
      family_id: z.number().int().positive(),
    }).parse(data)
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await db.contact.update({
        where: { id: data.contact_id },
        data: { familyId: data.family_id },
      })
    } catch (error) {
      console.error('Error adding contact to family:', error)
      throw new Error('Failed to add contact to family')
    }
  })

/**
 * Remove contact from family
 */
export const removeContactFromFamily = createServerFn({ method: 'POST' })
  .inputValidator((contactId: number) => z.number().int().positive().parse(contactId))
  .handler(async ({ data: contactId }): Promise<void> => {
    try {
      await db.contact.update({
        where: { id: contactId },
        data: { familyId: null },
      })
    } catch (error) {
      console.error('Error removing contact from family:', error)
      throw new Error('Failed to remove contact from family')
    }
  })

/**
 * Get all reminders for a family
 */
export const getFamilyReminders = createServerFn({ method: 'GET' })
  .inputValidator((familyId: number) => z.number().int().positive().parse(familyId))
  .handler(async ({ data: familyId }) => {
    try {
      const reminders = await db.reminder.findMany({
        where: {
          families: {
            some: { familyId },
          },
        },
        include: {
          contacts: { include: { contact: true } },
          families: { include: { family: true } },
        },
        orderBy: { dueDate: 'desc' },
      })
      return reminders
    } catch (error) {
      console.error('Error fetching family reminders:', error)
      return []
    }
  })

