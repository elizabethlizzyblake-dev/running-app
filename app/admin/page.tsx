"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  PacelineMedal,
  ChevronRight,
  Settings,
  Target,
  Calendar,
  Medal,
  TrendingUp,
  Check
} from "@/components/paceline-ui"

export default function AdminPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    badgeReward: "",
    targetMetric: "distance",
    targetValue: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        badgeReward: "",
        targetMetric: "distance",
        targetValue: ""
      })
    }, 2000)
  }

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
          <div className="font-bold text-ink">Challenge Setter</div>
        </div>
        <div className="w-[38px] h-[38px] rounded-full bg-gold/20 flex items-center justify-center">
          <Settings size={18} className="text-gold" />
        </div>
      </div>

      <main className="px-[22px] pt-4">
        {/* Header Card */}
        <div className="pl-card p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-race/20 flex items-center justify-center">
            <Target size={20} className="text-race" />
          </div>
          <div>
            <h2 className="font-semibold text-ink">Create New Quest</h2>
            <p className="text-xs text-ink-3">Motivate your running community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Title */}
          <div className="pl-field">
            <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px]">
              Quest Title
            </div>
            <input
              type="text"
              placeholder="e.g. Summer Distance Challenge"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="pl-input"
              required
            />
          </div>

          {/* Description */}
          <div className="pl-field">
            <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px]">
              Description
            </div>
            <textarea
              placeholder="Describe the quest and motivate participants..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="pl-input resize-none"
              rows={3}
              required
            />
          </div>

          {/* Dates */}
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
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="pl-input"
                  required
                />
              </div>
              <div>
                <div className="text-xs text-ink-3 mb-1">End Date</div>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="pl-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Badge Reward */}
          <div className="pl-field">
            <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center gap-2">
              <Medal size={14} className="text-gold" /> Patch Reward Name
            </div>
            <input
              type="text"
              placeholder="e.g. Summer Champion"
              value={formData.badgeReward}
              onChange={(e) => setFormData({ ...formData, badgeReward: e.target.value })}
              className="pl-input"
              required
            />
            <p className="text-xs text-ink-3 mt-2">
              Members earn this patch upon completion
            </p>
          </div>

          {/* Target */}
          <div className="pl-field">
            <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-[11px] flex items-center gap-2">
              <TrendingUp size={14} /> Target Goal
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-ink-3 mb-1">Metric</div>
                <select 
                  value={formData.targetMetric} 
                  onChange={(e) => setFormData({ ...formData, targetMetric: e.target.value })}
                  className="pl-input"
                >
                  <option value="distance">Distance (km)</option>
                  <option value="runs">Number of Runs</option>
                  <option value="streak">Streak (days)</option>
                  <option value="pace">Pace (min/km)</option>
                </select>
              </div>
              <div>
                <div className="text-xs text-ink-3 mb-1">Target Value</div>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 100"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  className="pl-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {formData.title && (
            <div className="pl-pine p-4">
              <p className="mono text-[10px] tracking-[0.16em] uppercase text-paper/55 mb-2">Preview</p>
              <h3 className="font-bold text-paper">{formData.title}</h3>
              {formData.description && (
                <p className="text-sm text-paper/70 mt-1 line-clamp-2">{formData.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 mono text-[10.5px] text-paper/60">
                {formData.targetValue && (
                  <span>
                    Goal: {formData.targetValue} {formData.targetMetric === "distance" ? "km" : formData.targetMetric === "runs" ? "runs" : formData.targetMetric === "streak" ? "days" : "min/km"}
                  </span>
                )}
                {formData.badgeReward && (
                  <span className="text-gold">{formData.badgeReward}</span>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="pl-btn pl-btn-primary mt-1"
          >
            <Check size={18} strokeWidth={2.6} /> Create Quest
          </button>
        </form>
      </main>
    </div>
  )
}
