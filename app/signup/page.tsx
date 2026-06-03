"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6 bg-card border-border">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Join the club</h1>
          <p className="text-muted-foreground text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-foreground">Your name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Jamie Runner"
              className="bg-input border-border text-foreground min-h-[44px] mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-input border-border text-foreground min-h-[44px] mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="bg-input border-border text-foreground min-h-[44px] mt-1"
              minLength={6}
              required
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px]"
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </Card>
    </div>
  )
}
