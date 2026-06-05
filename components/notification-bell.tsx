"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Bell } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [show, setShow] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setShow(false); return }
      setShow(true)
      supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)
        .then(({ count }) => setUnread(count ?? 0))
    })
  }, [pathname])

  if (!show) return null

  return (
    <Link
      href="/notifications"
      aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
      className="fixed top-4 right-[54px] z-50 w-[38px] h-[38px] rounded-full bg-card/90 backdrop-blur-lg border border-line text-ink-2 hover:text-ink transition-colors flex items-center justify-center"
    >
      <Bell size={18} strokeWidth={1.8} />
      {unread > 0 && (
        <span className="absolute top-[6px] right-[6px] w-[8px] h-[8px] rounded-full bg-race border border-paper" />
      )}
    </Link>
  )
}
