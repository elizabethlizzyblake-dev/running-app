"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Check, X, ZoomIn } from "lucide-react"

interface Props {
  file: File
  onDone: (blob: Blob) => void
  onCancel: () => void
}

const CIRCLE = 280 // crop circle diameter in the UI (px)
const OUTPUT = 400 // canvas output size (px)

export function AvatarCropModal({ file, onDone, onCancel }: Props) {
  const imgRef        = useRef<HTMLImageElement>(null)
  const dragging      = useRef(false)
  const lastPoint     = useRef({ x: 0, y: 0 })

  const [imgUrl, setImgUrl] = useState("")
  const [nat, setNat]       = useState({ w: 1, h: 1 })
  const [zoom, setZoom]     = useState(1)
  const [pos, setPos]       = useState({ x: 0, y: 0 })

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setImgUrl(url)
    const img = new Image()
    img.onload = () => setNat({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Scale so the image just covers the circle at zoom 1
  const baseScale  = nat.w && nat.h ? Math.max(CIRCLE / nat.w, CIRCLE / nat.h) : 1
  const s          = baseScale * zoom
  const imgW       = nat.w * s
  const imgH       = nat.h * s

  // Clamp so image always fully covers the circle
  const maxX = Math.max(0, (imgW - CIRCLE) / 2)
  const maxY = Math.max(0, (imgH - CIRCLE) / 2)
  const cx   = Math.max(-maxX, Math.min(maxX, pos.x))
  const cy   = Math.max(-maxY, Math.min(maxY, pos.y))

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true
    lastPoint.current = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - lastPoint.current.x
    const dy = e.clientY - lastPoint.current.y
    lastPoint.current = { x: e.clientX, y: e.clientY }
    setPos(p => ({ x: p.x + dx, y: p.y + dy }))
  }, [])

  const stopDrag = useCallback(() => { dragging.current = false }, [])

  const handleDone = () => {
    const img = imgRef.current
    if (!img) return

    // Map the crop circle back to source image coordinates
    const srcX    = nat.w / 2 + (-CIRCLE / 2 - cx) / s
    const srcY    = nat.h / 2 + (-CIRCLE / 2 - cy) / s
    const srcSize = CIRCLE / s

    const canvas  = document.createElement("canvas")
    canvas.width  = OUTPUT
    canvas.height = OUTPUT
    canvas.getContext("2d")!.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, OUTPUT, OUTPUT)
    canvas.toBlob(blob => { if (blob) onDone(blob) }, "image/jpeg", 0.92)
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/90 flex flex-col items-center justify-center p-6 pl-anim">
      <p className="mono text-[10.5px] tracking-[0.12em] uppercase text-paper/50 mb-5">
        Drag · Pinch to zoom
      </p>

      {/* Circle crop preview */}
      <div
        className="relative overflow-hidden rounded-full border-[3px] border-white/30 cursor-grab active:cursor-grabbing"
        style={{ width: CIRCLE, height: CIRCLE, touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        {imgUrl && (
          <img
            ref={imgRef}
            src={imgUrl}
            alt=""
            draggable={false}
            style={{
              width:  imgW,
              height: imgH,
              position: "absolute",
              left: "50%",
              top:  "50%",
              transform: `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px))`,
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        )}
      </div>

      {/* Zoom slider */}
      <div className="mt-5 w-full max-w-[280px]">
        <div className="flex items-center gap-3">
          <ZoomIn size={14} className="text-paper/40 flex-shrink-0" />
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={e => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-race"
          />
        </div>
      </div>

      {/* Actions */}
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
