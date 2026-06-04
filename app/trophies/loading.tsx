export default function Loading() {
  return (
    <div className="min-h-screen bg-paper pb-[110px]">
      <div className="px-[22px] pt-[54px]">
        <div className="h-[26px] w-[120px] rounded-full bg-line/60 animate-pulse mb-4" />
        <div className="h-8 w-[180px] rounded-[8px] bg-line/60 animate-pulse mb-6" />
        {/* Badge grid skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-[72px] h-[72px] rounded-full bg-line/40 animate-pulse" />
              <div className="h-3 w-[60px] rounded-full bg-line/40 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
