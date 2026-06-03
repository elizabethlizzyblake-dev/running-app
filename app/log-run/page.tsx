"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { BottomNav, AdminNav } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { runTypes } from "@/lib/mock-data"
import { Footprints, Calendar, Clock, Route, MessageSquare, Sparkles, Check } from "lucide-react"

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
    hours: "",
    minutes: "",
    seconds: "",
    type: "easy",
    notes: ""
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        setUserName(user.user_metadata?.name ?? 'Runner')
      }
    })
  }, [])

  const upsertLeaderboard = async (uid: string, name: string, category: string, value: number) => {
    const { data: existing } = await supabase
      .from('leaderboard_entries').select('id')
      .eq('user_id', uid).eq('category', category).single()

    if (existing) {
      await supabase.from('leaderboard_entries')
        .update({ value }).eq('id', existing.id)
    } else {
      const { count } = await supabase
        .from('leaderboard_entries').select('*', { count: 'exact', head: true })
        .eq('category', category)
      await supabase.from('leaderboard_entries').insert({
        user_id: uid, user_name: name, category, rank: (count ?? 0) + 1, value, change: 0,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const distance = parseFloat(formData.distance)
    const duration = (parseInt(formData.hours) || 0) * 60
      + (parseInt(formData.minutes) || 0)
      + (parseInt(formData.seconds) || 0) / 60
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
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        date: new Date().toISOString().split("T")[0],
        distance: "", hours: "", minutes: "", seconds: "", type: "easy", notes: ""
      })
    }, 2000)
  }

  const calculatePace = () => {
    const distance = parseFloat(formData.distance)
    const totalMinutes =
      (parseInt(formData.hours) || 0) * 60 +
      (parseInt(formData.minutes) || 0) +
      (parseInt(formData.seconds) || 0) / 60
    if (distance > 0 && totalMinutes > 0) {
      const pace = totalMinutes / distance
      const paceMin = Math.floor(pace)
      const paceSec = Math.round((pace - paceMin) * 60)
      return `${paceMin}:${paceSec.toString().padStart(2, "0")} /km`
    }
    return "--:-- /km"
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 bg-card border-border text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Run Logged! 🎉</h2>
          <p className="text-muted-foreground">Great job getting out there! Every run counts.</p>
          {earnedBadges.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-semibold text-foreground mb-2">
                🏅 {earnedBadges.length === 1 ? 'Badge' : 'Badges'} earned!
              </p>
              {earnedBadges.map(name => (
                <p key={name} className="text-sm text-primary font-medium">{name}</p>
              ))}
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AdminNav />

      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Footprints className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Log a Run</h1>
            <p className="text-sm text-muted-foreground">Record your achievement</p>
          </div>
        </div>
      </header>

      <main className="px-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="p-4 bg-card border-border">
            <Label htmlFor="date" className="flex items-center gap-2 text-foreground mb-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />Date
            </Label>
            <Input id="date" type="date" value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-input border-border text-foreground min-h-[44px]" required />
          </Card>

          <Card className="p-4 bg-card border-border">
            <Label htmlFor="distance" className="flex items-center gap-2 text-foreground mb-2">
              <Route className="w-4 h-4 text-muted-foreground" />Distance (km)
            </Label>
            <Input id="distance" type="number" step="0.1" min="0" placeholder="e.g. 5.0"
              value={formData.distance}
              onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
              className="bg-input border-border text-foreground min-h-[44px] text-lg" required />
          </Card>

          <Card className="p-4 bg-card border-border">
            <Label className="flex items-center gap-2 text-foreground mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />Duration
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "hours", label: "Hours", max: 23 },
                { key: "minutes", label: "Minutes", max: 59 },
                { key: "seconds", label: "Seconds", max: 59 },
              ].map(field => (
                <div key={field.key}>
                  <Input type="number" min="0" max={field.max} placeholder="0"
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="bg-input border-border text-foreground min-h-[44px] text-center"
                    required={field.key === "minutes"} />
                  <p className="text-xs text-muted-foreground text-center mt-1">{field.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Calculated Pace</span>
              <span className="font-semibold text-primary">{calculatePace()}</span>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <Label className="flex items-center gap-2 text-foreground mb-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />Run Type
            </Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="bg-input border-border text-foreground min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {runTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-popover-foreground">
                    <div>
                      <span className="font-medium">{type.label}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-4 bg-card border-border">
            <Label htmlFor="notes" className="flex items-center gap-2 text-foreground mb-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />Notes (optional)
            </Label>
            <Textarea id="notes" placeholder="How did it feel? Any highlights?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-input border-border text-foreground min-h-[100px] resize-none" />
          </Card>

          <Button type="submit" disabled={!userId}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 min-h-[52px] text-lg font-semibold">
            Log Run 🏃
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  )
}
