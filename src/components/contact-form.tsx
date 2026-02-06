'use client'

import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Heart,
  FileText,
} from 'lucide-react'
import {
  createContact,
  updateContact,
  type ContactWithTags,
  type CongregationFlat,
} from '@/server/contacts'
import type { TagFlat } from '@/server/tags'
import type { FamilyFlat } from '@/server/families'
import { toast } from 'sonner'

interface ContactFormProps {
  contact?: ContactWithTags
  congregations: CongregationFlat[]
  allTags: TagFlat[]
  families?: FamilyFlat[]
  defaultFamilyId?: number
}

export function ContactForm({
  contact,
  congregations,
  allTags,
  families = [],
  defaultFamilyId,
}: ContactFormProps) {
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      first_name: contact?.first_name ?? '',
      last_name: contact?.last_name ?? '',
      phone: contact?.phone ?? '',
      email: contact?.email ?? '',
      address: contact?.address ?? '',
      congregation_id: contact?.congregation_id ?? undefined,
      family_id: contact?.family_id ?? defaultFamilyId ?? undefined,
      birthday: contact?.birthday ?? '',
      wedding_anniversary: contact?.wedding_anniversary ?? '',
      notes: contact?.notes ?? '',
    },
    onSubmit: async ({ value }) => {
      try {
        const data = {
          first_name: value.first_name,
          last_name: value.last_name,
          phone: value.phone || null,
          email: value.email || null,
          address: value.address || null,
          congregation_id: value.congregation_id,
          family_id: value.family_id ?? null,
          birthday: value.birthday || null,
          wedding_anniversary: value.wedding_anniversary || null,
          notes: value.notes || null,
        }

        if (contact) {
          await updateContact({ data: { ...data, id: contact.id } })
          toast.success('Kontakt aktualisiert')
          router.navigate({ to: '/contacts/$id', params: { id: String(contact.id) } })
        } else {
          const result = await createContact({ data })
          toast.success('Kontakt erstellt')
          router.navigate({ to: '/contacts' })
        }
        router.invalidate()
      } catch (error) {
        toast.error('Fehler beim Speichern')
        console.error(error)
      }
    },
  })

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
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">Name</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <form.Field name="first_name">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="first_name" className="text-muted-foreground text-xs">
                  Vorname *
                </Label>
                <Input
                  id="first_name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
            )}
          </form.Field>
          <form.Field name="last_name">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="last_name" className="text-muted-foreground text-xs">
                  Nachname *
                </Label>
                <Input
                  id="last_name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
            )}
          </form.Field>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Phone className="h-4 w-4" />
          <span className="text-sm font-medium">Kontaktdaten</span>
        </div>
        <div className="space-y-3">
          <form.Field name="phone">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-muted-foreground text-xs">
                  Telefon
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-xl"
                  placeholder="+49 123 456789"
                />
              </div>
            )}
          </form.Field>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-muted-foreground text-xs">
                  E-Mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-xl"
                  placeholder="name@beispiel.de"
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
          <span className="text-sm font-medium">Ort & Versammlung</span>
        </div>
        <div className="space-y-3">
          <form.Field name="address">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-muted-foreground text-xs">
                  Adresse
                </Label>
                <Textarea
                  id="address"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-xl resize-none"
                  rows={2}
                  placeholder="Straße, PLZ Ort"
                />
              </div>
            )}
          </form.Field>
          <form.Field name="congregation_id">
            {(field) => (
              <div className="space-y-1.5">
                <Label
                  htmlFor="congregation_id"
                  className="text-muted-foreground text-xs"
                >
                  Versammlung
                </Label>
                <Select
                  value={field.state.value?.toString() ?? ''}
                  onValueChange={(value) =>
                    field.handleChange(value ? Number(value) : null)
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Versammlung auswählen" />
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

      {/* Dates Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">Wichtige Daten</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <form.Field name="birthday">
            {(field) => (
              <div className="space-y-1.5">
                <Label
                  htmlFor="birthday"
                  className="text-muted-foreground text-xs flex items-center gap-1"
                >
                  <Calendar className="h-3 w-3" /> Geburtstag
                </Label>
                <Input
                  id="birthday"
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            )}
          </form.Field>
          <form.Field name="wedding_anniversary">
            {(field) => (
              <div className="space-y-1.5">
                <Label
                  htmlFor="wedding_anniversary"
                  className="text-muted-foreground text-xs flex items-center gap-1"
                >
                  <Heart className="h-3 w-3" /> Hochzeitstag
                </Label>
                <Input
                  id="wedding_anniversary"
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            )}
          </form.Field>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">Notizen</span>
        </div>
        <form.Field name="notes">
          {(field) => (
            <Textarea
              id="notes"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="rounded-xl resize-none"
              rows={3}
              placeholder="Persönliche Notizen, Interessen, etc."
            />
          )}
        </form.Field>
      </div>

      <Button
        type="submit"
        disabled={form.state.isSubmitting}
        className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-medium"
      >
        {form.state.isSubmitting
          ? 'Speichern...'
          : contact
            ? 'Aktualisieren'
            : 'Kontakt erstellen'}
      </Button>
    </form>
  )
}
