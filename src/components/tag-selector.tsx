import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { Tags, X } from 'lucide-react'
import type { TagFlat } from '../server/tags'

interface TagSelectorProps {
  availableTags: TagFlat[]
  selectedTags: TagFlat[]
  onTagToggle: (tag: TagFlat) => void
}

export function TagSelector({
  availableTags,
  selectedTags,
  onTagToggle,
}: TagSelectorProps) {
  const selectedTagIds = new Set(selectedTags.map((t) => t.id))

  return (
    <div className="space-y-2">
      <Label>Tags</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="pl-2 pr-1 py-1"
            style={{
              borderColor: tag.color,
              backgroundColor: `${tag.color}15`,
            }}
          >
            <span style={{ color: tag.color }}>{tag.name}</span>
            <button
              type="button"
              onClick={() => onTagToggle(tag)}
              className="ml-1 hover:bg-background rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" style={{ color: tag.color }} />
            </button>
          </Badge>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" type="button">
            <Tags className="h-4 w-4 mr-2" />
            Tags hinzufügen
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-2">
            <p className="text-sm font-semibold mb-2">Tags auswählen</p>
            {availableTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keine Tags vorhanden. Erstelle Tags in den Einstellungen.
              </p>
            ) : (
              availableTags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={selectedTagIds.has(tag.id)}
                    onCheckedChange={() => onTagToggle(tag)}
                  />
                  <Label
                    htmlFor={`tag-${tag.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <Badge
                      variant="outline"
                      className="cursor-pointer"
                      style={{
                        borderColor: tag.color,
                        backgroundColor: `${tag.color}15`,
                      }}
                    >
                      <span style={{ color: tag.color }}>{tag.name}</span>
                    </Badge>
                  </Label>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
