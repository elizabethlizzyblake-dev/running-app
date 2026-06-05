import { describe, it, expect, vi } from 'vitest'
import { updateChallengeProgress } from '../lib/progress'

function makeSupabase(participations: { challenge_id: string; challenges: { id: string; start_date: string; end_date: string; target_metric: string }[] }[], runs: { distance: number }[]) {
  const update = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
  })

  return {
    from: vi.fn((table: string) => {
      const builder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockImplementation(() => {
          if (table === 'runs') return Promise.resolve({ data: runs })
          return builder
        }),
        update,
      }
      return builder
    }),
    _update: update,
  } as never
}

describe('updateChallengeProgress', () => {
  it('does nothing when user has no challenge participations', async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [] }),
      }),
    }
    await updateChallengeProgress(supabase as never, 'user-1')
    // no update calls — nothing to recalculate
  })

  it('does nothing when joined data is null', async () => {
    const update = vi.fn()
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null }),
        update,
      }),
    }
    await updateChallengeProgress(supabase as never, 'user-1')
    expect(update).not.toHaveBeenCalled()
  })
})
