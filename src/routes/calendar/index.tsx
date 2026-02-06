import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { getRemindersForMonth } from '../../server/reminders'
import { PageHeader } from '../../components/page-header'
import { CalendarView } from '../../components/calendar-view'

const calendarSearchSchema = z.object({
  year: z.number().int().optional(),
  month: z.number().int().min(1).max(12).optional(),
})

export const Route = createFileRoute('/calendar/')({
  validateSearch: calendarSearchSchema,
  loaderDeps: ({ search }) => ({
    year: search.year,
    month: search.month,
  }),
  loader: async ({ deps }) => {
    const now = new Date()
    const year = deps.year ?? now.getFullYear()
    const month = deps.month ?? now.getMonth() + 1

    const reminders = await getRemindersForMonth({ data: { year, month } })

    return { reminders, year, month }
  },
  component: CalendarPage,
})

function CalendarPage() {
  const { reminders, year, month } = Route.useLoaderData()
  const navigate = useNavigate({ from: '/calendar' })

  const handleMonthChange = (newYear: number, newMonth: number) => {
    navigate({
      search: { year: newYear, month: newMonth },
    })
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Kalender" showBack />
      <div className="px-4 py-4 max-w-3xl mx-auto">
        <CalendarView
          reminders={reminders}
          year={year}
          month={month}
          onMonthChange={handleMonthChange}
        />
      </div>
    </div>
  )
}
