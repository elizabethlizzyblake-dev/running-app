import { describe, it, expect } from 'vitest'
import { validateRunInput, validateChallengeInput } from '../lib/validation'

// ── validateRunInput ───────────────────────────────────────────────

describe('validateRunInput', () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const recentDate = yesterday.toISOString().split('T')[0]
  const valid = { date: recentDate, distance: 5, minutes: 30, seconds: 0 }

  it('accepts a valid run', () => {
    expect(validateRunInput(valid)).toEqual({ ok: true })
  })

  it('rejects a missing date', () => {
    const r = validateRunInput({ ...valid, date: undefined })
    expect(r.ok).toBe(false)
    expect((r as { ok: false; error: string }).error).toMatch(/date/i)
  })

  it('rejects a date that is not YYYY-MM-DD', () => {
    expect(validateRunInput({ ...valid, date: '15/01/2025' }).ok).toBe(false)
  })

  it('rejects a future date', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const d = tomorrow.toISOString().split('T')[0]
    expect(validateRunInput({ ...valid, date: d }).ok).toBe(false)
  })

  it('rejects a date more than 1 year ago', () => {
    const old = new Date()
    old.setFullYear(old.getFullYear() - 2)
    const d = old.toISOString().split('T')[0]
    expect(validateRunInput({ ...valid, date: d }).ok).toBe(false)
  })

  it('rejects zero distance', () => {
    expect(validateRunInput({ ...valid, distance: 0 }).ok).toBe(false)
  })

  it('rejects negative distance', () => {
    expect(validateRunInput({ ...valid, distance: -1 }).ok).toBe(false)
  })

  it('rejects distance over 500 km', () => {
    expect(validateRunInput({ ...valid, distance: 501 }).ok).toBe(false)
  })

  it('accepts distance exactly at 500 km boundary', () => {
    expect(validateRunInput({ ...valid, distance: 500 }).ok).toBe(true)
  })

  it('rejects zero duration', () => {
    expect(validateRunInput({ ...valid, minutes: 0, seconds: 0 }).ok).toBe(false)
  })

  it('rejects seconds > 59', () => {
    expect(validateRunInput({ ...valid, minutes: 0, seconds: 60 }).ok).toBe(false)
  })

  it('rejects seconds < 0', () => {
    expect(validateRunInput({ ...valid, minutes: 0, seconds: -1 }).ok).toBe(false)
  })

  it('accepts a run with only seconds (no full minutes)', () => {
    expect(validateRunInput({ ...valid, minutes: 0, seconds: 30 }).ok).toBe(true)
  })
})

// ── validateChallengeInput ─────────────────────────────────────────

describe('validateChallengeInput', () => {
  const valid = {
    title: 'June 100K',
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    targetValue: 100,
  }

  it('accepts a valid challenge', () => {
    expect(validateChallengeInput(valid)).toEqual({ ok: true })
  })

  it('rejects empty title', () => {
    expect(validateChallengeInput({ ...valid, title: '' }).ok).toBe(false)
  })

  it('rejects title over 100 characters', () => {
    expect(validateChallengeInput({ ...valid, title: 'a'.repeat(101) }).ok).toBe(false)
  })

  it('rejects end date before start date', () => {
    expect(validateChallengeInput({ ...valid, endDate: '2025-05-01' }).ok).toBe(false)
  })

  it('rejects end date equal to start date', () => {
    expect(validateChallengeInput({ ...valid, endDate: '2025-06-01' }).ok).toBe(false)
  })

  it('rejects zero target value', () => {
    expect(validateChallengeInput({ ...valid, targetValue: 0 }).ok).toBe(false)
  })

  it('rejects negative target value', () => {
    expect(validateChallengeInput({ ...valid, targetValue: -5 }).ok).toBe(false)
  })

  it('rejects target value over 10,000', () => {
    expect(validateChallengeInput({ ...valid, targetValue: 10001 }).ok).toBe(false)
  })

  it('rejects invalid date format', () => {
    expect(validateChallengeInput({ ...valid, startDate: 'June 1' }).ok).toBe(false)
  })
})
