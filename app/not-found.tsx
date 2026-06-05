import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-[22px] text-center">
      <div className="relative w-[38px] h-[38px] mb-6">
        <div className="absolute inset-0 rounded-full border-[5px] border-race" />
        <div className="absolute w-[11px] h-[11px] rounded-full bg-gold top-[-2px] left-1/2 -translate-x-1/2" />
      </div>
      <p className="mono text-[11px] tracking-[0.16em] uppercase text-ink-3 mb-2">404</p>
      <h1 className="font-extrabold text-[22px] text-ink mb-2">Page not found</h1>
      <p className="text-[14px] text-ink-3 mb-8 max-w-[280px] leading-[1.5]">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="pl-btn pl-btn-primary max-w-[280px]">
        Go home
      </Link>
    </div>
  )
}
