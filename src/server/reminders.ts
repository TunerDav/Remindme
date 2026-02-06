import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/db'
import type { ReminderType, RepeatInterval } from '@prisma/client'

// ============================================
// Types
// ============================================

export type ReminderFlat = {
  id: number
  contact_id: number | null
  contact_name: string | undefined
  contact_ids: number[] | undefined
  contact_names: string[] | undefined
  family_ids: number[] | undefined
  family_names: string[] | undefined
  type: ReminderType
  title: string
  description: string | null
  due_date: string
  repeat: RepeatInterval
  completed: boolean
  completed_at: string | null
  created_at: string
}

// ============================================
// Helper Functions
// ============================================

function toDateStr(date: Date | null): string | null {
  if (!date) return null
  return date.toISOString().split('T')[0]
}

function flattenReminder(r: any): ReminderFlat {
  return {
    id: r.id,
    contact_id: r.contacts?.[0]?.contactId ?? null,
    contact_name: r.contacts?.[0]?.contact
      ? `${r.contacts[0].contact.firstName} ${r.contacts[0].contact.lastName}`
      : undefined,
    contact_ids: r.contacts?.map((rc: any) => rc.contactId),
    contact_names: r.contacts?.map((rc: any) =>
      rc.contact ? `${rc.contact.firstName} ${rc.contact.lastName}` : ''),
    family_ids: r.families?.map((rf: any) => rf.familyId),
    family_names: r.families?.map((rf: any) => rf.family?.name ?? ''),
    type: r.type,
    title: r.title,
    description: r.description,
    due_date: toDateStr(r.dueDate) ?? '',
    repeat: r.repeat,
    completed: r.completed,
    completed_at: r.completedAt?.toISOString?.() ?? null,
    created_at: r.createdAt?.toISOString?.() ?? '',
  }
}

// ============================================
// Server Functions - Read
// ============================================

/**
 * Get all reminders
 */
export const getReminders = createServerFn({ method: 'GET' })
  .handler(async (): Promise<ReminderFlat[]> => {
    try {
      const reminders = await db.reminder.findMany({
        include: {
          contacts: { include: { contact: true } },
          families: { include: { family: true } },
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      })
      return reminders.map(flattenReminder)
    } catch (error) {
      console.error('Error fetching reminders:', error)
      return []
    }
  })

/**
 * Get reminder by ID
 */
export const getReminderById = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => z.number().int().positive().parse(id))
  .handler(async ({ data: id }): Promise<ReminderFlat | null> => {
    try {
      const reminder = await db.reminder.findUnique({
        where: { id },
        include: {
          contacts: { include: { contact: true } },
          families: { include: { family: true } },
        },
      })
      if (!reminder) return null
      return flattenReminder(reminder)
    } catch (error) {
      console.error('Error fetching reminder:', error)
      return null
    }
  })

/**
 * Get overdue reminders
 */
export const getOverdueReminders = createServerFn({ method: 'GET' })
  .inputValidator((limit?: number) => z.number().int().positive().optional().parse(limit))
  .handler(async ({ data: limit = 5 }): Promise<ReminderFlat[]> => {
    try {
      const now = new Date()
      const reminders = await db.reminder.findMany({
        where: {
          completed: false,
          dueDate: { lt: now },
        },
        include: {
          contacts: { include: { contact: true } },
          families: { include: { family: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: limit,
      })
      return reminders.map(flattenReminder)
    } catch (error) {
      console.error('Error fetching overdue reminders:', error)
      return []
    }
  })

/**
 * Get upcoming reminders
 */
export const getUpcomingReminders = createServerFn({ method: 'GET' })
  .inputValidator((days?: number) => z.number().int().positive().optional().parse(days))
  .handler(async ({ data: days = 14 }): Promise<ReminderFlat[]> => {
    try {
      const now = new Date()
      const future = new Date()
      future.setDate(future.getDate() + days)

      const reminders = await db.reminder.findMany({
        where: {
          completed: false,
          dueDate: { gte: now, lte: future },
        },
        include: {
          contacts: { include: { contact: true } },
          families: { include: { family: true } },
        },
        orderBy: { dueDate: 'asc' },
      })
      return reminders.map(flattenReminder)
    } catch (error) {
      console.error('Error fetching upcoming reminders:', error)
      return []
    }
  })

// ============================================
// Server Functions - Create/Update/Delete
// ============================================

const ReminderSchema = z.object({
  type: z.enum(['birthday', 'wedding_anniversary', 'visit', 'call', 'other']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  due_date: z.string().min(1, 'Due date is required'),
  repeat: z.enum(['none', 'weekly', 'monthly', 'quarterly', 'yearly']),
  contact_ids: z.array(z.number()).optional(),
  family_ids: z.array(z.number()).optional(),
})

/**
 * Create a new reminder with multiple targets
 */
export const createReminder = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => ReminderSchema.parse(data))
  .handler(async ({ data }): Promise<number> => {
    try {
      const reminder = await db.reminder.create({
        data: {
          type: data.type,
          title: data.title,
          description: data.description ?? null,
          dueDate: new Date(data.due_date),
          repeat: data.repeat,
          completed: false,
        },
      })

      // Add contact associations
      if (data.contact_ids && data.contact_ids.length > 0) {
        await db.reminderContact.createMany({
          data: data.contact_ids.map(contactId => ({ 
            reminderId: reminder.id, 
            contactId 
          })),
        })
      }

      // Add family associations
      if (data.family_ids && data.family_ids.length > 0) {
        await db.reminderFamily.createMany({
          data: data.family_ids.map(familyId => ({ 
            reminderId: reminder.id, 
            familyId 
          })),
        })
      }

      return reminder.id
    } catch (error) {
      console.error('Error creating reminder:', error)
      throw new Error('Failed to create reminder')
    }
  })

/**
 * Update an existing reminder
 */
export const updateReminder = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => 
    z.object({
      id: z.number().int().positive(),
      ...ReminderSchema.shape,
    }).parse(data)
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await db.reminder.update({
        where: { id: data.id },
        data: {
          type: data.type,
          title: data.title,
          description: data.description ?? null,
          dueDate: new Date(data.due_date),
          repeat: data.repeat,
        },
      })

      // Update contact associations
      await db.reminderContact.deleteMany({ where: { reminderId: data.id } })
      if (data.contact_ids && data.contact_ids.length > 0) {
        await db.reminderContact.createMany({
          data: data.contact_ids.map(contactId => ({ 
            reminderId: data.id, 
            contactId 
          })),
        })
      }

      // Update family associations
      await db.reminderFamily.deleteMany({ where: { reminderId: data.id } })
      if (data.family_ids && data.family_ids.length > 0) {
        await db.reminderFamily.createMany({
          data: data.family_ids.map(familyId => ({ 
            reminderId: data.id, 
            familyId 
          })),
        })
      }
    } catch (error) {
      console.error('Error updating reminder:', error)
      throw new Error('Failed to update reminder')
    }
  })

/**
 * Complete a reminder (mark as done or move to next occurrence)
 */
export const completeReminder = createServerFn({ method: 'POST' })
  .inputValidator((id: number) => z.number().int().positive().parse(id))
  .handler(async ({ data: id }): Promise<void> => {
    try {
      const reminder = await db.reminder.findUnique({ where: { id } })
      if (!reminder) throw new Error('Reminder not found')

      if (reminder.repeat === 'none') {
        // One-time reminder: mark as completed
        await db.reminder.update({
          where: { id },
          data: { 
            completed: true, 
            completedAt: new Date() 
          },
        })
      } else {
        // Recurring reminder: move to next occurrence
        const dueDate = new Date(reminder.dueDate)
        let nextDate: Date

        switch (reminder.repeat) {
          case 'weekly':
            nextDate = new Date(dueDate.setDate(dueDate.getDate() + 7))
            break
          case 'monthly':
            nextDate = new Date(dueDate.setMonth(dueDate.getMonth() + 1))
            break
          case 'quarterly':
            nextDate = new Date(dueDate.setMonth(dueDate.getMonth() + 3))
            break
          case 'yearly':
            nextDate = new Date(dueDate.setFullYear(dueDate.getFullYear() + 1))
            break
          default:
            nextDate = dueDate
        }

        await db.reminder.update({
          where: { id },
          data: { dueDate: nextDate },
        })
      }
    } catch (error) {
      console.error('Error completing reminder:', error)
      throw new Error('Failed to complete reminder')
    }
  })

/**
 * Delete a reminder
 */
export const deleteReminder = createServerFn({ method: 'POST' })
  .inputValidator((id: number) => z.number().int().positive().parse(id))
  .handler(async ({ data: id }): Promise<void> => {
    try {
      await db.reminder.delete({ where: { id } })
    } catch (error) {
      console.error('Error deleting reminder:', error)
      throw new Error('Failed to delete reminder')
    }
  })

/**
 * Helper function to create reminder from date (for birthdays/anniversaries)
 */
export const createReminderFromDate = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => 
    z.object({
      contactId: z.number().int().positive(),
      dateStr: z.string(),
      type: z.enum(['birthday', 'wedding_anniversary', 'visit', 'call', 'other']),
      title: z.string(),
    }).parse(data)
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      const thisYear = new Date().getFullYear()
      const date = new Date(data.dateStr)
      const dueDate = new Date(thisYear, date.getMonth(), date.getDate())

      // If the date has already passed this year, set it for next year
      if (dueDate < new Date()) {
        dueDate.setFullYear(thisYear + 1)
      }

      const reminder = await db.reminder.create({
        data: {
          type: data.type,
          title: data.title,
          dueDate,
          repeat: 'yearly',
          completed: false,
        },
      })

      await db.reminderContact.create({
        data: { reminderId: reminder.id, contactId: data.contactId },
      })
    } catch (error) {
      console.error('Error creating reminder from date:', error)
      throw new Error('Failed to create reminder from date')
    }
  })

/**
 * Get reminders for a specific month
 */
const getRemindersForMonthSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
})

export const getRemindersForMonth = createServerFn({ method: 'GET' })
  .inputValidator(getRemindersForMonthSchema)
  .handler(async ({ data }): Promise<ReminderFlat[]> => {
    try {
      const startDate = new Date(data.year, data.month - 1, 1)
      const endDate = new Date(data.year, data.month, 0, 23, 59, 59)

      const reminders = await db.reminder.findMany({
        where: {
          completed: false,
          dueDate: { gte: startDate, lte: endDate },
        },
        include: {
          contacts: { include: { contact: true } },
          families: { include: { family: true } },
        },
        orderBy: { dueDate: 'asc' },
      })

      return reminders.map(flattenReminder)
    } catch (error) {
      console.error('Error fetching reminders for month:', error)
      return []
    }
  })


