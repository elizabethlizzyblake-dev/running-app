export default function FeedLoading() {
  return (
    <div className="min-h-screen bg-paper pb-[110px]">
      <div className="px-[22px] pt-[54px] pb-4">
        <div className="h-[28px] w-40 bg-line/40 rounded animate-pulse" />
        <div className="h-[14px] w-48 bg-line/30 rounded mt-2 animate-pulse" />
      </div>
      <div className="px-[16px] flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card border border-line rounded-[16px] px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-line/40 animate-pulse" />
              <div className="flex-1">
                <div className="h-[14px] w-28 bg-line/40 rounded animate-pulse mb-1" />
                <div className="h-[11px] w-20 bg-line/30 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-[16px] w-48 bg-line/30 rounded animate-pulse mb-4" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-[30px] w-[44px] rounded-full bg-line/30 animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
