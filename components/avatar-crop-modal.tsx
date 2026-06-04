"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Check, X, ZoomIn } from "lucide-react"

interface Props {
  file: File
  onDone: (blob: Blob) => void
  onCancel: () => void
}

const CIRCLE = 280  // preview circle size (px)
const OUTPUT = 400  // saved image size (px)

function getClampedPos(
  p: { x: number; y: number },
  zoom: number,
  nat: { w: number; h: number }
) {
  const base = Math.max(CIRCLE / nat.w, CIRCLE / nat.h)
  const s    = base * zoom
  const maxX = Math.max(0, (nat.w * s - CIRCLE) / 2)
  const maxY = Math.max(0, (nat.h * s - CIRCLE) / 2)
  return {
    x: Math.max(-maxX, Math.min(maxX, p.x)),
    y: Math.max(-maxY, Math.min(maxY, p.y)),
  }
}

function drawCrop(
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  nat: { w: number; h: number },
  zoom: number,
  pos: { x: number; y: number },
  outSize: number
) {
  const base    = Math.max(CIRCLE / nat.w, CIRCLE / nat.h)
  const s       = base * zoom
  const clamped = getClampedPos(pos, zoom, nat)

  const srcX    = nat.w / 2 + (-CIRCLE / 2 - clamped.x) / s
  const srcY    = nat.h / 2 + (-CIRCLE / 2 - clamped.y) / s
  const srcSize = CIRCLE / s

  const ctx = canvas.getContext("2d")!
  ctx.clearRect(0, 0, outSize, outSize)
  ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, outSize, outSize)
}

export function AvatarCropModal({ file, onDone, onCancel }: Props) {
  const previewRef      = useRef<HTMLCanvasElement>(null)
  const imgRef          = useRef<HTMLImageElement | null>(null)
  const dragging        = useRef(false)
  const lastPoint       = useRef({ x: 0, y: 0 })
  const activePointers  = useRef(new Map<number, { x: number; y: number }>())
  const lastPinchDist   = useRef<number | null>(null)

  const [nat,   setNat]   = useState({ w: 1, h: 1 })
  const [zoom,  setZoom]  = useState(1)
  const [pos,   setPos]   = useState({ x: 0, y: 0 })
  const [ready, setReady] = useState(false)

  // Load image from file
  useEffect(() => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      setNat({ w: img.naturalWidth, h: img.naturalHeight })
      setReady(true)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Re-draw preview whenever state changes
  useEffect(() => {
    const canvas = previewRef.current
    const img    = imgRef.current
    if (!canvas || !img || !ready) return
    drawCrop(img, canvas, nat, zoom, pos, CIRCLE)
  }, [nat, zoom, pos, ready])

  // ── Pointer events (drag + pinch) ──────────────────────────

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    if (activePointers.current.size === 1) {
      dragging.current = true
      lastPoint.current = { x: e.clientX, y: e.clientY }
    }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = Array.from(activePointers.current.values())

    if (pts.length >= 2) {
      // Two-finger pinch → zoom
      dragging.current = false
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      if (lastPinchDist.current !== null) {
        const ratio = dist / lastPinchDist.current
        setZoom(z => Math.max(1, Math.min(3, z * ratio)))
      }
      lastPinchDist.current = dist
    } else if (pts.length === 1 && dragging.current) {
      // Single finger → drag
      const dx = e.clientX - lastPoint.current.x
      const dy = e.clientY - lastPoint.current.y
      lastPoint.current = { x: e.clientX, y: e.clientY }
      setPos(p => ({ x: p.x + dx, y: p.y + dy }))
    }
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId)
    if (activePointers.current.size < 2) lastPinchDist.current = null
    if (activePointers.current.size === 0) dragging.current = false
  }, [])

  // ── Output ─────────────────────────────────────────────────

  const handleDone = () => {
    const img = imgRef.current
    if (!img) return
    const canvas  = document.createElement("canvas")
    canvas.width  = OUTPUT
    canvas.height = OUTPUT
    drawCrop(img, canvas, nat, zoom, pos, OUTPUT)
    canvas.toBlob(blob => { if (blob) onDone(blob) }, "image/jpeg", 0.92)
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/90 flex flex-col items-center justify-center p-6 pl-anim">
      <p className="mono text-[10.5px] tracking-[0.12em] uppercase text-paper/50 mb-5">
        Drag &middot; Pinch or slider to zoom
      </p>

      {/* Canvas preview clipped to a circle */}
      <div
        className="rounded-full overflow-hidden border-[3px] border-white/30 cursor-grab active:cursor-grabbing"
        style={{ width: CIRCLE, height: CIRCLE, touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <canvas
          ref={previewRef}
          width={CIRCLE}
          height={CIRCLE}
          style={{ display: "block", width: CIRCLE, height: CIRCLE }}
        />
      </div>

      {/* Zoom slider */}
      <div className="mt-5 w-full max-w-[280px] flex items-center gap-3">
        <ZoomIn size={14} className="text-paper/40 flex-shrink-0" />
        <input
          type="range" min="1" max="3" step="0.01"
          value={zoom}
          onChange={e => setZoom(parseFloat(e.target.value))}
          className="flex-1 accent-race"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6 w-full max-w-[280px]">
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 py-[14px] rounded-[14px] font-semibold text-[15px]"
          style={{ background: "rgba(255,255,255,0.1)", color: "#F3EEE3", border: "1px solid rgba(255,255,255,0.18)" }}
        >
          <X size={16} /> Cancel
        </button>
        <button onClick={handleDone} className="flex-1 pl-btn pl-btn-primary">
          <Check size={16} strokeWidth={2.6} /> Use photo
        </button>
      </div>
    </div>
  )
}
