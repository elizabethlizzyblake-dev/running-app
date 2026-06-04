import { describe, it, expect } from 'vitest'
import { computeStreak, AUTO_BADGES } from '../lib/achievements'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

describe('computeStreak', () => {
  it('returns 0 with no dates', () => {
    expect(computeStreak([])).toBe(0)
  })

  it('returns 1 when only today has a run', () => {
    expect(computeStreak([daysAgo(0)])).toBe(1)
  })

  it('counts consecutive days from today', () => {
    const dates = [daysAgo(0), daysAgo(1), daysAgo(2)]
    expect(computeStreak(dates)).toBe(3)
  })

  it('breaks on a missing day', () => {
    // today and 2 days ago, but NOT yesterday
    const dates = [daysAgo(0), daysAgo(2)]
    expect(computeStreak(dates)).toBe(1)
  })

  it('handles gaps at the start — returns 0 if no run today', () => {
    const dates = [daysAgo(2), daysAgo(3)]
    expect(computeStreak(dates)).toBe(0)
  })

  it('caps at 60 days', () => {
    const dates = Array.from({ length: 65 }, (_, i) => daysAgo(i))
    expect(computeStreak(dates)).toBe(60)
  })
})

describe('AUTO_BADGES', () => {
  const run = (distance: number, daysBack = 0) => ({
    distance,
    date: daysAgo(daysBack),
  })

  it('First Steps — triggers on 1 run', () => {
    const badge = AUTO_BADGES.find(b => b.name === 'First Steps')!
    expect(badge.check([run(5)])).toBe(true)
    expect(badge.check([])).toBe(false)
  })

  it('10K Club — triggers at 10km cumulative', () => {
    const badge = AUTO_BADGES.find(b => b.name === '10K Club')!
    expect(badge.check([run(5), run(5)])).toBe(true)
    expect(badge.check([run(9)])).toBe(false)
  })

  it('50K Explorer — triggers at 50km cumulative', () => {
    const badge = AUTO_BADGES.find(b => b.name === '50K Explorer')!
    expect(badge.check([run(25), run(25)])).toBe(true)
    expect(badge.check([run(49)])).toBe(false)
  })

  it('100K Legend — triggers at 100km cumulative', () => {
    const badge = AUTO_BADGES.find(b => b.name === '100K Legend')!
    expect(badge.check([run(50), run(50)])).toBe(true)
    expect(badge.check([run(99)])).toBe(false)
  })

  it('Marathon Master — triggers on a single run >= 42.2km', () => {
    const badge = AUTO_BADGES.find(b => b.name === 'Marathon Master')!
    expect(badge.check([run(42.2)])).toBe(true)
    expect(badge.check([run(42.1)])).toBe(false)
  })

  it('Week Warrior — triggers on 7 consecutive days', () => {
    const badge = AUTO_BADGES.find(b => b.name === 'Week Warrior')!
    const sevenDays = Array.from({ length: 7 }, (_, i) => run(5, i))
    const sixDays = Array.from({ length: 6 }, (_, i) => run(5, i))
    expect(badge.check(sevenDays)).toBe(true)
    expect(badge.check(sixDays)).toBe(false)
  })

  it('Month Streak — triggers on 30 consecutive days', () => {
    const badge = AUTO_BADGES.find(b => b.name === 'Month Streak')!
    const thirtyDays = Array.from({ length: 30 }, (_, i) => run(5, i))
    const twentyNine = Array.from({ length: 29 }, (_, i) => run(5, i))
    expect(badge.check(thirtyDays)).toBe(true)
    expect(badge.check(twentyNine)).toBe(false)
  })
})
