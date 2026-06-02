import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Modal, Animated, Easing } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getTitle, getXpForLevel,
  categories, activityArchetypes, activityFreq,
  getMultiplier, activityExplanations, getDailyQuote
} from '../utils';
import { ACHIEVEMENTS, buildStats, type Achievement } from '../achievements';

function sortByCompletions<T extends { name: string }>(items: T[], completions: Record<string, number>): T[] {
  return items.slice().sort((a, b) => {
    const ca = completions[a.name] ?? 0;
    const cb = completions[b.name] ?? 0;
    if (ca === 0 && cb === 0) return 0;
    if (ca === 0) return 1;
    if (cb === 0) return -1;
    return cb - ca;
  });
}

const FULL_RAMP_LADDER = [
  { days: 0,  task: 'At least 3L of water' },
  { days: 0,  task: 'At least 30 min sunlight (with SPF)' },
  { days: 0,  task: 'Sleep (7-9 hours)' },
  { days: 3,  task: 'No phone for 60 min after waking' },
  { days: 6,  task: 'Going for a walk' },
  { days: 9,  task: 'Morning routine' },
  { days: 12, task: 'Nutrient dense breakfast' },
  { days: 15, task: 'Journal' },
  { days: 18, task: 'Reading (15 min or 10 pages minimum)' },
] as const;

const HABIT_TO_TASKS: Record<string, string[]> = {
  'I sleep 7-9 hours consistently':          ['Sleep (7-9 hours)'],
  'I drink enough water daily':              ['At least 3L of water'],
  'I get sunlight / go outside every day':   ['At least 30 min sunlight (with SPF)', 'Going for a walk'],
  'I stay off my phone for the first hour awake': ['No phone for 60 min after waking'],
  'I train or move my body daily':           ['Training (weights/calisthenics/plyometrics)', 'Any form of cardio'],
  'I read or learn something every day':     ['Reading (15 min or 10 pages minimum)', 'Learning (general)'],
  'I eat clean most days':                   ['Eating healthy (no sugar, no processed, RDIs)', 'Nutrient dense breakfast'],
};

const STARTER_SET = ['At least 3L of water', 'At least 30 min sunlight (with SPF)', 'Sleep (7-9 hours)'];

export default function HomeScreen() {
  const [xp, setXp] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const [lastLogDate, setLastLogDate] = useState<string | null>(null);
  const [archetype, setArchetype] = useState<string | null>(null);
  const [subArchetype, setSubArchetype] = useState<string | null>(null);
  const title = getTitle(level ?? 1);
  const [loggedToday, setLoggedToday] = useState<string[]>([]);
  const [completions, setCompletions] = useState<Record<string, number>>({});
  const [newTaskStarts, setNewTaskStarts] = useState<Record<string, string>>({});
  const [showAll, setShowAll] = useState(false);
  const [explanationModal, setExplanationModal] = useState<string | null>(null);
  const [lifetimeXp, setLifetimeXp] = useState(0);
  const [sideArchetypes, setSideArchetypes] = useState<string[]>([]);
  const [earnedXp, setEarnedXp] = useState<Record<string, number>>({});
  const [rampLevel, setRampLevel] = useState<string | null>(null);
  const [existingHabits, setExistingHabits] = useState<string[]>([]);
  const [rampStartDate, setRampStartDate] = useState<string | null>(null);
  const [rampUnlocked, setRampUnlocked] = useState(false);
  const [paceOverride, setPaceOverride] = useState(false);
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [showStar, setShowStar] = useState(false);
  const [levelingUp, setLevelingUp] = useState(false);

  // Achievement notification queue — sequential display
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

  const router = useRouter();

  // Shooting-star animation refs
  const starAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const starOpacity = useRef(new Animated.Value(0)).current;
  const xpBarContainerRef = useRef<any>(null);
  const xpBarY = useRef<number>(0);
  const taskViewRefs = useRef<Record<string, any>>({});
  const taskPositions = useRef<Record<string, number>>({});

  // XP bar animation refs (all useNativeDriver: false — width cannot use native driver)
  const xpBarWidthAnim = useRef(new Animated.Value(0)).current;
  const xpBarScale = useRef(new Animated.Value(1)).current;
  const xpBarShake = useRef(new Animated.Value(0)).current;
  const levelUpFlash = useRef(new Animated.Value(0)).current;
  const levelUpTextAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const [
          savedXp, savedLevel, savedStreak, savedLastLogDate, savedArchetype,
          savedSubArchetype, savedLoggedToday, savedCompletions, savedNewTaskStarts, savedLifetimeXp,
          savedSideArchetypes, savedEarnedXp, savedRampLevel, savedExistingHabits,
          savedRampStartDate, savedRampUnlocked, savedPaceOverride,
          savedAchSeeded, _savedAchUnlocked, savedWorkoutHistory,
        ] = await Promise.all([
          AsyncStorage.getItem('elevo_xp'),
          AsyncStorage.getItem('elevo_level'),
          AsyncStorage.getItem('elevo_streak'),
          AsyncStorage.getItem('elevo_last_log_date'),
          AsyncStorage.getItem('elevo_archetype'),
          AsyncStorage.getItem('elevo_subarchetype'),
          AsyncStorage.getItem('elevo_logged_today'),
          AsyncStorage.getItem('elevo_completions'),
          AsyncStorage.getItem('elevo_new_task_starts'),
          AsyncStorage.getItem('elevo_lifetime_xp'),
          AsyncStorage.getItem('elevo_side_archetypes'),
          AsyncStorage.getItem('elevo_earned_xp'),
          AsyncStorage.getItem('elevo_ramp_level'),
          AsyncStorage.getItem('elevo_existing_habits'),
          AsyncStorage.getItem('elevo_ramp_start_date'),
          AsyncStorage.getItem('elevo_ramp_unlocked'),
          AsyncStorage.getItem('elevo_pace_override'),
          AsyncStorage.getItem('elevo_achievements_seeded'),
          AsyncStorage.getItem('elevo_unlocked_achievements'),
          AsyncStorage.getItem('elevo_workout_history'),
        ]);
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const savedXpNum = savedXp ? Math.round(Number(savedXp) / 5) * 5 : 0;
        const savedLevelNum = savedLevel ? Number(savedLevel) : 1;
        setXp(savedXpNum);
        setLevel(savedLevelNum);
        xpBarWidthAnim.setValue(
          Math.min((savedXpNum / getXpForLevel(savedLevelNum + 1)) * 100, 100)
        );
        setLastLogDate(savedLastLogDate);
        if (savedLastLogDate && savedLastLogDate !== today && savedLastLogDate !== yesterday) {
          setStreak(0);
          await AsyncStorage.setItem('elevo_streak', '0');
        } else {
          setStreak(savedStreak ? Number(savedStreak) : 0);
        }
        setArchetype(savedArchetype ?? null);
        setSubArchetype(savedSubArchetype ?? null);
        setLoggedToday(savedLastLogDate === today && savedLoggedToday ? JSON.parse(savedLoggedToday) : []);
        if (savedCompletions) setCompletions(JSON.parse(savedCompletions));
        if (savedNewTaskStarts) setNewTaskStarts(JSON.parse(savedNewTaskStarts));
        if (savedLifetimeXp) setLifetimeXp(Number(savedLifetimeXp));
        setSideArchetypes(savedSideArchetypes ? JSON.parse(savedSideArchetypes) : []);
        setEarnedXp(savedLastLogDate === today && savedEarnedXp ? JSON.parse(savedEarnedXp) : {});
        setRampLevel(savedRampLevel ?? null);
        setExistingHabits(savedExistingHabits ? JSON.parse(savedExistingHabits) : []);
        setRampStartDate(savedRampStartDate ?? null);
        setRampUnlocked(savedRampUnlocked === 'true');
        setPaceOverride(savedPaceOverride === 'true');

        // First-run achievement seeding — silently unlock everything already earned
        if (!savedAchSeeded) {
          const history: { isPR?: boolean }[] = savedWorkoutHistory ? JSON.parse(savedWorkoutHistory) : [];
          const comps: Record<string, number> = savedCompletions ? JSON.parse(savedCompletions) : {};
          const streakNum = savedStreak ? Number(savedStreak) : 0;
          const stats = buildStats(savedLevelNum, streakNum, comps, history);
          const earnedIds = ACHIEVEMENTS.filter(a => a.check(stats)).map(a => a.id);
          await Promise.all([
            AsyncStorage.setItem('elevo_unlocked_achievements', JSON.stringify(earnedIds)),
            AsyncStorage.setItem('elevo_achievements_seeded', 'true'),
          ]);
        }
      };
      loadData();
    }, [])
  );

  useEffect(() => {
    if (level !== null && level >= 10 && !rampUnlocked) {
      setRampUnlocked(true);
      setShowGraduationModal(true);
      AsyncStorage.setItem('elevo_ramp_unlocked', 'true');
    }
  }, [level, rampUnlocked]);

  // Checks for newly unlocked achievements and queues notifications
  const checkAchievements = useCallback(async (
    lvl: number,
    str: number,
    comps: Record<string, number>
  ) => {
    const [rawHistory, rawUnlocked] = await Promise.all([
      AsyncStorage.getItem('elevo_workout_history'),
      AsyncStorage.getItem('elevo_unlocked_achievements'),
    ]);
    const history: { isPR?: boolean }[] = rawHistory ? JSON.parse(rawHistory) : [];
    const unlockedIds: string[] = rawUnlocked ? JSON.parse(rawUnlocked) : [];
    const stats = buildStats(lvl, str, comps, history);
    const newlyUnlocked = ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id) && a.check(stats));
    if (newlyUnlocked.length === 0) return;
    const newIds = [...unlockedIds, ...newlyUnlocked.map(a => a.id)];
    await AsyncStorage.setItem('elevo_unlocked_achievements', JSON.stringify(newIds));
    setAchievementQueue(prev => [...prev, ...newlyUnlocked]);
  }, []);

  const handleLogActivity = useCallback(async (amount: number, activityName: string) => {
    if (loggedToday.includes(activityName)) return;

    // Shooting-star animation
    const startY = taskPositions.current[activityName] ?? 400;
    starAnim.setValue({ x: 0, y: startY });
    starOpacity.setValue(1);
    setShowStar(true);
    Animated.parallel([
      Animated.timing(starAnim.y, {
        toValue: xpBarY.current,
        duration: 600,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(starAnim.x, {
          toValue: 20,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(starAnim.x, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(starOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      setShowStar(false);
      Animated.sequence([
        Animated.timing(xpBarScale, { toValue: 1.06, duration: 100, useNativeDriver: false }),
        Animated.timing(xpBarScale, { toValue: 1, duration: 100, useNativeDriver: false }),
      ]).start();
    });

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = streak ?? 0;
    let newLastLogDate = lastLogDate;
    let newLoggedToday: string[];
    if (lastLogDate !== today) {
      newStreak = lastLogDate === yesterday ? (streak ?? 0) + 1 : 1;
      newLastLogDate = today;
      newLoggedToday = [activityName];
    } else {
      newLoggedToday = [...loggedToday, activityName];
    }

    const currentCount = completions[activityName] ?? 0;
    const newCompletions = { ...completions, [activityName]: currentCount + 1 };

    if (activityName === 'Misogi') {
      let lvl = level ?? 1;
      let currentXp = xp ?? 0;
      let misogiGained = 0;
      for (let i = 0; i < 5; i++) {
        misogiGained += getXpForLevel(lvl + i + 1);
        currentXp += getXpForLevel(lvl + i + 1);
      }
      while (currentXp >= getXpForLevel(lvl + 1)) {
        currentXp -= getXpForLevel(lvl + 1);
        lvl += 1;
      }
      const newXp = Math.round(currentXp / 5) * 5;
      const newLifetimeXp = lifetimeXp + misogiGained;
      const newEarnedXp = { ...earnedXp, Misogi: misogiGained };
      setStreak(newStreak);
      setLastLogDate(newLastLogDate);
      setLoggedToday(newLoggedToday);
      setCompletions(newCompletions);
      setLevel(lvl);
      setXp(newXp);
      setLifetimeXp(newLifetimeXp);
      setEarnedXp(newEarnedXp);
      xpBarWidthAnim.setValue(Math.min((newXp / getXpForLevel(lvl + 1)) * 100, 100));
      const rawDailyXpM = await AsyncStorage.getItem('elevo_daily_xp');
      const dailyXpMapM: Record<string, number> = rawDailyXpM ? JSON.parse(rawDailyXpM) : {};
      dailyXpMapM[today] = (dailyXpMapM[today] ?? 0) + misogiGained;
      await Promise.all([
        AsyncStorage.setItem('elevo_streak', String(newStreak)),
        AsyncStorage.setItem('elevo_last_log_date', newLastLogDate ?? ''),
        AsyncStorage.setItem('elevo_logged_today', JSON.stringify(newLoggedToday)),
        AsyncStorage.setItem('elevo_completions', JSON.stringify(newCompletions)),
        AsyncStorage.setItem('elevo_level', String(lvl)),
        AsyncStorage.setItem('elevo_xp', String(newXp)),
        AsyncStorage.setItem('elevo_lifetime_xp', String(newLifetimeXp)),
        AsyncStorage.setItem('elevo_earned_xp', JSON.stringify(newEarnedXp)),
        AsyncStorage.setItem('elevo_daily_xp', JSON.stringify(dailyXpMapM)),
      ]);
      await checkAchievements(lvl, newStreak, newCompletions);
      return;
    }

    const effectiveLoggedToday = lastLogDate !== today ? [] : loggedToday;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    let updatedTaskStarts = newTaskStarts;
    if (currentCount === 0 && activityFreq[activityName] === 'Daily' && !newTaskStarts[activityName]) {
      const recentCount = Object.values(newTaskStarts).filter(d => d >= thirtyDaysAgo).length;
      if (recentCount < 3) {
        updatedTaskStarts = { ...newTaskStarts, [activityName]: new Date().toISOString() };
      }
    }
    const taskStartDate = updatedTaskStarts[activityName];
    const isNewTask = taskStartDate != null && taskStartDate >= thirtyDaysAgo;
    const newHabitMultiplier = isNewTask && currentCount < 5 && activityFreq[activityName] === 'Daily' ? 3 : 1;
    const adjustedAmount = Math.round(amount * getMultiplier(activityName, archetype, subArchetype, effectiveLoggedToday, sideArchetypes) * newHabitMultiplier);
    let newXp = (xp ?? 0) + adjustedAmount;
    const currentLevel = level ?? 1;
    let newLevel = currentLevel;
    while (newXp >= getXpForLevel(newLevel + 1)) {
      newXp -= getXpForLevel(newLevel + 1);
      newLevel += 1;
    }
    const finalXp = Math.round(newXp / 5) * 5;
    const newLifetimeXp = lifetimeXp + adjustedAmount;
    const newEarnedXp = { ...earnedXp, [activityName]: adjustedAmount };
    const didLevelUp = newLevel > currentLevel;
    const newProgressPct = Math.min((finalXp / getXpForLevel(newLevel + 1)) * 100, 100);

    setStreak(newStreak);
    setLastLogDate(newLastLogDate);
    setLoggedToday(newLoggedToday);
    setCompletions(newCompletions);
    setNewTaskStarts(updatedTaskStarts);
    setLifetimeXp(newLifetimeXp);
    setEarnedXp(newEarnedXp);

    const rawDailyXp = await AsyncStorage.getItem('elevo_daily_xp');
    const dailyXpMap: Record<string, number> = rawDailyXp ? JSON.parse(rawDailyXp) : {};
    dailyXpMap[today] = (dailyXpMap[today] ?? 0) + adjustedAmount;
    await Promise.all([
      AsyncStorage.setItem('elevo_streak', String(newStreak)),
      AsyncStorage.setItem('elevo_last_log_date', newLastLogDate ?? ''),
      AsyncStorage.setItem('elevo_logged_today', JSON.stringify(newLoggedToday)),
      AsyncStorage.setItem('elevo_completions', JSON.stringify(newCompletions)),
      AsyncStorage.setItem('elevo_new_task_starts', JSON.stringify(updatedTaskStarts)),
      AsyncStorage.setItem('elevo_level', String(newLevel)),
      AsyncStorage.setItem('elevo_xp', String(finalXp)),
      AsyncStorage.setItem('elevo_lifetime_xp', String(newLifetimeXp)),
      AsyncStorage.setItem('elevo_earned_xp', JSON.stringify(newEarnedXp)),
      AsyncStorage.setItem('elevo_daily_xp', JSON.stringify(dailyXpMap)),
    ]);

    // Check achievements after saves (uses newLevel so level-up achievements fire correctly)
    await checkAchievements(newLevel, newStreak, newCompletions);

    if (!didLevelUp) {
      setLevel(newLevel);
      setXp(finalXp);
      Animated.timing(xpBarWidthAnim, {
        toValue: newProgressPct,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
      return;
    }

    // Level-up animation sequence
    setXp(finalXp);
    setLevelingUp(true);

    levelUpTextAnim.setValue(0);
    Animated.timing(levelUpTextAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();

    Animated.sequence([
      Animated.timing(xpBarWidthAnim, { toValue: 100, duration: 300, useNativeDriver: false }),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(xpBarShake, { toValue: 6,  duration: 30, useNativeDriver: false }),
          Animated.timing(xpBarShake, { toValue: -6, duration: 30, useNativeDriver: false }),
          Animated.timing(xpBarShake, { toValue: 6,  duration: 30, useNativeDriver: false }),
          Animated.timing(xpBarShake, { toValue: -6, duration: 30, useNativeDriver: false }),
          Animated.timing(xpBarShake, { toValue: 6,  duration: 30, useNativeDriver: false }),
          Animated.timing(xpBarShake, { toValue: -6, duration: 30, useNativeDriver: false }),
          Animated.timing(xpBarShake, { toValue: 6,  duration: 30, useNativeDriver: false }),
          Animated.timing(xpBarShake, { toValue: -6, duration: 30, useNativeDriver: false }),
          Animated.timing(xpBarShake, { toValue: 6,  duration: 30, useNativeDriver: false }),
          Animated.timing(xpBarShake, { toValue: -6, duration: 30, useNativeDriver: false }),
          Animated.timing(xpBarShake, { toValue: 0,  duration: 0,  useNativeDriver: false }),
        ]),
        Animated.sequence([
          Animated.timing(xpBarScale, { toValue: 1.08, duration: 150, useNativeDriver: false }),
          Animated.timing(xpBarScale, { toValue: 1,    duration: 150, useNativeDriver: false }),
        ]),
        Animated.sequence([
          Animated.timing(levelUpFlash, { toValue: 0.4, duration: 150, useNativeDriver: false }),
          Animated.timing(levelUpFlash, { toValue: 0,   duration: 150, useNativeDriver: false }),
        ]),
      ]),
    ]).start(() => {
      setLevel(newLevel);
      Animated.timing(xpBarWidthAnim, {
        toValue: newProgressPct,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
      Animated.timing(levelUpTextAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => {
        setLevelingUp(false);
      });
    });
  }, [loggedToday, lastLogDate, streak, completions, level, xp, lifetimeXp, newTaskStarts, archetype, subArchetype, sideArchetypes, earnedXp, checkAchievements]);

  const filteredCategories = useMemo(() => categories.map(category => ({
    ...category,
    activities: sortByCompletions(
      archetype
        ? category.activities.filter(a =>
            activityArchetypes[a.name]?.includes(archetype) ||
            sideArchetypes.some(sa => activityArchetypes[a.name]?.includes(sa))
          )
        : category.activities,
      completions
    ),
  })).filter(category => category.activities.length > 0), [archetype, sideArchetypes, completions]);

  const rampFilteredCategories = useMemo(() => {
    if (rampUnlocked || rampLevel === 'skip' || !rampLevel) return filteredCategories;

    if (rampLevel === 'full') {
      const startDate = rampStartDate ? new Date(rampStartDate) : new Date();
      const daysElapsed = Math.floor((Date.now() - startDate.getTime()) / 86400000);
      const visible = new Set<string>();
      for (const { days, task } of FULL_RAMP_LADDER) {
        if (paceOverride || daysElapsed >= days) visible.add(task);
      }
      return filteredCategories.map(cat => ({
        ...cat,
        activities: cat.activities.filter(a => visible.has(a.name)),
      })).filter(cat => cat.activities.length > 0);
    }

    if (rampLevel === 'mid') {
      const excluded = new Set<string>();
      for (const habit of existingHabits) {
        for (const task of HABIT_TO_TASKS[habit] ?? []) {
          excluded.add(task);
        }
      }
      const applyExclusion = (exc: Set<string>) => filteredCategories.map(cat => ({
        ...cat,
        activities: cat.activities.filter(a => !exc.has(a.name)),
      })).filter(cat => cat.activities.length > 0);

      let filtered = applyExclusion(excluded);
      const visibleCount = filtered.reduce((sum, cat) => sum + cat.activities.length, 0);

      if (visibleCount < 3) {
        for (const name of STARTER_SET) {
          excluded.delete(name);
          filtered = applyExclusion(excluded);
          if (filtered.reduce((s, c) => s + c.activities.length, 0) >= 3) break;
        }
      }
      return filtered;
    }

    return filteredCategories;
  }, [filteredCategories, rampLevel, rampUnlocked, rampStartDate, existingHabits, paceOverride]);

  const xpToday = useMemo(() => loggedToday.reduce((sum, name) => sum + (earnedXp[name] ?? 0), 0), [loggedToday, earnedXp]);
  const allFilteredActivities = useMemo(() => rampFilteredCategories.flatMap(c => c.activities), [rampFilteredCategories]);
  const suggestedActivities = useMemo(() => sortByCompletions(allFilteredActivities, completions).slice(0, 8), [allFilteredActivities, completions]);
  const displayXpMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const activity of allFilteredActivities) {
      if (activity.name === 'Misogi') continue;
      const m = getMultiplier(activity.name, archetype, subArchetype, loggedToday, sideArchetypes);
      map[activity.name] = Math.round(activity.xp * m / 5) * 5;
    }
    return map;
  }, [allFilteredActivities, archetype, subArchetype, loggedToday, sideArchetypes]);

  const currentAchievement = achievementQueue[0] ?? null;
  const dismissAchievement = useCallback(() => {
    setAchievementQueue(prev => prev.slice(1));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Elevo</Text>
      </View>
      <Text style={styles.dailyQuote}>{getDailyQuote()}</Text>
      <View style={styles.xpCounter}>
        <Text style={styles.xpText}>Level {level ?? 1}</Text>
        <View style={styles.separator} />
        <Text style={styles.xpText}>{title}</Text>
        <View style={styles.separator} />
        <Text style={styles.xpText}>XP: {xp ?? 0}</Text>
      </View>

      {/* XP bar with level-up overlay text */}
      <View style={styles.xpBarWrapper}>
        {levelingUp && (
          <Animated.Text style={[styles.levelUpText, { opacity: levelUpTextAnim }]}>
            LEVEL UP
          </Animated.Text>
        )}
        <Animated.View
          ref={xpBarContainerRef}
          style={[
            styles.xpBarContainer,
            { transform: [{ translateX: xpBarShake }, { scale: xpBarScale }] },
          ]}
          onLayout={() => {
            xpBarContainerRef.current?.measureInWindow((_x: number, y: number) => {
              xpBarY.current = y;
            });
          }}>
          <Animated.View
            style={[
              styles.xpBar,
              {
                width: xpBarWidthAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
          {levelingUp && (
            <Animated.View style={[styles.levelUpFlashOverlay, { opacity: levelUpFlash }]} />
          )}
        </Animated.View>
      </View>

      <View style={styles.streakRow}>
        <Text style={styles.streakCounterText}>🔥 {streak ?? 0} day streak</Text>
        <TouchableOpacity onPress={() => router.push('/calendar')} style={styles.calendarBtn}>
          <Ionicons name="calendar-outline" size={18} color="#5a5650" />
        </TouchableOpacity>
      </View>
      <View style={styles.horizontalLine} />
      <ScrollView style={styles.todayRegion} showsVerticalScrollIndicator={false}>
        {loggedToday.length > 0 ? (
          <View style={styles.todaySection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.todaySectionHeader, { marginBottom: 0 }]}>
                {loggedToday.length} action{loggedToday.length !== 1 ? 's' : ''} in. Keep going.
              </Text>
              <Text style={styles.todaySectionHeader}>+{xpToday} XP</Text>
            </View>
            {loggedToday.map(name => (
              <View key={name} style={styles.todayItem}>
                <Text style={styles.todayCheck}>✓</Text>
                <Text style={styles.todayItemName} numberOfLines={1}>{name}</Text>
                <Text style={styles.todayItemXp}>+{earnedXp[name] ?? 0}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {(streak ?? 0) > 0
                ? `🔥 ${streak} day streak — keep it alive`
                : 'Start with one thing today.'}
            </Text>
          </View>
        )}
      </ScrollView>
      <View style={{ marginTop: 20 }} />
      <View style={styles.horizontalLine} />
      <View style={{ marginBottom: 20 }} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {!showAll ? (
          <>
            {suggestedActivities.map((activity) => {
              const done = loggedToday.includes(activity.name);
              return (
                <View
                  key={activity.name}
                  ref={(ref) => { taskViewRefs.current[activity.name] = ref; }}
                  onLayout={() => {
                    taskViewRefs.current[activity.name]?.measureInWindow((_x: number, y: number) => {
                      taskPositions.current[activity.name] = y;
                    });
                  }}>
                  <View
                    style={[styles.logButton, styles.logButtonMatch, done && styles.logButtonDone]}>
                    <TouchableOpacity
                      disabled={done}
                      style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                      onPress={() => handleLogActivity(activity.xp, activity.name)}>
                      <Text style={[styles.logButtonText, done && styles.logButtonTextDone]}>{activity.name}</Text>
                      <Text style={[styles.logButtonXp, done && styles.logButtonTextDone]}>
                        {activity.name === 'Misogi' ? '+5 Levels' : `+${displayXpMap[activity.name] ?? activity.xp} XP`}
                      </Text>
                    </TouchableOpacity>
                    {activityExplanations[activity.name] && (
                      <TouchableOpacity
                        onPress={() => setExplanationModal(activity.name)}
                        style={styles.infoButton}>
                        <Text style={styles.infoButtonText}>ⓘ</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
            {allFilteredActivities.length > 8 && (
              <TouchableOpacity style={styles.seeAllBtn} onPress={() => setShowAll(true)}>
                <Text style={styles.seeAllBtnText}>See all tasks</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            {rampFilteredCategories.map((category) => (
              <View key={category.title}>
                <Text style={styles.categoryHeader}>{category.title.toUpperCase()}</Text>
                {category.activities.map((activity) => {
                  const done = loggedToday.includes(activity.name);
                  return (
                    <View
                      key={activity.name}
                      ref={(ref) => { taskViewRefs.current[activity.name] = ref; }}
                      onLayout={() => {
                        taskViewRefs.current[activity.name]?.measureInWindow((_x: number, y: number) => {
                          taskPositions.current[activity.name] = y;
                        });
                      }}>
                      <View
                        style={[styles.logButton, styles.logButtonMatch, done && styles.logButtonDone]}>
                        <TouchableOpacity
                          disabled={done}
                          style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                          onPress={() => handleLogActivity(activity.xp, activity.name)}>
                          <Text style={[styles.logButtonText, done && styles.logButtonTextDone]}>{activity.name}</Text>
                          <Text style={[styles.logButtonXp, done && styles.logButtonTextDone]}>
                            {activity.name === 'Misogi' ? '+5 Levels' : `+${displayXpMap[activity.name] ?? activity.xp} XP`}
                          </Text>
                        </TouchableOpacity>
                        {activityExplanations[activity.name] && (
                          <TouchableOpacity
                            onPress={() => setExplanationModal(activity.name)}
                            style={styles.infoButton}>
                            <Text style={styles.infoButtonText}>ⓘ</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
            <TouchableOpacity style={styles.seeAllBtn} onPress={() => setShowAll(false)}>
              <Text style={styles.seeAllBtnText}>See less</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Explanation modal */}
      <Modal
        visible={explanationModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setExplanationModal(null)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setExplanationModal(null)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.modalCard}>
            <Text style={styles.modalTitle}>{explanationModal}</Text>
            <View style={styles.modalDivider} />
            <Text style={styles.modalBody}>
              {explanationModal ? activityExplanations[explanationModal] : ''}
            </Text>
            <TouchableOpacity onPress={() => setExplanationModal(null)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Got it</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Graduation modal */}
      <Modal
        visible={showGraduationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGraduationModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGraduationModal(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.modalCard}>
            <Text style={styles.graduationBadge}>🏅</Text>
            <Text style={styles.modalTitle}>Level 10 — Graduated.</Text>
            <View style={styles.modalDivider} />
            <Text style={styles.modalBody}>
              You've built the foundation. The full task library is now unlocked — every activity available to your archetype is yours to pick from.{'\n\n'}Streaks, XP multipliers, archetypes — they're all still here. This is just the beginning.
            </Text>
            <TouchableOpacity onPress={() => setShowGraduationModal(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Let's go</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Achievement notification — sequential queue */}
      <Modal
        visible={currentAchievement !== null}
        transparent
        animationType="fade"
        onRequestClose={dismissAchievement}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={dismissAchievement}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.achievementCard}>
            <Text style={styles.achievementTrophy}>🏆</Text>
            <Text style={styles.achievementUnlockedLabel}>Achievement Unlocked</Text>
            <Text style={styles.achievementTitle}>{currentAchievement?.title}</Text>
            <Text style={styles.achievementDesc}>{currentAchievement?.description}</Text>
            <TouchableOpacity onPress={dismissAchievement} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>
                {achievementQueue.length > 1 ? `Next (${achievementQueue.length - 1} more)` : 'Nice!'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Shooting star overlay */}
      {showStar && (
        <View style={styles.starOverlay} pointerEvents="none">
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: [
                { translateX: starAnim.x },
                { translateY: starAnim.y },
              ],
              opacity: starOpacity,
            }}>
            <Text style={styles.starText}>✦</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#c9a84c',
  },
  headerTitle: {
    color: '#c9a84c',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dailyQuote: {
    color: '#5a5650',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  xpCounter: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 10,
    paddingTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpText: {
    color: '#e8e0cc',
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    width: 2,
    height: 16,
    backgroundColor: '#c9a84c',
  },
  xpBarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  levelUpText: {
    position: 'absolute',
    top: -18,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#c9a84c',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  xpBarContainer: {
    marginHorizontal: 24,
    height: 8,
    backgroundColor: '#1e1e1e',
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpBar: {
    height: '100%',
    backgroundColor: '#c9a84c',
    borderRadius: 6,
  },
  levelUpFlashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#c9a84c',
    borderRadius: 6,
  },
  categoryHeader: {
    color: '#c9a84c',
    fontSize: 13,
    fontWeight: 'bold',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  logButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 8,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  logButtonMatch: {
    borderColor: '#c9a84c',
    borderWidth: 2,
  },
  logButtonDone: {
    borderColor: '#2a2a2a',
    borderWidth: 1,
    opacity: 0.4,
    paddingVertical: 7,
  },
  logButtonTextDone: {
    color: '#5a5650',
  },
  logButtonText: {
    color: '#e8e0cc',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  logButtonXp: {
    color: '#c9a84c',
    fontSize: 13,
    fontWeight: 'bold',
  },
  horizontalLine: {
    backgroundColor: '#2a2a2a',
    height: 1,
    marginVertical: 6,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 6,
    gap: 10,
  },
  streakCounterText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: 'bold',
  },
  calendarBtn: {
    padding: 4,
  },
  todaySection: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  todaySectionHeader: {
    color: '#c9a84c',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  todayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  todayCheck: {
    color: '#c9a84c',
    fontSize: 13,
    fontWeight: 'bold',
    width: 16,
  },
  todayItemName: {
    color: '#e8e0cc',
    fontSize: 13,
    flex: 1,
  },
  todayItemXp: {
    color: '#c9a84c',
    fontSize: 12,
  },
  emptyState: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 12,
  },
  emptyStateText: {
    color: '#5a5650',
    fontSize: 14,
    textAlign: 'center',
  },
  seeAllBtn: {
    marginHorizontal: 24,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
  },
  seeAllBtnText: {
    color: '#5a5650',
    fontSize: 14,
  },
  todayRegion: {
    maxHeight: 160,
  },
  infoButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  infoButtonText: {
    color: '#c9a84c',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#0f0f0f',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#c9a84c',
    width: '100%',
  },
  modalTitle: {
    color: '#c9a84c',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#1e1e1e',
    marginBottom: 12,
  },
  modalBody: {
    color: '#e8e0cc',
    fontSize: 14,
    lineHeight: 22,
  },
  modalClose: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#c9a84c',
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#c9a84c',
    fontSize: 14,
  },
  graduationBadge: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 12,
  },
  achievementCard: {
    backgroundColor: '#0f0f0f',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#c9a84c',
    width: '100%',
    alignItems: 'center',
  },
  achievementTrophy: {
    fontSize: 40,
    marginBottom: 8,
  },
  achievementUnlockedLabel: {
    color: '#c9a84c',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 10,
  },
  achievementTitle: {
    color: '#e8e0cc',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementDesc: {
    color: '#5a5650',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  starOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  starText: {
    color: '#c9a84c',
    fontSize: 18,
  },
});
