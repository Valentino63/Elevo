export type AchievementCategory = 'streak' | 'level' | 'logging' | 'workout' | 'records';

export interface AchievementStats {
  level: number;
  streak: number;
  totalTasksLogged: number;
  completions: Record<string, number>;
  workoutCount: number;
  prCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  check: (stats: AchievementStats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Log your first task.',
    category: 'logging',
    check: s => s.totalTasksLogged >= 1,
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Reach a 7-day streak.',
    category: 'streak',
    check: s => s.streak >= 7,
  },
  {
    id: 'monthly_monk',
    title: 'Monthly Monk',
    description: 'Reach a 30-day streak.',
    category: 'streak',
    check: s => s.streak >= 30,
  },
  {
    id: 'century_streak',
    title: 'Century',
    description: 'Reach a 100-day streak.',
    category: 'streak',
    check: s => s.streak >= 100,
  },
  {
    id: 'level_5',
    title: 'Level 5',
    description: 'Reach Level 5.',
    category: 'level',
    check: s => s.level >= 5,
  },
  {
    id: 'level_10',
    title: 'Level 10',
    description: 'Reach Level 10.',
    category: 'level',
    check: s => s.level >= 10,
  },
  {
    id: 'level_25',
    title: 'Level 25',
    description: 'Reach Level 25.',
    category: 'level',
    check: s => s.level >= 25,
  },
  {
    id: 'level_50',
    title: 'Level 50',
    description: 'Reach Level 50.',
    category: 'level',
    check: s => s.level >= 50,
  },
  {
    id: 'level_100',
    title: 'Level 100',
    description: 'Reach Level 100.',
    category: 'level',
    check: s => s.level >= 100,
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Log 100 tasks total.',
    category: 'logging',
    check: s => s.totalTasksLogged >= 100,
  },
  {
    id: 'thousand_club',
    title: 'Thousand Club',
    description: 'Log 1000 tasks total.',
    category: 'logging',
    check: s => s.totalTasksLogged >= 1000,
  },
  {
    id: 'first_workout',
    title: 'First Workout',
    description: 'Complete your first workout session.',
    category: 'workout',
    check: s => s.workoutCount >= 1,
  },
  {
    id: 'iron_will',
    title: 'Iron Will',
    description: 'Complete 50 workout sessions.',
    category: 'workout',
    check: s => s.workoutCount >= 50,
  },
  {
    id: 'record_breaker',
    title: 'Record Breaker',
    description: 'Set your first personal record.',
    category: 'records',
    check: s => s.prCount >= 1,
  },
  {
    id: 'early_riser',
    title: 'Early Riser',
    description: 'Log "Wake up when said without fuss" 30 times.',
    category: 'logging',
    check: s => (s.completions['Wake up when said without fuss'] ?? 0) >= 30,
  },
  {
    id: 'bookworm',
    title: 'Bookworm',
    description: 'Log "Reading (15 min or 10 pages minimum)" 50 times.',
    category: 'logging',
    check: s => (s.completions['Reading (15 min or 10 pages minimum)'] ?? 0) >= 50,
  },
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
  workoutHistory: { isPR?: boolean }[]
): AchievementStats {
  return {
    level,
    streak,
    completions,
    totalTasksLogged: Object.values(completions).reduce((a, b) => a + b, 0),
    workoutCount: workoutHistory.length,
    prCount: workoutHistory.filter(s => s.isPR).length,
  };
}
