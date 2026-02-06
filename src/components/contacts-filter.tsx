import { useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Badge } from './ui/badge'
import { Search, X } from 'lucide-react'
import { Button } from './ui/button'
import type { TagFlat } from '../server/tags'
import type { CongregationFlat } from '../server/contacts'

type ContactsFilterProps = {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedTagId: string
  onTagChange: (tagId: string) => void
  selectedCongregationId: string
  onCongregationChange: (congregationId: string) => void
  tags: TagFlat[]
  congregations: CongregationFlat[]
}

export function ContactsFilter({
  searchQuery,
  onSearchChange,
  selectedTagId,
  onTagChange,
  selectedCongregationId,
  onCongregationChange,
  tags,
  congregations,
}: ContactsFilterProps) {
  const hasActiveFilters =
    searchQuery || selectedTagId !== 'all' || selectedCongregationId !== 'all'

  const clearFilters = () => {
    onSearchChange('')
    onTagChange('all')
    onCongregationChange('all')
  }

  return (
    <div className="space-y-3 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Filter</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Zurücksetzen
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Search */}
        <div className="space-y-1.5">
          <Label htmlFor="search" className="text-xs">
            Suche
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Name, E-Mail, Telefon..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Tag Filter */}
        <div className="space-y-1.5">
          <Label htmlFor="tag-filter" className="text-xs">
            Tag
          </Label>
          <Select value={selectedTagId} onValueChange={onTagChange}>
            <SelectTrigger id="tag-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Tags</SelectItem>
              {tags.map(tag => (
                <SelectItem key={tag.id} value={tag.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Congregation Filter */}
        <div className="space-y-1.5">
          <Label htmlFor="congregation-filter" className="text-xs">
            Gemeinde
          </Label>
          <Select
            value={selectedCongregationId}
            onValueChange={onCongregationChange}
          >
            <SelectTrigger id="congregation-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Gemeinden</SelectItem>
              {congregations.map(cong => (
                <SelectItem key={cong.id} value={cong.id.toString()}>
                  {cong.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
