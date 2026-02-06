import { createFileRoute, Link } from '@tanstack/react-router'
import { getEventTemplates } from '@/server/events'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, Clock, Users, RotateCcw } from 'lucide-react'

export const Route = createFileRoute('/events/templates/')({
  loader: async () => {
    const templates = await getEventTemplates()
    return { templates }
  },
  component: EventTemplatesPage,
})

function EventTemplatesPage() {
  const { templates } = Route.useLoaderData()

  const getRecurrenceText = (template: typeof templates[0]) => {
    if (template.recurrence_type === 'weekly') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const day = days[template.recurrence_day_of_week ?? 0]
      return `Every ${template.recurrence_interval === 1 ? '' : template.recurrence_interval + ' '}week${template.recurrence_interval > 1 ? 's' : ''} on ${day}`
    } else {
      if (template.recurrence_week_of_month && template.recurrence_day_of_week !== null) {
        const weeks = ['1st', '2nd', '3rd', '4th', '5th']
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return `${weeks[template.recurrence_week_of_month - 1]} ${days[template.recurrence_day_of_week]} of each month`
      } else {
        return `Day ${template.recurrence_day_of_month} of each month`
      }
    }
  }

  return (
    <div className="pb-20">
      <PageHeader
        title="Event Templates"
        subtitle={`${templates.length} ${templates.length === 1 ? 'template' : 'templates'}`}
        action={
          <Link to="/events/templates/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </Link>
        }
      />

      <div className="container max-w-4xl py-6">
        {templates.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No event templates"
            description="Create a template to schedule recurring events"
            action={
              <Link to="/events/templates/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map(template => (
              <Link key={template.id} to="/events/templates/$id" params={{ id: String(template.id) }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {!template.active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {template.category && (
                      <Badge variant="outline" className="w-fit">
                        {template.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {template.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RotateCcw className="h-4 w-4" />
                      <span>{getRecurrenceText(template)}</span>
                    </div>
                    {template.time_of_day && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{template.time_of_day}</span>
                      </div>
                    )}
                    {template.max_attendees && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Max {template.max_attendees} attendees</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
