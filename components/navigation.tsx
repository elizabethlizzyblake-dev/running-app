"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Trophy, Target, BarChart3, Plus, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/trophies", icon: Trophy, label: "Trophies" },
  { href: "/challenges", icon: Target, label: "Challenges" },
  { href: "/leaderboard", icon: BarChart3, label: "Leaders" },
  { href: "/log-run", icon: Plus, label: "Log Run" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[44px] rounded-xl transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function AdminNav() {
  return (
    <Link
      href="/admin"
      className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-card/90 backdrop-blur-lg border border-border text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
    >
      <Settings className="w-5 h-5" />
    </Link>
  )
}
