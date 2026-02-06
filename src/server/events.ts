import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/db'

// ============================================
// Types
// ============================================

export type EventTemplateFlat = {
  id: number
  name: string
  description: string | null
  category: string | null
  recurrence_type: 'weekly' | 'monthly'
  recurrence_interval: number
  recurrence_day_of_week: number | null
  recurrence_day_of_month: number | null
  recurrence_week_of_month: number | null
  time_of_day: string | null
  max_attendees: number | null
  active: boolean
  created_at: string
  updated_at: string
}

export type EventSlotFlat = {
  id: number
  event_template_id: number
  event_template_name: string
  event_template_category: string | undefined
  slot_date: string
  slot_time: string | null
  status: 'available' | 'assigned' | 'completed' | 'cancelled'
  attendee_count: number
  created_at: string
}

// ============================================
// Helper Functions
// ============================================

function toTimeStr(date: Date | null): string | null {
  if (!date) return null
  return date.toISOString().split('T')[1].substring(0, 5)
}

function toDateStr(date: Date | null): string | null {
  if (!date) return null
  return date.toISOString().split('T')[0]
}

function flattenEventTemplate(t: any): EventTemplateFlat {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    recurrence_type: t.recurrenceType,
    recurrence_interval: t.recurrenceInterval,
    recurrence_day_of_week: t.recurrenceDayOfWeek,
    recurrence_day_of_month: t.recurrenceDayOfMonth,
    recurrence_week_of_month: t.recurrenceWeekOfMonth,
    time_of_day: toTimeStr(t.timeOfDay),
    max_attendees: t.maxAttendees,
    active: t.active,
    created_at: t.createdAt?.toISOString?.() ?? '',
    updated_at: t.updatedAt?.toISOString?.() ?? '',
  }
}

function getNthWeekdayOfMonth(
  year: number,
  month: number,
  dayOfWeek: number,
  weekOfMonth: number
): Date | null {
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay()
  
  let daysToAdd = dayOfWeek - firstDayOfWeek
  if (daysToAdd < 0) daysToAdd += 7
  
  const targetDate = new Date(year, month, 1 + daysToAdd + (weekOfMonth - 1) * 7)
  
  if (targetDate.getMonth() !== month) return null
  return targetDate
}

// ============================================
// Server Functions - Event Templates
// ============================================

/**
 * Get all event templates
 */
export const getEventTemplates = createServerFn({ method: 'GET' })
  .handler(async (): Promise<EventTemplateFlat[]> => {
    try {
      const templates = await db.eventTemplate.findMany({
        orderBy: [{ active: 'desc' }, { name: 'asc' }],
      })
      return templates.map(flattenEventTemplate)
    } catch (error) {
      console.error('Error fetching event templates:', error)
      return []
    }
  })

/**
 * Get event template by ID
 */
export const getEventTemplate = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => z.number().int().positive().parse(id))
  .handler(async ({ data: id }): Promise<EventTemplateFlat | null> => {
    try {
      const template = await db.eventTemplate.findUnique({ where: { id } })
      return template ? flattenEventTemplate(template) : null
    } catch (error) {
      console.error('Error fetching event template:', error)
      return null
    }
  })

/**
 * Create event template
 */
const EventTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  recurrence_type: z.enum(['weekly', 'monthly']),
  recurrence_interval: z.number().int().positive().default(1),
  recurrence_day_of_week: z.number().int().min(0).max(6).optional(),
  recurrence_day_of_month: z.number().int().min(1).max(31).optional(),
  recurrence_week_of_month: z.number().int().min(1).max(5).optional(),
  time_of_day: z.string().optional(),
  max_attendees: z.number().int().positive().optional(),
  active: z.boolean().default(true),
})

export const createEventTemplate = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => EventTemplateSchema.parse(data))
  .handler(async ({ data }): Promise<number> => {
    try {
      // Convert time string to Date if provided
      let timeOfDay: Date | null = null
      if (data.time_of_day) {
        const [hours, minutes] = data.time_of_day.split(':')
        timeOfDay = new Date()
        timeOfDay.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      }

      const template = await db.eventTemplate.create({
        data: {
          name: data.name,
          description: data.description ?? null,
          category: data.category ?? null,
          recurrenceType: data.recurrence_type,
          recurrenceInterval: data.recurrence_interval,
          recurrenceDayOfWeek: data.recurrence_day_of_week ?? null,
          recurrenceDayOfMonth: data.recurrence_day_of_month ?? null,
          recurrenceWeekOfMonth: data.recurrence_week_of_month ?? null,
          timeOfDay,
          maxAttendees: data.max_attendees ?? null,
          active: data.active,
        },
      })

      // Auto-generate slots for next 3 months
      await generateEventSlotsInternal(template.id, 3)

      return template.id
    } catch (error) {
      console.error('Error creating event template:', error)
      throw new Error('Failed to create event template')
    }
  })

/**
 * Update event template
 */
export const updateEventTemplate = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({
      id: z.number().int().positive(),
      ...EventTemplateSchema.shape,
    }).parse(data)
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      let timeOfDay: Date | null = null
      if (data.time_of_day) {
        const [hours, minutes] = data.time_of_day.split(':')
        timeOfDay = new Date()
        timeOfDay.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      }

      await db.eventTemplate.update({
        where: { id: data.id },
        data: {
          name: data.name,
          description: data.description ?? null,
          category: data.category ?? null,
          recurrenceType: data.recurrence_type,
          recurrenceInterval: data.recurrence_interval,
          recurrenceDayOfWeek: data.recurrence_day_of_week ?? null,
          recurrenceDayOfMonth: data.recurrence_day_of_month ?? null,
          recurrenceWeekOfMonth: data.recurrence_week_of_month ?? null,
          timeOfDay,
          maxAttendees: data.max_attendees ?? null,
          active: data.active,
        },
      })
    } catch (error) {
      console.error('Error updating event template:', error)
      throw new Error('Failed to update event template')
    }
  })

/**
 * Delete event template
 */
export const deleteEventTemplate = createServerFn({ method: 'POST' })
  .inputValidator((id: number) => z.number().int().positive().parse(id))
  .handler(async ({ data: id }): Promise<void> => {
    try {
      await db.eventTemplate.delete({ where: { id } })
    } catch (error) {
      console.error('Error deleting event template:', error)
      throw new Error('Failed to delete event template')
    }
  })

// ============================================
// Server Functions - Event Slots
// ============================================

/**
 * Generate event slots from template
 */
async function generateEventSlotsInternal(templateId: number, months: number = 3): Promise<number> {
  const template = await db.eventTemplate.findUnique({ where: { id: templateId } })
  if (!template) return 0

  const today = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + months)

  const slots: { date: Date; time: Date | null }[] = []

  if (template.recurrenceType === 'weekly') {
    const currentDate = new Date(today)
    const targetDayOfWeek = template.recurrenceDayOfWeek ?? 0
    
    while (currentDate.getDay() !== targetDayOfWeek) {
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    while (currentDate <= endDate) {
      slots.push({ date: new Date(currentDate), time: template.timeOfDay })
      currentDate.setDate(currentDate.getDate() + 7 * (template.recurrenceInterval || 1))
    }
  } else if (template.recurrenceType === 'monthly') {
    if (template.recurrenceWeekOfMonth !== null && template.recurrenceDayOfWeek !== null) {
      // Nth weekday of month (e.g., "2nd Friday")
      const currentDate = new Date(today.getFullYear(), today.getMonth(), 1)
      
      while (currentDate <= endDate) {
        const nthWeekdayDate = getNthWeekdayOfMonth(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          template.recurrenceDayOfWeek,
          template.recurrenceWeekOfMonth
        )
        
        if (nthWeekdayDate && nthWeekdayDate >= today && nthWeekdayDate <= endDate) {
          slots.push({ date: nthWeekdayDate, time: template.timeOfDay })
        }
        
        currentDate.setMonth(currentDate.getMonth() + (template.recurrenceInterval || 1))
      }
    } else {
      // Fixed day of month
      const targetDay = template.recurrenceDayOfMonth || 1
      const currentDate = new Date(today.getFullYear(), today.getMonth(), targetDay)
      
      if (currentDate < today) {
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
      
      while (currentDate <= endDate) {
        slots.push({ date: new Date(currentDate), time: template.timeOfDay })
        currentDate.setMonth(currentDate.getMonth() + (template.recurrenceInterval || 1))
      }
    }
  }

  let createdCount = 0
  for (const slot of slots) {
    try {
      await db.eventSlot.create({
        data: {
          eventTemplateId: templateId,
          slotDate: slot.date,
          slotTime: slot.time,
          status: 'available',
        },
      })
      createdCount++
    } catch {
      // Unique constraint violation - slot already exists
    }
  }

  return createdCount
}

export const generateEventSlots = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({
      templateId: z.number().int().positive(),
      months: z.number().int().positive().default(3),
    }).parse(data)
  )
  .handler(async ({ data }): Promise<number> => {
    return await generateEventSlotsInternal(data.templateId, data.months)
  })

/**
 * Get upcoming event slots
 */
export const getUpcomingSlots = createServerFn({ method: 'GET' })
  .inputValidator((limit?: number) => z.number().int().positive().optional().parse(limit))
  .handler(async ({ data: limit = 20 }): Promise<EventSlotFlat[]> => {
    try {
      const now = new Date()
      const slots = await db.eventSlot.findMany({
        where: {
          slotDate: { gte: now },
          template: { active: true },
        },
        include: {
          template: true,
          _count: { select: { contacts: true } },
        },
        orderBy: [{ slotDate: 'asc' }, { slotTime: 'asc' }],
        take: limit,
      })

      return slots.map(slot => ({
        id: slot.id,
        event_template_id: slot.eventTemplateId,
        event_template_name: slot.template.name,
        event_template_category: slot.template.category ?? undefined,
        slot_date: toDateStr(slot.slotDate) ?? '',
        slot_time: toTimeStr(slot.slotTime),
        status: slot.status,
        attendee_count: slot._count.attendees,
        created_at: slot.createdAt?.toISOString?.() ?? '',
      }))
    } catch (error) {
      console.error('Error fetching upcoming slots:', error)
      return []
    }
  })

/**
 * Assign contacts/families to an event slot
 */
export const assignToSlot = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({
      slotId: z.number().int().positive(),
      contactIds: z.array(z.number()).optional(),
      familyIds: z.array(z.number()).optional(),
    }).parse(data)
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      // Clear existing assignments
      await db.eventSlotContact.deleteMany({ where: { eventSlotId: data.slotId } })

      // Add contact assignments
      if (data.contactIds && data.contactIds.length > 0) {
        for (const contactId of data.contactIds) {
          await db.eventSlotContact.create({
            data: { 
              eventSlotId: data.slotId, 
              contactId, 
              familyId: null, 
              response: 'pending' 
            },
          })
        }
      }

      // Add family assignments
      if (data.familyIds && data.familyIds.length > 0) {
        for (const familyId of data.familyIds) {
          const firstMember = await db.contact.findFirst({ where: { familyId } })
          if (firstMember) {
            await db.eventSlotContact.create({
              data: { 
                eventSlotId: data.slotId, 
                contactId: firstMember.id, 
                familyId, 
                response: 'pending' 
              },
            })
          }
        }
      }

      // Update slot status
      if (data.contactIds?.length || data.familyIds?.length) {
        await db.eventSlot.update({ 
          where: { id: data.slotId }, 
          data: { status: 'assigned' } 
        })
      }
    } catch (error) {
      console.error('Error assigning to slot:', error)
      throw new Error('Failed to assign to slot')
    }
  })

