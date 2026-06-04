"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Camera, Check } from "lucide-react"
import { PacelineNav, SettingsButton } from "@/components/paceline-ui"

const LEVELS = [
  { key: "beginner", label: "Beginner", emoji: "🌱" },
  { key: "5k",       label: "5K",       emoji: "⚡" },
  { key: "10k",      label: "10K",      emoji: "🏃" },
  { key: "half",     label: "Half",     emoji: "🥈" },
  { key: "marathon", label: "Marathon", emoji: "🏆" },
]

export default function ProfilePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [uploading, setUploading] = useState(false)
  const [userId, setUserId]       = useState("")

  const [profile, setProfile] = useState({
    name:                 "",
    avatar_url:           "",
    running_level:        "beginner",
    bio:                  "",
    spotify_playlist_url: "",
    joined_at:            "",
    strava_athlete_id:    null as number | null,
  })

  const [stats, setStats] = useState({ runs: 0, distance: 0 })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace("/login"); return }
      setUserId(user.id)

      const [{ data: p }, { data: runs }] = await Promise.all([
        supabase.from("users").select("*").eq("id", user.id).single(),
        supabase.from("runs").select("distance").eq("user_id", user.id),
      ])

      if (p) {
        setProfile({
          name:                 p.name ?? "",
          avatar_url:           p.avatar_url ?? "",
          running_level:        p.running_level ?? "beginner",
          bio:                  p.bio ?? "",
          spotify_playlist_url: p.spotify_playlist_url ?? "",
          joined_at:            p.joined_at ?? "",
          strava_athlete_id:    p.strava_athlete_id ?? null,
        })
      }

      const totalDist = (runs ?? []).reduce((s, r) => s + Number(r.distance), 0)
      setStats({ runs: (runs ?? []).length, distance: Math.round(totalDist * 10) / 10 })
      setLoading(false)
    }
    load()
  }, [router])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)
    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `${userId}/avatar.${ext}`
    await supabase.storage.from("avatars").upload(path, file, { upsert: true })
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)
    setProfile(p => ({ ...p, avatar_url: publicUrl }))
    await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", userId)
    setUploading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await supabase.from("users").update({
      name:                 profile.name,
      running_level:        profile.running_level,
      bio:                  profile.bio,
      spotify_playlist_url: profile.spotify_playlist_url || null,
    }).eq("id", userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const joinedDate = profile.joined_at
    ? new Date(profile.joined_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : null

  if (loading) return null

  return (
    <div className="min-h-screen bg-paper pb-[110px] pl-anim">
      <SettingsButton />

      {/* Header */}
      <div className="flex items-center gap-3 px-[22px] pt-[54px] pb-[6px]">
        <Link
          href="/"
          className="w-[38px] h-[38px] rounded-full border border-line bg-card flex items-center justify-center text-ink-2 flex-shrink-0"
        >
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

      {/* Avatar */}
      <div className="flex flex-col items-center pt-6 pb-5">
        <div className="relative">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-[88px] h-[88px] rounded-full bg-paper-2 border-2 border-line overflow-hidden flex items-center justify-center"
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="anton text-[34px] text-ink-3">
                {profile.name?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-[28px] h-[28px] rounded-full bg-race text-white flex items-center justify-center shadow-md"
          >
            {uploading ? <span className="mono text-[9px]">…</span> : <Camera size={13} />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        {joinedDate && (
          <p className="mono text-[10px] tracking-[0.1em] uppercase text-ink-3 mt-3">
            Member since {joinedDate}
          </p>
        )}
      </div>

      <div className="px-[22px] space-y-3">

        {/* Name */}
        <div className="pl-field">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px]">Display name</div>
          <input
            type="text"
            value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            className="pl-input"
            placeholder="Your name"
          />
        </div>

        {/* Running level */}
        <div className="pl-field">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-3">Running level</div>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map(l => (
              <button
                key={l.key}
                type="button"
                onClick={() => setProfile(p => ({ ...p, running_level: l.key }))}
                className={`px-3 py-2 rounded-xl border-[1.5px] text-sm font-semibold transition-all flex items-center gap-1 ${
                  profile.running_level === l.key
                    ? "border-race bg-race/[0.08] text-race"
                    : "border-line bg-paper text-ink-3"
                }`}
              >
                {l.emoji} {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="pl-field">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px]">Running goal</div>
          <textarea
            value={profile.bio}
            onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
            className="pl-input resize-none"
            rows={3}
            placeholder="What are you training for?"
          />
        </div>

        {/* Stats */}
        <div className="pl-card py-[18px] px-2 flex">
          {[
            { n: stats.runs,     l: "Total runs", c: "text-race" },
            { n: stats.distance, l: "Total km",   c: "text-pine" },
          ].map((x, i) => (
            <div key={i} className={`flex-1 text-center ${i > 0 ? "border-l border-line" : ""}`}>
              <div className={`pl-statn text-[34px] ${x.c}`}>{x.n}</div>
              <div className="pl-statl">{x.l}</div>
            </div>
          ))}
        </div>

        {/* Connected Apps */}
        <div className="pl-field">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-3">Connected apps</div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <span className="text-xl">🟠</span>
              <div>
                <p className="text-sm font-semibold text-ink">Strava</p>
                <p className="mono text-[10px] text-ink-3">
                  {profile.strava_athlete_id ? "Connected — runs import automatically" : "Not connected"}
                </p>
              </div>
            </div>
            {profile.strava_athlete_id ? (
              <span className="pl-pill pl-pill-pine">
                <Check size={11} /> Connected
              </span>
            ) : (
              <Link href="/api/strava/connect" className="pl-pill pl-pill-race">
                Connect
              </Link>
            )}
          </div>
        </div>

        {/* Spotify */}
        <div className="pl-field">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center gap-2">
            🎵 Running playlist
          </div>
          <input
            type="url"
            value={profile.spotify_playlist_url}
            onChange={e => setProfile(p => ({ ...p, spotify_playlist_url: e.target.value }))}
            className="pl-input"
            placeholder="Paste a Spotify playlist link (optional)"
          />
          {profile.spotify_playlist_url && (
            <a
              href={profile.spotify_playlist_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-[10.5px] text-race mt-2 block"
            >
              Open playlist →
            </a>
          )}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="pl-btn pl-btn-primary disabled:opacity-50"
        >
          {saved ? (
            <><Check size={18} strokeWidth={2.6} /> Saved!</>
          ) : saving ? "Saving…" : "Save changes"}
        </button>

        <div className="h-4" />
      </div>

      <PacelineNav active="" />
    </div>
  )
}
