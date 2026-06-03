import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BottomNav, AdminNav } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BadgeIcon } from "@/components/badge-icon"
import { TrendingUp, Trophy, Target, Flame, ChevronRight, Sparkles } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

const TARGET_DISTANCE = 100

function computeStreak(dates: string[]) {
  const dateSet = new Set(dates)
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 60; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (dateSet.has(d.toISOString().split('T')[0])) streak++
    else break
  }
  return streak
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const [
    { data: profile },
    { data: runs },
    { data: badges },
    { data: allChallenges },
    { data: joined },
    { data: leaderboardEntry },
    { count: totalMembers },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('runs').select('*').eq('user_id', user.id).gte('date', monthStart),
    supabase.from('badges').select('*').eq('user_id', user.id).order('earned_date', { ascending: false }).limit(4),
    supabase.from('challenges').select('*'),
    supabase.from('challenge_participants').select('challenge_id, progress').eq('user_id', user.id),
    supabase.from('leaderboard_entries').select('rank').eq('user_id', user.id).eq('category', 'distance').single(),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])

  const progressMap = new Map((joined ?? []).map((j: { challenge_id: string; progress: number }) => [j.challenge_id, Number(j.progress)]))
  const joinedIds = new Set((joined ?? []).map((j: { challenge_id: string }) => j.challenge_id))
  const activeChallenges = (allChallenges ?? []).filter((c: { id: string }) => joinedIds.has(c.id)).slice(0, 2)

  const totalDistance = (runs ?? []).reduce((sum: number, r: { distance: number }) => sum + Number(r.distance), 0)
  const totalRuns = runs?.length ?? 0
  const longestRun = (runs ?? []).reduce((max: number, r: { distance: number }) => Math.max(max, Number(r.distance)), 0)
  const averagePace = runs?.length
    ? Number(((runs ?? []).reduce((sum: number, r: { pace: number }) => sum + Number(r.pace), 0) / runs.length).toFixed(2))
    : 0
  const streakDays = computeStreak((runs ?? []).map((r: { date: string }) => r.date))
  const progressPercent = (totalDistance / TARGET_DISTANCE) * 100

  return (
    <div className="min-h-screen bg-background pb-20">
      <AdminNav />

      <header className="px-4 pt-6 pb-4">
        <p className="text-muted-foreground text-sm">Welcome back,</p>
        <h1 className="text-2xl font-bold text-foreground">{profile?.name ?? 'Runner'} 👋</h1>
      </header>

      <main className="px-4 space-y-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-card-foreground">
              {now.toLocaleString('default', { month: 'long' })} Progress
            </h2>
            <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
              <Flame className="w-3 h-3 mr-1" />
              {streakDays} day streak
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Distance Goal</span>
                <span className="font-medium text-foreground">
                  {totalDistance.toFixed(1)}km / {TARGET_DISTANCE}km
                </span>
              </div>
              <Progress value={progressPercent} className="h-3 bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">
                {(TARGET_DISTANCE - totalDistance).toFixed(1)}km to go — you&apos;ve got this! 💪
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
              <div className="text-center">
                <p className="text-xl font-bold text-primary">{totalRuns}</p>
                <p className="text-xs text-muted-foreground">Runs</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-accent">{longestRun.toFixed(1)}km</p>
                <p className="text-xs text-muted-foreground">Longest</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-chart-3">{averagePace}</p>
                <p className="text-xs text-muted-foreground">Avg Pace</p>
              </div>
            </div>
          </div>
        </Card>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Active Challenges
            </h2>
            <Link href="/challenges" className="text-sm text-primary flex items-center min-h-[44px]">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {activeChallenges.map((challenge: {
              id: string; title: string; participants: number
              current_progress: number; target_value: number; target_metric: string
            }) => (
              <Card key={challenge.id} className="p-4 bg-card border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-card-foreground">{challenge.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{challenge.participants} runners joined</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-primary/50 text-primary">Joined</Badge>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Your progress</span>
                    <span className="text-foreground font-medium">
                      {progressMap.get(challenge.id) ?? 0} / {challenge.target_value}
                      {challenge.target_metric === "distance" ? "km" : " runs"}
                    </span>
                  </div>
                  <Progress
                    value={((progressMap.get(challenge.id) ?? 0) / challenge.target_value) * 100}
                    className="h-2 bg-muted"
                  />
                </div>
              </Card>
            ))}
          </div>
        </section>

        <Card className="p-4 bg-card border-border">
          <Link href="/leaderboard" className="flex items-center justify-between min-h-[44px]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leaderboard Position</p>
                <p className="text-lg font-bold text-foreground">
                  #{leaderboardEntry?.rank ?? '?'}
                  <span className="text-sm font-normal text-muted-foreground ml-1">of {totalMembers ?? 0}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </Link>
        </Card>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Recent Badges
            </h2>
            <Link href="/trophies" className="text-sm text-primary flex items-center min-h-[44px]">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {(badges ?? []).map((badge: { id: string; category: string; name: string }) => (
              <Card key={badge.id} className="flex-shrink-0 w-24 p-3 bg-card border-border text-center">
                <div className="flex justify-center mb-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <BadgeIcon type={badge.category as any} size="md" earned />
                </div>
                <p className="text-xs font-medium text-card-foreground line-clamp-2">{badge.name}</p>
              </Card>
            ))}
          </div>
        </section>

        <Link href="/log-run">
          <Card className="p-4 bg-primary/10 border-primary/30 hover:bg-primary/20 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary">Log Your Run</h3>
                <p className="text-sm text-muted-foreground">Keep the momentum going!</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xl">+</span>
              </div>
            </div>
          </Card>
        </Link>
      </main>

      <BottomNav />
    </div>
  )
}
