"use client"

import { useState } from 'react'
import { useRouter, Link } from '@tanstack/react-router'
import { Phone, Mail, MapPin, Edit, Trash2, MessageSquare, Users, PhoneCall, Navigation, UserPlus, UserMinus, Activity, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteFamily, removeContactFromFamily } from '@/server/families'
import type { FamilyWithMembers } from '@/server/families'
import type { Tag } from '@prisma/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface FamilyDetailProps {
  family: FamilyWithMembers
  tags: Tag[]
}

export function FamilyDetail({ family, tags }: FamilyDetailProps) {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [removingMember, setRemovingMember] = useState<number | null>(null)

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
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(address))}`
  }

  async function handleDelete() {
    try {
      await deleteFamily(family.id)
      toast.success('Family deleted successfully')
      router.navigate({ to: '/families' })
      router.invalidate()
    } catch (error) {
      toast.error('Failed to delete family')
    }
  }

  async function handleRemoveMember(contactId: number) {
    setRemovingMember(contactId)
    try {
      await removeContactFromFamily(contactId)
      toast.success('Member removed from family')
      router.invalidate()
    } catch (error) {
      toast.error('Failed to remove member')
    } finally {
      setRemovingMember(null)
    }
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-6 pb-20">
      {/* Profile Header */}
      <div className="text-center">
        <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary text-2xl font-bold mb-3 shadow-sm">
          <Users className="h-12 w-12" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{family.name}</h2>
        {family.congregation_name && (
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
            <MapPin className="h-3 w-3" />
            {family.congregation_name}
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
                  color: tag.color
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {family.phone && (
          <>
            <a
              href={`tel:${family.phone}`}
              className="flex flex-col items-center gap-1 p-3 bg-green-500/10 rounded-xl text-green-600 hover:bg-green-500/20 transition-colors"
            >
              <Phone className="h-5 w-5" />
              <span className="text-xs font-medium">Call</span>
            </a>
            <a
              href={getWhatsAppLink(family.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 p-3 bg-green-600/10 rounded-xl text-green-700 hover:bg-green-600/20 transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs font-medium">WhatsApp</span>
            </a>
          </>
        )}
        {family.email && (
          <a
            href={`mailto:${family.email}`}
            className="flex flex-col items-center gap-1 p-3 bg-blue-500/10 rounded-xl text-blue-600 hover:bg-blue-500/20 transition-colors"
          >
            <Mail className="h-5 w-5" />
            <span className="text-xs font-medium">Email</span>
          </a>
        )}
        {family.address && (
          <a
            href={getMapsLink(family.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-3 bg-orange-500/10 rounded-xl text-orange-600 hover:bg-orange-500/20 transition-colors"
          >
            <Navigation className="h-5 w-5" />
            <span className="text-xs font-medium">Map</span>
          </a>
        )}
        <Link
          to="/families/$id/edit"
          params={{ id: String(family.id) }}
          className="flex flex-col items-center gap-1 p-3 bg-muted rounded-xl text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          <Edit className="h-5 w-5" />
          <span className="text-xs font-medium">Edit</span>
        </Link>
      </div>

      {/* Contact Info */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3 shadow-sm">
        {family.phone && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-card-foreground">{family.phone}</span>
          </div>
        )}
        {family.email && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-card-foreground">{family.email}</span>
          </div>
        )}
        {family.address && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-card-foreground">{family.address}</span>
          </div>
        )}
      </div>

      {/* Family Members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Members ({family.members.length})</h3>
          <Link 
            to="/contacts/new" 
            search={{ familyId: family.id }}
          >
            <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs">
              <UserPlus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </Link>
        </div>
        {family.members.length > 0 ? (
          <div className="space-y-2">
            {family.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-card rounded-xl border border-border shadow-sm"
              >
                <Link 
                  to="/contacts/$id" 
                  params={{ id: String(member.id) }}
                  className="flex-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary text-sm font-bold">
                      {`${member.first_name[0]}${member.last_name[0]}`.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {member.first_name} {member.last_name}
                      </p>
                      {member.phone && (
                        <p className="text-xs text-muted-foreground">{member.phone}</p>
                      )}
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={removingMember === member.id}
                  className="h-8 w-8 p-0"
                >
                  <UserMinus className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No members yet</p>
            <p className="text-xs mt-1">Add people to this family</p>
          </div>
        )}
      </div>

      {/* Notes */}
      {family.notes && (
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <h3 className="font-semibold text-card-foreground mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{family.notes}</p>
        </div>
      )}

      {/* Delete Button */}
      <Button
        variant="destructive"
        onClick={() => setShowDeleteConfirm(true)}
        className="w-full rounded-xl"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Family
      </Button>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete family?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The family will be permanently deleted.
              Family members will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
