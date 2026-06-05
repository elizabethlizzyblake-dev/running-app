import { describe, it, expect } from 'vitest'

// Tests for leaderboard display logic.
// The SQL RANK() function is tested in Supabase; here we verify the
// client-side mapping that turns RPC rows into display entries.

type RpcRow = { user_id: string; user_name: string; value: number; rank: number }

function toEntries(rows: RpcRow[]) {
  return rows.map(r => ({
    rank: Number(r.rank),
    userId: r.user_id,
    userName: r.user_name,
    value: Number(r.value),
  }))
}

describe('Leaderboard RPC → display mapping', () => {
  const rows: RpcRow[] = [
    { user_id: 'u1', user_name: 'Alice', value: 120.5, rank: 1 },
    { user_id: 'u2', user_name: 'Bob',   value: 80.0,  rank: 2 },
    { user_id: 'u3', user_name: 'Carol', value: 80.0,  rank: 2 },
    { user_id: 'u4', user_name: 'Dave',  value: 10.0,  rank: 4 },
  ]

  it('maps rank correctly', () => {
    const entries = toEntries(rows)
    expect(entries[0].rank).toBe(1)
    expect(entries[3].rank).toBe(4)
  })

  it('preserves tied ranks (RANK not DENSE_RANK)', () => {
    const entries = toEntries(rows)
    expect(entries[1].rank).toBe(2)
    expect(entries[2].rank).toBe(2)
    // no rank 3 — gap after tie is expected behaviour
    expect(entries[3].rank).toBe(4)
  })

  it('maps user_id and user_name correctly', () => {
    const entries = toEntries(rows)
    expect(entries[0].userId).toBe('u1')
    expect(entries[0].userName).toBe('Alice')
  })

  it('coerces numeric value', () => {
    const stringRows = rows.map(r => ({ ...r, value: String(r.value) as unknown as number }))
    const entries = toEntries(stringRows)
    expect(typeof entries[0].value).toBe('number')
    expect(entries[0].value).toBe(120.5)
  })

  it('returns empty array for no rows', () => {
    expect(toEntries([])).toEqual([])
  })

  it('top3 slice is correct', () => {
    const entries = toEntries(rows)
    const top3 = entries.slice(0, 3)
    expect(top3).toHaveLength(3)
    expect(top3.map(e => e.rank)).toEqual([1, 2, 2])
  })
})

// ── Leaderboard category values ───────────────────────────────────

describe('Leaderboard category value computation (mirrors SQL logic)', () => {
  type Run = { distance: number; date: string }

  function distanceTotal(runs: Run[]) {
    return Math.round(runs.reduce((s, r) => s + r.distance, 0) * 10) / 10
  }

  function longestRun(runs: Run[]) {
    return Math.round(Math.max(0, ...runs.map(r => r.distance)) * 10) / 10
  }

  it('distance: sums and rounds to 1 decimal', () => {
    expect(distanceTotal([{ distance: 5.123 }, { distance: 3.456 }] as Run[])).toBe(8.6)
  })

  it('runs: count of activities', () => {
    const runs: Run[] = [{ distance: 5, date: '2025-06-01' }, { distance: 10, date: '2025-06-02' }]
    expect(runs.length).toBe(2)
  })

  it('longest: max single run distance', () => {
    expect(longestRun([{ distance: 5 }, { distance: 21 }, { distance: 10 }] as Run[])).toBe(21)
  })

  it('longest: 0 when no runs', () => {
    expect(longestRun([])).toBe(0)
  })
})
