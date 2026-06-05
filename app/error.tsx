"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-[22px] text-center">
      <div className="relative w-[38px] h-[38px] mb-6">
        <div className="absolute inset-0 rounded-full border-[5px] border-race opacity-40" />
        <div className="absolute w-[11px] h-[11px] rounded-full bg-gold top-[-2px] left-1/2 -translate-x-1/2 opacity-40" />
      </div>
      <h1 className="font-extrabold text-[22px] text-ink mb-2">Something went wrong</h1>
      <p className="text-[14px] text-ink-3 mb-8 max-w-[280px] leading-[1.5]">
        An unexpected error occurred. It&apos;s been logged and we&apos;ll look into it.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <button onClick={reset} className="pl-btn pl-btn-primary">
          Try again
        </button>
        <Link href="/" className="pl-btn pl-btn-ghost">
          Go home
        </Link>
      </div>
    </div>
  )
}
