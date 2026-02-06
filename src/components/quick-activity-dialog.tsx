import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
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
import { createInteraction } from '../server/interactions'
import { Plus, Loader2 } from 'lucide-react'

type QuickActivityDialogProps = {
  preselectedContactId?: number
  preselectedFamilyId?: number
  preselectedInviteGroupId?: number
  trigger?: React.ReactNode
}

const INTERACTION_TYPES = [
  { value: 'call', label: 'Telefonat' },
  { value: 'visit', label: 'Besuch' },
  { value: 'message', label: 'Nachricht' },
  { value: 'email', label: 'E-Mail' },
  { value: 'meeting', label: 'Treffen' },
  { value: 'event', label: 'Veranstaltung' },
  { value: 'other', label: 'Sonstiges' },
]

export function QuickActivityDialog({
  preselectedContactId,
  preselectedFamilyId,
  preselectedInviteGroupId,
  trigger,
}: QuickActivityDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: 'call',
    notes: '',
    interactionDate: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createInteraction({
        data: {
          contactId: preselectedContactId,
          familyId: preselectedFamilyId,
          inviteGroupId: preselectedInviteGroupId,
          type: formData.type,
          notes: formData.notes || undefined,
          interactionDate: new Date(formData.interactionDate),
        },
      })

      setOpen(false)
      setFormData({
        type: 'call',
        notes: '',
        interactionDate: new Date().toISOString().split('T')[0],
      })

      // Invalidate router to refresh data
      router.invalidate()
    } catch (error) {
      console.error('Failed to create interaction:', error)
      alert('Fehler beim Erstellen der Aktivität')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Aktivität
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Aktivität erfassen</DialogTitle>
          <DialogDescription>
            Erfasse eine neue Interaktion mit einem Kontakt, Familie oder Gruppe.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Art der Aktivität</Label>
            <Select
              value={formData.type}
              onValueChange={value =>
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERACTION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Datum</Label>
            <Input
              id="date"
              type="date"
              value={formData.interactionDate}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  interactionDate: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e =>
                setFormData(prev => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Optional: Details zur Aktivität..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Speichern'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
