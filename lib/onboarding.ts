import type {
  OnboardingData,
  Persona,
  RunningLevel,
  Motivation,
  Struggle,
  SuccessGoal,
} from '@/lib/types'

// ── Step definitions ─────────────────────────────────────────────

export const RUNNING_LEVELS: { value: RunningLevel; label: string; sub: string; emoji: string }[] = [
  { value: 'none',          label: "I don't run yet",     sub: 'Starting from scratch',       emoji: '🌱' },
  { value: 'couch_to_5k',   label: 'Couch to 5K',         sub: 'Working up to 5km',           emoji: '🚶' },
  { value: '5k_runner',     label: 'Regular 5K runner',   sub: 'Running 5km comfortably',     emoji: '⚡' },
  { value: '10k_training',  label: 'Training for 10K',    sub: 'Building up distance',        emoji: '🏃' },
  { value: 'half_marathon', label: 'Half marathon runner', sub: 'Covering serious distance',   emoji: '🥈' },
  { value: 'marathon',      label: 'Marathon runner',     sub: 'The full distance',            emoji: '🏆' },
]

export const MOTIVATIONS: { value: Motivation; label: string; emoji: string }[] = [
  { value: 'fitness',         label: 'Getting fitter',       emoji: '💪' },
  { value: 'weight_loss',     label: 'Losing weight',        emoji: '⚖️' },
  { value: 'mental_wellbeing',label: 'Mental wellbeing',     emoji: '🧘' },
  { value: 'consistency',     label: 'Building consistency', emoji: '🔥' },
  { value: 'social',          label: 'Social connection',    emoji: '👥' },
  { value: 'competition',     label: 'Competition',          emoji: '🏅' },
  { value: 'races',           label: 'Completing races',     emoji: '🎽' },
]

export const STRUGGLES: { value: Struggle; label: string; emoji: string }[] = [
  { value: 'motivation',    label: 'Motivation',        emoji: '😴' },
  { value: 'confidence',    label: 'Confidence',        emoji: '😬' },
  { value: 'pace',          label: 'Pace',              emoji: '⏱️' },
  { value: 'time',          label: 'Time',              emoji: '📅' },
  { value: 'running_alone', label: 'Running alone',     emoji: '🚶' },
  { value: 'injury',        label: 'Injury concerns',   emoji: '🩹' },
  { value: 'consistency',   label: 'Consistency',       emoji: '📉' },
]

export const SUCCESS_GOALS: { value: SuccessGoal; label: string; sub: string; emoji: string }[] = [
  { value: 'first_5k',       label: 'Run my first 5K',          sub: 'Cross that first finish line',     emoji: '🌟' },
  { value: 'run_10k',        label: 'Run 10K',                  sub: 'Double the distance',              emoji: '📈' },
  { value: 'half_marathon',  label: 'Run a half marathon',      sub: '21.1km — a serious milestone',     emoji: '🥈' },
  { value: 'complete_race',  label: 'Complete a race',          sub: 'Any distance, any format',         emoji: '🎽' },
  { value: 'join_club',      label: 'Join a running club',      sub: 'Run with a community',             emoji: '👥' },
  { value: 'consistent_habit', label: 'Build a consistent habit', sub: 'Just show up, every week',      emoji: '🔥' },
]

export const WEEKLY_TARGETS = [
  { value: 1, label: '1 run',  sub: 'Getting started' },
  { value: 2, label: '2 runs', sub: 'Building momentum' },
  { value: 3, label: '3 runs', sub: 'Solid habit' },
  { value: 4, label: '4+ runs',sub: 'Committed runner' },
]

// ── Persona assignment ────────────────────────────────────────────

export function assignPersona(data: OnboardingData): Persona {
  const scores: Record<Persona, number> = {
    'Explorer':            0,
    'Consistency Builder': 0,
    'Challenger':          0,
    'Social Runner':       0,
    'Improver':            0,
  }

  // Motivations
  if (data.motivations.includes('mental_wellbeing')) scores['Explorer']            += 3
  if (data.motivations.includes('social'))           scores['Social Runner']       += 4
  if (data.motivations.includes('competition'))      scores['Challenger']          += 4
  if (data.motivations.includes('races'))            scores['Challenger']          += 3
  if (data.motivations.includes('consistency'))      scores['Consistency Builder'] += 3
  if (data.motivations.includes('fitness'))          scores['Improver']            += 2
  if (data.motivations.includes('weight_loss'))      scores['Improver']            += 2

  // Struggles
  if (data.struggles.includes('running_alone')) scores['Social Runner']       += 3
  if (data.struggles.includes('consistency'))   scores['Consistency Builder'] += 3
  if (data.struggles.includes('motivation'))    scores['Consistency Builder'] += 2
  if (data.struggles.includes('pace'))          scores['Improver']            += 3
  if (data.struggles.includes('confidence'))    scores['Explorer']            += 1
  if (data.struggles.includes('time'))          scores['Consistency Builder'] += 1

  // Success goal
  const goalScores: Record<SuccessGoal, [Persona, number][]> = {
    'consistent_habit': [['Consistency Builder', 4]],
    'join_club':        [['Social Runner', 4]],
    'complete_race':    [['Challenger', 4]],
    'half_marathon':    [['Challenger', 3], ['Improver', 1]],
    'run_10k':          [['Improver', 3]],
    'first_5k':         [['Improver', 2], ['Consistency Builder', 1]],
  }
  for (const [persona, pts] of goalScores[data.successGoal]) {
    scores[persona] += pts
  }

  // Running level nudge
  if (['marathon', 'half_marathon'].includes(data.runningLevel)) scores['Challenger'] += 1
  if (['none', 'couch_to_5k'].includes(data.runningLevel))       scores['Consistency Builder'] += 1

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as Persona
}

// ── Persona display config ────────────────────────────────────────

export type PersonaConfig = {
  emoji: string
  tagline: string
  description: string
  headline: string
  sub: string
  accentColor: string
}

export const PERSONA_CONFIG: Record<Persona, PersonaConfig> = {
  'Explorer': {
    emoji:       '🗺️',
    tagline:     'Explorer',
    description: 'Enjoys routes and discovery',
    headline:    'New routes, new you.',
    sub:         'Every run is a chance to discover something new.',
    accentColor: '#2D6A4F',
  },
  'Consistency Builder': {
    emoji:       '🔥',
    tagline:     'Consistency Builder',
    description: 'Focuses on routine and habits',
    headline:    "You're building an incredible running habit.",
    sub:         'Show up again today — that\'s all it takes.',
    accentColor: '#C0392B',
  },
  'Challenger': {
    emoji:       '⚡',
    tagline:     'Challenger',
    description: 'Competitive and goal-driven',
    headline:    "You're only one run away from this week's goal.",
    sub:         'Push the pace. You\'ve got this.',
    accentColor: '#B8860B',
  },
  'Social Runner': {
    emoji:       '👥',
    tagline:     'Social Runner',
    description: 'Motivated by community',
    headline:    'Running is better together.',
    sub:         'Your club is with you. Log a run and keep pace.',
    accentColor: '#5B3A8E',
  },
  'Improver': {
    emoji:       '📈',
    tagline:     'Improver',
    description: 'Focused on progress and performance',
    headline:    'Every run makes you a better runner.',
    sub:         'Track your progress and watch yourself improve.',
    accentColor: '#1A6B8A',
  },
}
