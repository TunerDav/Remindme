"use client"

import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { createReminder } from '@/server/reminders'
import { Bell, Users, Calendar, RotateCcw, FileText } from 'lucide-react'
import type { ReminderType, RepeatInterval } from '@prisma/client'
import type { PeopleGrouped } from '@/server/contacts'
import type { FamilyWithTags } from '@/server/families'
import { toast } from 'sonner'

const reminderTypes: { value: ReminderType; label: string }[] = [
  { value: 'call', label: 'Call' },
  { value: 'visit', label: 'Visit' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'wedding_anniversary', label: 'Anniversary' },
  { value: 'other', label: 'Other' },
]

const repeatOptions: { value: RepeatInterval; label: string }[] = [
  { value: 'none', label: 'Once' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

interface ReminderFormProps {
  people: PeopleGrouped
  families: FamilyWithTags[]
}

export function ReminderForm({ people, families }: ReminderFormProps) {
  const router = useRouter()
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])
  const [selectedFamilies, setSelectedFamilies] = useState<number[]>([])

  const allContacts = [
    ...people.families.flatMap(f => f.members),
    ...people.individuals
  ]

  const form = useForm({
    defaultValues: {
      type: 'call' as ReminderType,
      title: '',
      description: '',
      due_date: '',
      repeat: 'none' as RepeatInterval,
    },
    onSubmit: async ({ value }) => {
      try {
        await createReminder({
          type: value.type,
          title: value.title,
          description: value.description || undefined,
          due_date: value.due_date,
          repeat: value.repeat,
          contact_ids: selectedContacts.length > 0 ? selectedContacts : undefined,
          family_ids: selectedFamilies.length > 0 ? selectedFamilies : undefined,
        })
        toast.success('Reminder created successfully')
        router.navigate({ to: '/reminders' })
        router.invalidate()
      } catch (error) {
        console.error('Error creating reminder:', error)
        toast.error('Failed to create reminder')
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-5"
    >
      {/* Type & Title Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Bell className="h-4 w-4" />
          <span className="text-sm font-medium">Reminder</span>
        </div>
        <div className="space-y-3">
          <form.Field name="type">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-muted-foreground text-xs">
                  Type *
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as ReminderType)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) =>
                !value ? 'Title is required' : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-muted-foreground text-xs">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Call Smith family"
                  className="rounded-xl"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>
        </div>
      </div>

      {/* Contacts & Families Multi-Select */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">People / Families</span>
        </div>
        
        {/* Families */}
        {families.length > 0 && (
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Select Families</Label>
            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-xl p-2">
              {families.map((family) => (
                <div key={family.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`family-${family.id}`}
                    checked={selectedFamilies.includes(family.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFamilies([...selectedFamilies, family.id])
                      } else {
                        setSelectedFamilies(selectedFamilies.filter(id => id !== family.id))
                      }
                    }}
                  />
                  <label htmlFor={`family-${family.id}`} className="text-sm cursor-pointer">
                    {family.name} {family.member_count > 0 && `(${family.member_count} members)`}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts */}
        {allContacts.length > 0 && (
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Select Individuals</Label>
            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-xl p-2">
              {allContacts.map((contact) => (
                <div key={contact.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`contact-${contact.id}`}
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedContacts([...selectedContacts, contact.id])
                      } else {
                        setSelectedContacts(selectedContacts.filter(id => id !== contact.id))
                      }
                    }}
                  />
                  <label htmlFor={`contact-${contact.id}`} className="text-sm cursor-pointer">
                    {contact.first_name} {contact.last_name}
                    {contact.family_name && ` (${contact.family_name})`}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Date & Repeat Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">Schedule</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="due_date"
            validators={{
              onChange: ({ value }) =>
                !value ? 'Due date is required' : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="due_date" className="text-muted-foreground text-xs">
                  Due Date *
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-xl"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-destructive">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>
          <form.Field name="repeat">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="repeat" className="text-muted-foreground text-xs flex items-center gap-1">
                  <RotateCcw className="h-3 w-3" /> Repeat
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as RepeatInterval)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {repeatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">Description</span>
        </div>
        <form.Field name="description">
          {(field) => (
            <Textarea
              id="description"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="rounded-xl resize-none"
              rows={3}
              placeholder="Additional notes..."
            />
          )}
        </form.Field>
      </div>

      <Button
        type="submit"
        disabled={form.state.isSubmitting}
        className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-medium"
      >
        {form.state.isSubmitting ? 'Saving...' : 'Create Reminder'}
      </Button>
    </form>
  )
}
