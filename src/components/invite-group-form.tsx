import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Card } from './ui/card'
import { Checkbox } from './ui/checkbox'
import { Loader2, Search, X } from 'lucide-react'
import { getContactsWithTags } from '../server/contacts'
import { getFamilies } from '../server/families'
import type { InviteGroupWithMembers } from '../server/invite-groups'

type InviteGroupFormProps = {
  initialData?: InviteGroupWithMembers
  onSubmit: (data: {
    name: string
    familyId?: number
    notes?: string
    memberIds: number[]
  }) => Promise<InviteGroupWithMembers>
}

export function InviteGroupForm({ initialData, onSubmit }: InviteGroupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(initialData?.name ?? '')
  const [familyId, setFamilyId] = useState<string>(
    initialData?.familyId?.toString() ?? ''
  )
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(
    new Set(initialData?.members.map(m => m.contactId) ?? [])
  )
  const [searchQuery, setSearchQuery] = useState('')

  // For simplicity, we'll load contacts and families on mount
  // In a real app, you might want to use React Query or similar
  const [contacts, setContacts] = useState<any[]>([])
  const [families, setFamilies] = useState<any[]>([])

  useEffect(() => {
    getContactsWithTags().then(setContacts)
    getFamilies().then(setFamilies)
  }, [])

  const filteredContacts = contacts.filter(
    contact =>
      contact.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleMember = (contactId: number) => {
    setSelectedMemberIds(prev => {
      const next = new Set(prev)
      if (next.has(contactId)) {
        next.delete(contactId)
      } else {
        next.add(contactId)
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedMemberIds.size === 0) {
      alert('Bitte wähle mindestens ein Mitglied aus.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        familyId: familyId ? parseInt(familyId) : undefined,
        notes: notes || undefined,
        memberIds: Array.from(selectedMemberIds),
      })
    } catch (error) {
      console.error('Error submitting invite group:', error)
      alert('Fehler beim Speichern der Gruppe')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name der Gruppe *</Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="z.B. Ehepaar Schmidt"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="family">Familie (optional)</Label>
          <Select value={familyId} onValueChange={setFamilyId}>
            <SelectTrigger id="family">
              <SelectValue placeholder="Familie auswählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Keine Familie</SelectItem>
              {families.map(family => (
                <SelectItem key={family.id} value={family.id.toString()}>
                  {family.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notizen</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Optional: Zusätzliche Informationen..."
            rows={3}
          />
        </div>
      </Card>

      {/* Member Selection */}
      <Card className="p-4 space-y-4">
        <div>
          <Label htmlFor="search">Mitglieder auswählen *</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Kontakte durchsuchen..."
              className="pl-9"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Keine Kontakte gefunden
            </p>
          ) : (
            filteredContacts.map(contact => (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Checkbox
                  id={`contact-${contact.id}`}
                  checked={selectedMemberIds.has(contact.id)}
                  onCheckedChange={() => handleToggleMember(contact.id)}
                />
                <Label
                  htmlFor={`contact-${contact.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary text-sm font-medium shrink-0">
                      {contact.photo_url ? (
                        <img
                          src={contact.photo_url}
                          alt={`${contact.first_name} ${contact.last_name}`}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        `${contact.first_name[0]}${contact.last_name[0]}`
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {contact.first_name} {contact.last_name}
                      </p>
                      {contact.family_name && (
                        <p className="text-xs text-muted-foreground">
                          {contact.family_name}
                        </p>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            ))
          )}
        </div>

        {selectedMemberIds.size > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedMemberIds.size}{' '}
              {selectedMemberIds.size === 1 ? 'Mitglied' : 'Mitglieder'}{' '}
              ausgewählt
            </p>
          </div>
        )}
      </Card>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting || selectedMemberIds.size === 0}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Speichern...
            </>
          ) : (
            'Gruppe speichern'
          )}
        </Button>
      </div>
    </form>
  )
}
