import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockMaybeSingle = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: mockInsert,
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      maybeSingle: mockMaybeSingle,
    })),
  })),
}))

import { POST } from '../../app/api/join-challenge/route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/join-challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/join-challenge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await POST(makeRequest({ challengeId: 'c-1' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when challengeId is missing', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/challengeId/i)
  })

  it('returns ok with alreadyJoined=true if user already joined', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: 'existing-row' } })
    const res = await POST(makeRequest({ challengeId: 'c-1' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.alreadyJoined).toBe(true)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('inserts participation and returns ok on first join', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null })
    mockInsert.mockResolvedValue({ error: null })
    const res = await POST(makeRequest({ challengeId: 'c-1' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.alreadyJoined).toBeUndefined()
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  it('returns 500 when DB insert fails', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null })
    mockInsert.mockResolvedValue({ error: { message: 'constraint violation' } })
    const res = await POST(makeRequest({ challengeId: 'c-1' }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('constraint violation')
  })
})
