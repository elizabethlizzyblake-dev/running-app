"use client"

import { BottomNav, AdminNav } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { activeChallenges, type Challenge } from "@/lib/mock-data"
import { Target, Users, Calendar, Award, Check } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

function ChallengeCard({ challenge, onJoin }: { challenge: Challenge; onJoin: (id: string) => void }) {
  const progress = challenge.currentProgress ?? 0
  const progressPercent = (progress / challenge.targetValue) * 100
  const isCompleted = progressPercent >= 100
  
  const startDate = new Date(challenge.startDate)
  const endDate = new Date(challenge.endDate)
  const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <Card className={cn(
      "p-4 bg-card border-border",
      isCompleted && "border-primary/50 bg-primary/5"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-card-foreground">{challenge.title}</h3>
            {isCompleted && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                <Check className="w-3 h-3 mr-1" />
                Done!
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {challenge.participants} joined
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {daysLeft > 0 ? `${daysLeft} days left` : "Ended"}
        </span>
        <span className="flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-accent" />
          {challenge.badgeReward}
        </span>
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
          <Progress 
            value={Math.min(progressPercent, 100)} 
            className={cn("h-3 bg-muted", isCompleted && "[&>div]:bg-primary")} 
          />
          {!isCompleted && (
            <p className="text-xs text-muted-foreground">
              {challenge.targetMetric === "distance" 
                ? `${(challenge.targetValue - progress).toFixed(1)}km to go`
                : `${challenge.targetValue - progress} more runs needed`
              } — keep going! 🏃
            </p>
          )}
        </div>
      ) : (
        <Button 
          onClick={() => onJoin(challenge.id)}
          className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px]"
        >
          Join Challenge
        </Button>
      )}
    </Card>
  )
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState(activeChallenges)
  
  const handleJoin = (id: string) => {
    setChallenges(prev => prev.map(c => 
      c.id === id ? { ...c, joined: true, currentProgress: 0, participants: c.participants + 1 } : c
    ))
  }

  const joinedChallenges = challenges.filter(c => c.joined)
  const availableChallenges = challenges.filter(c => !c.joined)

  return (
    <div className="min-h-screen bg-background pb-20">
      <AdminNav />
      
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Challenges</h1>
            <p className="text-sm text-muted-foreground">
              {joinedChallenges.length} active, {availableChallenges.length} available
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-6">
        {/* Active Challenges */}
        {joinedChallenges.length > 0 && (
          <section>
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Your Active Challenges
            </h2>
            <div className="space-y-3">
              {joinedChallenges.map((challenge) => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge} 
                  onJoin={handleJoin}
                />
              ))}
            </div>
          </section>
        )}

        {/* Available Challenges */}
        {availableChallenges.length > 0 && (
          <section>
            <h2 className="font-semibold text-foreground mb-3">
              Available to Join
            </h2>
            <div className="space-y-3">
              {availableChallenges.map((challenge) => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge} 
                  onJoin={handleJoin}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {challenges.length === 0 && (
          <Card className="p-8 bg-card border-border text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No challenges yet</h3>
            <p className="text-sm text-muted-foreground">
              Check back soon for new challenges!
            </p>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
