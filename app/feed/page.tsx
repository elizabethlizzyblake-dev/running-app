import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PacelineNav, SettingsButton } from "@/components/paceline-ui"
import { FeedCard } from "./feed-card"
import type { RunLoggedData, BadgeEarnedData, ChallengeJoinedData, FeedEventType } from "@/lib/feed"

export const dynamic = 'force-dynamic'

export type FeedEvent = {
  id: string
  user_id: string
  event_type: FeedEventType
  data: RunLoggedData | BadgeEarnedData | ChallengeJoinedData
  created_at: string
  users: { name: string; avatar_url: string | null } | null
}

export type ReactionGroup = {
  emoji: string
  count: number
  hasReacted: boolean
}

export type Comment = {
  id: string
  feed_event_id: string
  user_id: string
  text: string
  created_at: string
  users: { name: string; avatar_url: string | null } | null
}

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [eventsRes, profileRes] = await Promise.all([
    supabase
      .from('feed_events')
      .select('id, user_id, event_type, data, created_at, users(name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('users')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single(),
  ])

  const events = (eventsRes.data ?? []) as unknown as FeedEvent[]
  const profile = profileRes.data

  const eventIds = events.map(e => e.id)

  const [reactionsRes, commentsRes] = await Promise.all(
    eventIds.length
      ? [
          supabase.from('reactions').select('id, feed_event_id, user_id, emoji').in('feed_event_id', eventIds),
          supabase.from('comments').select('id, feed_event_id, user_id, text, created_at, users(name, avatar_url)').in('feed_event_id', eventIds).order('created_at', { ascending: true }),
        ]
      : [{ data: [] }, { data: [] }]
  )

  const reactionMap = new Map<string, ReactionGroup[]>()
  const commentMap = new Map<string, Comment[]>()

  for (const ev of events) {
    const evReactions = (reactionsRes.data ?? []).filter(r => r.feed_event_id === ev.id)
    const grouped = new Map<string, { count: number; hasReacted: boolean }>()
    for (const r of evReactions) {
      const prev = grouped.get(r.emoji) ?? { count: 0, hasReacted: false }
      grouped.set(r.emoji, {
        count: prev.count + 1,
        hasReacted: prev.hasReacted || r.user_id === user.id,
      })
    }
    reactionMap.set(ev.id, Array.from(grouped.entries()).map(([emoji, g]) => ({ emoji, ...g })))
    commentMap.set(ev.id, (commentsRes.data ?? []).filter(c => c.feed_event_id === ev.id) as unknown as Comment[])
  }

  return (
    <div className="min-h-screen bg-paper pb-[110px]">
      <SettingsButton />

      <div className="px-[22px] pt-[54px] pb-4">
        <h1 className="anton text-[28px] tracking-[0.04em] text-ink">CLUB FEED</h1>
        <p className="mono text-[11px] tracking-[0.06em] uppercase text-ink-3 mt-[2px]">What the pack is up to</p>
      </div>

      <div className="px-[16px] flex flex-col gap-3">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-[48px]">🏃</span>
            <p className="text-ink-2 text-[15px] font-medium">No activity yet</p>
            <p className="text-ink-3 text-[13px] text-center max-w-[220px]">
              Log a run or join a quest to kick things off
            </p>
          </div>
        ) : (
          events.map(event => (
            <FeedCard
              key={event.id}
              event={event}
              currentUserId={user.id}
              currentUserName={profile?.name ?? ''}
              currentUserAvatar={profile?.avatar_url ?? null}
              initialReactions={reactionMap.get(event.id) ?? []}
              initialComments={commentMap.get(event.id) ?? []}
            />
          ))
        )}
      </div>

      <PacelineNav active="/feed" />
    </div>
  )
}
