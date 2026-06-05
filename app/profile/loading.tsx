export default function Loading() {
  return (
    <div className="min-h-screen bg-paper pb-[110px]">
      <div className="px-[22px] pt-[54px] pb-[6px]">
        <div className="h-[26px] w-[120px] rounded-full bg-line/60 animate-pulse" />
      </div>
      <div className="flex flex-col items-center pt-6 pb-2 gap-3">
        <div className="w-[80px] h-[80px] rounded-full bg-line/60 animate-pulse" />
        <div className="h-3 w-[120px] rounded-full bg-line/60 animate-pulse" />
      </div>
      <div className="px-[22px] flex flex-col gap-3 pt-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-[80px] rounded-[16px] bg-line/40 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
