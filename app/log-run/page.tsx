"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  PacelineMedal,
  ChevronRight,
  Route,
  Clock,
  Sparkles,
  MessageSquare,
  Check,
} from "@/components/paceline-ui"
import { runTypes } from "@/lib/mock-data"
import Link from "next/link"

type Run = { distance: number; date: string }

const AUTO_BADGES = [
  { name: 'First Steps', description: 'Complete your first run with the club', category: 'distance', icon: 'Footprints', requirement: 'Log 1 run',
    check: (runs: Run[]) => runs.length >= 1 },
  { name: '10K Club', description: 'Run a total of 10km', category: 'distance', icon: 'Route', requirement: '10km total',
    check: (runs: Run[]) => runs.reduce((s, r) => s + Number(r.distance), 0) >= 10 },
  { name: '50K Explorer', description: 'Run a total of 50km', category: 'distance', icon: 'Mountain', requirement: '50km total',
    check: (runs: Run[]) => runs.reduce((s, r) => s + Number(r.distance), 0) >= 50 },
  { name: '100K Legend', description: 'Run a total of 100km', category: 'distance', icon: 'Award', requirement: '100km total',
    check: (runs: Run[]) => runs.reduce((s, r) => s + Number(r.distance), 0) >= 100 },
  { name: 'Marathon Master', description: 'Run 42.2km in a single run', category: 'distance', icon: 'Crown', requirement: '42.2km single run',
    check: (runs: Run[]) => runs.some(r => Number(r.distance) >= 42.2) },
  { name: 'Week Warrior', description: 'Run every day for a week', category: 'consistency', icon: 'Flame', requirement: '7-day streak',
    check: (runs: Run[]) => {
      const dates = new Set(runs.map(r => r.date))
      const today = new Date()
      let streak = 0
      for (let i = 0; i < 30; i++) {
        const d = new Date(today); d.setDate(today.getDate() - i)
        if (dates.has(d.toISOString().split('T')[0])) streak++; else break
      }
      return streak >= 7
    }},
  { name: 'Month Streak', description: 'Run every day for a month', category: 'consistency', icon: 'Flame', requirement: '30-day streak',
    check: (runs: Run[]) => {
      const dates = new Set(runs.map(r => r.date))
      const today = new Date()
      let streak = 0
      for (let i = 0; i < 60; i++) {
        const d = new Date(today); d.setDate(today.getDate() - i)
        if (dates.has(d.toISOString().split('T')[0])) streak++; else break
      }
      return streak >= 30
    }},
]

export default function LogRunPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('Runner')
  const [submitted, setSubmitted] = useState(false)
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    distance: "",
    minutes: "",
    seconds: "",
    type: "easy",
    notes: "",
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        setUserName(user.user_metadata?.name ?? 'Runner')
      }
    })
  }, [])

  const set = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }))

  const calculatePace = () => {
    const distance = parseFloat(formData.distance)
    const totalMinutes = (parseInt(formData.minutes) || 0) + (parseInt(formData.seconds) || 0) / 60
    if (distance > 0 && totalMinutes > 0) {
      const pace = totalMinutes / distance
      const paceMin = Math.floor(pace)
      const paceSec = Math.round((pace - paceMin) * 60)
      return `${paceMin}:${paceSec.toString().padStart(2, "0")}`
    }
    return "-:--"
  }

  const upsertLeaderboard = async (uid: string, name: string, category: string, value: number) => {
    const { data: existing } = await supabase
      .from('leaderboard_entries').select('id')
      .eq('user_id', uid).eq('category', category).single()

    if (existing) {
      await supabase.from('leaderboard_entries').update({ value }).eq('id', existing.id)
    } else {
      const { count } = await supabase
        .from('leaderboard_entries').select('*', { count: 'exact', head: true })
        .eq('category', category)
      await supabase.from('leaderboard_entries').insert({
        user_id: uid, user_name: name, category, rank: (count ?? 0) + 1, value, change: 0,
      })
    }
  }

  const rerankCategory = async (category: string) => {
    const { data: entries } = await supabase
      .from('leaderboard_entries')
      .select('id, rank, value')
      .eq('category', category)
      .order('value', { ascending: false })

    if (!entries) return

    await Promise.all(entries.map((entry, index) => {
      const newRank = index + 1
      const change = entry.rank - newRank
      return supabase
        .from('leaderboard_entries')
        .update({ rank: newRank, change })
        .eq('id', entry.id)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const distance = parseFloat(formData.distance)
    const duration = (parseInt(formData.minutes) || 0) + (parseInt(formData.seconds) || 0) / 60
    const pace = duration / distance

    await supabase.from('runs').insert({
      user_id: userId,
      date: formData.date,
      distance,
      duration: Math.round(duration),
      pace: Math.round(pace * 100) / 100,
      type: formData.type,
      notes: formData.notes || null,
    })

    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const { data: allRuns } = await supabase
      .from('runs').select('distance, date').eq('user_id', userId).order('date')

    const monthRuns = (allRuns ?? []).filter(r => r.date >= monthStart)
    if (monthRuns) {
      const totalDistance = monthRuns.reduce((sum, r) => sum + Number(r.distance), 0)
      const totalRuns = monthRuns.length
      const longestRun = monthRuns.reduce((max, r) => Math.max(max, Number(r.distance)), 0)
      await Promise.all([
        upsertLeaderboard(userId, userName, 'distance', Math.round(totalDistance * 10) / 10),
        upsertLeaderboard(userId, userName, 'runs', totalRuns),
        upsertLeaderboard(userId, userName, 'longest', Math.round(longestRun * 10) / 10),
      ])
      await Promise.all([
        rerankCategory('distance'),
        rerankCategory('runs'),
        rerankCategory('longest'),
      ])
    }

    const { data: joinedChallenges } = await supabase
      .from('challenge_participants')
      .select('challenge_id, challenges(id, start_date, end_date, target_metric)')
      .eq('user_id', userId)

    if (joinedChallenges) {
      await Promise.all(joinedChallenges.map(async (row: {
        challenge_id: string
        challenges: { id: string; start_date: string; end_date: string; target_metric: string } | null
      }) => {
        const challenge = row.challenges
        if (!challenge) return
        const { data: challengeRuns } = await supabase
          .from('runs').select('distance').eq('user_id', userId)
          .gte('date', challenge.start_date).lte('date', challenge.end_date)
        if (!challengeRuns) return
        const progress = challenge.target_metric === 'distance'
          ? Math.round(challengeRuns.reduce((sum, r) => sum + Number(r.distance), 0) * 10) / 10
          : challengeRuns.length
        await supabase.from('challenge_participants')
          .update({ progress })
          .eq('user_id', userId).eq('challenge_id', challenge.id)
      }))
    }

    const { data: existingBadges } = await supabase
      .from('badges').select('name').eq('user_id', userId)
    const earned = new Set(existingBadges?.map((b: { name: string }) => b.name) ?? [])
    const today = new Date().toISOString().split('T')[0]
    const newBadges = AUTO_BADGES.filter(b => !earned.has(b.name) && b.check(allRuns ?? []))
    if (newBadges.length > 0) {
      await supabase.from('badges').insert(
        newBadges.map(b => ({ user_id: userId, name: b.name, description: b.description, category: b.category, icon: b.icon, requirement: b.requirement, earned_date: today }))
      )
      setEarnedBadges(newBadges.map(b => b.name))
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center pl-anim">
        <div className="text-center px-8">
          <div className="flex justify-center mb-[22px]">
            <PacelineMedal category="distance" size="lg" />
          </div>
          <div className="anton text-[40px] uppercase leading-[0.95]">Logged!</div>
          <p className="text-ink-2 text-[15px] mt-3 max-w-[240px] mx-auto">
            {formData.distance ? `${formData.distance}km at ${calculatePace()}/km` : "Nice work"} — the club just moved forward.
          </p>
          {earnedBadges.length > 0 && (
            <div className="mt-4 pt-4 border-t border-line">
              <p className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 mb-2">New patch{earnedBadges.length > 1 ? 'es' : ''} earned!</p>
              {earnedBadges.map(name => (
                <p key={name} className="text-sm text-race font-semibold">{name}</p>
              ))}
            </div>
          )}
          <div className="mt-7 flex flex-col gap-[10px]">
            <Link href="/" className="pl-btn pl-btn-primary">
              Back to home
            </Link>
            <button
              className="pl-btn pl-btn-ghost"
              onClick={() => {
                setSubmitted(false)
                setEarnedBadges([])
                setFormData({ date: new Date().toISOString().split("T")[0], distance: "", minutes: "", seconds: "", type: "easy", notes: "" })
              }}
            >
              Log another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper pb-[130px] pl-anim">
      {/* Header */}
      <div className="flex items-center gap-3 px-[22px] pt-[54px] pb-1">
        <Link
          href="/"
          className="w-[38px] h-[38px] rounded-full border border-line bg-card flex items-center justify-center text-ink-2"
          aria-label="Back"
        >
          <ChevronRight size={18} className="rotate-180" />
        </Link>
        <div className="pl-eyebrow">New entry</div>
      </div>

      <div className="px-[22px] pt-[6px] pb-2">
        <h1 className="pl-heading">Log a Run</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-[22px] pt-2 flex flex-col gap-3">
        {/* Date */}
        <div className="pl-field">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px]">Date</div>
          <input
            type="date"
            value={formData.date}
            onChange={e => set("date", e.target.value)}
            className="pl-input"
            required
          />
        </div>

        {/* Distance Hero Field */}
        <div className="pl-field text-center py-5 px-4">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center justify-center gap-2">
            <Route size={14} /> Distance
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="0.0"
              value={formData.distance}
              onChange={e => set("distance", e.target.value)}
              className="w-[130px] bg-transparent border-none text-center anton text-[44px] outline-none placeholder:text-ink-3/50"
              required
            />
            <span className="mono text-lg text-ink-3">km</span>
          </div>
        </div>

        {/* Duration + Pace */}
        <div className="pl-field">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center gap-2">
            <Clock size={14} /> Duration
          </div>
          <div className="flex gap-[10px] items-center">
            <div className="flex-1">
              <input
                type="number"
                min="0"
                placeholder="00"
                value={formData.minutes}
                onChange={e => set("minutes", e.target.value)}
                className="pl-input text-center mono text-[22px] font-semibold"
                required
              />
              <p className="text-xs text-ink-3 text-center mt-1">Minutes</p>
            </div>
            <span className="anton text-[22px] text-ink-3 mb-5">:</span>
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="59"
                placeholder="00"
                value={formData.seconds}
                onChange={e => set("seconds", e.target.value)}
                className="pl-input text-center mono text-[22px] font-semibold"
              />
              <p className="text-xs text-ink-3 text-center mt-1">Seconds</p>
            </div>
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-line">
            <span className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3">Pace</span>
            <span className="mono text-base font-bold text-race">{calculatePace()} /km</span>
          </div>
        </div>

        {/* Run Type */}
        <div className="pl-field">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center gap-2">
            <Sparkles size={14} /> Type of run
          </div>
          <div className="grid grid-cols-3 gap-2">
            {runTypes.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => set("type", t.value)}
                className={`py-[11px] px-2 rounded-xl border-[1.5px] text-center transition-all ${
                  formData.type === t.value
                    ? 'border-race bg-race/[0.08]'
                    : 'border-line bg-paper'
                }`}
              >
                <div className="font-bold text-[13px] text-ink">{t.label}</div>
                <div className="text-[10px] text-ink-3 mt-[2px]">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="pl-field">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center gap-2">
            <MessageSquare size={14} /> Notes
          </div>
          <textarea
            className="pl-input resize-none text-[15px] leading-[1.5]"
            rows={3}
            placeholder="How did it feel? Any highlights?"
            value={formData.notes}
            onChange={e => set("notes", e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!userId}
          className="pl-btn pl-btn-primary mt-1 disabled:opacity-50"
        >
          <Check size={18} strokeWidth={2.6} /> Save run
        </button>
      </form>
    </div>
  )
}
