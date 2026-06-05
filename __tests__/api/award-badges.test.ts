import { describe, it, expect } from 'vitest'
import { AUTO_BADGES } from '../../lib/achievements'

// Tests for badge award eligibility — pure function, no DB needed.
// The full award flow (checkAndAwardBadges) is tested at the DB level;
// here we verify each badge's check function is correct.

function runsOf(distances: number[], daysAgo: number[] = []) {
  return distances.map((distance, i) => ({
    distance,
    date: (() => {
      const d = new Date()
      d.setDate(d.getDate() - (daysAgo[i] ?? i))
      return d.toISOString().split('T')[0]
    })(),
  }))
}

describe('Badge eligibility checks', () => {
  const badge = (name: string) => {
    const b = AUTO_BADGES.find(b => b.name === name)
    if (!b) throw new Error(`Badge "${name}" not found`)
    return b
  }

  describe('First Steps', () => {
    it('awarded after 1 run', () => {
      expect(badge('First Steps').check(runsOf([5]))).toBe(true)
    })
    it('not awarded with no runs', () => {
      expect(badge('First Steps').check([])).toBe(false)
    })
  })

  describe('10K Club', () => {
    it('awarded when total distance >= 10 km', () => {
      expect(badge('10K Club').check(runsOf([5, 5]))).toBe(true)
    })
    it('not awarded below 10 km total', () => {
      expect(badge('10K Club').check(runsOf([3, 3]))).toBe(false)
    })
    it('awarded on exactly 10 km', () => {
      expect(badge('10K Club').check(runsOf([10]))).toBe(true)
    })
  })

  describe('50K Explorer', () => {
    it('awarded at 50 km total', () => {
      expect(badge('50K Explorer').check(runsOf([25, 25]))).toBe(true)
    })
    it('not awarded below 50 km', () => {
      expect(badge('50K Explorer').check(runsOf([25, 24]))).toBe(false)
    })
  })

  describe('100K Legend', () => {
    it('awarded at 100 km total', () => {
      expect(badge('100K Legend').check(runsOf([50, 50]))).toBe(true)
    })
    it('not awarded at 99 km', () => {
      expect(badge('100K Legend').check(runsOf([50, 49]))).toBe(false)
    })
  })

  describe('Marathon Master', () => {
    it('awarded for a single run >= 42.2 km', () => {
      expect(badge('Marathon Master').check(runsOf([42.2]))).toBe(true)
    })
    it('not awarded if no single run reaches 42.2 km', () => {
      expect(badge('Marathon Master').check(runsOf([21, 21]))).toBe(false)
    })
    it('awarded even with many shorter runs preceding it', () => {
      expect(badge('Marathon Master').check(runsOf([5, 5, 5, 43]))).toBe(true)
    })
  })

  describe('Week Warrior', () => {
    it('awarded for a 7-day consecutive streak', () => {
      const runs = runsOf(Array(7).fill(5), [0, 1, 2, 3, 4, 5, 6])
      expect(badge('Week Warrior').check(runs)).toBe(true)
    })
    it('not awarded with a gap in the streak', () => {
      // today + 2 days ago (missing yesterday)
      const runs = runsOf([5, 5], [0, 2])
      expect(badge('Week Warrior').check(runs)).toBe(false)
    })
  })

  describe('Month Streak', () => {
    it('awarded for 30 consecutive days', () => {
      const runs = runsOf(Array(30).fill(5), Array.from({ length: 30 }, (_, i) => i))
      expect(badge('Month Streak').check(runs)).toBe(true)
    })
    it('not awarded for only 29 days', () => {
      const runs = runsOf(Array(29).fill(5), Array.from({ length: 29 }, (_, i) => i))
      expect(badge('Month Streak').check(runs)).toBe(false)
    })
  })
})
