import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'

export const exportAllData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const [
      contacts,
      families,
      reminders,
      tags,
      interactions,
      inviteGroups,
      eventTemplates,
      eventSlots,
      congregations,
    ] = await Promise.all([
      db.contact.findMany({ include: { tags: true } }),
      db.family.findMany(),
      db.reminder.findMany({
        include: { contacts: true, families: true },
      }),
      db.tag.findMany(),
      db.interaction.findMany(),
      db.inviteGroup.findMany({ include: { members: true } }),
      db.eventTemplate.findMany(),
      db.eventSlot.findMany({ include: { contacts: true } }),
      db.congregation.findMany(),
    ])

    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        congregations,
        contacts,
        families,
        tags,
        reminders,
        interactions,
        inviteGroups,
        eventTemplates,
        eventSlots,
      },
    }
  },
)
