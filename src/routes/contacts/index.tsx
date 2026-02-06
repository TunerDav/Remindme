import { createFileRoute } from '@tanstack/react-router'
import { getPeopleGrouped } from '@/server/contacts'
import { PageHeader } from '@/components/page-header'
import { PeopleList } from '@/components/people-list'
import { EmptyState } from '@/components/empty-state'
import { Users, Plus, UserPlus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { z } from 'zod'

const contactsSearchSchema = z.object({
  filter: z.enum(['all', 'families', 'individuals']).optional(),
})

export const Route = createFileRoute('/contacts/')({
  validateSearch: contactsSearchSchema,
  loader: async () => {
    const data = await getPeopleGrouped()
    return { data }
  },
  component: ContactsPage,
})

function ContactsPage() {
  const { data } = Route.useLoaderData()
  const { filter = 'all' } = Route.useSearch()

  const totalCount = data.families.length + data.individuals.length

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Menschen" />

      <div className="px-4 py-2 max-w-lg mx-auto">
        {totalCount > 0 ? (
          <PeopleList data={data} initialFilter={filter} />
        ) : (
          <EmptyState
            icon={<Users className="h-6 w-6 text-muted-foreground" />}
            title="Noch keine Menschen"
            description="Füge deine ersten Menschen oder Familien hinzu"
            action={
              <div className="flex gap-2">
                <Link
                  to="/contacts/new"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Person
                </Link>
                <Link
                  to="/families/new"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Familie
                </Link>
              </div>
            }
          />
        )}
      </div>

      {/* Floating Action Button */}
      {totalCount > 0 && <AddButton />}
    </div>
  )
}

function AddButton() {
  return (
    <div className="fixed right-4 bottom-20 z-40 flex flex-col gap-2 items-end">
      <Link
        to="/families/new"
        className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-full shadow-md hover:bg-muted/80 transition-all text-sm font-medium"
      >
        <Users className="h-4 w-4" />
        Familie
      </Link>
      <Link
        to="/contacts/new"
        className="p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-200"
        aria-label="Neuen Kontakt hinzufügen"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  )
}
