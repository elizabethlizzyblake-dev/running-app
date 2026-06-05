export default function Loading() {
  return (
    <div className="min-h-screen bg-paper pb-[110px]">
      <div className="px-[22px] pt-[54px] pb-[6px]">
        <div className="h-[26px] w-[120px] rounded-full bg-line/60 animate-pulse" />
      </div>
      <div className="px-[22px] pt-[14px] pb-2">
        <div className="h-8 w-[140px] rounded-[8px] bg-line/60 animate-pulse" />
      </div>
      <div className="px-[22px] flex flex-col gap-3 pt-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-[72px] rounded-[16px] bg-line/40 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
