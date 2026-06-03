"use client"

import { BottomNav, AdminNav } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { BadgeIcon, type BadgeType } from "@/components/badge-icon"
import { earnedBadges, availableBadges, type Badge } from "@/lib/mock-data"
import { Trophy, Lock, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const categories: { key: BadgeType; label: string; description: string }[] = [
  { key: "distance", label: "Distance", description: "Rack up those kilometers!" },
  { key: "consistency", label: "Consistency", description: "Show up every day" },
  { key: "pace", label: "Pace Improvement", description: "Getting faster!" },
  { key: "community", label: "Community", description: "Better together" },
  { key: "monthly", label: "Monthly Challenges", description: "Special achievements" },
]

function BadgeCard({ badge, earned }: { badge: Badge; earned: boolean }) {
  return (
    <div className={cn(
      "flex flex-col items-center p-3 rounded-xl transition-all",
      earned ? "bg-card" : "bg-muted/30"
    )}>
      <div className="relative">
        <BadgeIcon type={badge.category} size="lg" earned={earned} />
        {!earned && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
            <Lock className="w-3 h-3 text-muted-foreground" />
          </div>
        )}
      </div>
      <h4 className={cn(
        "text-sm font-medium mt-2 text-center",
        earned ? "text-foreground" : "text-muted-foreground"
      )}>
        {badge.name}
      </h4>
      {earned && badge.earnedDate && (
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(badge.earnedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      )}
      {!earned && (
        <p className="text-xs text-muted-foreground mt-1 text-center">
          {badge.requirement}
        </p>
      )}
    </div>
  )
}

function CategorySection({ category }: { category: typeof categories[0] }) {
  const [expanded, setExpanded] = useState(true)
  
  const categoryEarned = earnedBadges.filter(b => b.category === category.key)
  const categoryAvailable = availableBadges.filter(b => b.category === category.key)
  const allBadges = [...categoryEarned, ...categoryAvailable]
  
  return (
    <section className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-2 min-h-[44px]"
      >
        <div className="flex items-center gap-3">
          <BadgeIcon type={category.key} size="sm" earned />
          <div className="text-left">
            <h3 className="font-semibold text-foreground">{category.label}</h3>
            <p className="text-xs text-muted-foreground">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {categoryEarned.length}/{allBadges.length}
          </span>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {expanded && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {allBadges.map((badge) => (
            <BadgeCard 
              key={badge.id} 
              badge={badge} 
              earned={categoryEarned.some(e => e.id === badge.id)} 
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default function TrophiesPage() {
  const totalEarned = earnedBadges.length
  const totalAvailable = earnedBadges.length + availableBadges.length

  return (
    <div className="min-h-screen bg-background pb-20">
      <AdminNav />
      
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trophy Cabinet</h1>
            <p className="text-sm text-muted-foreground">
              {totalEarned} of {totalAvailable} badges earned
            </p>
          </div>
        </div>
      </header>

      {/* Stats Banner */}
      <div className="mx-4 mb-6">
        <Card className="p-4 bg-primary/10 border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Collection Progress</p>
              <p className="text-2xl font-bold text-primary">
                {Math.round((totalEarned / totalAvailable) * 100)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next badge in</p>
              <p className="text-lg font-semibold text-foreground">32.5km</p>
            </div>
          </div>
        </Card>
      </div>

      <main className="px-4">
        {categories.map((category) => (
          <CategorySection key={category.key} category={category} />
        ))}
      </main>

      <BottomNav />
    </div>
  )
}
