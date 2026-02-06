"use client"

import { Phone, Heart, Gift, Users, Calendar, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReminderFlat } from '@/server/reminders'
import { completeReminder } from '@/server/reminders'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

const typeConfig = {
  birthday: { icon: Gift, color: 'bg-chart-3/15 text-chart-3', label: 'Birthday' },
  wedding_anniversary: { icon: Heart, color: 'bg-destructive/15 text-destructive', label: 'Anniversary' },
  call: { icon: Phone, color: 'bg-accent/15 text-accent', label: 'Call' },
  visit: { icon: Users, color: 'bg-chart-5/15 text-chart-5', label: 'Visit' },
  other: { icon: Calendar, color: 'bg-muted text-muted-foreground', label: 'Other' },
}

interface ReminderCardProps {
  reminder: ReminderFlat
  showComplete?: boolean
}

export function ReminderCard({ reminder, showComplete = true }: ReminderCardProps) {
  const router = useRouter()
  const config = typeConfig[reminder.type] || typeConfig.other
  const Icon = config.icon

  const dueDate = new Date(reminder.due_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const getDueDateText = () => {
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `In ${diffDays} days`
    return dueDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  }

  async function handleComplete() {
    try {
      await completeReminder(reminder.id)
      toast.success(reminder.repeat === 'none' ? 'Reminder completed' : 'Moved to next occurrence')
      router.invalidate()
    } catch (error) {
      toast.error('Failed to complete reminder')
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200',
        reminder.completed && 'opacity-60',
        diffDays < 0 && 'border-destructive/30 bg-destructive/5',
      )}
    >
      <div className={cn('p-2.5 rounded-xl', config.color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('font-semibold text-card-foreground truncate', reminder.completed && 'line-through')}>
          {reminder.title}
        </p>
        {(reminder.contact_names?.length || reminder.family_names?.length) && (
          <p className="text-sm text-muted-foreground truncate">
            {reminder.family_names?.filter(Boolean).join(', ')}
            {reminder.family_names?.length && reminder.contact_names?.length ? ', ' : ''}
            {reminder.contact_names?.filter(Boolean).join(', ')}
          </p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <p
            className={cn(
              'text-xs font-medium',
              diffDays < 0 ? 'text-destructive' : diffDays === 0 ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {getDueDateText()}
          </p>
          {reminder.repeat !== 'none' && (
            <span className="text-xs text-muted-foreground">
              • Repeats {reminder.repeat}
            </span>
          )}
        </div>
      </div>
      {!reminder.completed && showComplete && (
        <button
          onClick={handleComplete}
          className="p-2.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          aria-label="Complete reminder"
        >
          <Check className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
