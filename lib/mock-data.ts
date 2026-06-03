// Mock data types and sample data for Run Club Quest

export interface User {
  id: string
  name: string
  avatar?: string
  joinedDate: string
}

export interface Run {
  id: string
  userId: string
  date: string
  distance: number // in km
  duration: number // in minutes
  pace: number // min/km
  type: "easy" | "tempo" | "interval" | "long" | "race" | "recovery"
  notes?: string
}

export interface Badge {
  id: string
  name: string
  description: string
  category: "distance" | "consistency" | "pace" | "community" | "monthly"
  icon: string
  earnedDate?: string
  requirement: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  targetMetric: "distance" | "runs" | "streak" | "pace"
  targetValue: number
  badgeReward: string
  participants: number
  currentProgress?: number
  joined?: boolean
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  value: number
  change?: number
}

// Sample current user
export const currentUser: User = {
  id: "user-1",
  name: "Jamie Runner",
  avatar: "JR",
  joinedDate: "2025-01-15"
}

// Sample monthly stats
export const monthlyStats = {
  totalDistance: 67.5,
  totalRuns: 12,
  longestRun: 15.2,
  averagePace: 5.45,
  streakDays: 5,
  targetDistance: 100,
  leaderboardPosition: 7,
  totalMembers: 48
}

// Sample badges
export const earnedBadges: Badge[] = [
  {
    id: "b1",
    name: "First Steps",
    description: "Complete your first run with the club",
    category: "distance",
    icon: "Footprints",
    earnedDate: "2025-01-16",
    requirement: "Log 1 run"
  },
  {
    id: "b2",
    name: "10K Club",
    description: "Run a total of 10km",
    category: "distance",
    icon: "Route",
    earnedDate: "2025-01-20",
    requirement: "10km total"
  },
  {
    id: "b3",
    name: "50K Explorer",
    description: "Run a total of 50km",
    category: "distance",
    icon: "Mountain",
    earnedDate: "2025-02-05",
    requirement: "50km total"
  },
  {
    id: "b4",
    name: "Week Warrior",
    description: "Run every day for a week",
    category: "consistency",
    icon: "Flame",
    earnedDate: "2025-02-10",
    requirement: "7-day streak"
  },
  {
    id: "b5",
    name: "Community Spirit",
    description: "Join your first group challenge",
    category: "community",
    icon: "Users",
    earnedDate: "2025-02-01",
    requirement: "Join 1 challenge"
  },
  {
    id: "b6",
    name: "January Jogger",
    description: "Complete the January Distance Challenge",
    category: "monthly",
    icon: "Calendar",
    earnedDate: "2025-01-31",
    requirement: "50km in January"
  },
]

export const availableBadges: Badge[] = [
  {
    id: "b7",
    name: "100K Legend",
    description: "Run a total of 100km",
    category: "distance",
    icon: "Award",
    requirement: "100km total"
  },
  {
    id: "b8",
    name: "Marathon Master",
    description: "Run 42.2km in a single run",
    category: "distance",
    icon: "Crown",
    requirement: "42.2km single run"
  },
  {
    id: "b9",
    name: "Month Streak",
    description: "Run every day for a month",
    category: "consistency",
    icon: "Flame",
    requirement: "30-day streak"
  },
  {
    id: "b10",
    name: "Speed Demon",
    description: "Run a 5K under 25 minutes",
    category: "pace",
    icon: "Zap",
    requirement: "5K < 25min"
  },
  {
    id: "b11",
    name: "Pace Pusher",
    description: "Improve your average pace by 30 seconds",
    category: "pace",
    icon: "TrendingUp",
    requirement: "30s pace improvement"
  },
  {
    id: "b12",
    name: "Social Butterfly",
    description: "Participate in 5 group challenges",
    category: "community",
    icon: "Heart",
    requirement: "Join 5 challenges"
  },
]

// Sample challenges
export const activeChallenges: Challenge[] = [
  {
    id: "c1",
    title: "June Distance Dash",
    description: "Run 100km this month as a club! Every kilometer counts towards our collective goal.",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    targetMetric: "distance",
    targetValue: 100,
    badgeReward: "June Runner",
    participants: 34,
    currentProgress: 67.5,
    joined: true
  },
  {
    id: "c2",
    title: "Consistency Champion",
    description: "Run at least 3 times per week for the entire month. Build those habits!",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    targetMetric: "runs",
    targetValue: 12,
    badgeReward: "Habit Hero",
    participants: 28,
    currentProgress: 8,
    joined: true
  },
  {
    id: "c3",
    title: "Long Run Weekend",
    description: "Complete a 15km+ run this weekend. Perfect for marathon training!",
    startDate: "2026-06-07",
    endDate: "2026-06-08",
    targetMetric: "distance",
    targetValue: 15,
    badgeReward: "Distance Champ",
    participants: 15,
    currentProgress: 0,
    joined: false
  },
  {
    id: "c4",
    title: "Sunrise Squad",
    description: "Log 5 runs before 7am this month. Early bird gets the badge!",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    targetMetric: "runs",
    targetValue: 5,
    badgeReward: "Early Riser",
    participants: 12,
    currentProgress: 2,
    joined: true
  },
]

// Sample leaderboard data
export const leaderboardData: Record<string, LeaderboardEntry[]> = {
  distance: [
    { rank: 1, userId: "u2", userName: "Alex Swift", value: 125.3, change: 0 },
    { rank: 2, userId: "u3", userName: "Morgan Trail", value: 112.8, change: 1 },
    { rank: 3, userId: "u4", userName: "Sam Pace", value: 98.5, change: -1 },
    { rank: 4, userId: "u5", userName: "Jordan Hill", value: 89.2, change: 2 },
    { rank: 5, userId: "u6", userName: "Casey Road", value: 82.1, change: 0 },
    { rank: 6, userId: "u7", userName: "Riley Sprint", value: 75.4, change: -2 },
    { rank: 7, userId: "user-1", userName: "Jamie Runner", value: 67.5, change: 1 },
    { rank: 8, userId: "u8", userName: "Quinn Jog", value: 61.2, change: -1 },
    { rank: 9, userId: "u9", userName: "Avery Mile", value: 55.8, change: 0 },
    { rank: 10, userId: "u10", userName: "Taylor Stride", value: 48.3, change: 3 },
  ],
  runs: [
    { rank: 1, userId: "u3", userName: "Morgan Trail", value: 18, change: 0 },
    { rank: 2, userId: "u2", userName: "Alex Swift", value: 16, change: 1 },
    { rank: 3, userId: "u5", userName: "Jordan Hill", value: 15, change: -1 },
    { rank: 4, userId: "user-1", userName: "Jamie Runner", value: 12, change: 2 },
    { rank: 5, userId: "u4", userName: "Sam Pace", value: 11, change: 0 },
    { rank: 6, userId: "u6", userName: "Casey Road", value: 10, change: -2 },
    { rank: 7, userId: "u7", userName: "Riley Sprint", value: 9, change: 0 },
    { rank: 8, userId: "u9", userName: "Avery Mile", value: 8, change: 1 },
    { rank: 9, userId: "u8", userName: "Quinn Jog", value: 7, change: -1 },
    { rank: 10, userId: "u10", userName: "Taylor Stride", value: 6, change: 0 },
  ],
  longest: [
    { rank: 1, userId: "u4", userName: "Sam Pace", value: 32.1, change: 0 },
    { rank: 2, userId: "u2", userName: "Alex Swift", value: 25.5, change: 0 },
    { rank: 3, userId: "u3", userName: "Morgan Trail", value: 21.2, change: 1 },
    { rank: 4, userId: "u5", userName: "Jordan Hill", value: 18.8, change: -1 },
    { rank: 5, userId: "user-1", userName: "Jamie Runner", value: 15.2, change: 2 },
    { rank: 6, userId: "u6", userName: "Casey Road", value: 14.5, change: 0 },
    { rank: 7, userId: "u7", userName: "Riley Sprint", value: 12.3, change: -2 },
    { rank: 8, userId: "u8", userName: "Quinn Jog", value: 11.1, change: 0 },
    { rank: 9, userId: "u9", userName: "Avery Mile", value: 10.5, change: 1 },
    { rank: 10, userId: "u10", userName: "Taylor Stride", value: 8.2, change: -1 },
  ],
  consistency: [
    { rank: 1, userId: "u3", userName: "Morgan Trail", value: 21, change: 0 },
    { rank: 2, userId: "u5", userName: "Jordan Hill", value: 18, change: 1 },
    { rank: 3, userId: "u2", userName: "Alex Swift", value: 14, change: -1 },
    { rank: 4, userId: "u6", userName: "Casey Road", value: 12, change: 0 },
    { rank: 5, userId: "u9", userName: "Avery Mile", value: 10, change: 2 },
    { rank: 6, userId: "user-1", userName: "Jamie Runner", value: 5, change: 1 },
    { rank: 7, userId: "u4", userName: "Sam Pace", value: 4, change: -2 },
    { rank: 8, userId: "u7", userName: "Riley Sprint", value: 3, change: -1 },
    { rank: 9, userId: "u8", userName: "Quinn Jog", value: 2, change: 0 },
    { rank: 10, userId: "u10", userName: "Taylor Stride", value: 1, change: 0 },
  ],
  improved: [
    { rank: 1, userId: "u10", userName: "Taylor Stride", value: 45, change: 0 },
    { rank: 2, userId: "u8", userName: "Quinn Jog", value: 38, change: 1 },
    { rank: 3, userId: "user-1", userName: "Jamie Runner", value: 32, change: 2 },
    { rank: 4, userId: "u9", userName: "Avery Mile", value: 28, change: -2 },
    { rank: 5, userId: "u6", userName: "Casey Road", value: 22, change: -1 },
    { rank: 6, userId: "u5", userName: "Jordan Hill", value: 18, change: 1 },
    { rank: 7, userId: "u7", userName: "Riley Sprint", value: 15, change: 0 },
    { rank: 8, userId: "u3", userName: "Morgan Trail", value: 12, change: -1 },
    { rank: 9, userId: "u2", userName: "Alex Swift", value: 8, change: 0 },
    { rank: 10, userId: "u4", userName: "Sam Pace", value: 5, change: 0 },
  ],
}

// Sample recent runs
export const recentRuns: Run[] = [
  {
    id: "r1",
    userId: "user-1",
    date: "2026-06-03",
    distance: 8.2,
    duration: 45,
    pace: 5.49,
    type: "easy",
    notes: "Beautiful morning run through the park"
  },
  {
    id: "r2",
    userId: "user-1",
    date: "2026-06-01",
    distance: 12.5,
    duration: 65,
    pace: 5.2,
    type: "long",
    notes: "Weekend long run, felt strong!"
  },
  {
    id: "r3",
    userId: "user-1",
    date: "2026-05-30",
    distance: 5.0,
    duration: 24,
    pace: 4.8,
    type: "tempo"
  },
]

export const runTypes = [
  { value: "easy", label: "Easy Run", description: "Relaxed pace, conversational" },
  { value: "tempo", label: "Tempo Run", description: "Comfortably hard pace" },
  { value: "interval", label: "Intervals", description: "Speed work with recovery" },
  { value: "long", label: "Long Run", description: "Building endurance" },
  { value: "race", label: "Race", description: "Competition day" },
  { value: "recovery", label: "Recovery", description: "Very easy, active recovery" },
]
