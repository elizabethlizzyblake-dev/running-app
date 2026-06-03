"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data.session) {
      router.push("/")
      router.refresh()
    } else {
      setError("Please check your email to confirm your account, then sign in.")
      setLoading(false)
    }
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
          <div className="pl-eyebrow mb-1">New member</div>
          <h1 className="font-extrabold text-[22px] text-ink mb-5">Join the club</h1>

          <form onSubmit={handleSignup} className="flex flex-col gap-3">
            <div>
              <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-2">Your name</div>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Jamie Runner"
                className="pl-input"
                required
              />
            </div>

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
              <div className="mono text-[11px] tracking-[0.1em] uppercase text-ink-3 font-semibold mb-2">Password</div>
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

            {error && (
              <p className="text-race text-sm font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="pl-btn pl-btn-primary mt-2 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-3 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-race font-semibold hover:text-race-deep">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
