'use client'

import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, X } from 'lucide-react'
import { createTag, deleteTag, type TagFlat } from '@/server/tags'
import { toast } from 'sonner'

interface TagManagerProps {
  initialTags: TagFlat[]
}

const DEFAULT_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
]

export function TagManager({ initialTags }: TagManagerProps) {
  const router = useRouter()
  const [tags, setTags] = useState<TagFlat[]>(initialTags)
  const [isOpen, setIsOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newTagName.trim()) {
      toast.error('Bitte einen Tag-Namen eingeben')
      return
    }

    setIsSubmitting(true)
    try {
      await createTag({ data: { name: newTagName.trim(), color: selectedColor } })
      toast.success('Tag erstellt')
      setNewTagName('')
      setSelectedColor(DEFAULT_COLORS[0])
      setIsOpen(false)
      // Invalidate route to reload data
      router.invalidate()
    } catch (error) {
      toast.error('Fehler beim Erstellen des Tags')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTag = async (tagId: number, tagName: string) => {
    if (
      !confirm(
        `Tag "${tagName}" wirklich löschen? Dies entfernt den Tag von allen Kontakten.`
      )
    ) {
      return
    }

    try {
      await deleteTag({ data: { id: tagId } })
      toast.success('Tag gelöscht')
      setTags(tags.filter((t) => t.id !== tagId))
      router.invalidate()
    } catch (error) {
      toast.error('Fehler beim Löschen des Tags')
      console.error(error)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Tags</h3>
          <p className="text-sm text-muted-foreground">
            Organisiere deine Kontakte mit Tags
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Neuer Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateTag}>
              <DialogHeader>
                <DialogTitle>Neuen Tag erstellen</DialogTitle>
                <DialogDescription>
                  Erstelle einen Tag, um Kontakte zu kategorisieren
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tag-name">Name</Label>
                  <Input
                    id="tag-name"
                    placeholder="z.B. Interessierte"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Farbe</Label>
                  <div className="flex gap-2">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? 'border-foreground scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <Label className="text-sm text-muted-foreground">
                    Vorschau
                  </Label>
                  <div className="mt-2">
                    <Badge
                      style={{ backgroundColor: selectedColor, color: 'white' }}
                    >
                      {newTagName || 'Tag Name'}
                    </Badge>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !newTagName.trim()}
                >
                  {isSubmitting ? 'Erstellt...' : 'Erstellen'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tags.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          Noch keine Tags vorhanden. Erstelle deinen ersten Tag.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="pl-3 pr-1 py-1.5 text-sm"
              style={{
                borderColor: tag.color,
                backgroundColor: `${tag.color}15`,
              }}
            >
              <span style={{ color: tag.color }}>{tag.name}</span>
              <button
                onClick={() => handleDeleteTag(tag.id, tag.name)}
                className="ml-2 hover:bg-background rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" style={{ color: tag.color }} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </Card>
  )
}
