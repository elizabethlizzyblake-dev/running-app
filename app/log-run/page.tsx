"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  PacelineMedal,
  ChevronRight,
  Route,
  Clock,
  Sparkles,
  MessageSquare,
  Check,
} from "@/components/paceline-ui"
import { formatPace, calcPace } from "@/lib/formatting"
import type { RunType } from "@/lib/types"

const RUN_TYPES: { value: RunType; label: string; description: string }[] = [
  { value: "easy",     label: "Easy Run",   description: "Relaxed pace, conversational" },
  { value: "tempo",    label: "Tempo Run",  description: "Comfortably hard pace" },
  { value: "interval", label: "Intervals",  description: "Speed work with recovery" },
  { value: "long",     label: "Long Run",   description: "Building endurance" },
  { value: "race",     label: "Race",       description: "Competition day" },
  { value: "recovery", label: "Recovery",   description: "Very easy, active recovery" },
]
import Link from "next/link"

type FormData = {
  date: string
  distance: string
  minutes: string
  seconds: string
  type: string
  notes: string
}

function validateForm(form: FormData): string | null {
  if (!form.date) return 'Please enter a date.'
  if (new Date(form.date) > new Date()) return 'Date cannot be in the future.'
  const distance = parseFloat(form.distance)
  if (!form.distance || isNaN(distance) || distance <= 0)
    return 'Distance must be greater than 0 km.'
  const minutes = parseInt(form.minutes) || 0
  const seconds = parseInt(form.seconds) || 0
  if (minutes <= 0 && seconds <= 0)
    return 'Duration must be greater than 0.'
  if (seconds < 0 || seconds > 59)
    return 'Seconds must be between 0 and 59.'
  return null
}

function previewPace(form: FormData): string {
  const distance = parseFloat(form.distance)
  const totalMin = (parseInt(form.minutes) || 0) + (parseInt(form.seconds) || 0) / 60
  const pace = calcPace(distance, totalMin)
  return pace > 0 ? `${formatPace(pace)} /km` : '-:-- /km'
}

export default function LogRunPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('Runner')
  const [submitted, setSubmitted] = useState(false)
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toLocaleDateString('en-CA'),
    distance: '',
    minutes: '',
    seconds: '',
    type: 'easy',
    notes: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        setUserName(user.user_metadata?.name ?? 'Runner')
      }
    })
  }, [])

  const set = (k: keyof FormData, v: string) =>
    setFormData((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const validationMsg = validateForm(formData)
    if (validationMsg) {
      setValidationError(validationMsg)
      return
    }
    setValidationError(null)
    setSubmitError(null)
    setSubmitting(true)

    const distance = parseFloat(formData.distance)
    const durationMin =
      (parseInt(formData.minutes) || 0) + (parseInt(formData.seconds) || 0) / 60
    const pace = calcPace(distance, durationMin)

    const res = await fetch('/api/log-run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: formData.date,
        distance,
        minutes: parseInt(formData.minutes) || 0,
        seconds: parseInt(formData.seconds) || 0,
        type: formData.type,
        notes: formData.notes,
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      setSubmitError(`Couldn't save your run — please try again. (${result.error ?? res.status})`)
      setSubmitting(false)
      return
    }

    setEarnedBadges(result.badges ?? [])
    setSubmitting(false)
    setSubmitted(true)
  }

  const resetForm = () => {
    setSubmitted(false)
    setEarnedBadges([])
    setValidationError(null)
    setSubmitError(null)
    setFormData({
      date: new Date().toLocaleDateString('en-CA'),
      distance: '',
      minutes: '',
      seconds: '',
      type: 'easy',
      notes: '',
    })
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center pl-anim">
        <div className="text-center px-8">
          <div className="flex justify-center mb-[22px]">
            <PacelineMedal category="distance" size="lg" />
          </div>
          <div className="anton text-[40px] uppercase leading-[0.95]">Logged!</div>
          <p className="text-ink-2 text-[15px] mt-3 max-w-[240px] mx-auto">
            {formData.distance
              ? `${formData.distance}km at ${previewPace(formData)}`
              : 'Nice work'}{' '}
            — the club just moved forward.
          </p>
          {earnedBadges.length > 0 && (
            <div className="mt-4 pt-4 border-t border-line">
              <p className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 mb-2">
                New patch{earnedBadges.length > 1 ? 'es' : ''} earned!
              </p>
              {earnedBadges.map((name) => (
                <p key={name} className="text-sm text-race font-semibold">
                  {name}
                </p>
              ))}
            </div>
          )}
          <div className="mt-7 flex flex-col gap-[10px]">
            <Link href="/" className="pl-btn pl-btn-primary">
              Back to home
            </Link>
            <button className="pl-btn pl-btn-ghost" onClick={resetForm}>
              Log another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper pb-[130px] pl-anim">
      {/* Header */}
      <div className="flex items-center gap-3 px-[22px] pt-[54px] pb-1">
        <Link
          href="/"
          className="w-[38px] h-[38px] rounded-full border border-line bg-card flex items-center justify-center text-ink-2"
          aria-label="Back"
        >
          <ChevronRight size={18} className="rotate-180" />
        </Link>
        <div className="pl-eyebrow">New entry</div>
      </div>

      <div className="px-[22px] pt-[6px] pb-2">
        <h1 className="pl-heading">Log a Run</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-[22px] pt-2 flex flex-col gap-3" noValidate>
        {/* Date */}
        <div className="pl-field">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px]">
            Date
          </div>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => set('date', e.target.value)}
            max={new Date().toLocaleDateString('en-CA')}
            className="pl-input"
          />
        </div>

        {/* Distance */}
        <div className="pl-field text-center py-5 px-4">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center justify-center gap-2">
            <Route size={14} /> Distance
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0.1"
              placeholder="0.0"
              value={formData.distance}
              onChange={(e) => set('distance', e.target.value)}
              className="w-[130px] bg-transparent border-none text-center anton text-[44px] outline-none placeholder:text-ink-3/50"
            />
            <span className="mono text-lg text-ink-3">km</span>
          </div>
        </div>

        {/* Duration + live pace */}
        <div className="pl-field">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center gap-2">
            <Clock size={14} /> Duration
          </div>
          <div className="flex gap-[10px] items-center">
            <div className="flex-1">
              <input
                type="number"
                min="0"
                placeholder="00"
                value={formData.minutes}
                onChange={(e) => set('minutes', e.target.value)}
                className="pl-input text-center mono text-[22px] font-semibold"
              />
              <p className="text-xs text-ink-3 text-center mt-1">Minutes</p>
            </div>
            <span className="anton text-[22px] text-ink-3 mb-5">:</span>
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="59"
                placeholder="00"
                value={formData.seconds}
                onChange={(e) => set('seconds', e.target.value)}
                className="pl-input text-center mono text-[22px] font-semibold"
              />
              <p className="text-xs text-ink-3 text-center mt-1">Seconds</p>
            </div>
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-line">
            <span className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3">Pace</span>
            <span className="mono text-base font-bold text-race">{previewPace(formData)}</span>
          </div>
        </div>

        {/* Run type */}
        <div className="pl-field">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center gap-2">
            <Sparkles size={14} /> Type of run
          </div>
          <div className="grid grid-cols-3 gap-2">
            {RUN_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set('type', t.value)}
                className={`py-[11px] px-2 rounded-xl border-[1.5px] text-center transition-all ${
                  formData.type === t.value
                    ? 'border-race bg-race/[0.08]'
                    : 'border-line bg-paper'
                }`}
              >
                <div className="font-bold text-[13px] text-ink">{t.label}</div>
                <div className="text-[10px] text-ink-3 mt-[2px]">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="pl-field">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center gap-2">
            <MessageSquare size={14} /> Notes
          </div>
          <textarea
            className="pl-input resize-none text-[15px] leading-[1.5]"
            rows={3}
            placeholder="How did it feel? Any highlights?"
            value={formData.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>

        {/* Validation / submit errors */}
        {(validationError || submitError) && (
          <div className="px-4 py-3 rounded-[12px] bg-race/10 border border-race/20">
            <p className="text-[13px] text-race font-semibold">
              {validationError ?? submitError}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!userId || submitting}
          className="pl-btn pl-btn-primary mt-1 disabled:opacity-50"
        >
          <Check size={18} strokeWidth={2.6} />
          {submitting ? 'Saving…' : 'Save run'}
        </button>
      </form>
    </div>
  )
}
