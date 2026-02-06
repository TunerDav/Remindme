"use client"

import { useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TagSelector } from '@/components/tag-selector'
import { createFamily, updateFamily, addContactToFamily } from '@/server/families'
import { addTagToFamily, removeTagFromFamily } from '@/server/tags'
import { Users, Phone, MapPin, FileText, Tags as TagsIcon, Mail } from 'lucide-react'
import type { FamilyFlat } from '@/server/families'
import type { Congregation, Tag } from '@prisma/client'
import { toast } from 'sonner'
import { useState } from 'react'

interface FamilyFormProps {
  family?: FamilyFlat
  congregations: Congregation[]
  tags: Tag[]
  initialTags?: Tag[]
}

export function FamilyForm({ family, congregations, tags, initialTags = [] }: FamilyFormProps) {
  const router = useRouter()
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTags)

  const form = useForm({
    defaultValues: {
      name: family?.name ?? '',
      phone: family?.phone ?? '',
      email: family?.email ?? '',
      address: family?.address ?? '',
      congregation_id: family?.congregation_id ?? undefined,
      notes: family?.notes ?? '',
    },
    onSubmit: async ({ value }) => {
      try {
        let familyId: number

        if (family) {
          // Update existing family
          await updateFamily({
            id: family.id,
            name: value.name,
            phone: value.phone || undefined,
            email: value.email || undefined,
            address: value.address || undefined,
            congregation_id: value.congregation_id,
            notes: value.notes || undefined,
          })
          familyId = family.id

          // Update tags
          const currentTagIds = new Set(initialTags.map(t => t.id))
          const selectedTagIds = new Set(selectedTags.map(t => t.id))

          // Remove tags
          for (const tag of initialTags) {
            if (!selectedTagIds.has(tag.id)) {
              await removeTagFromFamily(family.id, tag.id)
            }
          }

          // Add tags
          for (const tag of selectedTags) {
            if (!currentTagIds.has(tag.id)) {
              await addTagToFamily(family.id, tag.id)
            }
          }

          toast.success('Family updated successfully')
        } else {
          // Create new family
          familyId = await createFamily({
            name: value.name,
            phone: value.phone || undefined,
            email: value.email || undefined,
            address: value.address || undefined,
            congregation_id: value.congregation_id,
            notes: value.notes || undefined,
          })

          // Add tags
          for (const tag of selectedTags) {
            await addTagToFamily(familyId, tag.id)
          }

          toast.success('Family created successfully')
        }

        router.navigate({ to: '/families/$id', params: { id: String(familyId) } })
        router.invalidate()
      } catch (error) {
        console.error('Error saving family:', error)
        toast.error('Failed to save family')
      }
    },
  })

  const handleTagToggle = (tag: Tag) => {
    setSelectedTags(prev => {
      const exists = prev.find(t => t.id === tag.id)
      if (exists) {
        return prev.filter(t => t.id !== tag.id)
      } else {
        return [...prev, tag]
      }
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-5"
    >
      {/* Name Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">Family Name</span>
        </div>
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Name is required' : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="text-muted-foreground text-xs">
                Name *
              </Label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                className="rounded-xl"
                placeholder="e.g. Smith Family"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      {/* Contact Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Phone className="h-4 w-4" />
          <span className="text-sm font-medium">Contact Information</span>
        </div>
        <div className="space-y-3">
          <form.Field name="phone">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-muted-foreground text-xs">
                  Phone (shared)
                </Label>
                <Input
                  id={field.name}
                  type="tel"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-xl"
                  placeholder="+1 234 567890"
                />
              </div>
            )}
          </form.Field>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-muted-foreground text-xs">
                  Email (shared)
                </Label>
                <Input
                  id={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-xl"
                  placeholder="name@example.com"
                />
              </div>
            )}
          </form.Field>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">Location</span>
        </div>
        <div className="space-y-3">
          <form.Field name="address">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-muted-foreground text-xs">
                  Address (shared)
                </Label>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-xl resize-none"
                  rows={2}
                  placeholder="Street, ZIP City"
                />
              </div>
            )}
          </form.Field>
          <form.Field name="congregation_id">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-muted-foreground text-xs">
                  Congregation
                </Label>
                <Select
                  value={field.state.value?.toString() ?? ''}
                  onValueChange={(value) => field.handleChange(value ? Number(value) : undefined)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select congregation" />
                  </SelectTrigger>
                  <SelectContent>
                    {congregations.map((cong) => (
                      <SelectItem key={cong.id} value={cong.id.toString()}>
                        {cong.name} {cong.city && `(${cong.city})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">Notes</span>
        </div>
        <form.Field name="notes">
          {(field) => (
            <Textarea
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="rounded-xl resize-none"
              rows={3}
              placeholder="Notes about the family..."
            />
          )}
        </form.Field>
      </div>

      {/* Tags Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <TagsIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Tags</span>
        </div>
        <TagSelector
          availableTags={tags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
        />
      </div>

      <Button
        type="submit"
        disabled={form.state.isSubmitting}
        className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-medium"
      >
        {form.state.isSubmitting ? 'Saving...' : family ? 'Update Family' : 'Create Family'}
      </Button>
    </form>
  )
}
