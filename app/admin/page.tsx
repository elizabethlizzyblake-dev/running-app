"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  PacelineMedal,
  ChevronRight,
  Settings,
  Target,
  Calendar,
  Medal,
  TrendingUp,
  Check,
  Users,
  Route,
} from "@/components/paceline-ui"

type Member = { userId: string; name: string; distance: number; runs: number }

export default function AdminPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null)
  const [webhookRegistering, setWebhookRegistering] = useState(false)
  const [formData, setFormData] = useState({
    title: "", description: "", startDate: "", endDate: "",
    badgeReward: "", targetMetric: "distance", targetValue: ""
  })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const { data: profile } = await supabase
        .from('users').select('is_admin').eq('id', user.id).single()

      if (!profile?.is_admin) { router.replace('/'); return }

      setChecking(false)

      const [{ data: distanceEntries }, { data: runEntries }] = await Promise.all([
        supabase.from('leaderboard_entries').select('user_id, user_name, value').eq('category', 'distance').order('value', { ascending: false }),
        supabase.from('leaderboard_entries').select('user_id, value').eq('category', 'runs'),
      ])
      const runsMap = new Map((runEntries ?? []).map((r: { user_id: string; value: number }) => [r.user_id, Number(r.value)]))
      setMembers((distanceEntries ?? []).map((d: { user_id: string; user_name: string; value: number }) => ({
        userId: d.user_id, name: d.user_name,
        distance: Number(d.value), runs: runsMap.get(d.user_id) ?? 0,
      })))
    }
    init()
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/create-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        targetMetric: formData.targetMetric,
        targetValue: parseFloat(formData.targetValue),
        badgeReward: formData.badgeReward,
      }),
    })
    setSaving(false)
    if (res.ok) {
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setFormData({ title: "", description: "", startDate: "", endDate: "", badgeReward: "", targetMetric: "distance", targetValue: "" })
      }, 2000)
    }
  }

  if (checking) return null

  if (submitted) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4 pl-anim">
        <div className="text-center max-w-sm w-full">
          <div className="flex justify-center mb-[22px]">
            <PacelineMedal category="special" size="lg" />
          </div>
          <div className="anton text-[40px] uppercase leading-[0.95]">Created!</div>
          <p className="text-ink-2 text-[15px] mt-3">
            Your new quest is now live for members to join.
          </p>
          <div className="mt-7 flex flex-col gap-[10px]">
            <Link href="/challenges" className="pl-btn pl-btn-primary">
              View Quests
            </Link>
            <Link href="/" className="pl-btn pl-btn-ghost">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper pb-8 pl-anim">
      {/* Header */}
      <div className="flex items-center gap-3 px-[22px] pt-[54px] pb-1">
        <Link
          href="/"
          className="w-[38px] h-[38px] rounded-full border border-line bg-card flex items-center justify-center text-ink-2"
          aria-label="Back"
        >
          <ChevronRight size={18} className="rotate-180" />
        </Link>
        <div className="flex-1">
          <div className="pl-eyebrow">Admin</div>
          <div className="font-bold text-ink">Club Manager</div>
        </div>
        <div className="w-[38px] h-[38px] rounded-full bg-gold/20 flex items-center justify-center">
          <Settings size={18} className="text-[#8A5E12]" />
        </div>
      </div>

      <main className="px-[22px] pt-4 space-y-4">

        {/* Members Section */}
        <div className="pl-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-race" />
            <span className="font-semibold text-ink">Members this month</span>
            <span className="mono text-xs text-ink-3">({members.length})</span>
          </div>
          {members.length === 0 ? (
            <p className="text-sm text-ink-3 text-center py-2">No members yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {members.map(member => (
                <div key={member.userId} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="pl-avatar">{member.name.split(" ").map(n => n[0]).join("")}</div>
                    <p className="font-medium text-ink text-sm">{member.name}</p>
                  </div>
                  <div className="flex items-center gap-4 mono text-[10.5px] text-ink-3">
                    <span className="flex items-center gap-1"><Route size={12} />{member.distance}km</span>
                    <span className="flex items-center gap-1"><TrendingUp size={12} />{member.runs} runs</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

            {/* Strava Webhook */}
        <div className="pl-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🟠</span>
            <h2 className="font-semibold text-ink">Strava Webhook</h2>
          </div>
          <p className="text-xs text-ink-3 mb-3">
            Register once so all members&apos; runs auto-import when they finish on Strava.
          </p>
          {webhookStatus && (
            <p className="mono text-[11px] text-pine mb-3">{webhookStatus}</p>
          )}
          <div className="flex gap-2">
            <button
              className="pl-btn pl-btn-dark disabled:opacity-50 flex-1"
              disabled={webhookRegistering}
              onClick={async () => {
                setWebhookRegistering(true)
                setWebhookStatus(null)
                try {
                  const res = await fetch('/api/strava/register-webhook', { method: 'POST' })
                  const data = await res.json()
                  if (data.id) {
                    setWebhookStatus(`Webhook registered — subscription ID: ${data.id}`)
                  } else {
                    setWebhookStatus(`Strava response: ${JSON.stringify(data)}`)
                  }
                } catch (e) {
                  setWebhookStatus(`Error: ${e instanceof Error ? e.message : String(e)}`)
                }
                setWebhookRegistering(false)
              }}
            >
              {webhookRegistering ? 'Registering…' : 'Register Strava Webhook'}
            </button>
            <button
              className="pl-btn pl-btn-dark disabled:opacity-50"
              disabled={webhookRegistering}
              onClick={async () => {
                setWebhookRegistering(true)
                setWebhookStatus(null)
                try {
                  const res = await fetch('/api/strava/register-webhook', { method: 'GET' })
                  const data = await res.json()
                  const sub = Array.isArray(data) ? data[0] : null
                  if (sub?.id) {
                    setWebhookStatus(`Active subscription ID: ${sub.id} — add this as STRAVA_WEBHOOK_SUBSCRIPTION_ID in Vercel.`)
                  } else {
                    setWebhookStatus(`No active subscription found. Raw response: ${JSON.stringify(data)}`)
                  }
                } catch (e) {
                  setWebhookStatus(`Error: ${e instanceof Error ? e.message : String(e)}`)
                }
                setWebhookRegistering(false)
              }}
            >
              Check
            </button>
          </div>
        </div>

      {/* Create Challenge */}
        <div className="pl-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-race" />
            <h2 className="font-semibold text-ink">Create New Quest</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="pl-field">
              <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px]">Quest Title</div>
              <input
                type="text"
                placeholder="e.g. Summer Distance Challenge"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="pl-input"
                required
              />
            </div>

            <div className="pl-field">
              <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px]">Description</div>
              <textarea
                placeholder="Describe the quest and motivate participants..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="pl-input resize-none"
                rows={3}
                required
              />
            </div>

            <div className="pl-field">
              <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center gap-2">
                <Calendar size={14} /> Quest Period
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-ink-3 mb-1">Start Date</div>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="pl-input"
                    required
                  />
                </div>
                <div>
                  <div className="text-xs text-ink-3 mb-1">End Date</div>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="pl-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pl-field">
              <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center gap-2">
                <Medal size={14} className="text-[#8A5E12]" /> Patch Reward Name
              </div>
              <input
                type="text"
                placeholder="e.g. Summer Champion"
                value={formData.badgeReward}
                onChange={e => setFormData({ ...formData, badgeReward: e.target.value })}
                className="pl-input"
                required
              />
              <p className="text-xs text-ink-3 mt-2">Members earn this patch upon completion</p>
            </div>

            <div className="pl-field">
              <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center gap-2">
                <TrendingUp size={14} /> Target Goal
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-ink-3 mb-1">Metric</div>
                  <select
                    value={formData.targetMetric}
                    onChange={e => setFormData({ ...formData, targetMetric: e.target.value })}
                    className="pl-input"
                  >
                    <option value="distance">Distance (km)</option>
                    <option value="runs">Number of Runs</option>
                  </select>
                </div>
                <div>
                  <div className="text-xs text-ink-3 mb-1">Target Value</div>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={formData.targetValue}
                    onChange={e => setFormData({ ...formData, targetValue: e.target.value })}
                    className="pl-input"
                    required
                  />
                </div>
              </div>
            </div>

            {formData.title && (
              <div className="pl-pine p-4">
                <p className="mono text-[10px] tracking-[0.16em] uppercase text-paper/55 mb-2">Preview</p>
                <h3 className="font-bold text-paper">{formData.title}</h3>
                {formData.description && (
                  <p className="text-sm text-paper/70 mt-1 line-clamp-2">{formData.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 mono text-[10.5px] text-paper/60">
                  {formData.targetValue && (
                    <span>Goal: {formData.targetValue} {formData.targetMetric === "distance" ? "km" : "runs"}</span>
                  )}
                  {formData.badgeReward && <span className="text-gold">{formData.badgeReward}</span>}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="pl-btn pl-btn-primary mt-1 disabled:opacity-50"
            >
              <Check size={18} strokeWidth={2.6} /> {saving ? "Creating..." : "Create Quest"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
