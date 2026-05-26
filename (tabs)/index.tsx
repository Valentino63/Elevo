import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Modal } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getTitle, getXpForLevel,
  categories, activityArchetypes, activityFreq, activityXp,
  getMultiplier, activityExplanations
} from '../utils';

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

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const [
          savedXp, savedLevel, savedStreak, savedLastLogDate, savedArchetype,
          savedSubArchetype, savedLoggedToday, savedCompletions, savedNewTaskStarts, savedLifetimeXp,
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
        ]);
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        setXp(savedXp ? Math.round(Number(savedXp) / 5) * 5 : 0);
        setLevel(savedLevel ? Number(savedLevel) : 1);
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
      };
      loadData();
    }, [])
  );

  const handleLogActivity = useCallback(async (amount: number, activityName: string) => {
    if (loggedToday.includes(activityName)) return;
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
      setStreak(newStreak);
      setLastLogDate(newLastLogDate);
      setLoggedToday(newLoggedToday);
      setCompletions(newCompletions);
      setLevel(lvl);
      setXp(newXp);
      setLifetimeXp(newLifetimeXp);
      await Promise.all([
        AsyncStorage.setItem('elevo_streak', String(newStreak)),
        AsyncStorage.setItem('elevo_last_log_date', newLastLogDate ?? ''),
        AsyncStorage.setItem('elevo_logged_today', JSON.stringify(newLoggedToday)),
        AsyncStorage.setItem('elevo_completions', JSON.stringify(newCompletions)),
        AsyncStorage.setItem('elevo_level', String(lvl)),
        AsyncStorage.setItem('elevo_xp', String(newXp)),
        AsyncStorage.setItem('elevo_lifetime_xp', String(newLifetimeXp)),
      ]);
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
    const adjustedAmount = Math.round(amount * getMultiplier(activityName, archetype, subArchetype, effectiveLoggedToday) * newHabitMultiplier);
    let newXp = (xp ?? 0) + adjustedAmount;
    let newLevel = level ?? 1;
    while (newXp >= getXpForLevel(newLevel + 1)) {
      newXp -= getXpForLevel(newLevel + 1);
      newLevel += 1;
    }
    const finalXp = Math.round(newXp / 5) * 5;
    const newLifetimeXp = lifetimeXp + adjustedAmount;
    setStreak(newStreak);
    setLastLogDate(newLastLogDate);
    setLoggedToday(newLoggedToday);
    setCompletions(newCompletions);
    setNewTaskStarts(updatedTaskStarts);
    setLevel(newLevel);
    setXp(finalXp);
    setLifetimeXp(newLifetimeXp);
    await Promise.all([
      AsyncStorage.setItem('elevo_streak', String(newStreak)),
      AsyncStorage.setItem('elevo_last_log_date', newLastLogDate ?? ''),
      AsyncStorage.setItem('elevo_logged_today', JSON.stringify(newLoggedToday)),
      AsyncStorage.setItem('elevo_completions', JSON.stringify(newCompletions)),
      AsyncStorage.setItem('elevo_new_task_starts', JSON.stringify(updatedTaskStarts)),
      AsyncStorage.setItem('elevo_level', String(newLevel)),
      AsyncStorage.setItem('elevo_xp', String(finalXp)),
      AsyncStorage.setItem('elevo_lifetime_xp', String(newLifetimeXp)),
    ]);
  }, [loggedToday, lastLogDate, streak, completions, level, xp, lifetimeXp, newTaskStarts, archetype, subArchetype]);

  const xpProgress = Math.min(((xp ?? 0) / getXpForLevel((level ?? 1) + 1)) * 100, 100);

  const filteredCategories = useMemo(() => categories.map(category => ({
    ...category,
    activities: archetype
      ? category.activities.filter(a => activityArchetypes[a.name]?.includes(archetype))
      : category.activities,
  })).filter(category => category.activities.length > 0), [archetype]);

  const xpToday = useMemo(() => loggedToday.reduce((sum, name) => sum + (activityXp[name] ?? 0), 0), [loggedToday]);
  const allFilteredActivities = useMemo(() => filteredCategories.flatMap(c => c.activities), [filteredCategories]);
  const suggestedActivities = useMemo(() => allFilteredActivities.slice(0, 8), [allFilteredActivities]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Elevo</Text>
      </View>
      <View style={styles.xpCounter}>
        <Text style={styles.xpText}>Level {level ?? 1}</Text>
        <View style={styles.separator} />
        <Text style={styles.xpText}>{title}</Text>
        <View style={styles.separator} />
        <Text style={styles.xpText}>XP: {xp ?? 0}</Text>
      </View>
      <View style={styles.xpBarContainer}>
        <View style={[styles.xpBar, { width: `${xpProgress}%` }]} />
      </View>
      <Text style={styles.streakCounterText}>🔥 {streak ?? 0} day streak</Text>
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
                <Text style={styles.todayItemXp}>+{activityXp[name] ?? 0}</Text>
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
                  style={[styles.logButton, styles.logButtonMatch, done && styles.logButtonDone]}>
                  <TouchableOpacity
                    disabled={done}
                    style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                    onPress={() => handleLogActivity(activity.xp, activity.name)}>
                    <Text style={[styles.logButtonText, done && styles.logButtonTextDone]}>{activity.name}</Text>
                    <Text style={[styles.logButtonXp, done && styles.logButtonTextDone]}>
                      {activity.name === 'Misogi' ? '+5 Levels' : `+${activity.xp} XP`}
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
            {filteredCategories.map((category) => (
              <View key={category.title}>
                <Text style={styles.categoryHeader}>{category.title.toUpperCase()}</Text>
                {category.activities.map((activity) => {
                  const done = loggedToday.includes(activity.name);
                  return (
                    <View
                      key={activity.name}
                      style={[styles.logButton, styles.logButtonMatch, done && styles.logButtonDone]}>
                      <TouchableOpacity
                        disabled={done}
                        style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                        onPress={() => handleLogActivity(activity.xp, activity.name)}>
                        <Text style={[styles.logButtonText, done && styles.logButtonTextDone]}>{activity.name}</Text>
                        <Text style={[styles.logButtonXp, done && styles.logButtonTextDone]}>
                          {activity.name === 'Misogi' ? '+5 Levels' : `+${activity.xp} XP`}
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
  xpBarContainer: {
    marginHorizontal: 24,
    marginBottom: 10,
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
  streakCounterText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: 6,
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
});
