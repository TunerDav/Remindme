 'use client'

import { Link, useRouter } from '@tanstack/react-router'
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Edit,
  Trash2,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { deleteContact, type ContactWithTags } from '@/server/contacts'
import type { TagFlat } from '@/server/tags'
import { toast } from 'sonner'

interface ContactDetailProps {
  contact: ContactWithTags
  tags: TagFlat[]
}

export function ContactDetail({ contact, tags }: ContactDetailProps) {
  const router = useRouter()
  const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase()

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatAddress = (address: string | null) => {
    if (!address) return ''
    return address.replace(/\n/g, ', ')
  }

  const getWhatsAppLink = (phone: string | null) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\s/g, '').replace(/\+/g, '')
    return `https://wa.me/${cleaned}`
  }

  const getMapsLink = (address: string | null) => {
    if (!address) return ''
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      formatAddress(address)
    )}`
  }

  async function handleDelete() {
    if (
      !confirm(
        `${contact.first_name} ${contact.last_name} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
      )
    ) {
      return
    }

    try {
      await deleteContact({ data: { id: contact.id } })
      toast.success('Kontakt gelöscht')
      router.navigate({ to: '/contacts' })
    } catch (error) {
      toast.error('Fehler beim Löschen')
      console.error(error)
    }
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
      {/* Profile Header */}
      <div className="text-center">
        <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary text-2xl font-bold mb-3 shadow-sm">
          {contact.photo_url ? (
            <img
              src={contact.photo_url}
              alt={`${contact.first_name} ${contact.last_name}`}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {contact.first_name} {contact.last_name}
        </h2>
        {contact.congregation_name && (
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
            <MapPin className="h-3 w-3" />
            {contact.congregation_name}
          </p>
        )}
        {contact.family_name && (
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <User className="h-3 w-3" />
            {contact.family_name}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs px-2 py-0.5"
                style={{
                  borderColor: tag.color,
                  backgroundColor: `${tag.color}15`,
                  color: tag.color,
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {contact.phone && (
          <>
            <Button asChild className="flex-1 rounded-xl" variant="default">
              <a href={`tel:${contact.phone}`}>
                <Phone className="h-4 w-4 mr-2" />
                Anrufen
              </a>
            </Button>
            <Button
              asChild
              className="flex-1 rounded-xl"
              variant="outline"
            >
              <a
                href={getWhatsAppLink(contact.phone)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </Button>
          </>
        )}
      </div>

      {/* Contact Info */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">
          Kontaktdaten
        </h3>

        {contact.phone && (
          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Telefon</p>
              <a
                href={`tel:${contact.phone}`}
                className="text-foreground hover:text-primary"
              >
                {contact.phone}
              </a>
            </div>
          </div>
        )}

        {contact.email && (
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">E-Mail</p>
              <a
                href={`mailto:${contact.email}`}
                className="text-foreground hover:text-primary break-all"
              >
                {contact.email}
              </a>
            </div>
          </div>
        )}

        {contact.address && (
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Adresse</p>
              <a
                href={getMapsLink(contact.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary"
              >
                {formatAddress(contact.address)}
              </a>
            </div>
          </div>
        )}
      </Card>

      {/* Important Dates */}
      {(contact.birthday || contact.wedding_anniversary) && (
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">
            Wichtige Daten
          </h3>

          {contact.birthday && (
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Geburtstag</p>
                <p className="text-foreground">{formatDate(contact.birthday)}</p>
              </div>
            </div>
          )}

          {contact.wedding_anniversary && (
            <div className="flex items-center gap-3">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Hochzeitstag</p>
                <p className="text-foreground">
                  {formatDate(contact.wedding_anniversary)}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Notes */}
      {contact.notes && (
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">
            Notizen
          </h3>
          <p className="text-foreground whitespace-pre-wrap text-sm">
            {contact.notes}
          </p>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button
          asChild
          variant="outline"
          className="flex-1 rounded-xl"
        >
          <Link to="/contacts/$id/edit" params={{ id: String(contact.id) }}>
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Link>
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          className="flex-1 rounded-xl"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Löschen
        </Button>
      </div>
    </div>
  )
}
