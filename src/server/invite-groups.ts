import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../db'

// =============================================================================
// Types
// =============================================================================

export type InviteGroupFlat = {
  id: number
  name: string
  familyId: number | null
  familyName: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  memberCount: number
}

export type InviteGroupWithMembers = InviteGroupFlat & {
  members: {
    id: number
    contactId: number
    firstName: string
    lastName: string
    photoUrl: string | null
  }[]
}

// =============================================================================
// Schemas
// =============================================================================

const createInviteGroupSchema = z.object({
  name: z.string().min(1).max(150),
  familyId: z.number().int().positive().optional(),
  notes: z.string().optional(),
  memberIds: z.array(z.number().int().positive()).min(1),
})

const updateInviteGroupSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(150).optional(),
  familyId: z.number().int().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
  memberIds: z.array(z.number().int().positive()).optional(),
})

const assignInviteGroupsToSlotSchema = z.object({
  slotId: z.number().int().positive(),
  groupIds: z.array(z.number().int().positive()),
})

// =============================================================================
// Helper Functions
// =============================================================================

function flattenInviteGroup(group: any): InviteGroupFlat {
  return {
    id: group.id,
    name: group.name,
    familyId: group.familyId,
    familyName: group.family?.name ?? null,
    notes: group.notes,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    memberCount: group._count?.members ?? group.members?.length ?? 0,
  }
}

function flattenInviteGroupWithMembers(group: any): InviteGroupWithMembers {
  return {
    ...flattenInviteGroup(group),
    members: (group.members ?? []).map((m: any) => ({
      id: m.id ?? m.contactId,
      contactId: m.contactId ?? m.contact?.id,
      firstName: m.contact?.firstName ?? m.firstName ?? '',
      lastName: m.contact?.lastName ?? m.lastName ?? '',
      photoUrl: m.contact?.photoUrl ?? m.photoUrl ?? null,
    })),
  }
}

// =============================================================================
// Server Functions
// =============================================================================

/**
 * Get all invite groups with member count
 */
export const getInviteGroups = createServerFn({ method: 'GET' }).handler(
  async (): Promise<InviteGroupFlat[]> => {
    try {
      const groups = await db.inviteGroup.findMany({
        include: {
          family: true,
          _count: { select: { members: true } },
        },
        orderBy: { name: 'asc' },
      })

      return groups.map(flattenInviteGroup)
    } catch (error) {
      console.error('Error fetching invite groups:', error)
      return []
    }
  }
)

/**
 * Get a single invite group with members
 */
export const getInviteGroupById = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => z.number().int().positive().parse(id))
  .handler(async ({ data: id }): Promise<InviteGroupWithMembers | null> => {
    try {
      const group = await db.inviteGroup.findUnique({
        where: { id },
        include: {
          family: true,
          members: {
            include: { contact: true },
          },
          _count: { select: { members: true } },
        },
      })

      if (!group) return null

      return flattenInviteGroupWithMembers(group)
    } catch (error) {
      console.error('Error fetching invite group:', error)
      return null
    }
  })

/**
 * Get all invite groups for a specific family
 */
export const getInviteGroupsByFamily = createServerFn({ method: 'GET' })
  .inputValidator((familyId: number) => z.number().int().positive().parse(familyId))
  .handler(async ({ data: familyId }): Promise<InviteGroupFlat[]> => {
    try {
      const groups = await db.inviteGroup.findMany({
        where: { familyId },
        include: {
          family: true,
          _count: { select: { members: true } },
        },
        orderBy: { name: 'asc' },
      })

      return groups.map(flattenInviteGroup)
    } catch (error) {
      console.error('Error fetching family invite groups:', error)
      return []
    }
  })

/**
 * Create a new invite group
 */
export const createInviteGroup = createServerFn({ method: 'POST' })
  .inputValidator(createInviteGroupSchema)
  .handler(async ({ data }): Promise<InviteGroupWithMembers> => {
    try {
      const group = await db.inviteGroup.create({
        data: {
          name: data.name,
          familyId: data.familyId ?? null,
          notes: data.notes ?? null,
          members: {
            create: data.memberIds.map(contactId => ({ contactId })),
          },
        },
        include: {
          family: true,
          members: {
            include: { contact: true },
          },
          _count: { select: { members: true } },
        },
      })

      return flattenInviteGroupWithMembers(group)
    } catch (error) {
      console.error('Error creating invite group:', error)
      throw new Error('Failed to create invite group')
    }
  })

/**
 * Update an invite group
 */
export const updateInviteGroup = createServerFn({ method: 'POST' })
  .inputValidator(updateInviteGroupSchema)
  .handler(async ({ data }): Promise<InviteGroupWithMembers> => {
    try {
      const { id, memberIds, ...updateData } = data

      // If memberIds are provided, update them
      if (memberIds !== undefined) {
        // Delete existing members
        await db.inviteGroupMember.deleteMany({
          where: { inviteGroupId: id },
        })

        // Create new members
        if (memberIds.length > 0) {
          await db.inviteGroupMember.createMany({
            data: memberIds.map(contactId => ({
              inviteGroupId: id,
              contactId,
            })),
          })
        }
      }

      // Update the group
      const group = await db.inviteGroup.update({
        where: { id },
        data: updateData,
        include: {
          family: true,
          members: {
            include: { contact: true },
          },
          _count: { select: { members: true } },
        },
      })

      return flattenInviteGroupWithMembers(group)
    } catch (error) {
      console.error('Error updating invite group:', error)
      throw new Error('Failed to update invite group')
    }
  })

/**
 * Delete an invite group
 */
export const deleteInviteGroup = createServerFn({ method: 'POST' })
  .inputValidator((id: number) => z.number().int().positive().parse(id))
  .handler(async ({ data: id }): Promise<void> => {
    try {
      await db.inviteGroup.delete({ where: { id } })
    } catch (error) {
      console.error('Error deleting invite group:', error)
      throw new Error('Failed to delete invite group')
    }
  })

/**
 * Assign invite groups to an event slot
 */
export const assignInviteGroupsToSlot = createServerFn({ method: 'POST' })
  .inputValidator(assignInviteGroupsToSlotSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      // Delete existing assignments
      await db.eventSlotInviteGroup.deleteMany({
        where: { eventSlotId: data.slotId },
      })

      // Create new assignments
      if (data.groupIds.length > 0) {
        await db.eventSlotInviteGroup.createMany({
          data: data.groupIds.map(inviteGroupId => ({
            eventSlotId: data.slotId,
            inviteGroupId,
          })),
        })
      }
    } catch (error) {
      console.error('Error assigning invite groups to slot:', error)
      throw new Error('Failed to assign invite groups to slot')
    }
  })
