"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { BottomNav, AdminNav } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Users, Calendar, Award, Check } from "lucide-react"
import { cn } from "@/lib/utils"

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
}

function ChallengeCard({ challenge, onJoin }: { challenge: Challenge; onJoin: (id: string) => void }) {
  const progress = challenge.currentProgress ?? 0
  const progressPercent = (progress / challenge.targetValue) * 100
  const isCompleted = progressPercent >= 100
  const daysLeft = Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <Card className={cn("p-4 bg-card border-border", isCompleted && "border-primary/50 bg-primary/5")}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-card-foreground">{challenge.title}</h3>
            {isCompleted && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                <Check className="w-3 h-3 mr-1" />Done!
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{challenge.participants} joined</span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {daysLeft > 0 ? `${daysLeft} days left` : "Ended"}
        </span>
        <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-accent" />{challenge.badgeReward}</span>
      </div>

      {challenge.joined ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Your progress</span>
            <span className="font-medium text-foreground">
              {progress} / {challenge.targetValue}
              {challenge.targetMetric === "distance" ? "km" : " runs"}
            </span>
          </div>
          <Progress value={Math.min(progressPercent, 100)} className={cn("h-3 bg-muted", isCompleted && "[&>div]:bg-primary")} />
          {!isCompleted && (
            <p className="text-xs text-muted-foreground">
              {challenge.targetMetric === "distance"
                ? `${(challenge.targetValue - progress).toFixed(1)}km to go`
                : `${challenge.targetValue - progress} more runs needed`} — keep going! 🏃
            </p>
          )}
        </div>
      ) : (
        <Button onClick={() => onJoin(challenge.id)} className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px]">
          Join Challenge
        </Button>
      )}
    </Card>
  )
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data: all }, { data: participations }] = await Promise.all([
        supabase.from('challenges').select('*').order('start_date'),
        supabase.from('challenge_participants').select('challenge_id, progress').eq('user_id', user.id),
      ])
      const progressMap = new Map((participations ?? []).map((p: { challenge_id: string; progress: number }) => [p.challenge_id, Number(p.progress)]))
      const joinedIds = new Set((participations ?? []).map((p: { challenge_id: string }) => p.challenge_id))
      setChallenges((all ?? []).map((c: {
        id: string; title: string; description: string
        start_date: string; end_date: string; target_metric: string
        target_value: number; badge_reward: string; participants: number
      }) => ({
        id: c.id, title: c.title, description: c.description,
        startDate: c.start_date, endDate: c.end_date,
        targetMetric: c.target_metric, targetValue: Number(c.target_value),
        badgeReward: c.badge_reward, participants: c.participants,
        currentProgress: progressMap.get(c.id) ?? 0, joined: joinedIds.has(c.id),
      })))
    }
    load()
  }, [])

  const handleJoin = async (id: string) => {
    if (!userId) return
    const challenge = challenges.find(c => c.id === id)
    if (!challenge) return
    await supabase.from('challenge_participants').insert({ user_id: userId, challenge_id: id })
    await supabase.from('challenges').update({ participants: challenge.participants + 1 }).eq('id', id)
    setChallenges(prev => prev.map(c =>
      c.id === id ? { ...c, joined: true, participants: c.participants + 1 } : c
    ))
  }

  const joinedChallenges = challenges.filter(c => c.joined)
  const availableChallenges = challenges.filter(c => !c.joined)

  return (
    <div className="min-h-screen bg-background pb-20">
      <AdminNav />

      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Challenges</h1>
            <p className="text-sm text-muted-foreground">{joinedChallenges.length} active, {availableChallenges.length} available</p>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-6">
        {joinedChallenges.length > 0 && (
          <section>
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Your Active Challenges
            </h2>
            <div className="space-y-3">
              {joinedChallenges.map(c => <ChallengeCard key={c.id} challenge={c} onJoin={handleJoin} />)}
            </div>
          </section>
        )}

        {availableChallenges.length > 0 && (
          <section>
            <h2 className="font-semibold text-foreground mb-3">Available to Join</h2>
            <div className="space-y-3">
              {availableChallenges.map(c => <ChallengeCard key={c.id} challenge={c} onJoin={handleJoin} />)}
            </div>
          </section>
        )}

        {challenges.length === 0 && (
          <Card className="p-8 bg-card border-border text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No challenges yet</h3>
            <p className="text-sm text-muted-foreground">Check back soon for new challenges!</p>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
