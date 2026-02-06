import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Plus, User, Users, Bell, Calendar, CalendarDays } from 'lucide-react'

export function HomeFab() {
  return (
    <div className="fixed bottom-24 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Neu erstellen</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/contacts/new" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Kontakt
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/families/new" className="cursor-pointer">
              <Users className="mr-2 h-4 w-4" />
              Familie
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/reminders/new" className="cursor-pointer">
              <Bell className="mr-2 h-4 w-4" />
              Erinnerung
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/invite-groups/new" className="cursor-pointer">
              <CalendarDays className="mr-2 h-4 w-4" />
              Einladungsgruppe
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/events/new" className="cursor-pointer">
              <Calendar className="mr-2 h-4 w-4" />
              Event
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
