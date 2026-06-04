"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, MapPin, Flag, Trophy } from "lucide-react"
import { PacelineNav, PacelineProgress, SettingsButton } from "@/components/paceline-ui"
import { AvatarCircle, PRESETS } from "@/components/avatar-circle"

// ── Route geometry ─────────────────────────────────────────────
// SVG viewBox 0 0 360 210 — positions derived from the Kent coast shape

const ROUTE = [
  { name: "Sittingbourne", km: 0,  x: 22,  y: 180, emoji: "🏁" },
  { name: "Faversham",     km: 13, x: 80,  y: 148, emoji: "🌿" },
  { name: "Whitstable",    km: 26, x: 138, y: 126, emoji: "🦪" },
  { name: "Herne Bay",     km: 37, x: 188, y: 144, emoji: "🌊" },
  { name: "Margate",       km: 62, x: 268, y: 104, emoji: "🎡" },
  { name: "Broadstairs",   km: 68, x: 308, y: 138, emoji: "📖" },
  { name: "Ramsgate",      km: 74, x: 338, y: 180, emoji: "🏅" },
]

const TOTAL_KM = 74

// Smooth bezier path through the checkpoint positions
const BEZIER_PATH =
  "M 22,180 C 44,165 60,138 80,148 C 104,160 118,126 138,126 " +
  "C 158,126 168,148 188,144 C 218,138 248,104 268,104 " +
  "C 286,104 296,138 308,138 C 318,138 328,162 338,180"

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function posAtKm(km: number) {
  const clamped = Math.min(Math.max(0, km), TOTAL_KM)
  for (let i = 0; i < ROUTE.length - 1; i++) {
    const from = ROUTE[i]; const to = ROUTE[i + 1]
    if (clamped >= from.km && clamped <= to.km) {
      const t = (clamped - from.km) / (to.km - from.km)
      return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) }
    }
  }
  return { x: ROUTE[ROUTE.length - 1].x, y: ROUTE[ROUTE.length - 1].y }
}

function completedPolyline(km: number) {
  const reached = ROUTE.filter(r => r.km <= km)
  const pos = posAtKm(km)
  const pts = [...reached.map(r => `${r.x},${r.y}`), `${pos.x.toFixed(1)},${pos.y.toFixed(1)}`]
  return pts.join(" ")
}

function currentCheckpoint(km: number) {
  return [...ROUTE].reverse().find(r => km >= r.km) ?? ROUTE[0]
}

function nextCheckpoint(km: number) {
  return ROUTE.find(r => km < r.km) ?? null
}

function presetBg(url: string | null) {
  if (!url?.startsWith("preset:")) return null
  return PRESETS.find(p => `preset:${p.id}` === url)?.bg ?? null
}

// ── Types ───────────────────────────────────────────────────────

type Participant = {
  userId: string
  name: string
  avatarUrl: string | null
  progress: number
  isMe: boolean
}

// ── Component ───────────────────────────────────────────────────

export default function RouteChallengeePage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [loading,      setLoading]      = useState(true)
  const [joining,      setJoining]      = useState(false)
  const [userId,       setUserId]       = useState("")
  const [challenge,    setChallenge]    = useState<{ title: string; description: string; participants: number; badgeReward: string } | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [joined,       setJoined]       = useState(false)
  const [myProgress,   setMyProgress]   = useState(0)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace("/login"); return }
      setUserId(user.id)

      const [
        { data: ch },
        { data: parts },
      ] = await Promise.all([
        supabase.from("challenges").select("title, description, participants, badge_reward").eq("id", id).single(),
        supabase.from("challenge_participants").select("user_id, progress").eq("challenge_id", id).order("progress", { ascending: false }),
      ])

      if (!ch) { router.replace("/challenges"); return }
      setChallenge({ title: ch.title, description: ch.description, participants: ch.participants, badgeReward: ch.badge_reward })

      const partIds = (parts ?? []).map((p: { user_id: string }) => p.user_id)
      const { data: profiles } = partIds.length
        ? await supabase.from("users").select("id, name, avatar_url").in("id", partIds)
        : { data: [] }

      const profileMap = new Map((profiles ?? []).map((p: { id: string; name: string; avatar_url: string }) => [p.id, p]))

      const mapped: Participant[] = (parts ?? []).map((p: { user_id: string; progress: number }) => ({
        userId:    p.user_id,
        name:      profileMap.get(p.user_id)?.name ?? "Runner",
        avatarUrl: profileMap.get(p.user_id)?.avatar_url ?? null,
        progress:  Number(p.progress),
        isMe:      p.user_id === user.id,
      }))

      setParticipants(mapped)
      const me = mapped.find(p => p.isMe)
      if (me) { setJoined(true); setMyProgress(me.progress) }
      setLoading(false)
    }
    load()
  }, [id, router])

  const handleJoin = async () => {
    if (!userId || joining) return
    setJoining(true)
    await supabase.from("challenge_participants").insert({ user_id: userId, challenge_id: id })
    await supabase.from("challenges").update({ participants: (challenge?.participants ?? 0) + 1 }).eq("id", id)
    setJoined(true)
    setParticipants(prev => [...prev, { userId, name: "You", avatarUrl: null, progress: 0, isMe: true }])
    setChallenge(prev => prev ? { ...prev, participants: prev.participants + 1 } : prev)
    setJoining(false)
  }

  if (loading) return null

  const cur  = currentCheckpoint(myProgress)
  const next = nextCheckpoint(myProgress)
  const pct  = (myProgress / TOTAL_KM) * 100
  const done = myProgress >= TOTAL_KM

  // Sort: others first (ascending), me last (always on top in SVG)
  const svgParticipants = [...participants].sort((a, b) =>
    a.isMe ? 1 : b.isMe ? -1 : a.progress - b.progress
  )

  return (
    <div className="min-h-screen bg-paper pb-[110px] pl-anim">
      <SettingsButton />

      {/* Header */}
      <div className="flex items-center gap-3 px-[22px] pt-[54px] pb-[6px]">
        <Link href="/challenges" className="w-[38px] h-[38px] rounded-full border border-line bg-card flex items-center justify-center text-ink-2 flex-shrink-0">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex items-center gap-[9px]">
          <div className="relative w-[26px] h-[26px] flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-[4px] border-race" />
            <div className="absolute w-2 h-2 rounded-full bg-gold top-[-1px] left-1/2 -translate-x-1/2" />
          </div>
          <span className="anton text-lg tracking-[0.07em] text-ink">PACELINE</span>
        </div>
      </div>

      <div className="px-[22px] pt-[14px] pb-1">
        <div className="pl-eyebrow">Virtual Route Challenge</div>
        <h1 className="pl-heading mt-1 text-[34px]">{challenge?.title}</h1>
        <p className="text-sm text-ink-2 mt-1">{challenge?.participants} runners · {TOTAL_KM}km total</p>
      </div>

      {/* Your progress card */}
      {joined && (
        <div className="mx-[22px] mt-3">
          <div className="pl-pine p-5 relative overflow-hidden">
            {/* Subtle background motif */}
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 300 100">
              <path d="M-10 50 C 60 30, 120 70, 180 50 S 260 20, 310 50" fill="none" stroke="white" strokeWidth="2" />
            </svg>

            <div className="relative z-[2]">
              {done ? (
                <div className="text-center">
                  <div className="text-3xl mb-1">🏅</div>
                  <div className="font-bold text-paper text-lg">Road to Ramsgate Complete!</div>
                  <p className="mono text-[11px] text-paper/60 mt-1">You earned the {challenge?.badgeReward} badge</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="mono text-[10px] tracking-[0.14em] uppercase text-paper/50">You are here</div>
                      <div className="font-bold text-paper text-[17px] mt-[2px]">
                        {cur.emoji} {cur.name}
                      </div>
                    </div>
                    {next && (
                      <div className="text-right">
                        <div className="mono text-[10px] tracking-[0.14em] uppercase text-paper/50">Next stop</div>
                        <div className="font-semibold text-paper/80 text-[14px] mt-[2px]">
                          {next.emoji} {next.name}
                        </div>
                        <div className="mono text-[10px] text-paper/50 mt-[2px]">
                          {(next.km - myProgress).toFixed(1)}km away
                        </div>
                      </div>
                    )}
                  </div>

                  <PacelineProgress value={pct} onPine height={10} />
                  <div className="flex justify-between mt-2">
                    <span className="mono text-[11px] text-gold">{myProgress.toFixed(1)}km</span>
                    <span className="mono text-[11px] text-paper/50">{(TOTAL_KM - myProgress).toFixed(1)}km to Ramsgate</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Route Map SVG */}
      <div className="mx-[22px] mt-3">
        <div className="pl-card overflow-hidden p-0">
          <svg viewBox="0 0 360 210" className="w-full" style={{ display: "block" }}>
            {/* Sea background */}
            <defs>
              <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#B8DCE8" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#D4EEF4" stopOpacity="0.1"  />
              </linearGradient>
            </defs>
            <rect width="360" height="210" fill="#FAF7F0" />
            <path d="M 0,0 L 360,0 L 360,115 Q 270,85 180,95 Q 90,105 0,90 Z" fill="url(#seaGrad)" />
            <text x="310" y="30" fontSize="9" fill="#6BA8BC" fontFamily="system-ui" opacity="0.7">North Sea</text>

            {/* Full route — dashed gray */}
            <path
              d={BEZIER_PATH}
              fill="none"
              stroke="#C8C0B4"
              strokeWidth="2.5"
              strokeDasharray="5,4"
              strokeLinecap="round"
            />

            {/* Completed portion — solid race red */}
            {joined && myProgress > 0 && (
              <polyline
                points={completedPolyline(myProgress)}
                fill="none"
                stroke="#E0402A"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Checkpoint circles */}
            {ROUTE.map(cp => {
              const reached = joined && myProgress >= cp.km
              return (
                <g key={cp.name} transform={`translate(${cp.x},${cp.y})`}>
                  <circle
                    r={cp.km === 0 || cp.km === TOTAL_KM ? 13 : 11}
                    fill={reached ? "#E8A93C" : "#EAE2D2"}
                    stroke={reached ? "#D4940A" : "#C8C0B4"}
                    strokeWidth="1.5"
                  />
                  <text textAnchor="middle" dominantBaseline="central" fontSize={cp.km === 0 || cp.km === TOTAL_KM ? "12" : "10"}>
                    {cp.emoji}
                  </text>
                </g>
              )
            })}

            {/* Participant avatar dots */}
            {svgParticipants.map(p => {
              const pos = posAtKm(p.progress)
              const bg  = presetBg(p.avatarUrl) ?? (p.isMe ? "#E0402A" : "#2C4E41")
              const r   = p.isMe ? 13 : 11
              return (
                <g key={p.userId} transform={`translate(${pos.x.toFixed(1)},${pos.y.toFixed(1)})`}>
                  {p.isMe && <circle r={r + 3} fill="none" stroke="#E0402A" strokeWidth="2" opacity="0.5" />}
                  <circle r={r} fill={bg} stroke="white" strokeWidth="1.5" />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={p.isMe ? "8" : "7"}
                    fill="white"
                    fontWeight="700"
                    fontFamily="system-ui"
                  >
                    {p.isMe ? "YOU" : p.name[0]?.toUpperCase()}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Checkpoint legend */}
          <div className="flex overflow-x-auto gap-0 hide-scrollbar border-t border-line">
            {ROUTE.map((cp, i) => (
              <div key={cp.name} className="flex-1 min-w-[46px] flex flex-col items-center py-2 px-1 border-r last:border-r-0 border-line">
                <span className="text-[14px]">{cp.emoji}</span>
                <span className="mono text-[8px] text-ink-3 text-center leading-tight mt-[2px]">{cp.name.split(" ")[0]}</span>
                <span className="mono text-[7px] text-ink-3/60">{cp.km}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Join button */}
      {!joined && (
        <div className="px-[22px] mt-4">
          <button
            onClick={handleJoin}
            disabled={joining}
            className="pl-btn pl-btn-primary disabled:opacity-50"
          >
            {joining ? "Joining…" : "Join the Road to Ramsgate"}
          </button>
          <p className="text-xs text-ink-3 text-center mt-2">
            Your logged km count towards the challenge automatically
          </p>
        </div>
      )}

      {/* Runners on the route */}
      {participants.length > 0 && (
        <div className="px-[22px] mt-5">
          <span className="pl-seclabel">Runners on the route</span>
          <div className="flex flex-col gap-2 mt-3">
            {[...participants].sort((a, b) => b.progress - a.progress).map((p, i) => {
              const cp = currentCheckpoint(p.progress)
              return (
                <div key={p.userId} className={`pl-lrow ${p.isMe ? "pl-lrow-me" : ""}`}>
                  <div className="pl-rank">{i + 1}</div>
                  <AvatarCircle url={p.avatarUrl} name={p.name} size="sm" />
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${p.isMe ? "text-race" : "text-ink"}`}>
                      {p.name}{p.isMe && <span className="mono text-[10px] ml-1 text-race">YOU</span>}
                    </div>
                    <div className="mono text-[10px] text-ink-3">{cp.emoji} {cp.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="mono text-sm font-semibold text-ink">{p.progress.toFixed(1)}</div>
                    <div className="mono text-[9px] text-ink-3">km</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <PacelineNav active="/challenges" />
    </div>
  )
}
