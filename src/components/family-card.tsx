"use client"

import { Link } from '@tanstack/react-router'
import { Phone, MapPin, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { FamilyWithTags } from '@/server/families'

interface FamilyCardProps {
  family: FamilyWithTags
}

export function FamilyCard({ family }: FamilyCardProps) {
  return (
    <Link to="/families/$id" params={{ id: String(family.id) }}>
      <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold shrink-0">
          <Users className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-card-foreground truncate">{family.name}</p>
          {family.congregation_name && (
            <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {family.congregation_name}
            </p>
          )}
          {family.member_count > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Users className="h-3 w-3" />
              {family.member_count} {family.member_count === 1 ? 'member' : 'members'}
            </p>
          )}
          {family.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {family.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs px-1.5 py-0"
                  style={{
                    borderColor: tag.color,
                    backgroundColor: `${tag.color}10`,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
              {family.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  +{family.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        {family.phone && (
          <a
            href={`tel:${family.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors shrink-0"
            aria-label={`Call ${family.name}`}
          >
            <Phone className="h-4 w-4" />
          </a>
        )}
      </div>
    </Link>
  )
}
