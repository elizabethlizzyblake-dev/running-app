"use client"

import { useState } from "react"
import { 
  PacelineMedal,
  ChevronRight,
  Route,
  Clock,
  Sparkles,
  MessageSquare,
  Check
} from "@/components/paceline-ui"
import { runTypes } from "@/lib/mock-data"
import Link from "next/link"

export default function LogRunPage() {
  const [submitted, setSubmitted] = useState(false)
  const [f, setF] = useState({ 
    distance: "", 
    min: "", 
    sec: "", 
    type: "easy", 
    notes: "" 
  })
  
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }))

  const pace = () => {
    const d = parseFloat(f.distance)
    const tot = (parseInt(f.min) || 0) + (parseInt(f.sec) || 0) / 60
    if (d > 0 && tot > 0) {
      const p = tot / d
      const m = Math.floor(p)
      const s = Math.round((p - m) * 60)
      return `${m}:${s.toString().padStart(2, "0")}`
    }
    return "-:--"
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
            {f.distance ? `${f.distance} km at ${pace()}/km` : "Nice work"} &mdash; the club just moved forward.
          </p>
          <div className="mt-7 flex flex-col gap-[10px]">
            <Link href="/" className="pl-btn pl-btn-primary">
              Back to home
            </Link>
            <button 
              className="pl-btn pl-btn-ghost"
              onClick={() => {
                setSubmitted(false)
                setF({ distance: "", min: "", sec: "", type: "easy", notes: "" })
              }}
            >
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

      {/* Page Header */}
      <div className="px-[22px] pt-[6px] pb-2">
        <h1 className="pl-heading">Log a Run</h1>
      </div>

      {/* Form */}
      <div className="px-[22px] pt-2 flex flex-col gap-3">
        {/* Distance Hero Field */}
        <div className="pl-field text-center py-5 px-4">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center justify-center gap-2">
            <Route size={14} /> Distance
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <input
              type="number"
              placeholder="0.0"
              value={f.distance}
              onChange={e => set("distance", e.target.value)}
              className="w-[130px] bg-transparent border-none text-center anton text-[44px] outline-none placeholder:text-ink-3/50"
            />
            <span className="mono text-lg text-ink-3">km</span>
          </div>
        </div>

        {/* Duration + Pace */}
        <div className="pl-field">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center gap-2">
            <Clock size={14} /> Duration
          </div>
          <div className="flex gap-[10px] items-center">
            <input
              type="number"
              placeholder="00"
              value={f.min}
              onChange={e => set("min", e.target.value)}
              className="pl-input text-center mono text-[22px] font-semibold"
            />
            <span className="anton text-[22px] text-ink-3">:</span>
            <input
              type="number"
              placeholder="00"
              value={f.sec}
              onChange={e => set("sec", e.target.value)}
              className="pl-input text-center mono text-[22px] font-semibold"
            />
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-line">
            <span className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3">Pace</span>
            <span className="mono text-base font-bold text-race">{pace()} /km</span>
          </div>
        </div>

        {/* Run Type */}
        <div className="pl-field">
          <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center gap-2">
            <Sparkles size={14} /> Type of run
          </div>
          <div className="grid grid-cols-3 gap-2">
            {runTypes.map(t => (
              <button
                key={t.value}
                onClick={() => set("type", t.value)}
                className={`py-[11px] px-2 rounded-xl border-[1.5px] text-center transition-all ${
                  f.type === t.value 
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
            value={f.notes}
            onChange={e => set("notes", e.target.value)}
          />
        </div>

        {/* Submit */}
        <button 
          className="pl-btn pl-btn-primary mt-1"
          onClick={() => setSubmitted(true)}
        >
          <Check size={18} strokeWidth={2.6} /> Save run
        </button>
      </div>
    </div>
  )
}
