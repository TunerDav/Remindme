import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../db'

// =============================================================================
// Types
// =============================================================================

export type InteractionFlat = {
  id: number
  contactId: number | null
  familyId: number | null
  inviteGroupId: number | null
  type: string
  notes: string | null
  interactionDate: string
  createdAt: string
  contactName?: string
  familyName?: string
  inviteGroupName?: string
}

// =============================================================================
// Schemas
// =============================================================================

const createInteractionSchema = z.object({
  contactId: z.number().int().positive().optional(),
  familyId: z.number().int().positive().optional(),
  inviteGroupId: z.number().int().positive().optional(),
  type: z.string().min(1).max(50),
  notes: z.string().optional(),
  interactionDate: z.string().datetime().or(z.date()),
})

const createBulkInteractionSchema = z.object({
  inviteGroupIds: z.array(z.number().int().positive()),
  type: z.string().min(1).max(50),
  notes: z.string().optional(),
  interactionDate: z.string().datetime().or(z.date()),
})

// =============================================================================
// Helper Functions
// =============================================================================

function flattenInteraction(interaction: any): InteractionFlat {
  return {
    id: interaction.id,
    contactId: interaction.contactId,
    familyId: interaction.familyId,
    inviteGroupId: interaction.inviteGroupId,
    type: interaction.type,
    notes: interaction.notes,
    interactionDate: interaction.interactionDate.toISOString().split('T')[0],
    createdAt: interaction.createdAt.toISOString(),
    contactName: interaction.contact
      ? `${interaction.contact.firstName} ${interaction.contact.lastName}`
      : undefined,
    familyName: interaction.family?.name,
    inviteGroupName: interaction.inviteGroup?.name,
  }
}

// =============================================================================
// Server Functions
// =============================================================================

/**
 * Create a new interaction
 */
export const createInteraction = createServerFn({ method: 'POST' })
  .inputValidator(createInteractionSchema)
  .handler(async ({ data }): Promise<InteractionFlat> => {
    try {
      const interactionDate =
        typeof data.interactionDate === 'string'
          ? new Date(data.interactionDate)
          : data.interactionDate

      const interaction = await db.interaction.create({
        data: {
          contactId: data.contactId ?? null,
          familyId: data.familyId ?? null,
          inviteGroupId: data.inviteGroupId ?? null,
          type: data.type,
          notes: data.notes ?? null,
          interactionDate,
        },
        include: {
          contact: true,
          family: true,
          inviteGroup: true,
        },
      })

      return flattenInteraction(interaction)
    } catch (error) {
      console.error('Error creating interaction:', error)
      throw new Error('Failed to create interaction')
    }
  })

/**
 * Get all interactions for a contact
 */
export const getContactInteractions = createServerFn({ method: 'GET' })
  .inputValidator((contactId: number) => z.number().int().positive().parse(contactId))
  .handler(async ({ data: contactId }): Promise<InteractionFlat[]> => {
    try {
      const interactions = await db.interaction.findMany({
        where: { contactId },
        include: {
          contact: true,
          family: true,
          inviteGroup: true,
        },
        orderBy: { interactionDate: 'desc' },
      })

      return interactions.map(flattenInteraction)
    } catch (error) {
      console.error('Error fetching contact interactions:', error)
      return []
    }
  })

/**
 * Get all interactions for a family
 */
export const getFamilyInteractions = createServerFn({ method: 'GET' })
  .inputValidator((familyId: number) => z.number().int().positive().parse(familyId))
  .handler(async ({ data: familyId }): Promise<InteractionFlat[]> => {
    try {
      const interactions = await db.interaction.findMany({
        where: { familyId },
        include: {
          contact: true,
          family: true,
          inviteGroup: true,
        },
        orderBy: { interactionDate: 'desc' },
      })

      return interactions.map(flattenInteraction)
    } catch (error) {
      console.error('Error fetching family interactions:', error)
      return []
    }
  })

/**
 * Get all interactions for an invite group
 */
export const getInviteGroupInteractions = createServerFn({ method: 'GET' })
  .inputValidator((inviteGroupId: number) =>
    z.number().int().positive().parse(inviteGroupId)
  )
  .handler(async ({ data: inviteGroupId }): Promise<InteractionFlat[]> => {
    try {
      const interactions = await db.interaction.findMany({
        where: { inviteGroupId },
        include: {
          contact: true,
          family: true,
          inviteGroup: true,
        },
        orderBy: { interactionDate: 'desc' },
      })

      return interactions.map(flattenInteraction)
    } catch (error) {
      console.error('Error fetching invite group interactions:', error)
      return []
    }
  })

/**
 * Create bulk interactions for multiple invite groups
 */
export const createBulkInteraction = createServerFn({ method: 'POST' })
  .inputValidator(createBulkInteractionSchema)
  .handler(async ({ data }): Promise<number> => {
    try {
      const interactionDate =
        typeof data.interactionDate === 'string'
          ? new Date(data.interactionDate)
          : data.interactionDate

      const result = await db.interaction.createMany({
        data: data.inviteGroupIds.map(inviteGroupId => ({
          inviteGroupId,
          type: data.type,
          notes: data.notes ?? null,
          interactionDate,
          contactId: null,
          familyId: null,
        })),
      })

      return result.count
    } catch (error) {
      console.error('Error creating bulk interactions:', error)
      throw new Error('Failed to create bulk interactions')
    }
  })

/**
 * Get all distinct interaction types used in the database
 */
export const getInteractionTypes = createServerFn({ method: 'GET' }).handler(
  async (): Promise<string[]> => {
    try {
      const interactions = await db.interaction.findMany({
        select: { type: true },
        distinct: ['type'],
        orderBy: { type: 'asc' },
      })

      return interactions.map(i => i.type)
    } catch (error) {
      console.error('Error fetching interaction types:', error)
      return []
    }
  }
)

/**
 * Delete an interaction
 */
export const deleteInteraction = createServerFn({ method: 'POST' })
  .inputValidator((id: number) => z.number().int().positive().parse(id))
  .handler(async ({ data: id }): Promise<void> => {
    try {
      await db.interaction.delete({ where: { id } })
    } catch (error) {
      console.error('Error deleting interaction:', error)
      throw new Error('Failed to delete interaction')
    }
  })
