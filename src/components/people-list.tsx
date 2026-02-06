'use client'

import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Phone,
  MapPin,
  Users,
  ChevronDown,
  ChevronRight,
  User,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type {
  PeopleGrouped,
  FamilyWithMembers,
  ContactFlat,
  ContactWithTags,
} from '@/server/contacts'

type FilterType = 'all' | 'families' | 'individuals'

interface PeopleListProps {
  data: PeopleGrouped
  initialFilter?: FilterType
}

export function PeopleList({ data, initialFilter = 'all' }: PeopleListProps) {
  const [expandedFamilies, setExpandedFamilies] = useState<Set<number>>(
    new Set()
  )
  const [filter, setFilter] = useState<FilterType>(initialFilter)
  const [searchQuery, setSearchQuery] = useState('')

  const toggleFamily = (familyId: number) => {
    setExpandedFamilies((prev) => {
      const next = new Set(prev)
      if (next.has(familyId)) {
        next.delete(familyId)
      } else {
        next.add(familyId)
      }
      return next
    })
  }

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    let families = data.families
    let individuals = data.individuals

    // Suchfilter
    if (query) {
      families = data.families.filter((family) => {
        const familyMatch = family.name.toLowerCase().includes(query)
        const memberMatch = family.members.some(
          (m) =>
            m.first_name.toLowerCase().includes(query) ||
            m.last_name.toLowerCase().includes(query)
        )
        return familyMatch || memberMatch
      })

      individuals = data.individuals.filter(
        (c) =>
          c.first_name.toLowerCase().includes(query) ||
          c.last_name.toLowerCase().includes(query)
      )
    }

    // Tab-Filter
    if (filter === 'families') {
      individuals = []
    } else if (filter === 'individuals') {
      families = []
    }

    return { families, individuals }
  }, [data, filter, searchQuery])

  const totalCount = data.families.length + data.individuals.length
  const familyCount = data.families.length
  const individualCount = data.individuals.length

  return (
    <div className="space-y-4">
      {/* Suche */}
      <Input
        type="search"
        placeholder="Suchen..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />

      {/* Filter-Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Alle ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('families')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === 'families'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Familien ({familyCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('individuals')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === 'individuals'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Einzeln ({individualCount})
        </button>
      </div>

      {/* Liste */}
      <div className="space-y-2">
        {/* Familien */}
        {filteredData.families.map((family) => (
          <FamilyGroup
            key={`family-${family.id}`}
            family={family}
            expanded={expandedFamilies.has(family.id)}
            onToggle={() => toggleFamily(family.id)}
          />
        ))}

        {/* Einzelne */}
        {filteredData.individuals.map((contact) => (
          <IndividualCard key={`individual-${contact.id}`} contact={contact} />
        ))}

        {/* Empty State */}
        {filteredData.families.length === 0 &&
          filteredData.individuals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? 'Keine Ergebnisse gefunden'
                : 'Keine Menschen vorhanden'}
            </div>
          )}
      </div>
    </div>
  )
}

// Familie als expandierbare Gruppe
function FamilyGroup({
  family,
  expanded,
  onToggle,
}: {
  family: FamilyWithMembers
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Familie Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <button type="button" className="p-1 -ml-1 text-muted-foreground">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary shrink-0">
          {family.photo_url ? (
            <img
              src={family.photo_url}
              alt={family.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <Users className="h-5 w-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-card-foreground truncate">
              {family.name}
            </p>
            <span className="text-xs text-muted-foreground">
              ({family.members.length})
            </span>
          </div>
          {family.congregation_name && (
            <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {family.congregation_name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {family.phone && (
            <a
              href={`tel:${family.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
              aria-label={`${family.name} anrufen`}
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
          <Link
            to="/families/$id"
            params={{ id: String(family.id) }}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Details
          </Link>
        </div>
      </div>

      {/* Mitglieder (expandiert) */}
      {expanded && family.members.length > 0 && (
        <div className="border-t border-border">
          {family.members.map((member, index) => (
            <MemberCard
              key={member.id}
              contact={member}
              isLast={index === family.members.length - 1}
            />
          ))}
        </div>
      )}

      {/* Keine Mitglieder */}
      {expanded && family.members.length === 0 && (
        <div className="border-t border-border p-4 text-sm text-muted-foreground text-center">
          Keine Mitglieder zugeordnet
        </div>
      )}
    </div>
  )
}

// Familienmitglied (eingerückt)
function MemberCard({
  contact,
  isLast,
}: {
  contact: ContactFlat
  isLast: boolean
}) {
  const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase()

  return (
    <Link to="/contacts/$id" params={{ id: String(contact.id) }}>
      <div
        className={`flex items-center gap-3 p-3 pl-12 hover:bg-muted/50 transition-colors ${
          !isLast ? 'border-b border-border/50' : ''
        }`}
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary text-sm font-medium shrink-0">
          {contact.photo_url ? (
            <img
              src={contact.photo_url}
              alt={`${contact.first_name} ${contact.last_name}`}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-card-foreground text-sm truncate">
            {contact.first_name} {contact.last_name}
          </p>
        </div>

        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            aria-label={`${contact.first_name} anrufen`}
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </Link>
  )
}

// Einzelperson (ohne Familie)
function IndividualCard({ contact }: { contact: ContactFlat }) {
  const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase()

  return (
    <Link to="/contacts/$id" params={{ id: String(contact.id) }}>
      <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-muted-foreground shrink-0">
          {contact.photo_url ? (
            <img
              src={contact.photo_url}
              alt={`${contact.first_name} ${contact.last_name}`}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-card-foreground truncate">
            {contact.first_name} {contact.last_name}
          </p>
          {contact.congregation_name && (
            <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {contact.congregation_name}
            </p>
          )}
        </div>

        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors shrink-0"
            aria-label={`${contact.first_name} anrufen`}
          >
            <Phone className="h-4 w-4" />
          </a>
        )}
      </div>
    </Link>
  )
}
