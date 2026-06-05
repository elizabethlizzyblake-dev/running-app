export type ValidationError = { field: string; message: string }
export type ValidationResult = { ok: true } | { ok: false; error: string }

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function validateRunInput(input: {
  date?: unknown
  distance?: unknown
  minutes?: unknown
  seconds?: unknown
}): ValidationResult {
  const { date, distance, minutes, seconds } = input

  if (typeof date !== 'string' || !ISO_DATE.test(date)) {
    return { ok: false, error: 'Date must be a valid YYYY-MM-DD string' }
  }

  const parsed = new Date(date + 'T12:00:00Z')
  if (isNaN(parsed.getTime())) {
    return { ok: false, error: 'Date is not a valid calendar date' }
  }
  if (parsed > new Date()) {
    return { ok: false, error: 'Date cannot be in the future' }
  }
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  if (parsed < oneYearAgo) {
    return { ok: false, error: 'Date cannot be more than 1 year in the past' }
  }

  const dist = Number(distance)
  if (!isFinite(dist) || dist <= 0) {
    return { ok: false, error: 'Distance must be greater than 0 km' }
  }
  if (dist > 500) {
    return { ok: false, error: 'Distance cannot exceed 500 km' }
  }

  const mins = Number(minutes) || 0
  const secs = Number(seconds) || 0
  if (mins <= 0 && secs <= 0) {
    return { ok: false, error: 'Duration must be greater than 0' }
  }
  if (secs < 0 || secs > 59) {
    return { ok: false, error: 'Seconds must be between 0 and 59' }
  }

  return { ok: true }
}

export function validateChallengeInput(input: {
  title?: unknown
  startDate?: unknown
  endDate?: unknown
  targetValue?: unknown
}): ValidationResult {
  const { title, startDate, endDate, targetValue } = input

  if (typeof title !== 'string' || title.trim().length === 0) {
    return { ok: false, error: 'Title is required' }
  }
  if (title.length > 100) {
    return { ok: false, error: 'Title cannot exceed 100 characters' }
  }

  if (typeof startDate !== 'string' || !ISO_DATE.test(startDate)) {
    return { ok: false, error: 'Start date must be a valid YYYY-MM-DD string' }
  }
  if (typeof endDate !== 'string' || !ISO_DATE.test(endDate)) {
    return { ok: false, error: 'End date must be a valid YYYY-MM-DD string' }
  }
  if (endDate <= startDate) {
    return { ok: false, error: 'End date must be after start date' }
  }

  const tv = Number(targetValue)
  if (!isFinite(tv) || tv <= 0) {
    return { ok: false, error: 'Target value must be greater than 0' }
  }
  if (tv > 10000) {
    return { ok: false, error: 'Target value cannot exceed 10,000' }
  }

  return { ok: true }
}
