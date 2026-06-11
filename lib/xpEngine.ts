import AsyncStorage from '@react-native-async-storage/async-storage';
import { getXpForLevel, activityCategory, localDateString } from './utils';
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
 *   Daily task counts   → elevo_daily_task_counts
 *   Daily categories    → elevo_daily_categories  (if activityName given)
 *   Streak-broken flag  → elevo_streak_broken  (set once on first gap)
 *   Comeback achieved   → elevo_comeback_achieved  (set when rebuilt to 7 after break)
 *
 * Does NOT handle: per-task XP display (elevo_earned_xp),
 * new-habit tracking (elevo_new_task_starts), or achievement notifications.
 * Those are caller responsibilities.
 */
export async function awardXp(
  earnedXp: number,
  activityName: string | null
): Promise<AwardXpResult> {
  const today = localDateString();
  const yd = new Date(); yd.setDate(yd.getDate() - 1);
  const yesterday = localDateString(yd);

  const [
    rawXp, rawLevel, rawStreak, rawLastLog, rawLogged, rawCompletions, rawLifetime, rawDailyXp,
    rawDailyTaskCounts, rawDailyCats, rawStreakBroken, rawComebackAchieved,
  ] = await Promise.all([
    AsyncStorage.getItem('elevo_xp'),
    AsyncStorage.getItem('elevo_level'),
    AsyncStorage.getItem('elevo_streak'),
    AsyncStorage.getItem('elevo_last_log_date'),
    AsyncStorage.getItem('elevo_logged_today'),
    AsyncStorage.getItem('elevo_completions'),
    AsyncStorage.getItem('elevo_lifetime_xp'),
    AsyncStorage.getItem('elevo_daily_xp'),
    AsyncStorage.getItem('elevo_daily_task_counts'),
    AsyncStorage.getItem('elevo_daily_categories'),
    AsyncStorage.getItem('elevo_streak_broken'),
    AsyncStorage.getItem('elevo_comeback_achieved'),
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
  const dailyTaskCounts: Record<string, number> = rawDailyTaskCounts ? JSON.parse(rawDailyTaskCounts) : {};
  const dailyCats: Record<string, string[]> = rawDailyCats ? JSON.parse(rawDailyCats) : {};
  const alreadyStreakBroken = rawStreakBroken === 'true';
  const alreadyComebackAchieved = rawComebackAchieved === 'true';

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
  // Detect streak breaks here (not in the display-only focus effect)
  let newStreak = prevStreak;
  let newLastLogDate = lastLogDate;
  let streakBroken = alreadyStreakBroken;
  let comebackAchieved = alreadyComebackAchieved;
  if (lastLogDate !== today) {
    if (lastLogDate === yesterday) {
      newStreak = prevStreak + 1;
    } else {
      // Gap > 1 day: streak resets. Mark as broken if they had a streak.
      if (prevStreak >= 1) streakBroken = true;
      newStreak = 1;
    }
    newLastLogDate = today;
  }
  // Comeback: rebuilt to 7 after a previous break
  if (streakBroken && newStreak >= 7) comebackAchieved = true;

  // Logged-today: append once
  const newLoggedToday = [...loggedToday];
  if (activityName && !newLoggedToday.includes(activityName)) {
    newLoggedToday.push(activityName);
  }

  // Daily task count: every awardXp call counts as one logged task/event
  dailyTaskCounts[today] = (dailyTaskCounts[today] ?? 0) + 1;

  // Daily categories: add activity's category to today's set if not already there
  if (activityName) {
    const cat = activityCategory[activityName];
    if (cat) {
      const todayCats = dailyCats[today] ?? [];
      if (!todayCats.includes(cat)) {
        dailyCats[today] = [...todayCats, cat];
      } else {
        dailyCats[today] = todayCats;
      }
    }
  }

  const writes: Promise<void>[] = [
    AsyncStorage.setItem('elevo_xp', String(finalXp)),
    AsyncStorage.setItem('elevo_level', String(level)),
    AsyncStorage.setItem('elevo_streak', String(newStreak)),
    AsyncStorage.setItem('elevo_last_log_date', newLastLogDate ?? ''),
    AsyncStorage.setItem('elevo_logged_today', JSON.stringify(newLoggedToday)),
    AsyncStorage.setItem('elevo_completions', JSON.stringify(newCompletions)),
    AsyncStorage.setItem('elevo_lifetime_xp', String(newLifetimeXp)),
    AsyncStorage.setItem('elevo_daily_xp', JSON.stringify(dailyXp)),
    AsyncStorage.setItem('elevo_daily_task_counts', JSON.stringify(dailyTaskCounts)),
    AsyncStorage.setItem('elevo_daily_categories', JSON.stringify(dailyCats)),
  ];
  if (streakBroken && !alreadyStreakBroken) {
    writes.push(AsyncStorage.setItem('elevo_streak_broken', 'true'));
  }
  if (comebackAchieved && !alreadyComebackAchieved) {
    writes.push(AsyncStorage.setItem('elevo_comeback_achieved', 'true'));
  }
  await Promise.all(writes);

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
  const [rawHistory, rawUnlocked, rawDailyTaskCounts, rawDailyCats, rawComebackAchieved] = await Promise.all([
    AsyncStorage.getItem('elevo_workout_history'),
    AsyncStorage.getItem('elevo_unlocked_achievements'),
    AsyncStorage.getItem('elevo_daily_task_counts'),
    AsyncStorage.getItem('elevo_daily_categories'),
    AsyncStorage.getItem('elevo_comeback_achieved'),
  ]);
  const history: { isPR?: boolean }[] = rawHistory ? JSON.parse(rawHistory) : [];
  const unlockedIds: string[] = rawUnlocked ? JSON.parse(rawUnlocked) : [];
  const dailyTaskCounts: Record<string, number> = rawDailyTaskCounts ? JSON.parse(rawDailyTaskCounts) : {};
  const dailyCats: Record<string, string[]> = rawDailyCats ? JSON.parse(rawDailyCats) : {};
  const comebackAchieved = rawComebackAchieved === 'true';

  const bestDayTaskCount = Math.max(0, ...Object.values(dailyTaskCounts));
  const bestDayCategories = Math.max(0, ...Object.values(dailyCats).map(a => a.length));

  const stats = buildStats(level, streak, completions, history, {
    bestDayTaskCount,
    bestDayCategories,
    comebackTo7: comebackAchieved,
  });
  const newlyUnlocked = ACHIEVEMENTS.filter(
    a => !unlockedIds.includes(a.id) && a.check(stats)
  );
  if (newlyUnlocked.length === 0) return [];
  const newIds = [...unlockedIds, ...newlyUnlocked.map(a => a.id)];
  await AsyncStorage.setItem('elevo_unlocked_achievements', JSON.stringify(newIds));
  return newlyUnlocked;
}
