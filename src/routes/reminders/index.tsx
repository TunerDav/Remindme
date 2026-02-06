import { createFileRoute, Link } from '@tanstack/react-router'
import { getReminders } from '@/server/reminders'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { ReminderList } from '@/components/reminder-list'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, CheckCircle2, Clock } from 'lucide-react'
import { useMemo } from 'react'

export const Route = createFileRoute('/reminders/')({
  loader: async () => {
    const reminders = await getReminders()
    return { reminders }
  },
  component: RemindersPage,
})

function RemindersPage() {
  const { reminders } = Route.useLoaderData()

  const { active, completed, overdue } = useMemo(() => {
    const now = new Date()
    return {
      active: reminders.filter(r => !r.completed && new Date(r.due_date) >= now),
      completed: reminders.filter(r => r.completed),
      overdue: reminders.filter(r => !r.completed && new Date(r.due_date) < now),
    }
  }, [reminders])

  return (
    <div className="pb-20">
      <PageHeader
        title="Reminders"
        subtitle={`${reminders.length} total`}
        action={
          <Link to="/reminders/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Reminder
            </Button>
          </Link>
        }
      />

      <div className="container max-w-4xl py-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="gap-2">
              <Clock className="h-4 w-4" />
              Active ({active.length})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="gap-2">
              <Clock className="h-4 w-4 text-destructive" />
              Overdue ({overdue.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed ({completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {active.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No active reminders"
                description="All your reminders are complete"
              />
            ) : (
              <ReminderList reminders={active} />
            )}
          </TabsContent>

          <TabsContent value="overdue" className="mt-6">
            {overdue.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No overdue reminders"
                description="You're all caught up!"
              />
            ) : (
              <ReminderList reminders={overdue} showOverdue />
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completed.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No completed reminders"
                description="Completed reminders will appear here"
              />
            ) : (
              <ReminderList reminders={completed} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
