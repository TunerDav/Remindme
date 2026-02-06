import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/db'
import { z } from 'zod'

// ============================================
// Type Definitions
// ============================================

export type TagFlat = {
  id: number
  name: string
  color: string
  created_at: string
}

// ============================================
// Helpers
// ============================================

function flattenTag(t: any): TagFlat {
  return { 
    id: t.id, 
    name: t.name, 
    color: t.color, 
    created_at: t.createdAt?.toISOString?.() ?? "" 
  }
}

// ============================================
// Tag Server Functions
// ============================================

// Get all tags
export const getTags = createServerFn({ method: 'GET' })
  .handler(async (): Promise<TagFlat[]> => {
    try {
      const rows = await prisma.tag.findMany({ orderBy: { name: "asc" } })
      return rows.map(flattenTag)
    } catch {
      return []
    }
  })

// Create tag
const createTagSchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

export const createTag = createServerFn({ method: 'POST' })
  .inputValidator(createTagSchema)
  .handler(async ({ data }) => {
    await prisma.tag.create({ 
      data: { 
        name: data.name, 
        color: data.color 
      } 
    })
    return { success: true }
  })

// Update tag
const updateTagSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

export const updateTag = createServerFn({ method: 'POST' })
  .inputValidator(updateTagSchema)
  .handler(async ({ data }) => {
    await prisma.tag.update({
      where: { id: data.id },
      data: { 
        name: data.name, 
        color: data.color 
      },
    })
    return { success: true }
  })

// Delete tag
const deleteTagSchema = z.object({
  id: z.number(),
})

export const deleteTag = createServerFn({ method: 'POST' })
  .inputValidator(deleteTagSchema)
  .handler(async ({ data }) => {
    await prisma.tag.delete({ where: { id: data.id } })
    return { success: true }
  })

// ============================================
// Contact Tag Server Functions
// ============================================

// Get tags for a specific contact
const getContactTagsSchema = z.object({
  contactId: z.number(),
})

export const getContactTags = createServerFn({ method: 'GET' })
  .inputValidator(getContactTagsSchema)
  .handler(async ({ data }): Promise<TagFlat[]> => {
    try {
      const rows = await prisma.contactTag.findMany({
        where: { contactId: data.contactId },
        include: { tag: true },
        orderBy: { tag: { name: "asc" } },
      })
      return rows.map(ct => flattenTag(ct.tag))
    } catch {
      return []
    }
  })

// Add tag to contact
const addTagToContactSchema = z.object({
  contactId: z.number(),
  tagId: z.number(),
})

export const addTagToContact = createServerFn({ method: 'POST' })
  .inputValidator(addTagToContactSchema)
  .handler(async ({ data }) => {
    await prisma.contactTag.upsert({
      where: { contactId_tagId: { contactId: data.contactId, tagId: data.tagId } },
      update: {},
      create: { contactId: data.contactId, tagId: data.tagId },
    })
    return { success: true }
  })

// Remove tag from contact
const removeTagFromContactSchema = z.object({
  contactId: z.number(),
  tagId: z.number(),
})

export const removeTagFromContact = createServerFn({ method: 'POST' })
  .inputValidator(removeTagFromContactSchema)
  .handler(async ({ data }) => {
    await prisma.contactTag.delete({ 
      where: { contactId_tagId: { contactId: data.contactId, tagId: data.tagId } } 
    })
    return { success: true }
  })

// ============================================
// Family Tag Functions
// ============================================

// Get family tags
const getFamilyTagsSchema = z.object({
  familyId: z.number(),
})

export const getFamilyTags = createServerFn({ method: 'GET' })
  .inputValidator(getFamilyTagsSchema)
  .handler(async ({ data }): Promise<TagFlat[]> => {
    try {
      const rows = await prisma.familyTag.findMany({
        where: { familyId: data.familyId },
        include: { tag: true },
        orderBy: { tag: { name: "asc" } },
      })
      return rows.map(ft => flattenTag(ft.tag))
    } catch {
      return []
    }
  })

// Add tag to family
const addTagToFamilySchema = z.object({
  familyId: z.number(),
  tagId: z.number(),
})

export const addTagToFamily = createServerFn({ method: 'POST' })
  .inputValidator(addTagToFamilySchema)
  .handler(async ({ data }) => {
    await prisma.familyTag.upsert({
      where: { familyId_tagId: { familyId: data.familyId, tagId: data.tagId } },
      update: {},
      create: { familyId: data.familyId, tagId: data.tagId },
    })
    return { success: true }
  })

// Remove tag from family
const removeTagFromFamilySchema = z.object({
  familyId: z.number(),
  tagId: z.number(),
})

export const removeTagFromFamily = createServerFn({ method: 'POST' })
  .inputValidator(removeTagFromFamilySchema)
  .handler(async ({ data }) => {
    await prisma.familyTag.delete({ 
      where: { familyId_tagId: { familyId: data.familyId, tagId: data.tagId } } 
    })
    return { success: true }
  })

