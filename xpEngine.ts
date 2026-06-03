import AsyncStorage from '@react-native-async-storage/async-storage';
import { getXpForLevel } from './utils';
import { ACHIEVEMENTS, buildStats, type Achievement } from './achievements';

export interface AwardXpResult {
  prevLevel: number;
  newLevel: number;
  didLevelUp: boolean;
  newXp: number;
  prevStreak: number;
  newStreak: number;
  newLoggedToday: string[];
  newCompletions: Record<string, number>;
  newLifetimeXp: number;
}

/**
 * Single source of truth for awarding XP in Elevo.
 *
 * Reads current state from AsyncStorage, applies:
 *   XP + level-up loop → elevo_xp, elevo_level
 *   Lifetime XP         → elevo_lifetime_xp
 *   Daily XP heatmap    → elevo_daily_xp
 *   Completions count   → elevo_completions  (if activityName given)
 *   Streak + last date  → elevo_streak, elevo_last_log_date
 *   Logged-today list   → elevo_logged_today  (if activityName given)
 *
 * Does NOT handle: per-task XP display (elevo_earned_xp),
 * new-habit tracking (elevo_new_task_starts), or achievement notifications.
 * Those are caller responsibilities.
 */
export async function awardXp(
  earnedXp: number,
  activityName: string | null
): Promise<AwardXpResult> {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const [rawXp, rawLevel, rawStreak, rawLastLog, rawLogged, rawCompletions, rawLifetime, rawDailyXp] =
    await Promise.all([
      AsyncStorage.getItem('elevo_xp'),
      AsyncStorage.getItem('elevo_level'),
      AsyncStorage.getItem('elevo_streak'),
      AsyncStorage.getItem('elevo_last_log_date'),
      AsyncStorage.getItem('elevo_logged_today'),
      AsyncStorage.getItem('elevo_completions'),
      AsyncStorage.getItem('elevo_lifetime_xp'),
      AsyncStorage.getItem('elevo_daily_xp'),
    ]);

  const currentXp = parseFloat(rawXp ?? '0') || 0;
  const prevLevel = parseInt(rawLevel ?? '1') || 1;
  const prevStreak = parseInt(rawStreak ?? '0') || 0;
  const lastLogDate = rawLastLog ?? null;
  // Reset logged-today if it's from a previous day
  const loggedToday: string[] =
    lastLogDate === today && rawLogged ? JSON.parse(rawLogged) : [];
  const completions: Record<string, number> = rawCompletions
    ? JSON.parse(rawCompletions)
    : {};
  const lifetimeXp = parseFloat(rawLifetime ?? '0') || 0;
  const dailyXp: Record<string, number> = rawDailyXp ? JSON.parse(rawDailyXp) : {};

  // XP + level-up while loop
  let xp = currentXp + earnedXp;
  let level = prevLevel;
  while (xp >= getXpForLevel(level + 1)) {
    xp -= getXpForLevel(level + 1);
    level++;
  }
  const finalXp = Math.round(xp / 5) * 5;

  // Accumulate
  const newLifetimeXp = lifetimeXp + earnedXp;
  dailyXp[today] = (dailyXp[today] ?? 0) + earnedXp;

  const newCompletions = { ...completions };
  if (activityName) {
    newCompletions[activityName] = (newCompletions[activityName] ?? 0) + 1;
  }

  // Streak: only advance on the first event of a new day
  let newStreak = prevStreak;
  let newLastLogDate = lastLogDate;
  if (lastLogDate !== today) {
    newStreak = lastLogDate === yesterday ? prevStreak + 1 : 1;
    newLastLogDate = today;
  }

  // Logged-today: append once
  const newLoggedToday = [...loggedToday];
  if (activityName && !newLoggedToday.includes(activityName)) {
    newLoggedToday.push(activityName);
  }

  await Promise.all([
    AsyncStorage.setItem('elevo_xp', String(finalXp)),
    AsyncStorage.setItem('elevo_level', String(level)),
    AsyncStorage.setItem('elevo_streak', String(newStreak)),
    AsyncStorage.setItem('elevo_last_log_date', newLastLogDate ?? ''),
    AsyncStorage.setItem('elevo_logged_today', JSON.stringify(newLoggedToday)),
    AsyncStorage.setItem('elevo_completions', JSON.stringify(newCompletions)),
    AsyncStorage.setItem('elevo_lifetime_xp', String(newLifetimeXp)),
    AsyncStorage.setItem('elevo_daily_xp', JSON.stringify(dailyXp)),
  ]);

  return {
    prevLevel,
    newLevel: level,
    didLevelUp: level > prevLevel,
    newXp: finalXp,
    prevStreak,
    newStreak,
    newLoggedToday,
    newCompletions,
    newLifetimeXp,
  };
}

/**
 * Checks for newly unlocked achievements, persists them, and returns them.
 * Caller is responsible for showing notifications.
 */
export async function checkAchievements(
  level: number,
  streak: number,
  completions: Record<string, number>
): Promise<Achievement[]> {
  const [rawHistory, rawUnlocked] = await Promise.all([
    AsyncStorage.getItem('elevo_workout_history'),
    AsyncStorage.getItem('elevo_unlocked_achievements'),
  ]);
  const history: { isPR?: boolean }[] = rawHistory ? JSON.parse(rawHistory) : [];
  const unlockedIds: string[] = rawUnlocked ? JSON.parse(rawUnlocked) : [];
  const stats = buildStats(level, streak, completions, history);
  const newlyUnlocked = ACHIEVEMENTS.filter(
    a => !unlockedIds.includes(a.id) && a.check(stats)
  );
  if (newlyUnlocked.length === 0) return [];
  const newIds = [...unlockedIds, ...newlyUnlocked.map(a => a.id)];
  await AsyncStorage.setItem('elevo_unlocked_achievements', JSON.stringify(newIds));
  return newlyUnlocked;
}
