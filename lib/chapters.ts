// Story chapters — the journey unfolds as cumulative distance grows.
// Each chapter is a place Runi leads you to; distance is the key that unlocks it.

export type Chapter = {
  index: number
  title: string
  blurb: string
  /** cumulative km required to unlock */
  unlockKm: number
}

export const CHAPTERS: Chapter[] = [
  { index: 1, title: "The First Steps", blurb: "Where every journey begins — a quiet path at the edge of the meadow.", unlockKm: 0 },
  { index: 2, title: "The Whispering Woods", blurb: "Runi knows a trail through the trees where the morning light filters through.", unlockKm: 10 },
  { index: 3, title: "The Hidden Lighthouse", blurb: "Far along the coast, a lantern still glows. Runi has always wanted to see it.", unlockKm: 25 },
  { index: 4, title: "The Long Bridge", blurb: "It stretches further than you can see — but the view on the other side is worth it.", unlockKm: 45 },
  { index: 5, title: "Lantern Valley", blurb: "Hundreds of tiny lights drift over the water here at dusk.", unlockKm: 70 },
  { index: 6, title: "The Summit at Dawn", blurb: "The highest point on your map. Runi promises the sunrise is unforgettable.", unlockKm: 100 },
  { index: 7, title: "Beyond the Map", blurb: "No one has charted what lies past here. You and Runi will be the first.", unlockKm: 140 },
]

export type ChapterProgress = {
  current: Chapter
  next: Chapter | null
  kmIntoCurrent: number
  kmToNext: number | null
  /** 0..1 progress toward the next chapter */
  progressToNext: number
}

export function getChapterProgress(totalKm: number): ChapterProgress {
  let current = CHAPTERS[0]
  for (const c of CHAPTERS) {
    if (totalKm >= c.unlockKm) current = c
    else break
  }
  const next = CHAPTERS.find((c) => c.unlockKm > totalKm) ?? null
  const kmIntoCurrent = totalKm - current.unlockKm
  const kmToNext = next ? next.unlockKm - totalKm : null
  const span = next ? next.unlockKm - current.unlockKm : 1
  const progressToNext = next ? Math.min(kmIntoCurrent / span, 1) : 1
  return { current, next, kmIntoCurrent, kmToNext, progressToNext }
}

// Runi's anticipation for an upcoming adventure/race, escalating as the day nears.
export function runiCountdownLine(daysRemaining: number): string {
  if (daysRemaining <= 0) return "Today's the day. I'll be right beside you."
  if (daysRemaining === 1) return "Tomorrow! I can barely sit still."
  if (daysRemaining <= 7) return "Do you think we're ready? I think we're ready."
  if (daysRemaining <= 30) return "I'm starting to get excited about this one."
  return "I've already packed our bag for the journey."
}
