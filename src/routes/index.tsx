import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Bell,
  Users,
  Heart,
  Calendar,
  ArrowRight,
  Sparkles,
  CalendarClock,
  Cake,
} from 'lucide-react'
import { getStats, getUpcomingBirthdays } from '../server/dashboard'
import { getOverdueReminders, getUpcomingReminders } from '../server/reminders'
import { getUpcomingSlots } from '../server/events'
import { ReminderCard } from '../components/reminder-card'
import { EmptyState } from '../components/empty-state'
import { EventSlotCard } from '../components/event-slot-card'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [stats, overdueReminders, upcomingReminders, upcomingSlots, birthdays] =
      await Promise.all([
        getStats(),
        getOverdueReminders(),
        getUpcomingReminders({ data: 14 }),
        getUpcomingSlots({ data: 3 }),
        getUpcomingBirthdays({ data: { days: 14 } }),
      ])

    return {
      stats,
      overdueReminders,
      upcomingReminders,
      upcomingSlots,
      birthdays,
    }
  },
  component: HomePage,
})

function HomePage() {
  const { stats, overdueReminders, upcomingReminders, upcomingSlots, birthdays } =
    Route.useLoaderData()

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header with gradient */}
      <header className="bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground px-4 pt-12 pb-8 rounded-b-[2rem]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium text-primary-foreground/80">
              RemindMe
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Guten Tag!</h1>
          <p className="text-primary-foreground/80 text-sm">
            Pflege deine Beziehungen und vergiss keine wichtigen Termine.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-3 text-center">
              <Users className="h-5 w-5 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats.contacts}</p>
              <p className="text-xs text-primary-foreground/80">Menschen</p>
            </div>
            <div className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-3 text-center">
              <Bell className="h-5 w-5 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats.reminders}</p>
              <p className="text-xs text-primary-foreground/80">Offen</p>
            </div>
            <div
              className={`bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-3 text-center ${
                stats.overdue > 0 ? 'ring-2 ring-destructive/50' : ''
              }`}
            >
              <Heart className="h-5 w-5 mx-auto mb-1" />
              <p className="text-2xl font-bold text-primary-foreground">
                {stats.overdue}
              </p>
              <p className="text-xs text-primary-foreground/80">Überfällig</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Overdue Reminders - Priority */}
        {overdueReminders.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-destructive flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Überfällig
              </h2>
              <Link
                to="/reminders"
                className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
              >
                Alle <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {overdueReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Birthdays */}
        {birthdays.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Cake className="h-5 w-5 text-chart-3" />
                Anstehende Geburtstage
              </h2>
            </div>
            <div className="space-y-2">
              {birthdays.map((birthday) => (
                <Link
                  key={birthday.id}
                  to="/contacts/$id"
                  params={{ id: birthday.id.toString() }}
                >
                  <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/20 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-chart-3/20 to-chart-3/10 flex items-center justify-center text-chart-3 font-medium shrink-0">
                      {birthday.photoUrl ? (
                        <img
                          src={birthday.photoUrl}
                          alt={`${birthday.firstName} ${birthday.lastName}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        `${birthday.firstName[0]}${birthday.lastName[0]}`
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-card-foreground truncate">
                        {birthday.firstName} {birthday.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(birthday.birthday).toLocaleDateString(
                          'de-DE',
                          { day: 'numeric', month: 'long' }
                        )}
                      </p>
                    </div>
                    <div
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        birthday.daysUntil === 0
                          ? 'bg-chart-3 text-white'
                          : birthday.daysUntil === 1
                            ? 'bg-chart-3/20 text-chart-3'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {birthday.daysUntil === 0
                        ? 'Heute!'
                        : birthday.daysUntil === 1
                          ? 'Morgen'
                          : `in ${birthday.daysUntil} Tagen`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Event Slots */}
        {upcomingSlots.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" />
                Nächste Termine
              </h2>
              <Link
                to="/events/upcoming"
                className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
              >
                Alle <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingSlots.map((slot) => (
                <EventSlotCard key={slot.id} slot={slot} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Reminders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Anstehend
            </h2>
            <Link
              to="/reminders"
              className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
            >
              Alle <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {upcomingReminders.length > 0 ? (
            <div className="space-y-3">
              {upcomingReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="h-6 w-6 text-muted-foreground" />}
              title="Keine anstehenden Erinnerungen"
              description="Erstelle eine Erinnerung um nichts zu vergessen"
              action={
                <Link to="/reminders/new">
                  <Button variant="ghost" size="sm">
                    Erinnerung erstellen
                  </Button>
                </Link>
              }
            />
          )}
        </section>
      </main>
    </div>
  )
}
