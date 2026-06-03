import { 
  Flame, 
  Route, 
  Zap, 
  Users, 
  Calendar, 
  Star, 
  Award, 
  Crown,
  Mountain,
  Footprints,
  Timer,
  Heart,
  Sparkles,
  TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"

export type BadgeType = 
  | "distance" 
  | "consistency" 
  | "pace" 
  | "community" 
  | "monthly"
  | "special"

interface BadgeIconProps {
  type: BadgeType
  earned?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const badgeConfig: Record<BadgeType, { icon: React.ElementType; color: string; bgColor: string }> = {
  distance: { icon: Route, color: "text-chart-1", bgColor: "bg-chart-1/20" },
  consistency: { icon: Flame, color: "text-chart-2", bgColor: "bg-chart-2/20" },
  pace: { icon: Zap, color: "text-chart-3", bgColor: "bg-chart-3/20" },
  community: { icon: Users, color: "text-chart-4", bgColor: "bg-chart-4/20" },
  monthly: { icon: Calendar, color: "text-chart-5", bgColor: "bg-chart-5/20" },
  special: { icon: Star, color: "text-accent", bgColor: "bg-accent/20" },
}

const sizeConfig = {
  sm: { container: "w-10 h-10", icon: "w-5 h-5" },
  md: { container: "w-14 h-14", icon: "w-7 h-7" },
  lg: { container: "w-20 h-20", icon: "w-10 h-10" },
}

export function BadgeIcon({ type, earned = true, size = "md", className }: BadgeIconProps) {
  const config = badgeConfig[type]
  const sizeClasses = sizeConfig[size]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center transition-all",
        sizeClasses.container,
        earned ? config.bgColor : "bg-muted/50",
        earned ? "" : "opacity-40 grayscale",
        className
      )}
    >
      <Icon className={cn(sizeClasses.icon, earned ? config.color : "text-muted-foreground")} />
    </div>
  )
}

export function SpecialBadge({ 
  icon: Icon, 
  color = "primary",
  size = "md",
  earned = true 
}: { 
  icon: React.ElementType
  color?: string 
  size?: "sm" | "md" | "lg"
  earned?: boolean
}) {
  const sizeClasses = sizeConfig[size]

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center transition-all",
        sizeClasses.container,
        earned ? `bg-${color}/20` : "bg-muted/50",
        earned ? "" : "opacity-40 grayscale"
      )}
    >
      <Icon className={cn(sizeClasses.icon, earned ? `text-${color}` : "text-muted-foreground")} />
    </div>
  )
}

export const badgeIcons = {
  Flame,
  Route,
  Zap,
  Users,
  Calendar,
  Star,
  Award,
  Crown,
  Mountain,
  Footprints,
  Timer,
  Heart,
  Sparkles,
  TrendingUp,
}
