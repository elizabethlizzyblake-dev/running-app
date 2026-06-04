import { describe, it, expect, vi } from 'vitest'
import { rerankCategory } from '../lib/progress'

describe('rerankCategory', () => {
  it('assigns ranks in descending value order and calls update for each entry', async () => {
    const sorted = [
      { id: 'a', rank: 3, value: 100 },
      { id: 'c', rank: 2, value: 80 },
      { id: 'b', rank: 1, value: 50 },
    ]

    const updateEq = vi.fn().mockResolvedValue({ data: null })
    const update = vi.fn().mockReturnValue({ eq: updateEq })

    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: sorted }),
        update,
      }),
    }

    await rerankCategory(supabase as never, 'distance')

    // update called once per entry
    expect(update).toHaveBeenCalledTimes(3)

    // first entry (highest value) should get rank 1
    expect(update).toHaveBeenNthCalledWith(1, { rank: 1, change: 2 }) // was rank 3, now 1 → change +2
    // second entry: was rank 2, stays rank 2 → change 0
    expect(update).toHaveBeenNthCalledWith(2, { rank: 2, change: 0 })
    // third entry: was rank 1, now rank 3 → change -2
    expect(update).toHaveBeenNthCalledWith(3, { rank: 3, change: -2 })
  })

  it('does nothing when there are no entries', async () => {
    const update = vi.fn()
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null }),
        update,
      }),
    }

    await rerankCategory(supabase as never, 'distance')
    expect(update).not.toHaveBeenCalled()
  })
})
