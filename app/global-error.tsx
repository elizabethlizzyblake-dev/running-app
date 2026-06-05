"use client"

import { useEffect } from "react"

export default function GlobalError({
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
    <html lang="en">
      <body className="min-h-screen bg-[#F3EEE3] flex flex-col items-center justify-center px-6 text-center font-sans">
        <h1 className="font-extrabold text-[22px] text-[#1A1A1A] mb-2">Something went wrong</h1>
        <p className="text-[14px] text-[#888] mb-8 max-w-[280px] leading-[1.5]">
          A critical error occurred. Please try reloading the page.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-[14px] bg-[#1E3A30] text-white font-bold text-[14px]"
        >
          Reload
        </button>
      </body>
    </html>
  )
}
