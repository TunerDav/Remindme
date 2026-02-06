import { createFileRoute } from '@tanstack/react-router'
import { getCongregations } from '@/server/contacts'
import { getTags } from '@/server/tags'
import { getFamilies } from '@/server/families'
import { PageHeader } from '@/components/page-header'
import { ContactForm } from '@/components/contact-form'
import { z } from 'zod'

const searchSchema = z.object({
  familyId: z.number().optional(),
})

export const Route = createFileRoute('/contacts/new')({
  validateSearch: searchSchema,
  loader: async () => {
    const [congregations, tags, families] = await Promise.all([
      getCongregations(),
      getTags(),
      getFamilies(),
    ])
    return { congregations, tags, families }
  },
  component: NewContactPage,
})

function NewContactPage() {
  const { congregations, tags, families } = Route.useLoaderData()
  const { familyId } = Route.useSearch()

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Neuer Kontakt" showBack />
      <div className="px-4 py-4 max-w-lg mx-auto">
        <ContactForm 
          congregations={congregations} 
          allTags={tags}
          families={families}
          defaultFamilyId={familyId}
        />
      </div>
    </div>
  )
}
