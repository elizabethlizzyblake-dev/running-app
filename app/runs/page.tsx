"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { PacelineNav, SettingsButton } from "@/components/paceline-ui"
import Link from "next/link"
import { ChevronLeft, Pencil, Trash2, X } from "lucide-react"
import { formatPace, formatDuration, formatDate, formatMonth } from "@/lib/formatting"
import type { Run, RunType } from "@/lib/types"

const TYPE_OPTIONS: { value: RunType; label: string }[] = [
  { value: 'easy',     label: 'Easy' },
  { value: 'tempo',    label: 'Tempo' },
  { value: 'long',     label: 'Long' },
  { value: 'interval', label: 'Intervals' },
  { value: 'race',     label: 'Race' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'trail',    label: 'Trail' },
]

const TYPE_LABELS: Record<string, string> = Object.fromEntries(TYPE_OPTIONS.map(o => [o.value, o.label]))


// ── Edit modal ──────────────────────────────────────────────────

type EditForm = { type: RunType | ''; notes: string; date: string; distance: string; duration: string; pace: string }

function EditModal({ run, onSave, onDelete, onClose }: {
  run: Run
  onSave: (id: string, updates: Partial<Run>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}) {
  const isStrava = !!run.strava_activity_id
  const [form, setForm] = useState<EditForm>({
    type:     run.type ?? '',
    notes:    run.notes ?? '',
    date:     run.date,
    distance: String(run.distance),
    duration: String(run.duration),
    pace:     String(run.pace),
  })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const updates: Partial<Run> = { type: form.type as RunType, notes: form.notes || null }
    if (!isStrava) {
      updates.date     = form.date
      updates.distance = parseFloat(form.distance) || 0
      updates.duration = parseInt(form.duration)   || 0
      updates.pace     = parseFloat(form.pace)     || 0
    }
    await onSave(run.id, updates)
    setSaving(false)
  }

  const handleDelete = async () => {
    setSaving(true)
    await onDelete(run.id)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed left-0 right-0 bottom-0 z-[70] bg-paper rounded-t-[20px] px-[22px] pt-[14px] pb-[38px]">
        <div className="w-10 h-1 rounded-full bg-line mx-auto mb-5" />

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[17px]">
            {isStrava ? 'Edit Strava run' : 'Edit run'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-ink-3">
            <X size={18} />
          </button>
        </div>

        {/* Strava notice */}
        {isStrava && (
          <div className="bg-[#FC4C02]/8 border border-[#FC4C02]/20 rounded-[12px] px-4 py-3 mb-4">
            <p className="text-[12px] text-ink-2">
              🟠 Distance, pace and duration are synced from Strava and can&apos;t be changed here.
            </p>
          </div>
        )}

        {/* Run type chips */}
        <div className="mb-4">
          <div className="mono text-[10px] tracking-[0.1em] uppercase text-ink-3 mb-2">Run type</div>
          <div className="flex gap-2 flex-wrap">
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setForm(f => ({ ...f, type: opt.value }))}
                className={`px-3 py-[6px] rounded-[10px] text-[12px] font-semibold border transition-colors ${
                  form.type === opt.value
                    ? 'bg-pine text-paper border-pine'
                    : 'bg-paper text-ink-2 border-line'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes / description */}
        <div className="mb-4">
          <div className="mono text-[10px] tracking-[0.1em] uppercase text-ink-3 mb-2">
            {isStrava ? 'Description' : 'Notes'}
          </div>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder={isStrava ? 'Add a description…' : 'How did it feel?'}
            rows={3}
            className="w-full rounded-[12px] border border-line bg-card px-4 py-3 text-[14px] text-ink resize-none outline-none focus:border-pine"
          />
        </div>

        {/* Manual-run-only fields */}
        {!isStrava && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div>
              <div className="mono text-[10px] tracking-[0.1em] uppercase text-ink-3 mb-2">Distance (km)</div>
              <input type="number" step="0.01" value={form.distance}
                onChange={e => setForm(f => ({ ...f, distance: e.target.value }))}
                className="w-full rounded-[12px] border border-line bg-card px-3 py-3 text-[14px] text-ink outline-none focus:border-pine"
              />
            </div>
            <div>
              <div className="mono text-[10px] tracking-[0.1em] uppercase text-ink-3 mb-2">Duration (min)</div>
              <input type="number" value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                className="w-full rounded-[12px] border border-line bg-card px-3 py-3 text-[14px] text-ink outline-none focus:border-pine"
              />
            </div>
            <div>
              <div className="mono text-[10px] tracking-[0.1em] uppercase text-ink-3 mb-2">Date</div>
              <input type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full rounded-[12px] border border-line bg-card px-3 py-3 text-[14px] text-ink outline-none focus:border-pine"
              />
            </div>
            <div>
              <div className="mono text-[10px] tracking-[0.1em] uppercase text-ink-3 mb-2">Pace (min/km)</div>
              <input type="number" step="0.01" value={form.pace}
                onChange={e => setForm(f => ({ ...f, pace: e.target.value }))}
                className="w-full rounded-[12px] border border-line bg-card px-3 py-3 text-[14px] text-ink outline-none focus:border-pine"
              />
            </div>
          </div>
        )}

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className="pl-btn pl-btn-primary disabled:opacity-50 mb-2"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)}
              className="flex-1 py-[13px] rounded-[14px] border border-line text-ink-2 font-semibold text-[13px]"
            >
              Cancel
            </button>
            <button onClick={handleDelete} disabled={saving}
              className="flex-1 py-[13px] rounded-[14px] bg-race text-paper font-bold text-[13px] disabled:opacity-50"
            >
              Delete run
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center justify-center gap-2 py-3 text-[13px] text-ink-3 font-semibold"
          >
            <Trash2 size={14} /> Delete run
          </button>
        )}
      </div>
    </>
  )
}

// ── Page ────────────────────────────────────────────────────────

export default function RunsPage() {
  const router = useRouter()
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState("")
  const [editRun, setEditRun] = useState<Run | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      setUserId(user.id)
      const { data } = await supabase.from('runs').select('*').eq('user_id', user.id).order('date', { ascending: false })
      setRuns((data ?? []) as Run[])
      setLoading(false)
    }
    load()
  }, [router])

  const handleSave = async (id: string, updates: Partial<Run>) => {
    await fetch(`/api/runs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    setRuns(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
    setEditRun(null)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/runs/${id}`, { method: 'DELETE' })
    setRuns(prev => prev.filter(r => r.id !== id))
    setEditRun(null)
  }

  if (loading) return null

  // Group by YYYY-MM
  const grouped: Record<string, Run[]> = {}
  for (const run of runs) {
    const month = run.date.substring(0, 7)
    if (!grouped[month]) grouped[month] = []
    grouped[month].push(run)
  }

  const totalDistance = runs.reduce((s, r) => s + Number(r.distance), 0)

  return (
    <div className="min-h-screen bg-paper pb-[110px] pl-anim">
      <SettingsButton />

      {editRun && (
        <EditModal
          run={editRun}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditRun(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-[22px] pt-[54px] pb-[6px]">
        <Link href="/" className="w-[38px] h-[38px] rounded-full border border-line bg-card flex items-center justify-center text-ink-2 flex-shrink-0">
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
          {runs.length} runs &middot; {totalDistance.toFixed(1)} km total
        </div>
      </div>

      {runs.length === 0 ? (
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

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="mono text-[11px] text-ink-3">{formatDate(run.date)}</span>
                          <button
                            onClick={() => setEditRun(run)}
                            className="w-7 h-7 rounded-full border border-line bg-card flex items-center justify-center text-ink-3 hover:text-ink transition-colors"
                            aria-label="Edit run"
                          >
                            <Pencil size={12} />
                          </button>
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
