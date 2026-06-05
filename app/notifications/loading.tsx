export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-paper pb-[110px]">
      <div className="px-[22px] pt-[54px] pb-4">
        <div className="h-[28px] w-52 bg-line/40 rounded animate-pulse" />
        <div className="h-[14px] w-40 bg-line/30 rounded mt-2 animate-pulse" />
      </div>
      <div className="px-[16px] flex flex-col gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-[14px] border border-line bg-card">
            <div className="w-6 h-6 rounded-full bg-line/40 animate-pulse flex-none" />
            <div className="flex-1">
              <div className="h-[14px] w-full bg-line/40 rounded animate-pulse mb-2" />
              <div className="h-[11px] w-16 bg-line/30 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
