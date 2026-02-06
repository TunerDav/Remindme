"use client"

import { ReminderCard } from './reminder-card'
import type { ReminderFlat } from '@/server/reminders'

interface ReminderListProps {
  reminders: ReminderFlat[]
  showOverdue?: boolean
}

export function ReminderList({ reminders, showOverdue = false }: ReminderListProps) {
  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <ReminderCard 
          key={reminder.id} 
          reminder={reminder}
          showComplete={!reminder.completed}
        />
      ))}
    </div>
  )
}
