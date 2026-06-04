/** Format a decimal pace value (min/km) as M:SS */
export function formatPace(pace: number): string {
  if (!pace || pace <= 0) return '--'
  const m = Math.floor(pace)
  const s = Math.round((pace - m) * 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Format a distance in km to a fixed number of decimal places */
export function formatDistance(km: number, decimals = 1): string {
  return Number(km).toFixed(decimals)
}

/** Format duration in minutes as a human-readable string (e.g. "1h 23m") */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '--'
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
  return `${minutes}m`
}

/** Format an ISO date string (YYYY-MM-DD) for display, e.g. "Tue 3 Jun" */
export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** Format a YYYY-MM string as "Month Year", e.g. "June 2026" */
export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Calculate pace (min/km) from distance and duration.
 * Returns 0 if either value is invalid to prevent division by zero.
 */
export function calcPace(distanceKm: number, durationMin: number): number {
  if (!distanceKm || distanceKm <= 0 || !durationMin || durationMin <= 0) return 0
  return Math.round((durationMin / distanceKm) * 100) / 100
}
