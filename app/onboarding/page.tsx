"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Check } from "lucide-react"
import type { RunningLevel, Motivation, Struggle, SuccessGoal } from "@/lib/types"
import {
  RUNNING_LEVELS,
  MOTIVATIONS,
  STRUGGLES,
  SUCCESS_GOALS,
  WEEKLY_TARGETS,
  PERSONA_CONFIG,
} from "@/lib/onboarding"
import type { Persona } from "@/lib/types"

const TOTAL_STEPS = 5

// ── Step sub-components ──────────────────────────────────────────

function StepHeader({
  step,
  onBack,
}: {
  step: number
  onBack: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-[22px] pt-[54px] pb-[6px]">
      {step > 1 ? (
        <button
          onClick={onBack}
          className="w-[38px] h-[38px] rounded-full border border-line bg-card flex items-center justify-center text-ink-2 flex-shrink-0"
          aria-label="Back"
        >
          <ChevronLeft size={18} />
        </button>
      ) : (
        <div className="w-[38px] h-[38px] flex-shrink-0" />
      )}

      {/* Progress dots */}
      <div className="flex-1 flex items-center justify-center gap-[6px]">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i < step
                ? 'w-[20px] h-[6px] bg-race'
                : i === step - 1
                ? 'w-[20px] h-[6px] bg-race'
                : 'w-[6px] h-[6px] bg-line'
            }`}
          />
        ))}
      </div>

      <div className="w-[38px] flex-shrink-0">
        <span className="mono text-[11px] text-ink-3 tracking-[0.04em]">
          {step}/{TOTAL_STEPS}
        </span>
      </div>
    </div>
  )
}

function SingleSelect<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; sub: string; emoji: string }[]
  value: T | null
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`w-full flex items-center gap-4 px-4 py-[14px] rounded-[16px] border-[1.5px] text-left transition-all active:scale-[0.98] ${
              selected
                ? 'border-race bg-race/[0.07]'
                : 'border-line bg-card'
            }`}
          >
            <span className="text-[22px] w-8 text-center flex-shrink-0">{opt.emoji}</span>
            <div className="flex-1">
              <div className={`font-bold text-[14px] ${selected ? 'text-race' : 'text-ink'}`}>
                {opt.label}
              </div>
              <div className="text-[12px] text-ink-3 mt-[2px]">{opt.sub}</div>
            </div>
            {selected && (
              <div className="w-5 h-5 rounded-full bg-race flex items-center justify-center flex-shrink-0">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

function MultiSelect<T extends string>({
  options,
  values,
  onChange,
}: {
  options: { value: T; label: string; emoji: string }[]
  values: T[]
  onChange: (v: T[]) => void
}) {
  const toggle = (v: T) => {
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v])
  }
  return (
    <div className="grid grid-cols-2 gap-[10px]">
      {options.map((opt) => {
        const selected = values.includes(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`flex flex-col items-start gap-1 px-4 py-[14px] rounded-[16px] border-[1.5px] text-left transition-all active:scale-[0.97] ${
              selected
                ? 'border-race bg-race/[0.07]'
                : 'border-line bg-card'
            }`}
          >
            <span className="text-[20px]">{opt.emoji}</span>
            <span className={`font-semibold text-[13px] leading-tight ${selected ? 'text-race' : 'text-ink'}`}>
              {opt.label}
            </span>
            {selected && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-race flex items-center justify-center">
                <Check size={9} className="text-white" strokeWidth={3} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function WeeklyTargetStep({
  value,
  onChange,
}: {
  value: number | null
  onChange: (v: number) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-[10px]">
      {WEEKLY_TARGETS.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center py-6 px-4 rounded-[16px] border-[1.5px] text-center transition-all active:scale-[0.97] ${
              selected ? 'border-race bg-race/[0.07]' : 'border-line bg-card'
            }`}
          >
            <span className={`anton text-[38px] leading-none ${selected ? 'text-race' : 'text-ink'}`}>
              {opt.value}
            </span>
            <span className={`font-bold text-[13px] mt-1 ${selected ? 'text-race' : 'text-ink'}`}>
              {opt.label}
            </span>
            <span className="text-[11px] text-ink-3 mt-[3px]">{opt.sub}</span>
          </button>
        )
      })}
    </div>
  )
}

// ── Result screen ────────────────────────────────────────────────

function PersonaReveal({ persona }: { persona: Persona }) {
  const cfg = PERSONA_CONFIG[persona]
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-[22px] text-center pl-anim">
      <div className="text-[72px] mb-5">{cfg.emoji}</div>
      <div className="mono text-[11px] tracking-[0.14em] uppercase text-ink-3 mb-2">
        Your running persona
      </div>
      <h1 className="anton text-[36px] uppercase leading-[0.95] text-ink mb-3">
        {persona}
      </h1>
      <p className="text-[15px] text-ink-2 leading-[1.5] max-w-[280px] mb-2">
        {cfg.description}
      </p>
      <p className="text-[13px] text-ink-3 italic max-w-[260px]">
        &ldquo;{cfg.headline}&rdquo;
      </p>
      <div className="mt-6">
        <div className="w-6 h-6 rounded-full bg-race/20 flex items-center justify-center mx-auto animate-pulse">
          <div className="w-3 h-3 rounded-full bg-race" />
        </div>
        <p className="mono text-[11px] text-ink-3 mt-2">Setting up your profile…</p>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────

type FormState = {
  runningLevel: RunningLevel | null
  motivations: Motivation[]
  struggles: Struggle[]
  successGoal: SuccessGoal | null
  weeklyTarget: number | null
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [revealedPersona, setRevealedPersona] = useState<Persona | null>(null)

  const [form, setForm] = useState<FormState>({
    runningLevel: null,
    motivations: [],
    struggles: [],
    successGoal: null,
    weeklyTarget: null,
  })

  const canContinue = (() => {
    if (step === 1) return form.runningLevel !== null
    if (step === 2) return form.motivations.length > 0
    if (step === 3) return form.struggles.length > 0
    if (step === 4) return form.successGoal !== null
    if (step === 5) return form.weeklyTarget !== null
    return false
  })()

  const handleSubmit = async () => {
    if (!form.runningLevel || !form.successGoal || !form.weeklyTarget) return
    setSubmitting(true)
    setSubmitError(null)

    const res = await fetch('/api/complete-onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        runningLevel: form.runningLevel,
        motivations: form.motivations,
        struggles: form.struggles,
        successGoal: form.successGoal,
        weeklyTarget: form.weeklyTarget,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setSubmitError(data.error ?? 'Something went wrong — please try again.')
      setSubmitting(false)
      return
    }

    setRevealedPersona(data.persona as Persona)
    // Give user a moment to see their persona, then redirect
    setTimeout(() => router.replace('/'), 2200)
  }

  if (revealedPersona) return <PersonaReveal persona={revealedPersona} />

  const STEP_COPY = [
    { eyebrow: 'Step 1 of 5', heading: "Where are you\nstarting from?",     sub: 'Be honest — this helps us tailor your experience.' },
    { eyebrow: 'Step 2 of 5', heading: "What gets you\nout the door?",       sub: 'Select all that apply.' },
    { eyebrow: 'Step 3 of 5', heading: "What's held\nyou back?",             sub: "We'll build around your challenges." },
    { eyebrow: 'Step 4 of 5', heading: "What would success\nlook like?",     sub: 'Pick the goal that excites you most.' },
    { eyebrow: 'Step 5 of 5', heading: "How often do you\nwant to run?",     sub: "Set a realistic weekly target and we'll track it." },
  ]

  const copy = STEP_COPY[step - 1]

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <StepHeader step={step} onBack={() => setStep((s) => Math.max(1, s - 1))} />

      {/* Brand mark */}
      <div className="flex items-center gap-[8px] px-[22px] pt-[10px]">
        <div className="relative w-[20px] h-[20px] flex-shrink-0">
          <div className="absolute inset-0 rounded-full border-[3px] border-race" />
          <div className="absolute w-[6px] h-[6px] rounded-full bg-gold top-[-1px] left-1/2 -translate-x-1/2" />
        </div>
        <span className="anton text-sm tracking-[0.07em] text-ink-3">RUNIKA</span>
      </div>

      {/* Question */}
      <div className="px-[22px] pt-[18px] pb-[20px]">
        <div className="pl-eyebrow mb-2">{copy.eyebrow}</div>
        <h1 className="font-extrabold text-[28px] leading-[1.1] text-ink whitespace-pre-line">
          {copy.heading}
        </h1>
        <p className="text-[13.5px] text-ink-3 mt-[8px]">{copy.sub}</p>
      </div>

      {/* Options */}
      <div className="px-[22px] flex-1 overflow-y-auto pb-[100px]">
        {step === 1 && (
          <SingleSelect
            options={RUNNING_LEVELS}
            value={form.runningLevel}
            onChange={(v) => setForm((f) => ({ ...f, runningLevel: v }))}
          />
        )}
        {step === 2 && (
          <MultiSelect
            options={MOTIVATIONS}
            values={form.motivations}
            onChange={(v) => setForm((f) => ({ ...f, motivations: v }))}
          />
        )}
        {step === 3 && (
          <MultiSelect
            options={STRUGGLES}
            values={form.struggles}
            onChange={(v) => setForm((f) => ({ ...f, struggles: v }))}
          />
        )}
        {step === 4 && (
          <SingleSelect
            options={SUCCESS_GOALS}
            value={form.successGoal}
            onChange={(v) => setForm((f) => ({ ...f, successGoal: v }))}
          />
        )}
        {step === 5 && (
          <WeeklyTargetStep
            value={form.weeklyTarget}
            onChange={(v) => setForm((f) => ({ ...f, weeklyTarget: v }))}
          />
        )}

        {submitError && (
          <div className="mt-4 px-4 py-3 rounded-[12px] bg-race/10 border border-race/20">
            <p className="text-[13px] text-race font-semibold">{submitError}</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-paper border-t border-line px-[22px] py-[18px] pb-[calc(18px+env(safe-area-inset-bottom))]">
        <button
          disabled={!canContinue || submitting}
          onClick={() => {
            if (step < TOTAL_STEPS) {
              setStep((s) => s + 1)
            } else {
              handleSubmit()
            }
          }}
          className="pl-btn pl-btn-primary disabled:opacity-40 w-full"
        >
          {submitting
            ? 'Building your profile…'
            : step < TOTAL_STEPS
            ? 'Continue'
            : 'Finish'}
        </button>
        {step > 1 && step < TOTAL_STEPS && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="w-full text-center text-[13px] text-ink-3 mt-3"
          >
            Back
          </button>
        )}
      </div>
    </div>
  )
}
