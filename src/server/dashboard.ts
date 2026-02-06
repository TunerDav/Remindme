import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../db'

// =============================================================================
// Types
// =============================================================================

export type DashboardStats = {
  contacts: number
  families: number
  reminders: number
  overdue: number
  upcomingEvents: number
}

export type UpcomingBirthday = {
  id: number
  firstName: string
  lastName: string
  birthday: string
  daysUntil: number
  photoUrl: string | null
}

// =============================================================================
// Stats
// =============================================================================

export const getStats = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DashboardStats> => {
    const today = new Date()

    const [contacts, families, reminders, overdue, upcomingEvents] =
      await Promise.all([
        db.contact.count(),
        db.family.count(),
        db.reminder.count({ where: { completed: false } }),
        db.reminder.count({
          where: { completed: false, dueDate: { lt: today } },
        }),
        db.eventSlot.count({
          where: {
            slotDate: { gte: today },
            template: { active: true },
          },
        }),
      ])

    return { contacts, families, reminders, overdue, upcomingEvents }
  }
)

// =============================================================================
// Upcoming Birthdays
// =============================================================================

const upcomingBirthdaysSchema = z.object({
  days: z.number().min(1).max(365).default(14),
})

export const getUpcomingBirthdays = createServerFn({ method: 'POST' })
  .inputValidator(upcomingBirthdaysSchema)
  .handler(async ({ data }): Promise<UpcomingBirthday[]> => {
    const contacts = await db.contact.findMany({
      where: { birthday: { not: null } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthday: true,
        photoUrl: true,
      },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentYear = today.getFullYear()
    const result: UpcomingBirthday[] = []

    for (const c of contacts) {
      if (!c.birthday) continue

      const bday = new Date(c.birthday)
      let nextBirthday = new Date(
        currentYear,
        bday.getMonth(),
        bday.getDate()
      )

      // If birthday already passed this year, use next year
      if (nextBirthday < today) {
        nextBirthday = new Date(
          currentYear + 1,
          bday.getMonth(),
          bday.getDate()
        )
      }

      const daysUntil = Math.ceil(
        (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysUntil <= data.days) {
        result.push({
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          birthday: c.birthday.toISOString().split('T')[0],
          daysUntil: daysUntil,
          photoUrl: c.photoUrl,
        })
      }
    }

    result.sort((a, b) => a.daysUntil - b.daysUntil)
    return result
  })

