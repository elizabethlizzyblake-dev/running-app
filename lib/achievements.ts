import type { SupabaseClient } from '@supabase/supabase-js'
import type { BadgeCategory } from '@/lib/types'

export type BadgeRun = { distance: number; date: string }

export type BadgeDefinition = {
  name: string
  description: string
  category: BadgeCategory
  icon: string
  requirement: string
  check: (runs: BadgeRun[]) => boolean
}

export const AUTO_BADGES: BadgeDefinition[] = [
  {
    name: 'First Steps',
    description: 'Complete your first run with the club',
    category: 'distance',
    icon: 'Footprints',
    requirement: 'Log 1 run',
    check: (runs) => runs.length >= 1,
  },
  {
    name: '10K Club',
    description: 'Run a total of 10km',
    category: 'distance',
    icon: 'Route',
    requirement: '10km total',
    check: (runs) => runs.reduce((s, r) => s + Number(r.distance), 0) >= 10,
  },
  {
    name: '50K Explorer',
    description: 'Run a total of 50km',
    category: 'distance',
    icon: 'Mountain',
    requirement: '50km total',
    check: (runs) => runs.reduce((s, r) => s + Number(r.distance), 0) >= 50,
  },
  {
    name: '100K Legend',
    description: 'Run a total of 100km',
    category: 'distance',
    icon: 'Award',
    requirement: '100km total',
    check: (runs) => runs.reduce((s, r) => s + Number(r.distance), 0) >= 100,
  },
  {
    name: 'Marathon Master',
    description: 'Run 42.2km in a single run',
    category: 'distance',
    icon: 'Crown',
    requirement: '42.2km single run',
    check: (runs) => runs.some((r) => Number(r.distance) >= 42.2),
  },
  {
    name: 'Week Warrior',
    description: 'Run every day for a week',
    category: 'consistency',
    icon: 'Flame',
    requirement: '7-day streak',
    check: (runs) => computeStreak(runs.map((r) => r.date)) >= 7,
  },
  {
    name: 'Month Streak',
    description: 'Run every day for a month',
    category: 'consistency',
    icon: 'Flame',
    requirement: '30-day streak',
    check: (runs) => computeStreak(runs.map((r) => r.date)) >= 30,
  },
]

/**
 * Count consecutive days with at least one run, going backwards from today.
 * Looks back up to 60 days.
 */
export function computeStreak(dates: string[]): number {
  const dateSet = new Set(dates)
  const now = new Date()
  let streak = 0
  for (let i = 0; i < 60; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i))
    const key = d.toISOString().split('T')[0]
    if (dateSet.has(key)) streak++
    else break
  }
  return streak
}

/**
 * Compare a run's all-time history against AUTO_BADGES, insert any newly
 * unlocked badges, and return the names of newly awarded badges.
 */
export async function checkAndAwardBadges(
  supabase: SupabaseClient,
  userId: string,
  allRuns: BadgeRun[]
): Promise<string[]> {
  const { data: existing } = await supabase
    .from('badges')
    .select('name')
    .eq('user_id', userId)

  const earned = new Set((existing ?? []).map((b: { name: string }) => b.name))
  const today = new Date().toISOString().split('T')[0]

  const newBadges = AUTO_BADGES.filter(
    (b) => !earned.has(b.name) && b.check(allRuns)
  )

  if (newBadges.length > 0) {
    await supabase.from('badges').insert(
      newBadges.map((b) => ({
        user_id: userId,
        name: b.name,
        description: b.description,
        category: b.category,
        icon: b.icon,
        requirement: b.requirement,
        earned_date: today,
      }))
    )
  }

  return newBadges.map((b) => b.name)
}
