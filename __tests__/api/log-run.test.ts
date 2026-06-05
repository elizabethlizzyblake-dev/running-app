import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ────────────────────────────────────────────────────────
const mockInsert = vi.fn()
const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))
vi.mock('@/lib/strava', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [] }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    })),
  })),
}))
vi.mock('@/lib/achievements', () => ({
  checkAndAwardBadges: vi.fn().mockResolvedValue([]),
}))
vi.mock('@/lib/progress', () => ({
  updateChallengeProgress: vi.fn().mockResolvedValue(undefined),
}))

import { POST } from '../../app/api/log-run/route'

const TODAY = new Date().toISOString().split('T')[0]

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/log-run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function setupAuth(authed = true) {
  mockGetUser.mockResolvedValue({
    data: { user: authed ? { id: 'user-1' } : null },
  })
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [] }),
    insert: mockInsert,
    maybeSingle: vi.fn().mockResolvedValue({ data: null }),
  })
  mockInsert.mockResolvedValue({ error: null })
}

// ── Tests ────────────────────────────────────────────────────────

describe('POST /api/log-run', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when unauthenticated', async () => {
    setupAuth(false)
    const res = await POST(makeRequest({ date: TODAY, distance: 5, minutes: 30, seconds: 0, type: 'easy', notes: '' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for a future date', async () => {
    setupAuth()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const res = await POST(makeRequest({ date: tomorrow.toISOString().split('T')[0], distance: 5, minutes: 30, seconds: 0, type: 'easy', notes: '' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/future/i)
  })

  it('returns 400 for zero distance', async () => {
    setupAuth()
    const res = await POST(makeRequest({ date: TODAY, distance: 0, minutes: 30, seconds: 0, type: 'easy', notes: '' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/distance/i)
  })

  it('returns 400 for distance over 500 km', async () => {
    setupAuth()
    const res = await POST(makeRequest({ date: TODAY, distance: 501, minutes: 30, seconds: 0, type: 'easy', notes: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for zero duration', async () => {
    setupAuth()
    const res = await POST(makeRequest({ date: TODAY, distance: 5, minutes: 0, seconds: 0, type: 'easy', notes: '' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/duration/i)
  })

  it('returns 400 for invalid seconds', async () => {
    setupAuth()
    const res = await POST(makeRequest({ date: TODAY, distance: 5, minutes: 0, seconds: 60, type: 'easy', notes: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for malformed body', async () => {
    setupAuth()
    const req = new Request('http://localhost/api/log-run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with badges on a valid run', async () => {
    setupAuth()
    const { checkAndAwardBadges } = await import('@/lib/achievements')
    vi.mocked(checkAndAwardBadges).mockResolvedValue(['First Steps'])

    const res = await POST(makeRequest({ date: TODAY, distance: 5, minutes: 30, seconds: 0, type: 'easy', notes: '' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.badges).toContain('First Steps')
  })

  it('returns 500 when the DB insert fails', async () => {
    setupAuth()
    mockInsert.mockResolvedValue({ error: { message: 'DB error' } })
    const res = await POST(makeRequest({ date: TODAY, distance: 5, minutes: 30, seconds: 0, type: 'easy', notes: '' }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('DB error')
  })
})
