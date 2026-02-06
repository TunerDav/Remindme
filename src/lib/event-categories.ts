export const EVENT_CATEGORIES = [
  'Besuch',
  'Gemeinschaftsabend',
  'Bibelstudium',
  'Predigtdienst',
  'Sonstiges',
] as const

export type EventCategory = (typeof EVENT_CATEGORIES)[number]
