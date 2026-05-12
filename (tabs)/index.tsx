import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TITLES = ['Novice', 'Apprentice', 'Warrior'];

const activities = [
  { name: 'Workout', xp: 150 },
  { name: 'Read', xp: 75 },
  { name: 'Cold Shower', xp: 75 },
  { name: 'Sleep 8 hours', xp: 150 },
  { name: 'Meditation', xp: 75 },
  { name: "Daily RDI's hit", xp: 200 },
];

const activityArchetypes: Record<string, string[]> = {
  'Workout': ['Gymbro / Athlete'],
  'Read': ['Scholar', 'Monk', 'Entrepreneur'],
  'Cold Shower': ['Monk', 'Gymbro / Athlete', 'Healthy Guy'],
  'Sleep 8 hours': ['Healthy Guy', 'Gymbro / Athlete'],
  'Meditation': ['Monk', 'Healthy Guy', 'Entrepreneur'],
  "Daily RDI's hit": ['Healthy Guy', 'Gymbro / Athlete', 'Family Man', 'Looksmaxer'],
};

export default function HomeScreen() {
  const [xp, setXp] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const [lastLogDate, setLastLogDate] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [archetype, setArchetype] = useState<string | null>(null);
  const title = TITLES[(level ?? 1) - 1] || 'Legend';

  useFocusEffect(
    useCallback(() => {
      setLoaded(false);
      const loadData = async () => {
        const savedXp = await AsyncStorage.getItem('elevo_xp');
        const savedLevel = await AsyncStorage.getItem('elevo_level');
        const savedStreak = await AsyncStorage.getItem('elevo_streak');
        const savedLastLogDate = await AsyncStorage.getItem('elevo_last_log_date');
        const today = new Date().toISOString().split('T')[0];
        const savedArchetype = await AsyncStorage.getItem('elevo_archetype');
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        setXp(savedXp ? Math.round(Number(savedXp) / 5) * 5 : 0);
        setLevel(savedLevel ? Number(savedLevel) : 1);
        setLastLogDate(savedLastLogDate);
        if (savedLastLogDate && savedLastLogDate !== today && savedLastLogDate !== yesterday) {
          setStreak(0);
        } else {
          setStreak(savedStreak ? Number(savedStreak) : 0);
        }
        if (savedArchetype) setArchetype(savedArchetype);
        setLoaded(true);
      };
      loadData();
    }, [])
  );

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem('elevo_xp', String(xp));
    AsyncStorage.setItem('elevo_level', String(level));
    AsyncStorage.setItem('elevo_streak', String(streak));
    AsyncStorage.setItem('elevo_last_log_date', lastLogDate ?? '');
  }, [xp, level, streak, lastLogDate, loaded]);

  function getXpForLevel(level: number) {
    let baseLevelXp = 1500;
    let growthRate = 0.10;
    for (let levelNum = 2; levelNum < level; levelNum++) {
      baseLevelXp = baseLevelXp * (1 + growthRate);
      growthRate -= 0.0015;
      growthRate = Math.max(growthRate, 0.005);
    }
    return Math.round(baseLevelXp / 5) * 5;
  }

  function handleLogActivity(amount: number, activityName: string) {
    const today = new Date().toISOString().split('T')[0];
    if (lastLogDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      setStreak(lastLogDate === yesterday ? (prev => (prev ?? 0) + 1) : 1);
      setLastLogDate(today);
    }

    const isOnArchetype = archetype && activityArchetypes[activityName]?.includes(archetype);
    const multiplier = isOnArchetype ? 1.0 : 0.7;
    const adjustedAmount = Math.round(amount * multiplier);
    const newXp = (xp ?? 0) + adjustedAmount;
    const threshold = getXpForLevel((level ?? 1) + 1);
    if (newXp >= threshold) {
      setLevel((level ?? 1) + 1);
      setXp(newXp - threshold);
    } else {
      setXp(newXp);
    }
  }

  const xpProgress = Math.min(((xp ?? 0) / getXpForLevel((level ?? 1) + 1)) * 100, 100);

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
      <Text style={styles.activityTitleText}>Log Activity</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {activities.map((activity) => (
          <TouchableOpacity
            key={activity.name}
            style={styles.logButton}
            onPress={() => handleLogActivity(activity.xp, activity.name)}>
            <Text style={styles.logButtonText}>{activity.name}</Text>
            <Text style={styles.logButtonXp}>+{activity.xp} XP</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
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
    paddingBottom: 30,
    paddingTop: 20,
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
    marginBottom: 30,
    height: 12,
    backgroundColor: '#1e1e1e',
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpBar: {
    height: '100%',
    backgroundColor: '#c9a84c',
    borderRadius: 6,
  },
  logButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#c9a84c',
  },
  logButtonText: {
    color: '#e8e0cc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logButtonXp: {
    color: '#c9a84c',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityTitleText: {
    color: '#e8e0cc',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 24,
    marginBottom: 12,
  },
  horizontalLine: {
    backgroundColor: '#2a2a2a',
    height: 2,
    marginVertical: 12,
  },
  streakCounterText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: 10,
  },
});
