import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Modal, Animated, Easing, Pressable } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getTitle, getXpForLevel,
  categories, activityArchetypes, activityFreq,
  getMultiplier, activityExplanations, getDailyQuote, subArchetypeTiers, localDateString
} from '../../lib/utils';
import { activityContent } from '../../lib/activityContent';
import { ACHIEVEMENTS, buildStats, type Achievement } from '../../lib/achievements';
import { awardXp } from '../../lib/xpEngine';
import Svg, { Circle } from 'react-native-svg';

// Ring geometry
const RING_SIZE = 160;
const RING_THICK = 12;
const RING_RADIUS = RING_SIZE / 2 - RING_THICK / 2;   // 74 — radius to stroke center
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;       // ~464.96

// AnimatedCircle must be created at module level (not inside the component)
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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

function fmtXp(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

function fmtMult(m: number): string {
  return `×${m === Math.floor(m) ? m : m.toFixed(1)}`;
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
  const [username, setUsername] = useState<string | null>(null);
  const [joinDate, setJoinDate] = useState<string | null>(null);

  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

  const router = useRouter();

  // Shooting-star animation refs
  const starAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const starOpacity = useRef(new Animated.Value(0)).current;
  const xpBarContainerRef = useRef<any>(null);
  const xpBarY = useRef<number>(0);
  const xpBarX = useRef<number>(0);
  const taskViewRefs = useRef<Record<string, any>>({});
  const taskPositions = useRef<Record<string, { x: number; y: number }>>({});

  // Ring / XP animation refs (useNativeDriver: false — drives ring rotation + shake/scale)
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
          savedSubArchetype, savedLoggedToday, savedCompletions, savedNewTaskStarts,
          savedSideArchetypes, savedEarnedXp, savedRampLevel, savedExistingHabits,
          savedRampStartDate, savedRampUnlocked, savedPaceOverride,
          savedAchSeeded, savedAchUnlocked, savedWorkoutHistory,
          savedLifetimeXp, savedUsername, savedJoinDate,
          savedAchVersion, savedDailyTaskCounts, savedDailyCats, savedComebackAchieved,
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
          AsyncStorage.getItem('elevo_lifetime_xp'),
          AsyncStorage.getItem('elevo_username'),
          AsyncStorage.getItem('elevo_join_date'),
          AsyncStorage.getItem('elevo_achievements_version'),
          AsyncStorage.getItem('elevo_daily_task_counts'),
          AsyncStorage.getItem('elevo_daily_categories'),
          AsyncStorage.getItem('elevo_comeback_achieved'),
        ]);
        const today = localDateString();
        const yd = new Date(); yd.setDate(yd.getDate() - 1);
        const yesterday = localDateString(yd);
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
        } else {
          setStreak(savedStreak ? Number(savedStreak) : 0);
        }
        setArchetype(savedArchetype ?? null);
        setSubArchetype(savedSubArchetype ?? null);
        setLoggedToday(savedLastLogDate === today && savedLoggedToday ? JSON.parse(savedLoggedToday) : []);
        if (savedCompletions) setCompletions(JSON.parse(savedCompletions));
        if (savedNewTaskStarts) setNewTaskStarts(JSON.parse(savedNewTaskStarts));
        setLifetimeXp(savedLifetimeXp ? Number(savedLifetimeXp) : 0);
        setSideArchetypes(savedSideArchetypes ? JSON.parse(savedSideArchetypes) : []);
        setEarnedXp(savedLastLogDate === today && savedEarnedXp ? JSON.parse(savedEarnedXp) : {});
        setRampLevel(savedRampLevel ?? null);
        setExistingHabits(savedExistingHabits ? JSON.parse(savedExistingHabits) : []);
        setRampStartDate(savedRampStartDate ?? null);
        setRampUnlocked(savedRampUnlocked === 'true');
        setPaceOverride(savedPaceOverride === 'true');
        setUsername(savedUsername);
        setJoinDate(savedJoinDate);

        // Version migration — runs regardless of seeding; prevents toast storm for existing users
        const achVersion = parseInt(savedAchVersion ?? '0') || 0;
        if (achVersion < 2) {
          const migHistory: { isPR?: boolean }[] = savedWorkoutHistory ? JSON.parse(savedWorkoutHistory) : [];
          const migComps: Record<string, number> = savedCompletions ? JSON.parse(savedCompletions) : {};
          const migStreak = savedStreak ? Number(savedStreak) : 0;
          const migDailyTaskCounts: Record<string, number> = savedDailyTaskCounts ? JSON.parse(savedDailyTaskCounts) : {};
          const migDailyCats: Record<string, string[]> = savedDailyCats ? JSON.parse(savedDailyCats) : {};
          const migComebackAchieved = savedComebackAchieved === 'true';
          const migBestDayTaskCount = Math.max(0, ...Object.values(migDailyTaskCounts));
          const migBestDayCategories = Math.max(0, ...Object.values(migDailyCats).map((a: string[]) => a.length));
          const migStats = buildStats(savedLevelNum, migStreak, migComps, migHistory, {
            bestDayTaskCount: migBestDayTaskCount,
            bestDayCategories: migBestDayCategories,
            comebackTo7: migComebackAchieved,
          });
          const currentUnlocked: string[] = savedAchUnlocked ? JSON.parse(savedAchUnlocked) : [];
          const allQualifying = ACHIEVEMENTS.filter(a => a.check(migStats)).map(a => a.id);
          const mergedIds = [...new Set([...currentUnlocked, ...allQualifying])];
          await Promise.all([
            AsyncStorage.setItem('elevo_unlocked_achievements', JSON.stringify(mergedIds)),
            AsyncStorage.setItem('elevo_achievements_version', '2'),
          ]);
        }

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
    const bestDayCategories = Math.max(0, ...Object.values(dailyCats).map((a: string[]) => a.length));
    const stats = buildStats(lvl, str, comps, history, {
      bestDayTaskCount,
      bestDayCategories,
      comebackTo7: comebackAchieved,
    });
    const newlyUnlocked = ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id) && a.check(stats));
    if (newlyUnlocked.length === 0) return;
    const newIds = [...unlockedIds, ...newlyUnlocked.map(a => a.id)];
    await AsyncStorage.setItem('elevo_unlocked_achievements', JSON.stringify(newIds));
    setAchievementQueue(prev => [...prev, ...newlyUnlocked]);
  }, []);

  const handleLogActivity = useCallback(async (amount: number, activityName: string) => {
    if (loggedToday.includes(activityName)) return;

    // Shooting-star animation — flies from tapped task to ring center
    const taskPos = taskPositions.current[activityName] ?? { x: 0, y: 400 };
    starAnim.setValue({ x: taskPos.x, y: taskPos.y });
    starOpacity.setValue(1);
    setShowStar(true);
    Animated.parallel([
      Animated.timing(starAnim.y, {
        toValue: xpBarY.current,
        duration: 600,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(starAnim.x, {
        toValue: xpBarX.current,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
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

    if (activityName === 'Misogi') {
      let misogiGained = 0;
      for (let i = 0; i < 5; i++) misogiGained += getXpForLevel((level ?? 1) + i + 1);
      const r = await awardXp(misogiGained, 'Misogi');
      const newEarnedXp = { ...earnedXp, Misogi: misogiGained };
      await AsyncStorage.setItem('elevo_earned_xp', JSON.stringify(newEarnedXp));
      setStreak(r.newStreak);
      setLastLogDate(localDateString());
      setLoggedToday(r.newLoggedToday);
      setCompletions(r.newCompletions);
      setLevel(r.newLevel);
      setXp(r.newXp);
      setLifetimeXp(r.newLifetimeXp);
      setEarnedXp(newEarnedXp);
      xpBarWidthAnim.setValue(Math.min((r.newXp / getXpForLevel(r.newLevel + 1)) * 100, 100));
      await checkAchievements(r.newLevel, r.newStreak, r.newCompletions);
      return;
    }

    const today = localDateString();
    const effectiveLoggedToday = lastLogDate !== today ? [] : loggedToday;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const currentCount = completions[activityName] ?? 0;
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
    const adjustedAmount = Math.round(amount * getMultiplier(activityName, archetype, subArchetype, effectiveLoggedToday, sideArchetypes) * newHabitMultiplier / 5) * 5;

    const r = await awardXp(adjustedAmount, activityName);

    const newEarnedXp = { ...earnedXp, [activityName]: adjustedAmount };
    await Promise.all([
      AsyncStorage.setItem('elevo_new_task_starts', JSON.stringify(updatedTaskStarts)),
      AsyncStorage.setItem('elevo_earned_xp', JSON.stringify(newEarnedXp)),
    ]);

    setStreak(r.newStreak);
    setLastLogDate(today);
    setLoggedToday(r.newLoggedToday);
    setCompletions(r.newCompletions);
    setNewTaskStarts(updatedTaskStarts);
    setLifetimeXp(r.newLifetimeXp);
    setEarnedXp(newEarnedXp);

    await checkAchievements(r.newLevel, r.newStreak, r.newCompletions);

    const newProgressPct = Math.min((r.newXp / getXpForLevel(r.newLevel + 1)) * 100, 100);

    if (!r.didLevelUp) {
      setLevel(r.newLevel);
      setXp(r.newXp);
      Animated.timing(xpBarWidthAnim, {
        toValue: newProgressPct,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
      return;
    }

    // Level-up animation sequence
    setXp(r.newXp);
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
      setLevel(r.newLevel);
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
  }, [loggedToday, lastLogDate, completions, level, newTaskStarts, archetype, subArchetype, sideArchetypes, earnedXp, checkAchievements]);

  const filteredCategories = useMemo(() => {
    const subTasks = subArchetype && subArchetype !== 'none'
      ? subArchetypeTiers[subArchetype]
      : null;
    return categories.map(category => ({
      ...category,
      activities: sortByCompletions(
        archetype
          ? category.activities.filter(a =>
              activityArchetypes[a.name]?.includes(archetype) ||
              sideArchetypes.some(sa => activityArchetypes[a.name]?.includes(sa)) ||
              (subTasks && (
                subTasks.core.includes(a.name) ||
                subTasks.strong.includes(a.name) ||
                subTasks.relevant.includes(a.name)
              ))
            )
          : category.activities,
        completions
      ),
    })).filter(category => category.activities.length > 0);
  }, [archetype, subArchetype, sideArchetypes, completions]);

  const rampFilteredCategories = useMemo(() => {
    if (rampUnlocked || rampLevel === 'skip' || !rampLevel) return filteredCategories;

    if (rampLevel === 'full') {
      const startDate = rampStartDate ? new Date(rampStartDate + 'T12:00:00') : new Date();
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
    const today = localDateString();
    const effective = lastLogDate !== today ? [] : loggedToday;
    const map: Record<string, number> = {};
    for (const activity of allFilteredActivities) {
      if (activity.name === 'Misogi') continue;
      const m = getMultiplier(activity.name, archetype, subArchetype, effective, sideArchetypes);
      map[activity.name] = Math.round(activity.xp * m / 5) * 5;
    }
    return map;
  }, [allFilteredActivities, archetype, subArchetype, loggedToday, sideArchetypes, lastLogDate]);

  const multiplierMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const act of allFilteredActivities) {
      if (act.name === 'Misogi') continue;
      map[act.name] = getMultiplier(act.name, archetype, subArchetype, loggedToday, sideArchetypes);
    }
    return map;
  }, [allFilteredActivities, archetype, subArchetype, loggedToday, sideArchetypes]);

  const dayN = useMemo(() => {
    if (!joinDate) return 1;
    const d = Math.floor((Date.now() - new Date(joinDate).getTime()) / 86400000);
    return Math.max(1, d + 1);
  }, [joinDate]);

  const nextTitleInfo = useMemo(() => {
    const lvl = level ?? 1;
    const curXp = xp ?? 0;
    let nextLevel: number; let nextTitle: string;
    if (lvl < 10)      { nextLevel = 10; nextTitle = 'Gaining Momentum'; }
    else if (lvl < 30) { nextLevel = 30; nextTitle = 'Locked In'; }
    else if (lvl < 50) { nextLevel = 50; nextTitle = 'Building a New Life'; }
    else if (lvl < 70) { nextLevel = 70; nextTitle = 'Leveled Up'; }
    else if (lvl < 90) { nextLevel = 90; nextTitle = 'The One Who Never Quit'; }
    else return null;
    let total = getXpForLevel(lvl + 1) - curXp;
    for (let l = lvl + 1; l < nextLevel; l++) total += getXpForLevel(l + 1);
    return { xp: Math.max(0, Math.round(total)), title: nextTitle };
  }, [level, xp]);

  const currentAchievement = achievementQueue[0] ?? null;
  const dismissAchievement = useCallback(() => {
    setAchievementQueue(prev => prev.slice(1));
  }, []);

  const xpForNext = getXpForLevel((level ?? 1) + 1);
  const remainingTasks = useMemo(
    () => (showAll ? allFilteredActivities : suggestedActivities).filter(a => !loggedToday.includes(a.name)),
    [showAll, allFilteredActivities, suggestedActivities, loggedToday]
  );

  // strokeDashoffset drives ring fill: CIRCUMFERENCE = empty, 0 = full
  const strokeDashOffsetAnim = xpBarWidthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const renderTaskRow = (activity: { name: string; xp: number }) => {
    const done = loggedToday.includes(activity.name);
    if (done) return null;
    const mult = multiplierMap[activity.name] ?? 1;
    return (
      <View
        key={activity.name}
        ref={(ref) => { taskViewRefs.current[activity.name] = ref; }}
        onLayout={() => {
          taskViewRefs.current[activity.name]?.measureInWindow((x: number, y: number, w: number) => {
            taskPositions.current[activity.name] = { x: x + w / 2, y };
          });
        }}
        style={styles.taskRow}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={styles.taskTap}
          onPress={() => handleLogActivity(activity.xp, activity.name)}>
          <View style={styles.taskAdd}>
            <Ionicons name="add" size={18} color="#c9a84c" />
          </View>
          <Text style={styles.taskName} numberOfLines={1}>{activity.name}</Text>
          {mult > 1 && (
            <View style={styles.multBadge}>
              <Text style={styles.multBadgeText}>{fmtMult(mult)}</Text>
            </View>
          )}
          <Text style={styles.taskXp}>
            {activity.name === 'Misogi' ? '+5 LVL' : `+${displayXpMap[activity.name] ?? activity.xp}`}
          </Text>
        </TouchableOpacity>
        {activityExplanations[activity.name] && (
          <TouchableOpacity
            onPress={() => setExplanationModal(activity.name)}
            hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
            style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={18} color="#5a5650" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Header identity row ──────────────────── */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {username ? username[0].toUpperCase() : '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.headerArchetype} numberOfLines={1}>
                {archetype ?? 'Elevo'} · {title}
              </Text>
              <Text style={styles.headerUsername} numberOfLines={1}>
                {username ?? 'Set username'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/calendar')} style={styles.calendarBtn}>
              <Ionicons name="calendar-outline" size={18} color="#5a5650" />
            </TouchableOpacity>
            <Text style={styles.dayLabel}>DAY {dayN}</Text>
          </View>
        </View>

        {/* ── Circular progress ring ───────────────── */}
        <View style={styles.ringSection}>
          <Animated.View
            ref={xpBarContainerRef}
            style={[
              styles.ringWrapper,
              { transform: [{ translateX: xpBarShake }, { scale: xpBarScale }] },
            ]}
            onLayout={() => {
              xpBarContainerRef.current?.measureInWindow((x: number, y: number, w: number, h: number) => {
                xpBarX.current = x + w / 2;
                xpBarY.current = y + h / 2;
              });
            }}>

            {/* SVG ring: background + animated progress arc + level-up flash */}
            <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
              {/* Background track */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="#1a1814"
                strokeWidth={RING_THICK}
                fill="none"
              />
              {/* Gold progress arc — dashoffset animates empty→full */}
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="#c9a84c"
                strokeWidth={RING_THICK}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashOffsetAnim}
                strokeLinecap="round"
              />
              {/* Level-up gold flash — full ring, fades in/out */}
              {levelingUp && (
                <AnimatedCircle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  stroke="#f5d77a"
                  strokeWidth={RING_THICK}
                  fill="none"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={0}
                  opacity={levelUpFlash}
                />
              )}
            </Svg>

            {/* Level-up text above ring */}
            {levelingUp && (
              <Animated.Text style={[styles.levelUpText, { opacity: levelUpTextAnim }]}>
                LEVEL UP
              </Animated.Text>
            )}

            {/* Center: level number overlaid on SVG */}
            <View style={styles.ringCenter}>
              <Text style={styles.ringLevelNum}>{level ?? 1}</Text>
              <Text style={styles.ringLevelLabel}>LEVEL</Text>
            </View>
          </Animated.View>

          <Text style={styles.rankText}>RANK · {archetype ?? '—'}</Text>
          {nextTitleInfo ? (
            <Text style={styles.nextTitleText}>
              {fmtXp(nextTitleInfo.xp)} XP to {nextTitleInfo.title}
            </Text>
          ) : (
            <Text style={styles.nextTitleText}>Maximum rank reached</Text>
          )}
          <Text style={styles.xpSubLabel}>{xp ?? 0} / {xpForNext} XP</Text>
        </View>

        {/* ── Stat tiles ────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <Ionicons name="flame" size={15} color="#FF6B35" />
            <Text style={styles.statValue}>{streak ?? 0}</Text>
            <Text style={styles.statLabel}>STREAK</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statTile}>
            <Ionicons name="flash" size={15} color="#c9a84c" />
            <Text style={styles.statValue}>+{xpToday}</Text>
            <Text style={styles.statLabel}>TODAY</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statTile}>
            <Ionicons name="star" size={15} color="#c9a84c" />
            <Text style={styles.statValue}>{fmtXp(lifetimeXp)}</Text>
            <Text style={styles.statLabel}>LIFETIME</Text>
          </View>
        </View>

        {/* ── Parable of the Day ───────────────────── */}
        <View style={styles.parableCard}>
          <Text style={styles.parableLabel}>PARABLE OF THE DAY</Text>
          <View style={styles.parableDivider} />
          <Text style={styles.parableQuote}>{getDailyQuote()}</Text>
        </View>

        {/* ── Today's momentum ─────────────────────── */}
        {loggedToday.length > 0 && (
          <View style={styles.todayCard}>
            <View style={styles.todayHeader}>
              <Text style={styles.todayHeaderText}>
                {loggedToday.length} done today
              </Text>
              <Text style={styles.todayHeaderXp}>+{xpToday} XP</Text>
            </View>
            {loggedToday.map(name => (
              <View key={name} style={styles.todayItem}>
                <Ionicons name="checkmark" size={15} color="#c9a84c" style={{ width: 18 }} />
                <Text style={styles.todayItemName} numberOfLines={1}>{name}</Text>
                <Text style={styles.todayItemXp}>+{earnedXp[name] ?? 0}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Task list ────────────────────────────── */}
        <View style={styles.listSection}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listHeader}>
              {loggedToday.length > 0 ? 'KEEP GOING' : 'PICK ONE TO START'}
            </Text>
          </View>

          {remainingTasks.length === 0 ? (
            <View style={styles.allDone}>
              <Ionicons name="checkmark-done" size={22} color="#c9a84c" />
              <Text style={styles.allDoneText}>
                Everything logged. That's a day most people won't have.
              </Text>
            </View>
          ) : (
            remainingTasks.map(renderTaskRow)
          )}

          {allFilteredActivities.length > 8 && remainingTasks.length > 0 && (
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => setShowAll(s => !s)}>
              <Text style={styles.seeAllBtnText}>
                {showAll ? 'Show less' : `Show all ${allFilteredActivities.length} tasks`}
              </Text>
              <Ionicons
                name={showAll ? 'chevron-up' : 'chevron-down'}
                size={15}
                color="#5a5650"
              />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Explanation modal */}
      <Modal
        visible={explanationModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setExplanationModal(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setExplanationModal(null)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{explanationModal}</Text>
            <View style={styles.modalDivider} />
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <Text style={styles.modalBody}>
                {explanationModal ? activityExplanations[explanationModal] : ''}
              </Text>
              {explanationModal && activityContent[explanationModal] && (
                <>
                  <View style={[styles.modalDivider, { marginTop: 16 }]} />
                  <Text style={styles.modalSectionLabel}>BENEFITS</Text>
                  {activityContent[explanationModal].benefits.map((b, i) => (
                    <Text key={i} style={styles.modalBullet}>· {b}</Text>
                  ))}
                  <View style={[styles.modalDivider, { marginTop: 16 }]} />
                  <Text style={styles.modalSectionLabel}>HOW TO</Text>
                  {activityContent[explanationModal].howTo.map((h, i) => (
                    <Text key={i} style={styles.modalBullet}>· {h}</Text>
                  ))}
                  <View style={[styles.modalDivider, { marginTop: 16 }]} />
                  <Text style={styles.modalSectionLabel}>THE SCIENCE</Text>
                  <Text style={styles.modalBody}>{activityContent[explanationModal].science}</Text>
                </>
              )}
            </ScrollView>
            <TouchableOpacity onPress={() => setExplanationModal(null)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
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
            <View style={styles.graduationBadge}>
              <Ionicons name="ribbon" size={34} color="#c9a84c" />
            </View>
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
        <View style={styles.modalOverlay}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.achievementCard}>
            <View style={styles.achievementTrophy}>
              <Ionicons name="trophy" size={32} color="#c9a84c" />
            </View>
            <Text style={styles.achievementUnlockedLabel}>ACHIEVEMENT UNLOCKED</Text>
            <Text style={styles.achievementTitle}>{currentAchievement?.title}</Text>
            <Text style={styles.achievementDesc}>{currentAchievement?.description}</Text>
            <TouchableOpacity onPress={dismissAchievement} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>
                {achievementQueue.length > 1 ? `Next (${achievementQueue.length - 1} more)` : 'Nice!'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
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
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Header identity ───────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1610',
    borderWidth: 1,
    borderColor: '#2a2418',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#c9a84c',
    fontSize: 15,
    fontWeight: '700',
  },
  headerArchetype: {
    color: '#c9a84c',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerUsername: {
    color: '#5a5650',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  calendarBtn: {
    padding: 4,
  },
  dayLabel: {
    color: '#3a3830',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // ── Circular ring ─────────────────────────────
  ringSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 16,
  },
  ringSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: [{ rotate: '-90deg' }],
  },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLevelNum: {
    color: '#e8e0cc',
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 58,
  },
  ringLevelLabel: {
    color: '#5a5650',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: -2,
  },
  levelUpText: {
    position: 'absolute',
    top: -22,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#c9a84c',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    zIndex: 10,
  },
  rankText: {
    color: '#c9a84c',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  nextTitleText: {
    color: '#5a5650',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  xpSubLabel: {
    color: '#3a3830',
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Stat tiles ────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#0f0e0c',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a1814',
    marginBottom: 20,
    overflow: 'hidden',
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1a1814',
    marginVertical: 12,
  },
  statValue: {
    color: '#e8e0cc',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: '#3a3830',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // ── Parable card ──────────────────────────────
  parableCard: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1a1814',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  parableLabel: {
    color: '#3a3830',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 10,
  },
  parableDivider: {
    height: 1,
    backgroundColor: '#1a1814',
    marginBottom: 12,
  },
  parableQuote: {
    color: '#5a5650',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // ── Today card ────────────────────────────────
  todayCard: {
    marginHorizontal: 16,
    backgroundColor: '#100f0c',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayHeaderText: {
    color: '#c9a84c',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  todayHeaderXp: {
    color: '#c9a84c',
    fontSize: 13,
    fontWeight: '800',
  },
  todayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  todayItemName: {
    color: '#9a9488',
    fontSize: 13,
    flex: 1,
  },
  todayItemXp: {
    color: '#6b6453',
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Task list ─────────────────────────────────
  listSection: {
    paddingHorizontal: 16,
  },
  listHeaderRow: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  listHeader: {
    color: '#5a5650',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    marginBottom: 8,
    paddingRight: 12,
  },
  taskTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingLeft: 12,
  },
  taskAdd: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1a1610',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskName: {
    color: '#e8e0cc',
    fontSize: 14.5,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  multBadge: {
    backgroundColor: '#1a1610',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
  },
  multBadgeText: {
    color: '#c9a84c',
    fontSize: 11,
    fontWeight: '700',
  },
  taskXp: {
    color: '#c9a84c',
    fontSize: 13,
    fontWeight: '700',
  },
  infoButton: {
    paddingLeft: 10,
    paddingVertical: 4,
  },

  allDone: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 12,
  },
  allDoneText: {
    color: '#5a5650',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 4,
  },
  seeAllBtnText: {
    color: '#5a5650',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Modals ────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#100f0c',
    borderRadius: 18,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    color: '#c9a84c',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#1e1e1e',
    marginBottom: 14,
  },
  modalBody: {
    color: '#e8e0cc',
    fontSize: 14,
    lineHeight: 22,
  },
  modalClose: {
    marginTop: 22,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#c9a84c',
    borderRadius: 10,
    alignSelf: 'stretch',
  },
  modalCloseText: {
    color: '#0a0a0a',
    fontSize: 14,
    fontWeight: '700',
  },
  graduationBadge: {
    alignSelf: 'center',
    marginBottom: 14,
  },
  achievementCard: {
    backgroundColor: '#100f0c',
    borderRadius: 18,
    padding: 28,
    width: '100%',
    alignItems: 'center',
  },
  achievementTrophy: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1a1610',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  achievementUnlockedLabel: {
    color: '#c9a84c',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 10,
  },
  achievementTitle: {
    color: '#e8e0cc',
    fontSize: 21,
    fontWeight: '800',
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
    top: 0, left: 0,
    width: '100%', height: '100%',
  },
  starText: {
    color: '#c9a84c',
    fontSize: 18,
  },

  modalScroll: {
    maxHeight: 420,
  },
  modalSectionLabel: {
    color: '#3a3830',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginTop: 14,
    marginBottom: 10,
  },
  modalBullet: {
    color: '#e8e0cc',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
});
