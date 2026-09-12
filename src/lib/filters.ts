import type { Preferences, Profile } from '../types'

export const HEIGHT_MIN = 62
export const HEIGHT_MAX = 74

export function parseHeight(value?: string): number | null {
  if (!value) return null
  const match = value.match(/(\d+)'\s*(\d+)/)
  if (!match) return null
  return Number(match[1]) * 12 + Number(match[2])
}

export function formatHeight(inches: number) {
  return `${Math.floor(inches / 12)}'${inches % 12}"`
}

export function parseMiles(value?: string): number | null {
  if (!value) return null
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : null
}

export function matchesPreferences(profile: Profile, prefs: Preferences) {
  if (profile.age < prefs.ageMin || profile.age > prefs.ageMax) return false

  const height = parseHeight(profile.vitals.height)
  if (height != null && (height < prefs.heightMin || height > prefs.heightMax)) return false

  if (prefs.datingIntent) {
    const intent = profile.vitals.intentions ?? ''
    if (!intent.toLowerCase().includes(prefs.datingIntent.toLowerCase())) return false
  }

  if (prefs.nearby) {
    const miles = parseMiles(profile.distance)
    if (miles != null && miles > prefs.distance) return false
  }

  return true
}
