export default function Loading() {
  return (
    <div className="min-h-screen bg-paper pb-[110px]">
      <div className="px-[22px] pt-[54px]">
        <div className="h-[26px] w-[120px] rounded-full bg-line/60 animate-pulse mb-6" />
        <div className="h-8 w-[160px] rounded-[8px] bg-line/60 animate-pulse mb-2" />
        <div className="h-4 w-[100px] rounded-full bg-line/40 animate-pulse mb-6" />
        {/* Tab skeleton */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 flex-1 rounded-full bg-line/40 animate-pulse" />
          ))}
        </div>
        {/* Podium skeleton */}
        <div className="flex items-end justify-center gap-3 mb-6">
          <div className="w-[90px] h-[120px] rounded-[16px] bg-line/40 animate-pulse" />
          <div className="w-[100px] h-[150px] rounded-[16px] bg-line/40 animate-pulse" />
          <div className="w-[90px] h-[100px] rounded-[16px] bg-line/40 animate-pulse" />
        </div>
        {/* List skeleton */}
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-[60px] rounded-[16px] bg-line/40 animate-pulse mb-2" />
        ))}
      </div>
    </div>
  )
}
