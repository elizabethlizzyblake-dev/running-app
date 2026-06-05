"use client"

import { useEffect } from "react"

export function MarkReadOnMount() {
  useEffect(() => {
    fetch('/api/notifications/mark-read', { method: 'POST' })
  }, [])
  return null
}
