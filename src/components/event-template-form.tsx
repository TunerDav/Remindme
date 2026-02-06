import { useState } from 'react'
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
import { Card } from './ui/card'
import { Switch } from './ui/switch'
import { Loader2 } from 'lucide-react'
import { EVENT_CATEGORIES } from '../lib/event-categories'
import type { EventTemplateFlat } from '../server/events'

type EventTemplateFormProps = {
  initialData?: EventTemplateFlat
  onSubmit: (data: {
    name: string
    description?: string
    category?: string
    recurrenceType: string
    recurrenceInterval: number
    recurrenceDayOfWeek?: number
    recurrenceDayOfMonth?: number
    recurrenceWeekOfMonth?: number
    timeOfDay?: string
    maxAttendees: number
    active: boolean
  }) => Promise<EventTemplateFlat>
}

const WEEKDAYS = [
  { value: 0, label: 'Sonntag' },
  { value: 1, label: 'Montag' },
  { value: 2, label: 'Dienstag' },
  { value: 3, label: 'Mittwoch' },
  { value: 4, label: 'Donnerstag' },
  { value: 5, label: 'Freitag' },
  { value: 6, label: 'Samstag' },
]

const WEEK_OF_MONTH = [
  { value: 0, label: '1. Woche' },
  { value: 1, label: '2. Woche' },
  { value: 2, label: '3. Woche' },
  { value: 3, label: '4. Woche' },
  { value: 4, label: 'Letzte Woche' },
]

export function EventTemplateForm({
  initialData,
  onSubmit,
}: EventTemplateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [category, setCategory] = useState(initialData?.category ?? '')
  const [recurrenceType, setRecurrenceType] = useState(
    initialData?.recurrence_type ?? 'monthly'
  )
  const [recurrenceInterval, setRecurrenceInterval] = useState(
    initialData?.recurrence_interval ?? 1
  )
  const [recurrenceDayOfWeek, setRecurrenceDayOfWeek] = useState<string>(
    initialData?.recurrence_day_of_week?.toString() ?? ''
  )
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState<string>(
    initialData?.recurrence_day_of_month?.toString() ?? ''
  )
  const [recurrenceWeekOfMonth, setRecurrenceWeekOfMonth] = useState<string>(
    initialData?.recurrence_week_of_month?.toString() ?? ''
  )
  const [timeOfDay, setTimeOfDay] = useState(initialData?.time_of_day ?? '')
  const [maxAttendees, setMaxAttendees] = useState(
    initialData?.max_attendees ?? 1
  )
  const [active, setActive] = useState(initialData?.active ?? true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit({
        name,
        description: description || undefined,
        category: category || undefined,
        recurrenceType,
        recurrenceInterval,
        recurrenceDayOfWeek: recurrenceDayOfWeek
          ? parseInt(recurrenceDayOfWeek)
          : undefined,
        recurrenceDayOfMonth: recurrenceDayOfMonth
          ? parseInt(recurrenceDayOfMonth)
          : undefined,
        recurrenceWeekOfMonth: recurrenceWeekOfMonth
          ? parseInt(recurrenceWeekOfMonth)
          : undefined,
        timeOfDay: timeOfDay || undefined,
        maxAttendees,
        active,
      })
    } catch (error) {
      console.error('Error submitting event template:', error)
      alert('Fehler beim Speichern der Event-Vorlage')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Event-Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="z.B. Gemeinschaftsabend"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Beschreibung</Label>
          <Textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional: Details zum Event..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategorie</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Kategorie auswählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Keine Kategorie</SelectItem>
              {EVENT_CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <h3 className="font-semibold text-sm">Wiederholung</h3>

        <div className="space-y-2">
          <Label htmlFor="recurrenceType">Typ *</Label>
          <Select value={recurrenceType} onValueChange={setRecurrenceType}>
            <SelectTrigger id="recurrenceType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Wöchentlich</SelectItem>
              <SelectItem value="monthly">Monatlich</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {recurrenceType === 'weekly' && (
          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">Wochentag *</Label>
            <Select
              value={recurrenceDayOfWeek}
              onValueChange={setRecurrenceDayOfWeek}
            >
              <SelectTrigger id="dayOfWeek">
                <SelectValue placeholder="Wochentag auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAYS.map(day => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {recurrenceType === 'monthly' && (
          <>
            <div className="space-y-2">
              <Label>Monatlicher Rhythmus</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dayOfMonth" className="text-xs">
                    Bestimmter Tag
                  </Label>
                  <Input
                    id="dayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    value={recurrenceDayOfMonth}
                    onChange={e => {
                      setRecurrenceDayOfMonth(e.target.value)
                      if (e.target.value) {
                        setRecurrenceWeekOfMonth('')
                        setRecurrenceDayOfWeek('')
                      }
                    }}
                    placeholder="1-31"
                  />
                </div>
                <div className="text-center self-end pb-2 text-xs text-muted-foreground">
                  oder
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weekOfMonth" className="text-xs">
                  Woche im Monat
                </Label>
                <Select
                  value={recurrenceWeekOfMonth}
                  onValueChange={value => {
                    setRecurrenceWeekOfMonth(value)
                    if (value) setRecurrenceDayOfMonth('')
                  }}
                >
                  <SelectTrigger id="weekOfMonth">
                    <SelectValue placeholder="Woche..." />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEK_OF_MONTH.map(week => (
                      <SelectItem key={week.value} value={week.value.toString()}>
                        {week.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dayOfWeekMonthly" className="text-xs">
                  Wochentag
                </Label>
                <Select
                  value={recurrenceDayOfWeek}
                  onValueChange={value => {
                    setRecurrenceDayOfWeek(value)
                    if (value) setRecurrenceDayOfMonth('')
                  }}
                  disabled={!recurrenceWeekOfMonth}
                >
                  <SelectTrigger id="dayOfWeekMonthly">
                    <SelectValue placeholder="Tag..." />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAYS.map(day => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="timeOfDay">Uhrzeit</Label>
          <Input
            id="timeOfDay"
            type="time"
            value={timeOfDay}
            onChange={e => setTimeOfDay(e.target.value)}
          />
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="maxAttendees">Max. Teilnehmer *</Label>
          <Input
            id="maxAttendees"
            type="number"
            min="1"
            value={maxAttendees}
            onChange={e => setMaxAttendees(parseInt(e.target.value) || 1)}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="active" className="cursor-pointer">
            Event aktiv
          </Label>
          <Switch id="active" checked={active} onCheckedChange={setActive} />
        </div>
      </Card>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Speichern...
          </>
        ) : (
          'Event-Vorlage speichern'
        )}
      </Button>
    </form>
  )
}
