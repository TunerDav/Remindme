import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getContactById } from '../../../server/contacts'
import { getCongregations, getPeopleGrouped } from '../../../server/contacts'
import { getTags, getContactTags } from '../../../server/tags'
import { getFamilies } from '../../../server/families'
import { ContactForm } from '../../../components/contact-form'
import { PageHeader } from '../../../components/page-header'

export const Route = createFileRoute('/contacts/$id/edit')({
  loader: async ({ params }) => {
    const id = Number(params.id)
    const [contact, congregations, tags, contactTags, families] =
      await Promise.all([
        getContactById({ data: { id } }),
        getCongregations(),
        getTags(),
        getContactTags({ data: { contactId: id } }),
        getFamilies(),
      ])

    if (!contact) {
      throw new Error('Contact not found')
    }

    return { contact, congregations, tags, contactTags, families }
  },
  component: EditContactPage,
})

function EditContactPage() {
  const { contact, congregations, tags, contactTags, families } =
    Route.useLoaderData()
  const router = useRouter()

  return (
    <div className="min-h-screen pb-20 bg-background">
      <PageHeader title="Kontakt bearbeiten" showBack />
      <main className="px-4 py-6 max-w-lg mx-auto">
        <ContactForm
          contact={contact}
          congregations={congregations}
          allTags={tags}
          contactTags={contactTags}
          families={families}
          onSuccess={() => {
            router.navigate({ to: '/contacts/$id', params: { id: String(contact.id) } })
          }}
        />
      </main>
    </div>
  )
}
