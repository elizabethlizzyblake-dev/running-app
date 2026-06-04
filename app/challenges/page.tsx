"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  PacelineProgress,
  PacelineNav,
  SettingsButton,
  Users,
  Calendar,
  Medal,
  Check,
} from "@/components/paceline-ui"

import Link from "next/link"
import { Map as MapIcon } from "lucide-react"

type Challenge = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  targetMetric: string
  targetValue: number
  badgeReward: string
  participants: number
  currentProgress: number
  joined: boolean
  isRoute: boolean
}

function ChallengeCard({ c, onJoin, joiningId }: { c: Challenge; onJoin: (id: string) => void; joiningId: string | null }) {
  const isJoining = joiningId === c.id
  const p = ((c.currentProgress ?? 0) / c.targetValue) * 100
  const done = p >= 100
  const daysLeft = Math.max(0, Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <div
      className="pl-card p-[17px]"
      style={{ borderColor: done ? 'var(--race)' : 'var(--line)' }}
    >
      <div className="flex justify-between items-start gap-[10px]">
        <div className="font-extrabold text-[17px]">{c.title}</div>
        {done && (
          <span className="pl-pill pl-pill-race">
            <Check size={12} /> Done
          </span>
        )}
      </div>

      <p className="text-[13.5px] text-ink-2 mt-[6px] leading-[1.45]">{c.description}</p>

      <div className="flex gap-[14px] mt-3 flex-wrap">
        <span className="mono text-[10.5px] tracking-[0.04em] text-ink-3 flex items-center gap-1">
          <Users size={13} /> {c.participants}
        </span>
        <span className="mono text-[10.5px] tracking-[0.04em] text-ink-3 flex items-center gap-1">
          <Calendar size={13} /> {daysLeft}d left
        </span>
        <span className="mono text-[10.5px] tracking-[0.04em] text-[#8A5E12] flex items-center gap-1">
          <Medal size={13} /> {c.badgeReward}
        </span>
      </div>

      {c.joined ? (
        <div className="mt-[14px]">
          <div className="flex justify-between mb-[7px]">
            <span className="mono text-[11px] text-ink-3">Your progress</span>
            <span className="mono text-[11px] font-semibold">
              {c.currentProgress ?? 0} / {c.targetValue}{c.targetMetric === "distance" ? "km" : ""}
            </span>
          </div>
          <PacelineProgress value={p} solid={done} height={10} />
          {c.isRoute && (
            <Link
              href={`/route-challenge/${c.id}`}
              className="mt-3 w-full flex items-center justify-center gap-2 py-[11px] rounded-[12px] bg-pine text-paper font-semibold text-[13.5px]"
            >
              <MapIcon size={15} /> View route map
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-[14px]">
          <button className="pl-btn pl-btn-dark disabled:opacity-50" onClick={() => onJoin(c.id)} disabled={!!joiningId}>
            {isJoining ? 'Joining…' : 'Join quest'}
          </button>
          {c.isRoute && (
            <Link
              href={`/route-challenge/${c.id}`}
              className="w-full flex items-center justify-center gap-2 py-[11px] rounded-[12px] border border-line text-ink-2 font-semibold text-[13.5px]"
            >
              <MapIcon size={15} /> Preview route
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [joiningId, setJoiningId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [challengeRes, participationRes, routeRes] = await Promise.all([
        supabase.from('challenges').select('*').order('start_date'),
        supabase.from('challenge_participants').select('challenge_id, progress').eq('user_id', user.id),
        supabase.from('route_challenges').select('challenge_id'),
      ])

      const all            = challengeRes.data
      const participations = participationRes.data
      const routes         = routeRes.data

      const progressMap  = new Map((participations ?? []).map((p: { challenge_id: string; progress: number }) => [p.challenge_id, Number(p.progress)]))
      const joinedIds    = new Set((participations ?? []).map((p: { challenge_id: string }) => p.challenge_id))
      const routeIds     = new Set((routes ?? []).map((r: { challenge_id: string }) => r.challenge_id))
      setChallenges((all ?? []).map((c: {
        id: string; title: string; description: string
        start_date: string; end_date: string; target_metric: string
        target_value: number; badge_reward: string; participants: number
      }) => ({
        id: c.id, title: c.title, description: c.description,
        startDate: c.start_date, endDate: c.end_date,
        targetMetric: c.target_metric, targetValue: Number(c.target_value),
        badgeReward: c.badge_reward, participants: c.participants,
        currentProgress: progressMap.get(c.id) ?? 0,
        joined: joinedIds.has(c.id),
        isRoute: routeIds.has(c.id),
      })))
    }
    load()
  }, [])

  const handleJoin = async (id: string) => {
    if (!userId || joiningId) return
    setJoinError(null)
    setJoiningId(id)
    const { error } = await supabase.from('challenge_participants').insert({ user_id: userId, challenge_id: id })
    setJoiningId(null)
    if (error) {
      setJoinError(`${error.message} [${error.code}]`)
      return
    }
    setChallenges(prev => prev.map(c =>
      c.id === id ? { ...c, joined: true, participants: c.participants + 1 } : c
    ))
  }

  const joined = challenges.filter(c => c.joined)
  const available = challenges.filter(c => !c.joined)

  return (
    <div className="min-h-screen bg-paper pb-[110px] pl-anim">
      <SettingsButton />

      {/* Header */}
      <div className="px-[22px] pt-[54px] pb-[6px]">
        <div className="flex items-center gap-[9px]">
          <div className="relative w-[26px] h-[26px] flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-[4px] border-race" />
            <div className="absolute w-2 h-2 rounded-full bg-gold top-[-1px] left-1/2 -translate-x-1/2" />
          </div>
          <span className="anton text-lg tracking-[0.07em] text-ink">PACELINE</span>
        </div>
      </div>

      <div className="px-[22px] pt-[14px] pb-2">
        <div className="pl-eyebrow">Group Quests</div>
        <h1 className="pl-heading mt-2">Quests</h1>
        <div className="text-sm text-ink-2 mt-2">
          {joined.length} active &middot; {available.length} to join
        </div>
      </div>

      {joinError && (
        <div className="mx-[22px] mt-2 px-4 py-3 rounded-[12px] bg-race/10 border border-race/20">
          <p className="text-[12px] text-race font-semibold">Failed to join: {joinError}</p>
        </div>
      )}

      {/* Active Quests */}
      {joined.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-[7px] mx-[22px] mb-3">
            <span className="w-[7px] h-[7px] rounded-full bg-race" />
            <span className="pl-seclabel">Your Active Quests</span>
          </div>
          <div className="px-[22px] flex flex-col gap-3">
            {joined.map(c => <ChallengeCard key={c.id} c={c} onJoin={handleJoin} joiningId={joiningId} />)}
          </div>
        </div>
      )}

      {/* Open to Join */}
      {available.length > 0 && (
        <div className="mt-[22px]">
          <div className="mx-[22px] mb-3">
            <span className="pl-seclabel">Open to Join</span>
          </div>
          <div className="px-[22px] flex flex-col gap-3">
            {available.map(c => <ChallengeCard key={c.id} c={c} onJoin={handleJoin} joiningId={joiningId} />)}
          </div>
        </div>
      )}

      {challenges.length === 0 && (
        <div className="px-[22px] mt-8 text-center">
          <div className="pl-card p-8">
            <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 mb-2">No quests yet</div>
            <p className="text-sm text-ink-2">Check back soon for new challenges!</p>
          </div>
        </div>
      )}

      <PacelineNav active="/challenges" />
    </div>
  )
}
