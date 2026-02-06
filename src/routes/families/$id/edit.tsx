import { createFileRoute, notFound } from '@tanstack/react-router'
import { getFamilyById } from '@/server/families'
import { getCongregations } from '@/server/contacts'
import { getTags, getFamilyTags } from '@/server/tags'
import { PageHeader } from '@/components/page-header'
import { FamilyForm } from '@/components/family-form'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/families/$id/edit')({
  loader: async ({ params }) => {
    const id = Number(params.id)
    if (isNaN(id)) throw notFound()

    const [family, congregations, allTags, familyTags] = await Promise.all([
      getFamilyById(id),
      getCongregations(),
      getTags(),
      getFamilyTags({ data: { familyId: id } }),
    ])

    if (!family) throw notFound()

    return { family, congregations, allTags, familyTags }
  },
  component: EditFamilyPage,
  notFoundComponent: () => <div>Family not found</div>,
})

function EditFamilyPage() {
  const { family, congregations, allTags, familyTags } = Route.useLoaderData()

  return (
    <div className="pb-20">
      <PageHeader
        title="Edit Family"
        subtitle={`Update ${family.name}`}
      />

      <div className="container max-w-2xl py-6">
        <Card>
          <CardContent className="pt-6">
            <FamilyForm
              family={family}
              congregations={congregations}
              tags={allTags}
              initialTags={familyTags}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
