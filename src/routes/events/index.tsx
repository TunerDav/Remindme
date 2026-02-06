import { createFileRoute, Link } from '@tanstack/react-router'
import { getEventTemplates } from '../../server/events'
import { PageHeader } from '../../components/page-header'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Plus, Calendar, Clock } from 'lucide-react'
import { EmptyState } from '../../components/empty-state'

export const Route = createFileRoute('/events/')({
  loader: async () => {
    const templates = await getEventTemplates()
    return { templates }
  },
  component: EventsPage,
})

function EventsPage() {
  const { templates } = Route.useLoaderData()

  const activeTemplates = templates.filter(t => t.active)
  const inactiveTemplates = templates.filter(t => !t.active)

  const formatRecurrence = (template: typeof templates[0]) => {
    if (template.recurrence_type === 'weekly') {
      const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
      return `Wöchentlich - ${template.recurrence_day_of_week !== null ? days[template.recurrence_day_of_week] : ''}`
    } else if (template.recurrence_type === 'monthly') {
      if (template.recurrence_day_of_month !== null) {
        return `Monatlich - ${template.recurrence_day_of_month}.`
      } else if (
        template.recurrence_week_of_month !== null &&
        template.recurrence_day_of_week !== null
      ) {
        const weeks = ['1.', '2.', '3.', '4.', 'Letzter']
        const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
        return `Monatlich - ${weeks[template.recurrence_week_of_month]} ${days[template.recurrence_day_of_week]}`
      }
    }
    return template.recurrence_type
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Event-Verwaltung" showBack>
        <Button asChild size="sm">
          <Link to="/events/new">
            <Plus className="h-4 w-4 mr-2" />
            Neues Event
          </Link>
        </Button>
      </PageHeader>

      <div className="px-4 py-4 max-w-3xl mx-auto space-y-6">
        {/* Active Templates */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Aktive Event-Vorlagen</h2>
          {activeTemplates.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Keine aktiven Events"
              description="Erstelle Event-Vorlagen, um wiederkehrende Termine zu planen."
              action={
                <Button asChild>
                  <Link to="/events/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Event erstellen
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4">
              {activeTemplates.map(template => (
                <Link
                  key={template.id}
                  to="/events/$id"
                  params={{ id: template.id.toString() }}
                >
                  <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {template.name}
                          </h3>
                          {template.category && (
                            <Badge variant="secondary">{template.category}</Badge>
                          )}
                        </div>
                        {template.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {template.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatRecurrence(template)}</span>
                          </div>
                          {template.time_of_day && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{template.time_of_day}</span>
                            </div>
                          )}
                          <span>Max. {template.max_attendees} Teilnehmer</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Inactive Templates */}
        {inactiveTemplates.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
              Inaktive Vorlagen
            </h2>
            <div className="grid gap-4 opacity-60">
              {inactiveTemplates.map(template => (
                <Link
                  key={template.id}
                  to="/events/$id"
                  params={{ id: template.id.toString() }}
                >
                  <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {template.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {formatRecurrence(template)}
                        </p>
                      </div>
                      <Badge variant="outline">Inaktiv</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
