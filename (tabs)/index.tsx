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
import { awardXp } from '../xpEngine';

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
          savedSubArchetype, savedLoggedToday, savedCompletions, savedNewTaskStarts,
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
        } else {
          setStreak(savedStreak ? Number(savedStreak) : 0);
        }
        setArchetype(savedArchetype ?? null);
        setSubArchetype(savedSubArchetype ?? null);
        setLoggedToday(savedLastLogDate === today && savedLoggedToday ? JSON.parse(savedLoggedToday) : []);
        if (savedCompletions) setCompletions(JSON.parse(savedCompletions));
        if (savedNewTaskStarts) setNewTaskStarts(JSON.parse(savedNewTaskStarts));
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

    if (activityName === 'Misogi') {
      let misogiGained = 0;
      for (let i = 0; i < 5; i++) misogiGained += getXpForLevel((level ?? 1) + i + 1);
      const r = await awardXp(misogiGained, 'Misogi');
      const newEarnedXp = { ...earnedXp, Misogi: misogiGained };
      await AsyncStorage.setItem('elevo_earned_xp', JSON.stringify(newEarnedXp));
      setStreak(r.newStreak);
      setLastLogDate(new Date().toISOString().split('T')[0]);
      setLoggedToday(r.newLoggedToday);
      setCompletions(r.newCompletions);
      setLevel(r.newLevel);
      setXp(r.newXp);
      setEarnedXp(newEarnedXp);
      xpBarWidthAnim.setValue(Math.min((r.newXp / getXpForLevel(r.newLevel + 1)) * 100, 100));
      await checkAchievements(r.newLevel, r.newStreak, r.newCompletions);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
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
    const adjustedAmount = Math.round(amount * getMultiplier(activityName, archetype, subArchetype, effectiveLoggedToday, sideArchetypes) * newHabitMultiplier);

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

  const xpForNext = getXpForLevel((level ?? 1) + 1);
  const remainingTasks = useMemo(
    () => (showAll ? allFilteredActivities : suggestedActivities).filter(a => !loggedToday.includes(a.name)),
    [showAll, allFilteredActivities, suggestedActivities, loggedToday]
  );

  const renderTaskRow = (activity: { name: string; xp: number }) => {
    const done = loggedToday.includes(activity.name);
    if (done) return null;
    return (
      <View
        key={activity.name}
        ref={(ref) => { taskViewRefs.current[activity.name] = ref; }}
        onLayout={() => {
          taskViewRefs.current[activity.name]?.measureInWindow((_x: number, y: number) => {
            taskPositions.current[activity.name] = y;
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

        {/* ── Hero block ───────────────────────────── */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.streakChip}>
              <Ionicons name="flame" size={14} color="#FF6B35" />
              <Text style={styles.streakChipText}>{streak ?? 0}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/calendar')} style={styles.calendarBtn}>
              <Ionicons name="calendar-outline" size={20} color="#5a5650" />
            </TouchableOpacity>
          </View>

          <Text style={styles.levelNum}>{level ?? 1}</Text>
          <Text style={styles.levelLabel}>LEVEL</Text>
          <Text style={styles.titleText}>{title}</Text>

          {/* XP bar */}
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
            <Text style={styles.xpBarLabel}>{xp ?? 0} / {xpForNext} XP</Text>
          </View>
        </View>

        <Text style={styles.dailyQuote}>{getDailyQuote()}</Text>

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
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={dismissAchievement}>
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
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Hero ──────────────────────────────────────
  hero: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1a1410',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  streakChipText: {
    color: '#FF6B35',
    fontSize: 13,
    fontWeight: '700',
  },
  calendarBtn: {
    padding: 4,
  },
  levelNum: {
    color: '#e8e0cc',
    fontSize: 64,
    fontWeight: '800',
    lineHeight: 70,
    letterSpacing: -1,
  },
  levelLabel: {
    color: '#5a5650',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: -4,
  },
  titleText: {
    color: '#c9a84c',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 10,
  },
  xpBarWrapper: {
    width: '100%',
    marginTop: 18,
    position: 'relative',
  },
  levelUpText: {
    position: 'absolute',
    top: -16,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#c9a84c',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
  },
  xpBarContainer: {
    height: 6,
    backgroundColor: '#17150f',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBar: {
    height: '100%',
    backgroundColor: '#c9a84c',
    borderRadius: 3,
  },
  levelUpFlashOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#f5d77a',
    borderRadius: 3,
  },
  xpBarLabel: {
    color: '#5a5650',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },

  dailyQuote: {
    color: '#5a5650',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 36,
    marginBottom: 24,
    lineHeight: 19,
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
    marginRight: 10,
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
    paddingVertical: 13,
    backgroundColor: '#c9a84c',
    borderRadius: 10,
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
});
