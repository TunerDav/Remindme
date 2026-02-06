import { createFileRoute, notFound } from '@tanstack/react-router'
import { getContactById } from '@/server/contacts'
import { getContactTags } from '@/server/tags'
import { PageHeader } from '@/components/page-header'
import { ContactDetail } from '@/components/contact-detail'

export const Route = createFileRoute('/contacts/$id')({
  loader: async ({ params }) => {
    const contactId = parseInt(params.id)
    const [contact, tags] = await Promise.all([
      getContactById({ data: { id: contactId } }),
      getContactTags({ data: { contactId } }),
    ])

    if (!contact) {
      throw notFound()
    }

    return { contact, tags }
  },
  component: ContactPage,
})

function ContactPage() {
  const { contact, tags } = Route.useLoaderData()

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Kontakt" showBack />
      <ContactDetail contact={contact} tags={tags} />
    </div>
  )
}
