import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Mocks ────────────────────────────────────────────────────────
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}))
vi.mock('@/lib/strava', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { name: 'Lizzy' } }),
    })),
  })),
  importStravaActivity: vi.fn().mockResolvedValue(true),
}))

import { GET } from '../../app/api/strava/callback/route'

function makeCallbackRequest(params: Record<string, string>, stateCookie?: string): NextRequest {
  const url = new URL('http://localhost/api/strava/callback')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const headers: HeadersInit = {}
  if (stateCookie) headers['Cookie'] = `strava_oauth_state=${stateCookie}`
  return new NextRequest(url, { headers })
}

// ── Tests ────────────────────────────────────────────────────────

describe('GET /api/strava/callback', () => {
  const STATE = 'test-state-uuid'

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  it('redirects to /login when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await GET(makeCallbackRequest({ code: 'abc', state: STATE }, STATE))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login')
  })

  it('redirects to /?strava=denied when Strava returns an error', async () => {
    const res = await GET(makeCallbackRequest({ error: 'access_denied', state: STATE }, STATE))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('strava=denied')
  })

  it('redirects to /?strava=error when state cookie is missing (CSRF)', async () => {
    const res = await GET(makeCallbackRequest({ code: 'abc', state: STATE }))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('strava=error')
  })

  it('redirects to /?strava=error when state does not match cookie (CSRF)', async () => {
    const res = await GET(makeCallbackRequest({ code: 'abc', state: 'wrong-state' }, STATE))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('strava=error')
  })

  it('clears the strava_oauth_state cookie on every exit path', async () => {
    const res = await GET(makeCallbackRequest({ error: 'denied', state: STATE }, STATE))
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain('strava_oauth_state=')
    // Cookie value should be empty (deleted)
    expect(setCookie).toMatch(/strava_oauth_state=;|strava_oauth_state=($|;)/)
  })
})
