"use client"

import { useState } from "react"
import { AvatarCircle } from "@/components/avatar-circle"
import { formatPace, formatDistance, formatDuration } from "@/lib/formatting"
import type { FeedEvent, ReactionGroup } from "./page"
import type { RunLoggedData, BadgeEarnedData, ChallengeJoinedData } from "@/lib/feed"

const EMOJIS = ['🔥', '💪', '👏', '❤️']

const TYPE_LABELS: Record<string, string> = {
  easy: 'Easy', tempo: 'Tempo', long: 'Long',
  interval: 'Intervals', race: 'Race', recovery: 'Recovery', trail: 'Trail',
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function RunBody({ data }: { data: RunLoggedData }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="mono text-[15px] font-bold text-ink">{formatDistance(data.distance_km)} km</span>
      <span className="w-[1px] h-[14px] bg-line" />
      <span className="mono text-[13px] text-ink-2">{formatDuration(data.duration_min)}</span>
      {data.pace > 0 && (
        <>
          <span className="w-[1px] h-[14px] bg-line" />
          <span className="mono text-[13px] text-ink-2">{formatPace(data.pace)}/km</span>
        </>
      )}
      {data.type && (
        <>
          <span className="w-[1px] h-[14px] bg-line" />
          <span className="mono text-[11px] tracking-[0.06em] uppercase font-semibold px-2 py-[2px] rounded-[6px] bg-pine/10 text-pine">
            {TYPE_LABELS[data.type] ?? data.type}
          </span>
        </>
      )}
    </div>
  )
}

function BadgeBody({ data }: { data: BadgeEarnedData }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[28px] leading-none mt-[2px]">🏅</span>
      <div>
        <p className="font-semibold text-[14px] text-ink">{data.badge_name}</p>
        <p className="text-[12px] text-ink-3 mt-[1px]">{data.badge_description}</p>
      </div>
    </div>
  )
}

function ChallengeBody({ data }: { data: ChallengeJoinedData }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[22px] leading-none">🎯</span>
      <p className="font-semibold text-[14px] text-ink">{data.challenge_title}</p>
    </div>
  )
}

const EVENT_VERB: Record<string, string> = {
  run_logged: 'logged a run',
  badge_earned: 'earned a badge',
  challenge_joined: 'joined a quest',
}

interface Props {
  event: FeedEvent
  currentUserId: string
  initialReactions: ReactionGroup[]
}

export function FeedCard({ event, currentUserId, initialReactions }: Props) {
  const [reactions, setReactions] = useState<ReactionGroup[]>(initialReactions)
  const [pending, setPending] = useState<string | null>(null)

  async function toggleReaction(emoji: string) {
    if (pending) return
    setPending(emoji)

    const existing = reactions.find(r => r.emoji === emoji)
    const hasReacted = existing?.hasReacted ?? false

    // Optimistic update
    setReactions(prev => {
      if (hasReacted) {
        return prev
          .map(r => r.emoji === emoji ? { ...r, count: r.count - 1, hasReacted: false } : r)
          .filter(r => r.count > 0)
      }
      if (existing) {
        return prev.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, hasReacted: true } : r)
      }
      return [...prev, { emoji, count: 1, hasReacted: true }]
    })

    try {
      await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedEventId: event.id, emoji }),
      })
    } catch {
      // Revert on error
      setReactions(initialReactions)
    } finally {
      setPending(null)
    }
  }

  const user = event.users
  const firstName = user?.name?.split(' ')[0] ?? 'Someone'

  const shownEmojis = EMOJIS.map(emoji => {
    const group = reactions.find(r => r.emoji === emoji)
    return { emoji, count: group?.count ?? 0, hasReacted: group?.hasReacted ?? false }
  })

  return (
    <div className="bg-card border border-line rounded-[16px] px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <AvatarCircle url={user?.avatar_url} name={user?.name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[14px] text-ink leading-tight truncate">{user?.name ?? 'A member'}</p>
          <p className="mono text-[11px] text-ink-3 uppercase tracking-[0.05em]">
            {EVENT_VERB[event.event_type] ?? event.event_type}
          </p>
        </div>
        <span className="mono text-[11px] text-ink-3 flex-none">{relativeTime(event.created_at)}</span>
      </div>

      {/* Body */}
      <div className="mb-4">
        {event.event_type === 'run_logged' && (
          <RunBody data={event.data as RunLoggedData} />
        )}
        {event.event_type === 'badge_earned' && (
          <BadgeBody data={event.data as BadgeEarnedData} />
        )}
        {event.event_type === 'challenge_joined' && (
          <ChallengeBody data={event.data as ChallengeJoinedData} />
        )}
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-2">
        {shownEmojis.map(({ emoji, count, hasReacted }) => (
          <button
            key={emoji}
            onClick={() => toggleReaction(emoji)}
            disabled={pending === emoji}
            className={`flex items-center gap-[5px] px-[10px] py-[5px] rounded-full text-[13px] border transition-all active:scale-95 ${
              hasReacted
                ? 'bg-race/10 border-race/30 text-race'
                : 'bg-paper border-line text-ink-3 hover:border-ink-2'
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && (
              <span className={`mono text-[11px] font-semibold ${hasReacted ? 'text-race' : 'text-ink-3'}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
