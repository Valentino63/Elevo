export type AchievementCategory = 'streak' | 'level' | 'logging' | 'workout' | 'records';

export interface AchievementStats {
  level: number;
  streak: number;
  totalTasksLogged: number;
  completions: Record<string, number>;
  workoutCount: number;
  prCount: number;
  bestDayTaskCount: number;
  bestDayCategories: number;
  comebackTo7: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  hidden?: boolean;
  check: (stats: AchievementStats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ── LEVEL ──
  { id: 'level_2',   title: 'It Begins',            description: 'Reach Level 2. The first climb is the proof you can.', category: 'level', check: s => s.level >= 2 },
  { id: 'level_5',   title: 'Off the Ground',       description: 'Reach Level 5. You showed up long enough to matter.', category: 'level', check: s => s.level >= 5 },
  { id: 'level_10',  title: 'Graduated',            description: 'Reach Level 10. The foundation is laid. Now you build.', category: 'level', check: s => s.level >= 10 },
  { id: 'level_25',  title: 'No Turning Back',      description: 'Reach Level 25. This is a habit now, not a phase.', category: 'level', check: s => s.level >= 25 },
  { id: 'level_50',  title: 'Halfway to a Hundred', description: 'Reach Level 50. Most people quit before here. You did not.', category: 'level', check: s => s.level >= 50 },
  { id: 'level_100', title: 'The Standard',         description: 'Reach Level 100. Years of choosing the hard thing. This is who you are now.', category: 'level', check: s => s.level >= 100 },

  // ── STREAK ──
  { id: 'week_warrior',   title: 'Seven Straight', description: 'Reach a 7-day streak. The hardest week is the first.', category: 'streak', check: s => s.streak >= 7 },
  { id: 'monthly_monk',   title: 'Thirty Deep',    description: 'Reach a 30-day streak. This is where it becomes who you are.', category: 'streak', check: s => s.streak >= 30 },
  { id: 'fifty_streak',   title: 'Fifty-Fifty',    description: 'Reach a 50-day streak. Halfway to a hundred days unbroken.', category: 'streak', check: s => s.streak >= 50 },
  { id: 'century_streak', title: 'Unbroken',       description: 'Reach a 100-day streak. A hundred days no one can take back.', category: 'streak', check: s => s.streak >= 100 },
  { id: 'year_one',       title: 'Year One',       description: 'Reach a 365-day streak. A full year. Almost no one gets here.', category: 'streak', check: s => s.streak >= 365 },
  { id: 'comeback',       title: 'Back From the Dead', description: 'Break a streak, then rebuild it to 7. Coming back is the real test.', category: 'streak', check: s => s.comebackTo7 === true },

  // ── LOGGING ──
  { id: 'first_step',    title: 'Day Zero',          description: 'Log your first task. Everything starts here.', category: 'logging', check: s => s.totalTasksLogged >= 1 },
  { id: 'centurion',     title: 'Hundred Logged',    description: 'Log 100 tasks total. Small actions, stacked.', category: 'logging', check: s => s.totalTasksLogged >= 100 },
  { id: 'thousand_club', title: 'A Thousand In',     description: 'Log 1000 tasks total. This is what relentless looks like.', category: 'logging', check: s => s.totalTasksLogged >= 1000 },
  { id: 'full_send',     title: 'Full Send',         description: 'Log 10 tasks in a single day.', category: 'logging', check: s => s.bestDayTaskCount >= 10 },
  { id: 'breadth',       title: 'Range',             description: 'Log tasks from 5 different areas in one day.', category: 'logging', check: s => s.bestDayCategories >= 5 },
  { id: 'discipline',    title: 'Voluntary Hardship', description: 'Do something you hate 25 times. The muscle that moves everything else.', category: 'logging', check: s => (s.completions['Doing something you hate daily'] ?? 0) >= 25 },
  { id: 'deep_worker',   title: 'Deep Worker',       description: 'Log 50 deep-focus sessions. The output the world rewards.', category: 'logging', check: s => (s.completions['Working in deep focus (1hr minimum)'] ?? 0) >= 50 },
  { id: 'cold_blooded',  title: 'Cold Blooded',      description: 'Take 30 cold showers. Discipline you can feel.', category: 'logging', hidden: true, check: s => (s.completions['Cold shower'] ?? 0) >= 30 },
  { id: 'early_riser',   title: 'Won the Morning',   description: 'Wake up without fuss 30 times. The day is decided before sunrise.', category: 'logging', check: s => (s.completions['Wake up when said without fuss'] ?? 0) >= 30 },
  { id: 'bookworm',      title: 'Sharper Mind',      description: 'Read 50 times. The sharpest weapon you own is a trained mind.', category: 'logging', check: s => (s.completions['Reading (15 min or 10 pages minimum)'] ?? 0) >= 50 },
  { id: 'misogi',        title: 'Misogi',            description: 'Complete a Misogi. You did the thing with a 50% chance of failure.', category: 'logging', hidden: true, check: s => (s.completions['Misogi'] ?? 0) >= 1 },

  // ── WORKOUT ──
  { id: 'first_workout',   title: 'First Blood',     description: 'Finish your first workout. The body is the project.', category: 'workout', check: s => s.workoutCount >= 1 },
  { id: 'consistent_iron', title: 'Consistent Iron', description: 'Finish 10 workouts. Showing up is the whole game.', category: 'workout', check: s => s.workoutCount >= 10 },
  { id: 'iron_will',       title: 'Iron Will',       description: 'Finish 50 workouts. Built, not given.', category: 'workout', check: s => s.workoutCount >= 50 },
  { id: 'ten_ceilings',    title: 'Ten Ceilings',    description: 'Have 10 workouts where you set a personal record.', category: 'workout', check: s => s.prCount >= 10 },

  // ── RECORDS ──
  { id: 'record_breaker', title: 'New Ceiling', description: 'Set your first personal record. Yesterday-you just lost.', category: 'records', check: s => s.prCount >= 1 },
];

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  streak: 'Streak',
  level: 'Level',
  logging: 'Logging',
  workout: 'Workout',
  records: 'Records',
};

export const CATEGORY_ORDER: AchievementCategory[] = ['streak', 'level', 'logging', 'workout', 'records'];

export function buildStats(
  level: number,
  streak: number,
  completions: Record<string, number>,
  workoutHistory: { isPR?: boolean }[],
  extra?: { bestDayTaskCount?: number; bestDayCategories?: number; comebackTo7?: boolean }
): AchievementStats {
  return {
    level,
    streak,
    completions,
    totalTasksLogged: Object.values(completions).reduce((a, b) => a + b, 0),
    workoutCount: workoutHistory.length,
    prCount: workoutHistory.filter(s => s.isPR).length,
    bestDayTaskCount: extra?.bestDayTaskCount ?? 0,
    bestDayCategories: extra?.bestDayCategories ?? 0,
    comebackTo7: extra?.comebackTo7 ?? false,
  };
}
