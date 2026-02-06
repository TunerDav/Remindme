import { createFileRoute } from '@tanstack/react-router'
import { getTags } from '@/server/tags'
import { TagManager } from '@/components/tag-manager'

export const Route = createFileRoute('/settings')({
  loader: async () => {
    const tags = await getTags()
    return { tags }
  },
  component: SettingsPage,
})

function SettingsPage() {
  const { tags } = Route.useLoaderData()

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
        <p className="text-muted-foreground mt-2">
          Verwalte Tags und andere Einstellungen
        </p>
      </div>

      <TagManager initialTags={tags} />
    </div>
  )
}

