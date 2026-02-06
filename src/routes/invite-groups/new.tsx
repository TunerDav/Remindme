import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PageHeader } from '../../components/page-header'
import { InviteGroupForm } from '../../components/invite-group-form'
import { createInviteGroup } from '../../server/invite-groups'
import type { InviteGroupWithMembers } from '../../server/invite-groups'

export const Route = createFileRoute('/invite-groups/new')({
  component: NewInviteGroupPage,
})

function NewInviteGroupPage() {
  const navigate = useNavigate()

  const handleSubmit = async (data: {
    name: string
    familyId?: number
    notes?: string
    memberIds: number[]
  }): Promise<InviteGroupWithMembers> => {
    const group = await createInviteGroup({ data })
    await navigate({ to: '/invite-groups/$id', params: { id: group.id.toString() } })
    return group
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Neue Einladungsgruppe" showBack />
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <InviteGroupForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
