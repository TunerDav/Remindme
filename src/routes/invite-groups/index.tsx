import { createFileRoute, Link } from '@tanstack/react-router'
import { getInviteGroups } from '../../server/invite-groups'
import { PageHeader } from '../../components/page-header'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Plus, Users } from 'lucide-react'
import { EmptyState } from '../../components/empty-state'

export const Route = createFileRoute('/invite-groups/')({
  loader: async () => {
    const groups = await getInviteGroups()
    return { groups }
  },
  component: InviteGroupsPage,
})

function InviteGroupsPage() {
  const { groups } = Route.useLoaderData()

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Einladungsgruppen" showBack>
        <Button asChild size="sm">
          <Link to="/invite-groups/new">
            <Plus className="h-4 w-4 mr-2" />
            Neue Gruppe
          </Link>
        </Button>
      </PageHeader>

      <div className="px-4 py-4 max-w-3xl mx-auto">
        {groups.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Keine Einladungsgruppen"
            description="Erstelle Gruppen, um mehrere Kontakte gemeinsam zu Events einzuladen."
            action={
              <Button asChild>
                <Link to="/invite-groups/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Gruppe erstellen
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {groups.map(group => (
              <Link
                key={group.id}
                to="/invite-groups/$id"
                params={{ id: group.id.toString() }}
              >
                <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">
                        {group.name}
                      </h3>
                      {group.familyName && (
                        <p className="text-sm text-muted-foreground">
                          Familie: {group.familyName}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {group.memberCount}{' '}
                          {group.memberCount === 1 ? 'Mitglied' : 'Mitglieder'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {group.notes && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {group.notes}
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
