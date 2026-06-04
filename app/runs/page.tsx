import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PacelineNav, SettingsButton } from "@/components/paceline-ui"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const dynamic = 'force-dynamic'

type Run = {
  id: string
  date: string
  distance: number
  duration: number
  pace: number
  type: string
  notes: string | null
  strava_activity_id: number | null
}

const TYPE_LABELS: Record<string, string> = {
  easy: 'Easy', tempo: 'Tempo', long: 'Long',
  interval: 'Intervals', race: 'Race', recovery: 'Recovery', trail: 'Trail',
}

function formatPace(pace: number) {
  if (!pace) return '--'
  const m = Math.floor(pace)
  const s = Math.round((pace - m) * 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDuration(minutes: number) {
  if (!minutes) return ''
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
  return `${minutes}m`
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

function formatMonth(monthStr: string) {
  const [year, month] = monthStr.split('-')
  return new Date(parseInt(year), parseInt(month) - 1, 1)
    .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export default async function RunsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: runs } = await supabase
    .from('runs')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const allRuns = (runs ?? []) as Run[]

  // Group by YYYY-MM
  const grouped: Record<string, Run[]> = {}
  for (const run of allRuns) {
    const month = run.date.substring(0, 7)
    if (!grouped[month]) grouped[month] = []
    grouped[month].push(run)
  }

  const totalDistance = allRuns.reduce((s, r) => s + Number(r.distance), 0)

  return (
    <div className="min-h-screen bg-paper pb-[110px] pl-anim">
      <SettingsButton />

      {/* Header */}
      <div className="flex items-center gap-3 px-[22px] pt-[54px] pb-[6px]">
        <Link
          href="/"
          className="w-[38px] h-[38px] rounded-full border border-line bg-card flex items-center justify-center text-ink-2 flex-shrink-0"
        >
          <ChevronLeft size={18} />
        </Link>
        <div className="flex items-center gap-[9px]">
          <div className="relative w-[26px] h-[26px] flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-[4px] border-race" />
            <div className="absolute w-2 h-2 rounded-full bg-gold top-[-1px] left-1/2 -translate-x-1/2" />
          </div>
          <span className="anton text-lg tracking-[0.07em] text-ink">PACELINE</span>
        </div>
      </div>

      <div className="px-[22px] pt-[14px] pb-2">
        <div className="pl-eyebrow">Your runs</div>
        <h1 className="pl-heading mt-2">History</h1>
        <div className="text-sm text-ink-2 mt-2">
          {allRuns.length} runs &middot; {totalDistance.toFixed(1)} km total
        </div>
      </div>

      {allRuns.length === 0 ? (
        <div className="px-[22px] mt-8">
          <div className="pl-card p-8 text-center">
            <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 mb-2">No runs yet</div>
            <p className="text-sm text-ink-2">Connect Strava or log a run to see your history here.</p>
          </div>
        </div>
      ) : (
        <div className="px-[22px] pt-[14px]">
          {Object.entries(grouped).map(([month, monthRuns]) => {
            const monthDist = monthRuns.reduce((s, r) => s + Number(r.distance), 0)
            return (
              <div key={month} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="pl-seclabel">{formatMonth(month)}</span>
                  <span className="mono text-[10.5px] text-ink-3">
                    {monthRuns.length} runs &middot; {monthDist.toFixed(1)} km
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {monthRuns.map(run => (
                    <div key={run.id} className="pl-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-[6px]">
                            <span className="pl-statn text-[30px] text-race leading-none">
                              {Number(run.distance).toFixed(1)}
                            </span>
                            <span className="mono text-xs text-ink-3">km</span>
                            {run.strava_activity_id && (
                              <span className="text-[14px]" title="Imported from Strava">🟠</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {run.pace > 0 && (
                              <span className="mono text-[11px] text-ink-2 font-semibold">
                                {formatPace(Number(run.pace))} /km
                              </span>
                            )}
                            {run.duration > 0 && (
                              <span className="mono text-[11px] text-ink-3">
                                {formatDuration(run.duration)}
                              </span>
                            )}
                            {run.type && (
                              <span className="pl-pill pl-pill-ghost" style={{ padding: '3px 8px', fontSize: '10px' }}>
                                {TYPE_LABELS[run.type] ?? run.type}
                              </span>
                            )}
                          </div>

                          {run.notes && (
                            <p className="text-[12px] text-ink-3 mt-2 leading-[1.4] line-clamp-2">
                              {run.notes}
                            </p>
                          )}
                        </div>

                        <div className="mono text-[11px] text-ink-3 flex-shrink-0 text-right pt-[2px]">
                          {formatDate(run.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <PacelineNav active="" />
    </div>
  )
}
