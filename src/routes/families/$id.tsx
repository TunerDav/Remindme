import { createFileRoute, notFound } from '@tanstack/react-router'
import { getFamilyById } from '@/server/families'
import { getFamilyTags } from '@/server/tags'
import { FamilyDetail } from '@/components/family-detail'

export const Route = createFileRoute('/families/$id')({
  loader: async ({ params }) => {
    const id = Number(params.id)
    if (isNaN(id)) throw notFound()

    const [family, tags] = await Promise.all([
      getFamilyById(id),
      getFamilyTags({ data: { familyId: id } }),
    ])

    if (!family) throw notFound()

    return { family, tags }
  },
  component: FamilyDetailPage,
  notFoundComponent: () => <div>Family not found</div>,
})

function FamilyDetailPage() {
  const { family, tags } = Route.useLoaderData()
  return <FamilyDetail family={family} tags={tags} />
}
