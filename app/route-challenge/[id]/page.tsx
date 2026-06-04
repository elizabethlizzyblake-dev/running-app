"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { PacelineNav, PacelineProgress, SettingsButton } from "@/components/paceline-ui"
import { AvatarCircle, PRESETS } from "@/components/avatar-circle"

// ── Smooth path generation ──────────────────────────────────────
// Catmull-Rom spline converted to cubic bezier segments

function buildSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return ""
  if (pts.length === 2) return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y}`
  const n = pts.length
  let d = `M ${pts[0].x},${pts[0].y}`
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(n - 1, i + 2)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x},${p2.y}`
  }
  return d
}

// ── Helpers ─────────────────────────────────────────────────────

type Checkpoint = { name: string; km: number; x: number; y: number; emoji: string }

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function posAtKm(km: number, checkpoints: Checkpoint[], totalKm: number) {
  if (!checkpoints.length) return { x: 0, y: 0 }
  const clamped = Math.min(Math.max(0, km), totalKm)
  for (let i = 0; i < checkpoints.length - 1; i++) {
    const from = checkpoints[i]; const to = checkpoints[i + 1]
    if (clamped >= from.km && clamped <= to.km) {
      const t = (clamped - from.km) / (to.km - from.km)
      return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) }
    }
  }
  return { x: checkpoints[checkpoints.length - 1].x, y: checkpoints[checkpoints.length - 1].y }
}

function completedPolyline(km: number, checkpoints: Checkpoint[], totalKm: number) {
  const reached = checkpoints.filter(r => r.km <= km)
  const pos = posAtKm(km, checkpoints, totalKm)
  const pts = [...reached.map(r => `${r.x},${r.y}`), `${pos.x.toFixed(1)},${pos.y.toFixed(1)}`]
  return pts.join(" ")
}

function currentCheckpoint(km: number, checkpoints: Checkpoint[]) {
  return [...checkpoints].reverse().find(r => km >= r.km) ?? checkpoints[0]
}

function nextCheckpoint(km: number, checkpoints: Checkpoint[]) {
  return checkpoints.find(r => km < r.km) ?? null
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

type RouteInfo = { totalKm: number; endLocation: string }
type ChallengeInfo = { title: string; description: string; participants: number; badgeReward: string }

// ── Component ───────────────────────────────────────────────────

export default function RouteChallengeePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [userId, setUserId] = useState("")
  const [myProfile, setMyProfile] = useState<{ name: string; avatarUrl: string | null } | null>(null)
  const [challenge, setChallenge] = useState<ChallengeInfo | null>(null)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [joined, setJoined] = useState(false)
  const [myProgress, setMyProgress] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace("/login"); return }
      setUserId(user.id)

      const [
        { data: ch },
        { data: myPart },
        { data: allParts },
        { data: prof },
      ] = await Promise.all([
        supabase.from("challenges").select("title, description, participants, badge_reward").eq("id", id).single(),
        // Explicit own-row check — guaranteed to work regardless of RLS SELECT policy
        supabase.from("challenge_participants").select("progress").eq("challenge_id", id).eq("user_id", user.id).maybeSingle(),
        // All participants for the runner list (may be limited by RLS to own row only)
        supabase.from("challenge_participants").select("user_id, progress").eq("challenge_id", id).order("progress", { ascending: false }),
        supabase.from("users").select("name, avatar_url").eq("id", user.id).single(),
      ])

      if (prof) setMyProfile({ name: prof.name, avatarUrl: prof.avatar_url })

      if (!ch) { router.replace("/challenges"); return }
      setChallenge({ title: ch.title, description: ch.description, participants: ch.participants, badgeReward: ch.badge_reward })

      if (myPart !== null && myPart !== undefined) {
        setJoined(true)
        setMyProgress(Number(myPart.progress))
      }

      // Fetch route geometry from DB
      const { data: rc } = await supabase
        .from("route_challenges")
        .select("id, total_distance_km, end_location")
        .eq("challenge_id", id)
        .single()

      if (!rc) { router.replace("/challenges"); return }
      setRouteInfo({ totalKm: rc.total_distance_km, endLocation: rc.end_location })

      const { data: cps } = await supabase
        .from("route_checkpoints")
        .select("name, distance_km, emoji, svg_x, svg_y")
        .eq("route_challenge_id", rc.id)
        .order("order_index", { ascending: true })

      setCheckpoints((cps ?? []).map((cp: { name: string; distance_km: number; emoji: string; svg_x: number; svg_y: number }) => ({
        name: cp.name,
        km: cp.distance_km,
        x: cp.svg_x,
        y: cp.svg_y,
        emoji: cp.emoji,
      })))

      // Fetch participant profiles
      const partIds = (allParts ?? []).map((p: { user_id: string }) => p.user_id)
      const { data: profiles } = partIds.length
        ? await supabase.from("users").select("id, name, avatar_url").in("id", partIds)
        : { data: [] }

      const profileMap = new Map((profiles ?? []).map((p: { id: string; name: string; avatar_url: string }) => [p.id, p]))

      const mapped: Participant[] = (allParts ?? []).map((p: { user_id: string; progress: number }) => ({
        userId: p.user_id,
        name: profileMap.get(p.user_id)?.name ?? "Runner",
        avatarUrl: profileMap.get(p.user_id)?.avatar_url ?? null,
        progress: Number(p.progress),
        isMe: p.user_id === user.id,
      }))

      setParticipants(mapped)
      setLoading(false)
    }
    load()
  }, [id, router])

  const bezierPath = useMemo(
    () => buildSmoothPath(checkpoints.map(cp => ({ x: cp.x, y: cp.y }))),
    [checkpoints]
  )

  const handleJoin = async () => {
    if (!userId || joining || joined) return
    setJoining(true)
    setJoinError(null)
    const { error } = await supabase.from("challenge_participants").insert({ user_id: userId, challenge_id: id, progress: 0 })
    setJoining(false)
    if (error) {
      setJoinError(`${error.message} [${error.code}]`)
      return
    }
    setJoined(true)
    setParticipants(prev => [...prev, {
      userId,
      name: myProfile?.name ?? "You",
      avatarUrl: myProfile?.avatarUrl ?? null,
      progress: 0,
      isMe: true,
    }])
  }

  if (loading || !routeInfo || !checkpoints.length) return null

  const { totalKm, endLocation } = routeInfo
  const cur  = currentCheckpoint(myProgress, checkpoints)
  const next = nextCheckpoint(myProgress, checkpoints)
  const pct  = (myProgress / totalKm) * 100
  const done = myProgress >= totalKm

  // Sort: others first (ascending progress), me last (always on top in SVG)
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
        <p className="text-sm text-ink-2 mt-1">{participants.length} runner{participants.length !== 1 ? "s" : ""} · {totalKm}km total</p>
      </div>

      {/* Your progress card */}
      {joined && (
        <div className="mx-[22px] mt-3">
          <div className="pl-pine p-5 relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 300 100">
              <path d="M-10 50 C 60 30, 120 70, 180 50 S 260 20, 310 50" fill="none" stroke="white" strokeWidth="2" />
            </svg>

            <div className="relative z-[2]">
              {done ? (
                <div className="text-center">
                  <div className="text-3xl mb-1">🏅</div>
                  <div className="font-bold text-paper text-lg">{challenge?.title} Complete!</div>
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
                    <span className="mono text-[11px] text-paper/50">{(totalKm - myProgress).toFixed(1)}km to {endLocation}</span>
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
            <defs>
              <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#B8DCE8" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#D4EEF4" stopOpacity="0.1"  />
              </linearGradient>
            </defs>
            <rect width="360" height="210" fill="#FAF7F0" />
            <path d="M 0,0 L 360,0 L 360,115 Q 270,85 180,95 Q 90,105 0,90 Z" fill="url(#seaGrad)" />

            {/* Full route — dashed gray */}
            <path
              d={bezierPath}
              fill="none"
              stroke="#C8C0B4"
              strokeWidth="2.5"
              strokeDasharray="5,4"
              strokeLinecap="round"
            />

            {/* Completed portion — solid race red */}
            {joined && myProgress > 0 && (
              <polyline
                points={completedPolyline(myProgress, checkpoints, totalKm)}
                fill="none"
                stroke="#E0402A"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Checkpoint circles */}
            {checkpoints.map(cp => {
              const reached = joined && myProgress >= cp.km
              const isEndpoint = cp.km === 0 || cp.km === totalKm
              return (
                <g key={cp.name} transform={`translate(${cp.x},${cp.y})`}>
                  <circle
                    r={isEndpoint ? 13 : 11}
                    fill={reached ? "#E8A93C" : "#EAE2D2"}
                    stroke={reached ? "#D4940A" : "#C8C0B4"}
                    strokeWidth="1.5"
                  />
                  <text textAnchor="middle" dominantBaseline="central" fontSize={isEndpoint ? "12" : "10"}>
                    {cp.emoji}
                  </text>
                </g>
              )
            })}

            {/* Participant avatar dots */}
            {svgParticipants.map(p => {
              const pos = posAtKm(p.progress, checkpoints, totalKm)
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
            {checkpoints.map(cp => (
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
            {joining ? "Joining…" : `Join ${challenge?.title}`}
          </button>
          {joinError && (
            <div className="mt-2 px-4 py-3 rounded-[12px] bg-race/10 border border-race/20">
              <p className="text-[12px] text-race font-semibold">Failed to join: {joinError}</p>
            </div>
          )}
          {!joinError && (
            <p className="text-xs text-ink-3 text-center mt-2">
              Your logged km count towards the challenge automatically
            </p>
          )}
        </div>
      )}

      {/* Runners on the route */}
      {participants.length > 0 && (
        <div className="px-[22px] mt-5">
          <span className="pl-seclabel">Runners on the route</span>
          <div className="flex flex-col gap-2 mt-3">
            {[...participants].sort((a, b) => b.progress - a.progress).map((p, i) => {
              const cp = currentCheckpoint(p.progress, checkpoints)
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
