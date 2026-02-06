import { createFileRoute, Link } from '@tanstack/react-router'
import { getFamiliesWithTags } from '@/server/families'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { FamilyCard } from '@/components/family-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'

const searchSchema = z.object({
  q: z.string().optional(),
})

export const Route = createFileRoute('/families/')({
  validateSearch: searchSchema,
  loader: async () => {
    const families = await getFamiliesWithTags()
    return { families }
  },
  component: FamiliesPage,
})

function FamiliesPage() {
  const { families } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const { q = '' } = Route.useSearch()
  const [searchQuery, setSearchQuery] = useState(q)

  const filteredFamilies = families.filter(family => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      family.name.toLowerCase().includes(query) ||
      family.address?.toLowerCase().includes(query) ||
      family.congregation_name?.toLowerCase().includes(query) ||
      family.tags.some(tag => tag.name.toLowerCase().includes(query))
    )
  })

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    navigate({
      search: (prev) => ({ ...prev, q: value || undefined }),
    })
  }

  return (
    <div className="pb-20">
      <PageHeader
        title="Families"
        subtitle={`${families.length} ${families.length === 1 ? 'family' : 'families'}`}
        action={
          <Link to="/families/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Family
            </Button>
          </Link>
        }
      />

      <div className="container max-w-4xl py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search families..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Family List */}
        {filteredFamilies.length === 0 ? (
          <EmptyState
            icon={Plus}
            title={searchQuery ? 'No families found' : 'No families yet'}
            description={searchQuery ? 'Try adjusting your search' : 'Create your first family to get started'}
            action={
              !searchQuery ? (
                <Link to="/families/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Family
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredFamilies.map(family => (
              <FamilyCard key={family.id} family={family} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
