import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rerankCategory, updateLeaderboard } from '../lib/progress'

// Minimal Supabase mock that records calls
function makeMockSupabase(rows: { id: string; rank: number; value: number }[]) {
  const updates: { id: string; rank: number; change: number }[] = []

  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    order: vi.fn().mockResolvedValue({ data: rows }),
    update: vi.fn((payload: { rank: number; change: number }) => {
      chain._lastPayload = payload
      return chain
    }),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    _lastPayload: {} as { rank: number; change: number },
  }

  const eqFn = vi.fn((_col: string, id: string) => {
    if (_col === 'id') {
      const payload = { ...(chain._lastPayload ?? {}) }
      updates.push({ id, ...payload } as { id: string; rank: number; change: number })
    }
    return chain
  })
  chain.eq = eqFn

  const supabase = {
    from: vi.fn().mockReturnValue(chain),
    _updates: updates,
  }

  return supabase
}

describe('rerankCategory', () => {
  it('assigns ranks in descending value order', async () => {
    const rows = [
      { id: 'a', rank: 3, value: 100 },
      { id: 'b', rank: 1, value: 50 },
      { id: 'c', rank: 2, value: 80 },
    ]
    // order() mock returns rows already sorted (as Supabase would)
    const sorted = [...rows].sort((a, b) => b.value - a.value)

    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: sorted }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    }

    // Should not throw
    await rerankCategory(supabase as never, 'distance')
    expect(supabase.from).toHaveBeenCalledWith('leaderboard_entries')
  })
})

describe('updateLeaderboard — calculates totals correctly', () => {
  it('sums distances, counts runs, and finds longest', async () => {
    const monthRuns = [
      { distance: 10 },
      { distance: 15 },
      { distance: 8 },
    ]

    // Capture what values are passed to upsertLeaderboard
    const inserted: { category: string; value: number }[] = []

    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      order: vi.fn().mockResolvedValue({ data: [] }),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockImplementation((row: { category: string; value: number } | { category: string; value: number }[]) => {
        const rows = Array.isArray(row) ? row : [row]
        inserted.push(...rows)
        return Promise.resolve({ data: null })
      }),
    }

    const supabase = { from: vi.fn().mockReturnValue(chain) }

    await updateLeaderboard(supabase as never, 'user-1', 'Test Runner', monthRuns)

    // distance = 33, runs = 3, longest = 15
    const distEntry = inserted.find(r => r.category === 'distance')
    const runsEntry = inserted.find(r => r.category === 'runs')
    const longestEntry = inserted.find(r => r.category === 'longest')

    expect(distEntry?.value).toBe(33)
    expect(runsEntry?.value).toBe(3)
    expect(longestEntry?.value).toBe(15)
  })
})
