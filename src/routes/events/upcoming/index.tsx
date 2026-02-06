import { createFileRoute, Link } from '@tanstack/react-router'
import { getUpcomingSlots } from '@/server/events'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, Plus } from 'lucide-react'

export const Route = createFileRoute('/events/upcoming/')({
  loader: async () => {
    const slots = await getUpcomingSlots(50)
    return { slots }
  },
  component: UpcomingEventsPage,
})

function UpcomingEventsPage() {
  const { slots } = Route.useLoaderData()

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const statusColors = {
    available: 'bg-green-500/10 text-green-700 border-green-200',
    assigned: 'bg-blue-500/10 text-blue-700 border-blue-200',
    completed: 'bg-gray-500/10 text-gray-700 border-gray-200',
    cancelled: 'bg-red-500/10 text-red-700 border-red-200',
  }

  return (
    <div className="pb-20">
      <PageHeader
        title="Upcoming Events"
        subtitle={`${slots.length} ${slots.length === 1 ? 'event' : 'events'}`}
        action={
          <Link to="/events/templates">
            <Button size="sm" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Manage Templates
            </Button>
          </Link>
        }
      />

      <div className="container max-w-4xl py-6">
        {slots.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming events"
            description="Create event templates to schedule recurring events"
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
          <div className="space-y-4">
            {slots.map(slot => (
              <Card key={slot.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{slot.event_template_name}</h3>
                        <Badge 
                          variant="outline" 
                          className={statusColors[slot.status]}
                        >
                          {slot.status}
                        </Badge>
                      </div>
                      
                      {slot.event_template_category && (
                        <Badge variant="secondary" className="mb-2">
                          {slot.event_template_category}
                        </Badge>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(slot.slot_date)}</span>
                        </div>
                        
                        {slot.slot_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{slot.slot_time}</span>
                          </div>
                        )}
                        
                        {slot.attendee_count > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{slot.attendee_count} attendee{slot.attendee_count !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
