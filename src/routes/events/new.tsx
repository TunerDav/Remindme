import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PageHeader } from '../../components/page-header'
import { EventTemplateForm } from '../../components/event-template-form'
import { createEventTemplate } from '../../server/events'
import type { EventTemplateFlat } from '../../server/events'

export const Route = createFileRoute('/events/new')({
  component: NewEventPage,
})

function NewEventPage() {
  const navigate = useNavigate()

  const handleSubmit = async (data: {
    name: string
    description?: string
    category?: string
    recurrenceType: string
    recurrenceInterval: number
    recurrenceDayOfWeek?: number
    recurrenceDayOfMonth?: number
    recurrenceWeekOfMonth?: number
    timeOfDay?: string
    maxAttendees: number
    active: boolean
  }): Promise<EventTemplateFlat> => {
    const template = await createEventTemplate({ data })
    await navigate({ to: '/events' })
    return template
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Neues Event" showBack />
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <EventTemplateForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
