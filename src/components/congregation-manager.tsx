import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card } from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Plus, Edit, Trash2, Church } from 'lucide-react'
import {
  getCongregations,
  createCongregation,
  type CongregationFlat,
} from '../server/contacts'
import { toast } from 'sonner'

type CongregationManagerProps = {
  congregations: CongregationFlat[]
}

export function CongregationManager({
  congregations: initialCongregations,
}: CongregationManagerProps) {
  const router = useRouter()
  const [congregations, setCongregations] = useState(initialCongregations)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createCongregation({ data: { name, city: city || undefined } })
      toast.success('Gemeinde erstellt')

      // Refresh congregations
      const updated = await getCongregations()
      setCongregations(updated)

      // Reset form
      setName('')
      setCity('')
      setIsDialogOpen(false)
      router.invalidate()
    } catch (error) {
      toast.error('Fehler beim Erstellen der Gemeinde')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-muted-foreground">
          Gemeinden
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Neue Gemeinde
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Gemeinde</DialogTitle>
              <DialogDescription>
                Füge eine neue Gemeinde hinzu, um Kontakte zu organisieren.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cong-name">Name *</Label>
                <Input
                  id="cong-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="z.B. Versammlung Berlin-Mitte"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cong-city">Stadt</Label>
                <Input
                  id="cong-city"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="z.B. Berlin"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Speichern...' : 'Erstellen'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {congregations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Noch keine Gemeinden vorhanden
          </p>
        ) : (
          congregations.map(congregation => (
            <div
              key={congregation.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Church className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{congregation.name}</p>
                  {congregation.city && (
                    <p className="text-xs text-muted-foreground">
                      {congregation.city}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" disabled>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-destructive"
                  disabled
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
