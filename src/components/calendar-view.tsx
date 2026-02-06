import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import type { ReminderFlat } from '../server/reminders'

type CalendarViewProps = {
  reminders: ReminderFlat[]
  year: number
  month: number
  onMonthChange: (year: number, month: number) => void
}

const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTH_NAMES = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
]

export function CalendarView({
  reminders,
  year,
  month,
  onMonthChange,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Get calendar days for the month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month - 1, 1).getDay()
    // Convert Sunday (0) to 7 for Monday-first week
    return day === 0 ? 7 : day
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Group reminders by date
  const remindersByDate = new Map<string, ReminderFlat[]>()
  reminders.forEach(reminder => {
    const date = reminder.due_date
    if (!remindersByDate.has(date)) {
      remindersByDate.set(date, [])
    }
    remindersByDate.get(date)!.push(reminder)
  })

  // Generate calendar grid
  const calendarDays: (number | null)[] = []
  // Add empty cells for days before month starts (Monday = 1)
  for (let i = 1; i < firstDay; i++) {
    calendarDays.push(null)
  }
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12)
    } else {
      onMonthChange(year, month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1)
    } else {
      onMonthChange(year, month + 1)
    }
  }

  const formatDateKey = (day: number) => {
    const date = new Date(year, month - 1, day)
    return date.toISOString().split('T')[0]
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getFullYear() === year &&
      today.getMonth() === month - 1 &&
      today.getDate() === day
    )
  }

  const selectedReminders =
    selectedDate !== null ? remindersByDate.get(selectedDate) ?? [] : []

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <Button variant="outline" size="sm" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday Headers */}
          {WEEKDAY_LABELS.map(label => (
            <div
              key={label}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {label}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />
            }

            const dateKey = formatDateKey(day)
            const dayReminders = remindersByDate.get(dateKey) ?? []
            const isSelected = selectedDate === dateKey
            const today = isToday(day)

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                className={`aspect-square p-1 rounded-lg border transition-colors text-sm ${
                  today
                    ? 'bg-primary/10 border-primary font-semibold'
                    : 'border-border hover:border-primary/50'
                } ${isSelected ? 'bg-primary/20 border-primary' : ''}`}
              >
                <div className="h-full flex flex-col">
                  <span className={today ? 'text-primary' : 'text-foreground'}>
                    {day}
                  </span>
                  {dayReminders.length > 0 && (
                    <div className="mt-auto flex justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Selected Day Reminders */}
      {selectedReminders.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
            Erinnerungen am{' '}
            {selectedDate
              ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('de-DE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : ''}
          </h3>
          <div className="space-y-2">
            {selectedReminders.map(reminder => (
              <div
                key={reminder.id}
                className="p-3 rounded-lg bg-accent/50 border border-border"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{reminder.title}</p>
                    {reminder.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {reminder.description}
                      </p>
                    )}
                    {reminder.contact_names && reminder.contact_names.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {reminder.contact_names.join(', ')}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">{reminder.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
