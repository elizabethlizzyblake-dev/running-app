import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PacelineNav, SettingsButton } from "@/components/paceline-ui"
import { MarkReadOnMount } from "./mark-read-on-mount"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const dynamic = 'force-dynamic'

type Notification = {
  id: string
  type: string
  message: string
  read: boolean
  created_at: string
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const TYPE_ICON: Record<string, string> = {
  reaction: '⚡',
  comment: '💬',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('notifications')
    .select('id, type, message, read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(60)

  const notifications = (data ?? []) as Notification[]
  const hasUnread = notifications.some(n => !n.read)

  return (
    <div className="min-h-screen bg-paper pb-[110px]">
      <SettingsButton />
      {hasUnread && <MarkReadOnMount />}

      <div className="px-[22px] pt-[54px] pb-4 flex items-center gap-3">
        <Link href="/" className="text-ink-3 -ml-1">
          <ChevronLeft size={22} strokeWidth={1.8} />
        </Link>
        <div>
          <h1 className="anton text-[28px] tracking-[0.04em] text-ink leading-none">NOTIFICATIONS</h1>
          <p className="mono text-[11px] tracking-[0.06em] uppercase text-ink-3 mt-[2px]">Your recent activity</p>
        </div>
      </div>

      <div className="px-[16px] flex flex-col gap-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-[48px]">🔔</span>
            <p className="text-ink-2 text-[15px] font-medium">All quiet here</p>
            <p className="text-ink-3 text-[13px] text-center max-w-[220px]">
              When someone reacts to or comments on your activity, you&apos;ll see it here
            </p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 rounded-[14px] border transition-colors ${
                n.read ? 'bg-card border-line' : 'bg-pine/5 border-pine/20'
              }`}
            >
              <span className="text-[20px] leading-none mt-[2px] flex-none">
                {TYPE_ICON[n.type] ?? '🔔'}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-[14px] leading-snug ${n.read ? 'text-ink-2' : 'text-ink font-medium'}`}>
                  {n.message}
                </p>
                <p className="mono text-[11px] text-ink-3 mt-[3px]">{relativeTime(n.created_at)}</p>
              </div>
              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-race flex-none mt-[6px]" />
              )}
            </div>
          ))
        )}
      </div>

      <PacelineNav active="/notifications" />
    </div>
  )
}
