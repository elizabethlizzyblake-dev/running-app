import { describe, it, expect } from 'vitest'
import { formatPace, formatDistance, formatDuration, formatDate, formatMonth, calcPace } from '../lib/formatting'

describe('formatPace', () => {
  it('formats a decimal pace as M:SS', () => {
    expect(formatPace(5.5)).toBe('5:30')
    expect(formatPace(6)).toBe('6:00')
    expect(formatPace(4.75)).toBe('4:45')
  })

  it('returns -- for zero or invalid pace', () => {
    expect(formatPace(0)).toBe('--')
    expect(formatPace(-1)).toBe('--')
  })

  it('pads seconds to two digits', () => {
    expect(formatPace(5.1)).toBe('5:06')
  })
})

describe('formatDistance', () => {
  it('formats to 1 decimal by default', () => {
    expect(formatDistance(5)).toBe('5.0')
    expect(formatDistance(10.567)).toBe('10.6')
  })

  it('respects custom decimal places', () => {
    expect(formatDistance(5, 2)).toBe('5.00')
  })
})

describe('formatDuration', () => {
  it('formats minutes under an hour', () => {
    expect(formatDuration(30)).toBe('30m')
    expect(formatDuration(59)).toBe('59m')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m')
    expect(formatDuration(60)).toBe('1h')
    expect(formatDuration(125)).toBe('2h 5m')
  })

  it('returns -- for zero or invalid', () => {
    expect(formatDuration(0)).toBe('--')
    expect(formatDuration(-5)).toBe('--')
  })
})

describe('formatDate', () => {
  it('returns a readable date string', () => {
    const result = formatDate('2026-06-04')
    expect(result).toContain('4')
    expect(result).toMatch(/Jun/)
  })
})

describe('formatMonth', () => {
  it('returns Month Year', () => {
    expect(formatMonth('2026-06')).toContain('June')
    expect(formatMonth('2026-06')).toContain('2026')
  })
})

describe('calcPace', () => {
  it('calculates pace correctly', () => {
    expect(calcPace(10, 50)).toBe(5)
    expect(calcPace(5, 25)).toBe(5)
  })

  it('returns 0 for invalid inputs', () => {
    expect(calcPace(0, 30)).toBe(0)
    expect(calcPace(10, 0)).toBe(0)
    expect(calcPace(-1, 30)).toBe(0)
  })
})
