"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Supabase puts the session in the URL hash on redirect — this picks it up
    supabase.auth.getSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError("Passwords don't match."); return }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push("/"), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6 pl-anim">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-[38px] h-[38px] mb-4">
            <div className="absolute inset-0 rounded-full border-[5px] border-race" />
            <div className="absolute w-[11px] h-[11px] rounded-full bg-gold top-[-2px] left-1/2 -translate-x-1/2" />
          </div>
          <span className="anton text-2xl tracking-[0.07em] text-ink">RUNIKA</span>
        </div>

        <div className="pl-card p-6">
          <div className="pl-eyebrow mb-1">New password</div>
          <h1 className="font-extrabold text-[22px] text-ink mb-5">Reset password</h1>

          {done ? (
            <p className="text-pine font-semibold text-center py-4">Password updated — taking you home…</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-2">New password</div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="pl-input"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-2">Confirm password</div>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Same again"
                  className="pl-input"
                  required
                />
              </div>
              {error && <p className="text-race text-sm font-medium">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="pl-btn pl-btn-primary mt-2 disabled:opacity-50"
              >
                {loading ? "Updating…" : "Set new password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
