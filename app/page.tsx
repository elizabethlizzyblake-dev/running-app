import { BottomNav, AdminNav } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BadgeIcon } from "@/components/badge-icon"
import { 
  monthlyStats, 
  earnedBadges, 
  activeChallenges, 
  currentUser 
} from "@/lib/mock-data"
import { 
  TrendingUp, 
  Trophy, 
  Target, 
  Flame,
  ChevronRight,
  Sparkles
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const progressPercent = (monthlyStats.totalDistance / monthlyStats.targetDistance) * 100

  return (
    <div className="min-h-screen bg-background pb-20">
      <AdminNav />
      
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <p className="text-muted-foreground text-sm">Welcome back,</p>
        <h1 className="text-2xl font-bold text-foreground">{currentUser.name} 👋</h1>
      </header>

      <main className="px-4 space-y-4">
        {/* Monthly Progress Card */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-card-foreground">June Progress</h2>
            <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
              <Flame className="w-3 h-3 mr-1" />
              {monthlyStats.streakDays} day streak
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Distance Goal</span>
                <span className="font-medium text-foreground">
                  {monthlyStats.totalDistance}km / {monthlyStats.targetDistance}km
                </span>
              </div>
              <Progress value={progressPercent} className="h-3 bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(monthlyStats.targetDistance - monthlyStats.totalDistance)}km to go — you&apos;ve got this! 💪
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
              <div className="text-center">
                <p className="text-xl font-bold text-primary">{monthlyStats.totalRuns}</p>
                <p className="text-xs text-muted-foreground">Runs</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-accent">{monthlyStats.longestRun}km</p>
                <p className="text-xs text-muted-foreground">Longest</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-chart-3">{monthlyStats.averagePace}</p>
                <p className="text-xs text-muted-foreground">Avg Pace</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Challenges Preview */}
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
            {activeChallenges.filter(c => c.joined).slice(0, 2).map((challenge) => (
              <Card key={challenge.id} className="p-4 bg-card border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-card-foreground">{challenge.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {challenge.participants} runners joined
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                    Joined
                  </Badge>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Your progress</span>
                    <span className="text-foreground font-medium">
                      {challenge.currentProgress} / {challenge.targetValue}
                      {challenge.targetMetric === "distance" ? "km" : " runs"}
                    </span>
                  </div>
                  <Progress 
                    value={(challenge.currentProgress! / challenge.targetValue) * 100} 
                    className="h-2 bg-muted" 
                  />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Leaderboard Position */}
        <Card className="p-4 bg-card border-border">
          <Link href="/leaderboard" className="flex items-center justify-between min-h-[44px]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leaderboard Position</p>
                <p className="text-lg font-bold text-foreground">
                  #{monthlyStats.leaderboardPosition} 
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    of {monthlyStats.totalMembers}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+2</span>
            </div>
          </Link>
        </Card>

        {/* Recent Badges */}
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
            {earnedBadges.slice(0, 4).map((badge) => (
              <Card 
                key={badge.id} 
                className="flex-shrink-0 w-24 p-3 bg-card border-border text-center"
              >
                <div className="flex justify-center mb-2">
                  <BadgeIcon type={badge.category} size="md" earned />
                </div>
                <p className="text-xs font-medium text-card-foreground line-clamp-2">
                  {badge.name}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Log CTA */}
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
