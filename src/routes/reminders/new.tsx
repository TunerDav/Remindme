import { createFileRoute } from '@tanstack/react-router'
import { getPeopleGrouped } from '@/server/contacts'
import { getFamiliesWithTags } from '@/server/families'
import { PageHeader } from '@/components/page-header'
import { ReminderForm } from '@/components/reminder-form'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/reminders/new')({
  loader: async () => {
    const [people, families] = await Promise.all([
      getPeopleGrouped(),
      getFamiliesWithTags(),
    ])
    return { people, families }
  },
  component: NewReminderPage,
})

function NewReminderPage() {
  const { people, families } = Route.useLoaderData()

  return (
    <div className="pb-20">
      <PageHeader
        title="New Reminder"
        subtitle="Create a new reminder"
      />

      <div className="container max-w-2xl py-6">
        <Card>
          <CardContent className="pt-6">
            <ReminderForm
              people={people}
              families={families}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
