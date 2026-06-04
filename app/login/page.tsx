"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError("Enter your email address above first."); return }
    setResetLoading(true)
    setError("")
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setResetSent(true)
    setResetLoading(false)
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6 pl-anim">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-[38px] h-[38px] mb-4">
            <div className="absolute inset-0 rounded-full border-[5px] border-race" />
            <div className="absolute w-[11px] h-[11px] rounded-full bg-gold top-[-2px] left-1/2 -translate-x-1/2" />
          </div>
          <span className="anton text-2xl tracking-[0.07em] text-ink">PACELINE</span>
          <p className="mono text-[11px] tracking-[0.14em] uppercase text-ink-3 mt-1">Run together. Rise together.</p>
        </div>

        <div className="pl-card p-6">
          <div className="pl-eyebrow mb-1">Welcome back</div>
          <h1 className="font-extrabold text-[22px] text-ink mb-5">Sign in</h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <div>
              <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-2">Email</div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-input"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold">Password</div>
                <button
                  type="button"
                  onClick={() => setShowReset(r => !r)}
                  className="mono text-[10.5px] text-race hover:text-race-deep underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
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
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {showReset && (
            <div className="mt-4 pt-4 border-t border-line">
              {resetSent ? (
                <p className="text-sm text-pine font-medium text-center">
                  Reset link sent — check your email.
                </p>
              ) : (
                <>
                  <p className="text-xs text-ink-3 mb-3">
                    Enter your email above then tap the button below. We&apos;ll send a reset link.
                  </p>
                  <button
                    onClick={handleReset}
                    disabled={resetLoading}
                    className="pl-btn pl-btn-ghost disabled:opacity-50"
                  >
                    {resetLoading ? "Sending…" : "Send reset link"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-sm text-ink-3 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-race font-semibold hover:text-race-deep">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
