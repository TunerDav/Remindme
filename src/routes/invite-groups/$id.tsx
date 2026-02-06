import { createFileRoute, notFound, useRouter, Link } from '@tanstack/react-router'
import { getInviteGroupById, deleteInviteGroup } from '../../server/invite-groups'
import { PageHeader } from '../../components/page-header'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Edit, Trash2, Users, User } from 'lucide-react'
import { toast } from 'sonner'
import { QuickActivityDialog } from '../../components/quick-activity-dialog'

export const Route = createFileRoute('/invite-groups/$id')({
  loader: async ({ params }) => {
    const id = parseInt(params.id)
    const group = await getInviteGroupById({ data: id })

    if (!group) {
      throw notFound()
    }

    return { group }
  },
  component: InviteGroupDetailPage,
})

function InviteGroupDetailPage() {
  const { group } = Route.useLoaderData()
  const router = useRouter()

  const handleDelete = async () => {
    if (
      !confirm(
        `Möchtest du die Gruppe "${group.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
      )
    ) {
      return
    }

    try {
      await deleteInviteGroup({ data: group.id })
      toast.success('Gruppe gelöscht')
      await router.navigate({ to: '/invite-groups' })
    } catch (error) {
      toast.error('Fehler beim Löschen der Gruppe')
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title={group.name} showBack />

      <div className="px-4 py-4 max-w-3xl mx-auto space-y-6">
        {/* Group Info */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Gruppeninfo
            </h3>
            <QuickActivityDialog preselectedInviteGroupId={group.id} />
          </div>

          {group.familyName && (
            <div>
              <p className="text-sm text-muted-foreground">Familie</p>
              <p className="text-foreground">{group.familyName}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">Mitglieder</p>
            <p className="text-foreground">
              {group.memberCount} {group.memberCount === 1 ? 'Person' : 'Personen'}
            </p>
          </div>

          {group.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notizen</p>
              <p className="text-foreground whitespace-pre-wrap text-sm">
                {group.notes}
              </p>
            </div>
          )}
        </Card>

        {/* Members List */}
        {group.members.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-3">
              Mitglieder
            </h3>
            <div className="space-y-2">
              {group.members.map(member => (
                <Link
                  key={member.contactId}
                  to="/contacts/$id"
                  params={{ id: member.contactId.toString() }}
                >
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-medium shrink-0">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {member.firstName} {member.lastName}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1 rounded-xl" disabled>
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex-1 rounded-xl"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Löschen
          </Button>
        </div>
      </div>
    </div>
  )
}
