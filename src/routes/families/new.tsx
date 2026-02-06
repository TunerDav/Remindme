import { createFileRoute } from '@tanstack/react-router'
import { getCongregations } from '@/server/contacts'
import { getTags } from '@/server/tags'
import { PageHeader } from '@/components/page-header'
import { FamilyForm } from '@/components/family-form'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/families/new')({
  loader: async () => {
    const [congregations, tags] = await Promise.all([
      getCongregations(),
      getTags(),
    ])
    return { congregations, tags }
  },
  component: NewFamilyPage,
})

function NewFamilyPage() {
  const { congregations, tags } = Route.useLoaderData()

  return (
    <div className="pb-20">
      <PageHeader
        title="New Family"
        subtitle="Create a new family"
      />

      <div className="container max-w-2xl py-6">
        <Card>
          <CardContent className="pt-6">
            <FamilyForm
              congregations={congregations}
              tags={tags}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
