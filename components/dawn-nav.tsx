"use client"

import Link from "next/link"
import { Home, Compass, Users, BookHeart, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/feed", icon: Users, label: "Friends" },
  { href: "/challenges", icon: Compass, label: "Adventures" },
  { href: "/trophies", icon: BookHeart, label: "Memories" },
]

export function DawnNav({ active }: { active: string }) {
  return (
    <div className="fixed left-0 right-0 bottom-0 z-40 h-[92px] px-[14px] pb-[26px] pt-[10px] bg-gradient-to-t from-dawn-mist via-dawn-mist/85 to-transparent">
      <div className="dawn-card !rounded-[24px] flex items-center justify-between px-2 py-2 gap-[2px]">
        {navItems.slice(0, 2).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center gap-[3px] py-[6px] rounded-[16px] transition-colors",
              active === item.href ? "text-runi-deep" : "text-dawn-ink-3",
            )}
          >
            <item.icon size={21} strokeWidth={active === item.href ? 2.4 : 2} />
            <span className="mono text-[9px] tracking-[0.06em] uppercase font-semibold">{item.label}</span>
          </Link>
        ))}

        {/* Log-a-run FAB */}
        <Link href="/log-run" className="flex-none" aria-label="Log a run">
          <span className="w-[52px] h-[52px] rounded-[18px] flex items-center justify-center text-[#4A2E08] shadow-lg active:scale-[0.92] transition-transform bg-gradient-to-br from-runi-deep to-runi">
            <Plus size={24} strokeWidth={2.6} />
          </span>
        </Link>

        {navItems.slice(2).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center gap-[3px] py-[6px] rounded-[16px] transition-colors",
              active === item.href ? "text-runi-deep" : "text-dawn-ink-3",
            )}
          >
            <item.icon size={21} strokeWidth={active === item.href ? 2.4 : 2} />
            <span className="mono text-[9px] tracking-[0.06em] uppercase font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
