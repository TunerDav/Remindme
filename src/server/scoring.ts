import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../db'
import type { InteractionFlat } from './interactions'

// =============================================================================
// Types
// =============================================================================

export type RelationshipScore = {
  score: number
  level: 'strong' | 'good' | 'weak' | 'critical' | 'none'
  label: string
  recency: number
  frequency: number
  variety: number
  lastInteractionDays: number | null
  totalInteractions: number
}

export type InviteGroupWithScore = {
  id: number
  name: string
  familyId: number | null
  familyName: string | null
  memberCount: number
  score: RelationshipScore
}

// =============================================================================
// Scoring Algorithm
// =============================================================================

/**
 * Compute relationship score based on interactions
 * Formula:
 * - Recency: 50% (how recent was the last interaction)
 * - Frequency: 30% (how many interactions in last 6 months)
 * - Variety: 20% (diversity of interaction types)
 */
export function computeScore(interactions: InteractionFlat[]): RelationshipScore {
  const now = new Date()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  // Filter interactions from last 6 months
  const recentInteractions = interactions.filter(i => {
    const date = new Date(i.interactionDate)
    return date >= sixMonthsAgo
  })

  const totalInteractions = recentInteractions.length

  // No interactions = no score
  if (totalInteractions === 0) {
    return {
      score: 0,
      level: 'none',
      label: 'Keine Daten',
      recency: 0,
      frequency: 0,
      variety: 0,
      lastInteractionDays: null,
      totalInteractions: 0,
    }
  }

  // Calculate last interaction days
  const lastInteraction = interactions.reduce((latest, current) => {
    const currentDate = new Date(current.interactionDate)
    const latestDate = new Date(latest.interactionDate)
    return currentDate > latestDate ? current : latest
  })
  const lastInteractionDate = new Date(lastInteraction.interactionDate)
  const daysSinceLastInteraction = Math.floor(
    (now.getTime() - lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  // 1. Recency Score (50 points)
  // 0-7 days: 50, 8-30 days: 40, 31-90 days: 25, 91-180 days: 10, >180 days: 0
  let recencyScore = 0
  if (daysSinceLastInteraction <= 7) recencyScore = 50
  else if (daysSinceLastInteraction <= 30) recencyScore = 40
  else if (daysSinceLastInteraction <= 90) recencyScore = 25
  else if (daysSinceLastInteraction <= 180) recencyScore = 10
  else recencyScore = 0

  // 2. Frequency Score (30 points)
  // 10+ interactions: 30, 6-9: 24, 3-5: 18, 1-2: 10
  let frequencyScore = 0
  if (totalInteractions >= 10) frequencyScore = 30
  else if (totalInteractions >= 6) frequencyScore = 24
  else if (totalInteractions >= 3) frequencyScore = 18
  else frequencyScore = 10

  // 3. Variety Score (20 points)
  // Unique interaction types (max 5 types for full score)
  const uniqueTypes = new Set(recentInteractions.map(i => i.type)).size
  const varietyScore = Math.min((uniqueTypes / 5) * 20, 20)

  // Total score
  const totalScore = Math.round(recencyScore + frequencyScore + varietyScore)

  // Determine level
  let level: RelationshipScore['level']
  let label: string
  if (totalScore >= 80) {
    level = 'strong'
    label = 'Stark'
  } else if (totalScore >= 60) {
    level = 'good'
    label = 'Gut'
  } else if (totalScore >= 40) {
    level = 'weak'
    label = 'Schwach'
  } else {
    level = 'critical'
    label = 'Kritisch'
  }

  return {
    score: totalScore,
    level,
    label,
    recency: recencyScore,
    frequency: frequencyScore,
    variety: Math.round(varietyScore),
    lastInteractionDays: daysSinceLastInteraction,
    totalInteractions,
  }
}

// =============================================================================
// Server Functions
// =============================================================================

/**
 * Get relationship score for a contact
 */
export const getContactScore = createServerFn({ method: 'GET' })
  .inputValidator((contactId: number) => z.number().int().positive().parse(contactId))
  .handler(async ({ data: contactId }): Promise<RelationshipScore> => {
    try {
      const interactions = await db.interaction.findMany({
        where: { contactId },
        select: {
          id: true,
          type: true,
          interactionDate: true,
          notes: true,
          createdAt: true,
          contactId: true,
          familyId: true,
          inviteGroupId: true,
        },
        orderBy: { interactionDate: 'desc' },
      })

      const flatInteractions: InteractionFlat[] = interactions.map(i => ({
        id: i.id,
        contactId: i.contactId,
        familyId: i.familyId,
        inviteGroupId: i.inviteGroupId,
        type: i.type,
        notes: i.notes,
        interactionDate: i.interactionDate.toISOString().split('T')[0],
        createdAt: i.createdAt.toISOString(),
      }))

      return computeScore(flatInteractions)
    } catch (error) {
      console.error('Error computing contact score:', error)
      return computeScore([])
    }
  })

/**
 * Get relationship score for an invite group
 */
export const getInviteGroupScore = createServerFn({ method: 'GET' })
  .inputValidator((inviteGroupId: number) =>
    z.number().int().positive().parse(inviteGroupId)
  )
  .handler(async ({ data: inviteGroupId }): Promise<RelationshipScore> => {
    try {
      const interactions = await db.interaction.findMany({
        where: { inviteGroupId },
        select: {
          id: true,
          type: true,
          interactionDate: true,
          notes: true,
          createdAt: true,
          contactId: true,
          familyId: true,
          inviteGroupId: true,
        },
        orderBy: { interactionDate: 'desc' },
      })

      const flatInteractions: InteractionFlat[] = interactions.map(i => ({
        id: i.id,
        contactId: i.contactId,
        familyId: i.familyId,
        inviteGroupId: i.inviteGroupId,
        type: i.type,
        notes: i.notes,
        interactionDate: i.interactionDate.toISOString().split('T')[0],
        createdAt: i.createdAt.toISOString(),
      }))

      return computeScore(flatInteractions)
    } catch (error) {
      console.error('Error computing invite group score:', error)
      return computeScore([])
    }
  })

/**
 * Get all invite groups with their scores
 */
export const getInviteGroupsWithScores = createServerFn({ method: 'GET' }).handler(
  async (): Promise<InviteGroupWithScore[]> => {
    try {
      const groups = await db.inviteGroup.findMany({
        include: {
          family: true,
          _count: { select: { members: true } },
          interactions: {
            select: {
              id: true,
              type: true,
              interactionDate: true,
              notes: true,
              createdAt: true,
              contactId: true,
              familyId: true,
              inviteGroupId: true,
            },
            orderBy: { interactionDate: 'desc' },
          },
        },
        orderBy: { name: 'asc' },
      })

      return groups.map(group => {
        const flatInteractions: InteractionFlat[] = group.interactions.map(i => ({
          id: i.id,
          contactId: i.contactId,
          familyId: i.familyId,
          inviteGroupId: i.inviteGroupId,
          type: i.type,
          notes: i.notes,
          interactionDate: i.interactionDate.toISOString().split('T')[0],
          createdAt: i.createdAt.toISOString(),
        }))

        return {
          id: group.id,
          name: group.name,
          familyId: group.familyId,
          familyName: group.family?.name ?? null,
          memberCount: group._count.members,
          score: computeScore(flatInteractions),
        }
      })
    } catch (error) {
      console.error('Error fetching invite groups with scores:', error)
      return []
    }
  }
)
