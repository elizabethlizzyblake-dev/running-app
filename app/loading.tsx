export default function Loading() {
  return (
    <div className="min-h-screen bg-paper pb-[110px]">
      {/* Header skeleton */}
      <div className="px-[22px] pt-[54px] pb-[6px]">
        <div className="h-[26px] w-[120px] rounded-full bg-line/60 animate-pulse" />
      </div>

      {/* Greeting skeleton */}
      <div className="px-[22px] pt-[14px] pb-2 flex items-center gap-4">
        <div className="w-[52px] h-[52px] rounded-full bg-line/60 animate-pulse flex-shrink-0" />
        <div className="space-y-2">
          <div className="h-3 w-[80px] rounded-full bg-line/60 animate-pulse" />
          <div className="h-7 w-[140px] rounded-[8px] bg-line/60 animate-pulse" />
        </div>
      </div>

      {/* Hero card skeleton */}
      <div className="px-[22px] pt-[10px]">
        <div className="h-[200px] rounded-[20px] bg-pine/20 animate-pulse" />
      </div>

      {/* Stats row skeleton */}
      <div className="px-[22px] pt-[10px]">
        <div className="h-[80px] rounded-[16px] bg-line/40 animate-pulse" />
      </div>

      {/* Card skeletons */}
      <div className="px-[22px] pt-[10px] flex flex-col gap-3">
        <div className="h-[72px] rounded-[16px] bg-line/40 animate-pulse" />
        <div className="h-[110px] rounded-[16px] bg-line/40 animate-pulse" />
      </div>
    </div>
  )
}
