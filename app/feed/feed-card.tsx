"use client"

import { useState, useRef } from "react"
import { AvatarCircle } from "@/components/avatar-circle"
import { formatPace, formatDistance, formatDuration } from "@/lib/formatting"
import { Send } from "lucide-react"
import type { FeedEvent, ReactionGroup, Comment } from "./page"
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
  currentUserName: string
  currentUserAvatar: string | null
  initialReactions: ReactionGroup[]
  initialComments: Comment[]
}

export function FeedCard({ event, currentUserId, currentUserName, currentUserAvatar, initialReactions, initialComments }: Props) {
  const [reactions, setReactions] = useState<ReactionGroup[]>(initialReactions)
  const [pendingEmoji, setPendingEmoji] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function toggleReaction(emoji: string) {
    if (pendingEmoji) return
    setPendingEmoji(emoji)

    const existing = reactions.find(r => r.emoji === emoji)
    const hasReacted = existing?.hasReacted ?? false

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
      setReactions(initialReactions)
    } finally {
      setPendingEmoji(null)
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    const text = commentText.trim()
    if (!text || submitting) return

    setSubmitting(true)

    const optimistic: Comment = {
      id: `opt-${Date.now()}`,
      feed_event_id: event.id,
      user_id: currentUserId,
      text,
      created_at: new Date().toISOString(),
      users: { name: currentUserName, avatar_url: currentUserAvatar },
    }
    setComments(prev => [...prev, optimistic])
    setCommentText('')

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedEventId: event.id, text }),
      })
      const json = await res.json()
      if (json.ok && json.comment) {
        setComments(prev => prev.map(c => c.id === optimistic.id ? json.comment as Comment : c))
      } else {
        setComments(prev => prev.filter(c => c.id !== optimistic.id))
      }
    } catch {
      setComments(prev => prev.filter(c => c.id !== optimistic.id))
    } finally {
      setSubmitting(false)
    }
  }

  const eventUser = event.users
  const shownEmojis = EMOJIS.map(emoji => {
    const group = reactions.find(r => r.emoji === emoji)
    return { emoji, count: group?.count ?? 0, hasReacted: group?.hasReacted ?? false }
  })

  return (
    <div className="bg-card border border-line rounded-[16px] px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <AvatarCircle url={eventUser?.avatar_url} name={eventUser?.name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[14px] text-ink leading-tight truncate">{eventUser?.name ?? 'A member'}</p>
          <p className="mono text-[11px] text-ink-3 uppercase tracking-[0.05em]">
            {EVENT_VERB[event.event_type] ?? event.event_type}
          </p>
        </div>
        <span className="mono text-[11px] text-ink-3 flex-none">{relativeTime(event.created_at)}</span>
      </div>

      {/* Body */}
      <div className="mb-4">
        {event.event_type === 'run_logged' && <RunBody data={event.data as RunLoggedData} />}
        {event.event_type === 'badge_earned' && <BadgeBody data={event.data as BadgeEarnedData} />}
        {event.event_type === 'challenge_joined' && <ChallengeBody data={event.data as ChallengeJoinedData} />}
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-2 mb-3">
        {shownEmojis.map(({ emoji, count, hasReacted }) => (
          <button
            key={emoji}
            onClick={() => toggleReaction(emoji)}
            disabled={pendingEmoji === emoji}
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

      {/* Comments */}
      {comments.length > 0 && (
        <div className="border-t border-line/60 pt-3 mb-3 flex flex-col gap-[10px]">
          {comments.map(c => (
            <div key={c.id} className="flex items-start gap-2">
              <AvatarCircle url={c.users?.avatar_url} name={c.users?.name} size="sm" className="flex-none w-[26px] h-[26px] text-[10px]" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-ink">
                  <span className="font-semibold">{c.users?.name ?? 'Member'}</span>
                  {' '}
                  <span className="text-ink-2">{c.text}</span>
                </p>
                <p className="mono text-[10px] text-ink-3 mt-[2px]">{relativeTime(c.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      <form onSubmit={submitComment} className="flex items-center gap-2 border-t border-line/60 pt-3">
        <AvatarCircle url={currentUserAvatar} name={currentUserName} size="sm" className="flex-none w-[26px] h-[26px] text-[10px]" />
        <input
          ref={inputRef}
          type="text"
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder="Add a comment…"
          maxLength={500}
          className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-ink-3 outline-none min-w-0"
        />
        {commentText.trim() && (
          <button
            type="submit"
            disabled={submitting}
            className="flex-none text-race disabled:opacity-40 transition-opacity"
            aria-label="Post comment"
          >
            <Send size={15} strokeWidth={2} />
          </button>
        )}
      </form>
    </div>
  )
}
