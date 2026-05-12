import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TITLES = ['Novice', 'Apprentice', 'Warrior'];

type Activity = { name: string; xp: number; freq: 'Daily' | 'Weekly' | 'Monthly' | 'Annual' };
type Category = { title: string; activities: Activity[] };

const categories: Category[] = [
  {
    title: 'Morning',
    activities: [
      { name: 'Wake up when said without fuss', xp: 25, freq: 'Daily' },
      { name: 'No phone for 60 min after waking', xp: 75, freq: 'Daily' },
      { name: 'Delay coffee 90 min after waking', xp: 25, freq: 'Daily' },
      { name: 'Morning routine (water, light exercise, skincare)', xp: 75, freq: 'Daily' },
      { name: 'Nutrient dense breakfast', xp: 25, freq: 'Daily' },
    ],
  },
  {
    title: 'Nutrition',
    activities: [
      { name: 'At least 3L of water', xp: 25, freq: 'Daily' },
      { name: 'Hit daily protein and calories', xp: 75, freq: 'Daily' },
      { name: 'Eating healthy (no sugar, no processed, RDIs)', xp: 200, freq: 'Daily' },
      { name: 'Taking supplements', xp: 25, freq: 'Daily' },
      { name: 'Debloat protocol', xp: 75, freq: 'Daily' },
    ],
  },
  {
    title: 'Physical',
    activities: [
      { name: 'Any form of cardio', xp: 150, freq: 'Daily' },
      { name: 'Training (weights/calisthenics/plyometrics)', xp: 150, freq: 'Daily' },
      { name: 'Gym rest day', xp: 75, freq: 'Daily' },
      { name: 'Stretching', xp: 75, freq: 'Daily' },
      { name: 'Cold shower', xp: 75, freq: 'Daily' },
      { name: 'Sauna', xp: 75, freq: 'Daily' },
      { name: 'Going for a walk', xp: 25, freq: 'Daily' },
      { name: 'Digestive walk', xp: 25, freq: 'Daily' },
      { name: 'Good posture', xp: 200, freq: 'Daily' },
    ],
  },
  {
    title: 'Appearance',
    activities: [
      { name: 'Skincare routine', xp: 25, freq: 'Daily' },
      { name: 'Mewing', xp: 200, freq: 'Daily' },
      { name: 'Mouth taping', xp: 25, freq: 'Daily' },
      { name: 'At least 30 min sunlight (with SPF)', xp: 25, freq: 'Daily' },
    ],
  },
  {
    title: 'Mind & Learning',
    activities: [
      { name: 'Working in deep focus (1hr minimum)', xp: 150, freq: 'Daily' },
      { name: 'Learning (general)', xp: 75, freq: 'Daily' },
      { name: 'Learn something directly applicable to business', xp: 150, freq: 'Daily' },
      { name: 'Study session', xp: 150, freq: 'Daily' },
      { name: 'Learn a new skill (15 min minimum)', xp: 75, freq: 'Daily' },
      { name: 'Reading (15 min or 10 pages minimum)', xp: 75, freq: 'Daily' },
      { name: 'Listening to a podcast (30 min minimum)', xp: 75, freq: 'Daily' },
      { name: 'Active recall / flashcard session', xp: 75, freq: 'Daily' },
      { name: 'Teach someone what you learned today', xp: 75, freq: 'Daily' },
      { name: 'Write a summary of what you studied', xp: 75, freq: 'Daily' },
      { name: 'Language practice session', xp: 75, freq: 'Daily' },
      { name: 'Solve a problem from scratch', xp: 150, freq: 'Daily' },
    ],
  },
  {
    title: 'Habits & Discipline',
    activities: [
      { name: 'No lustful behaviours', xp: 200, freq: 'Daily' },
      { name: 'No unnecessary social media', xp: 200, freq: 'Daily' },
      { name: 'Not on phone too much', xp: 200, freq: 'Daily' },
      { name: 'Doing something you hate daily', xp: 150, freq: 'Daily' },
      { name: 'View sunset', xp: 25, freq: 'Daily' },
    ],
  },
  {
    title: 'Mind & Reflection',
    activities: [
      { name: 'Meditating/NSDR/breathing exercises', xp: 75, freq: 'Daily' },
      { name: 'Sit in silence 10 min', xp: 25, freq: 'Daily' },
      { name: 'Journal', xp: 75, freq: 'Daily' },
      { name: 'Doing something creative', xp: 75, freq: 'Daily' },
      { name: 'Think before speaking (end of day reflection)', xp: 200, freq: 'Daily' },
      { name: 'Standing for your morals (end of day reflection)', xp: 200, freq: 'Daily' },
      { name: 'Being grounded (end of day reflection)', xp: 200, freq: 'Daily' },
      { name: 'Be content with yourself (end of day reflection)', xp: 200, freq: 'Daily' },
    ],
  },
  {
    title: 'Social',
    activities: [
      { name: 'Being social', xp: 75, freq: 'Daily' },
      { name: 'Initiate a conversation with a stranger', xp: 150, freq: 'Daily' },
      { name: 'Give someone a genuine compliment', xp: 25, freq: 'Daily' },
      { name: 'Organise or attend a social event', xp: 150, freq: 'Daily' },
      { name: "Call or meet a friend you haven't spoken to in a while", xp: 75, freq: 'Daily' },
      { name: 'Practice public speaking (mirror/recording)', xp: 150, freq: 'Daily' },
      { name: 'Active listening — full presence, no phone', xp: 75, freq: 'Daily' },
      { name: 'Do something kind without expecting anything', xp: 75, freq: 'Daily' },
      { name: 'Networking', xp: 150, freq: 'Daily' },
    ],
  },
  {
    title: 'Family',
    activities: [
      { name: 'Spend quality time with family (no phones)', xp: 150, freq: 'Daily' },
      { name: 'Have a meaningful conversation with a family member', xp: 75, freq: 'Daily' },
      { name: 'Plan a family activity', xp: 75, freq: 'Daily' },
      { name: 'Financial planning session', xp: 150, freq: 'Daily' },
      { name: 'Tell someone you love them', xp: 25, freq: 'Daily' },
    ],
  },
  {
    title: 'Creator',
    activities: [
      { name: 'Publish something (post, video, article)', xp: 150, freq: 'Daily' },
      { name: 'Brainstorm session (15 min minimum)', xp: 75, freq: 'Daily' },
      { name: "Study someone you admire's work", xp: 75, freq: 'Daily' },
      { name: 'Engage with your audience', xp: 75, freq: 'Daily' },
      { name: 'Batch content creation session (1hr minimum)', xp: 150, freq: 'Daily' },
      { name: 'Seek feedback on your work', xp: 75, freq: 'Daily' },
    ],
  },
  {
    title: 'Entrepreneur',
    activities: [
      { name: 'Review finances/business metrics', xp: 75, freq: 'Daily' },
      { name: 'Outreach to a potential client or collaborator', xp: 150, freq: 'Daily' },
      { name: 'Work on the business not in it (30min strategic)', xp: 150, freq: 'Daily' },
      { name: 'Sales or negotiation practice', xp: 150, freq: 'Daily' },
    ],
  },
  {
    title: 'Weekly',
    activities: [
      { name: '1 hour silence', xp: 150, freq: 'Weekly' },
    ],
  },
  {
    title: 'Monthly',
    activities: [
      { name: '1 day fast', xp: 750, freq: 'Monthly' },
      { name: 'Skill audit', xp: 750, freq: 'Monthly' },
    ],
  },
  {
    title: 'Annual',
    activities: [
      { name: 'Misogi', xp: 150, freq: 'Annual' },
      { name: "New Year's review", xp: 500, freq: 'Annual' },
      { name: '1 week total digital detox', xp: 1000, freq: 'Annual' },
    ],
  },
];

const ALL = ['Healthy Guy', 'Gymbro / Athlete', 'Entrepreneur', 'Scholar', 'Creator', 'Monk', 'Social Guy', 'Family Man', 'Looksmaxer', 'Jack of All Trades'];

const activityArchetypes: Record<string, string[]> = {
  'Wake up when said without fuss': ALL,
  'No phone for 60 min after waking': ['Monk', 'Entrepreneur', 'Scholar', 'Healthy Guy'],
  'Delay coffee 90 min after waking': ['Healthy Guy', 'Monk', 'Entrepreneur'],
  'Morning routine (water, light exercise, skincare)': ALL,
  'Nutrient dense breakfast': ['Healthy Guy', 'Gymbro / Athlete', 'Looksmaxer'],
  'At least 3L of water': ['Healthy Guy', 'Gymbro / Athlete', 'Looksmaxer'],
  'Hit daily protein and calories': ['Gymbro / Athlete', 'Healthy Guy'],
  'Eating healthy (no sugar, no processed, RDIs)': ['Healthy Guy', 'Gymbro / Athlete', 'Family Man', 'Looksmaxer'],
  'Taking supplements': ['Gymbro / Athlete', 'Healthy Guy', 'Looksmaxer'],
  'Debloat protocol': ['Healthy Guy', 'Looksmaxer'],
  'Any form of cardio': ['Gymbro / Athlete', 'Healthy Guy', 'Family Man', 'Looksmaxer'],
  'Training (weights/calisthenics/plyometrics)': ['Gymbro / Athlete'],
  'Gym rest day': ['Gymbro / Athlete', 'Healthy Guy', 'Looksmaxer'],
  'Stretching': ['Gymbro / Athlete', 'Healthy Guy', 'Monk'],
  'Cold shower': ['Monk', 'Gymbro / Athlete', 'Healthy Guy'],
  'Sauna': ['Gymbro / Athlete', 'Healthy Guy', 'Monk'],
  'Going for a walk': ['Healthy Guy', 'Monk', 'Family Man', 'Looksmaxer', 'Gymbro / Athlete'],
  'Digestive walk': ['Healthy Guy', 'Looksmaxer'],
  'Good posture': ['Looksmaxer', 'Gymbro / Athlete', 'Healthy Guy'],
  'Skincare routine': ['Looksmaxer', 'Healthy Guy'],
  'Mewing': ['Looksmaxer'],
  'Mouth taping': ['Looksmaxer', 'Healthy Guy', 'Monk'],
  'At least 30 min sunlight (with SPF)': ['Healthy Guy', 'Looksmaxer'],
  'Working in deep focus (1hr minimum)': ['Entrepreneur', 'Scholar', 'Creator'],
  'Learning (general)': ['Jack of All Trades', 'Healthy Guy', 'Gymbro / Athlete', 'Monk', 'Family Man', 'Looksmaxer'],
  'Learn something directly applicable to business': ['Entrepreneur'],
  'Study session': ['Scholar'],
  'Learn a new skill (15 min minimum)': ['Jack of All Trades', 'Entrepreneur', 'Creator', 'Monk', 'Social Guy'],
  'Reading (15 min or 10 pages minimum)': ['Scholar', 'Monk', 'Entrepreneur'],
  'Listening to a podcast (30 min minimum)': ['Scholar', 'Entrepreneur', 'Creator'],
  'Active recall / flashcard session': ['Scholar'],
  'Teach someone what you learned today': ['Scholar'],
  'Write a summary of what you studied': ['Scholar'],
  'Language practice session': ['Scholar'],
  'Solve a problem from scratch': ['Scholar'],
  'No lustful behaviours': ALL,
  'No unnecessary social media': ['Healthy Guy', 'Scholar'],
  'Not on phone too much': ['Healthy Guy', 'Scholar'],
  'Doing something you hate daily': ['Entrepreneur', 'Gymbro / Athlete', 'Monk', 'Scholar'],
  'View sunset': ['Monk', 'Creator', 'Healthy Guy'],
  'Meditating/NSDR/breathing exercises': ['Monk', 'Healthy Guy', 'Entrepreneur'],
  'Sit in silence 10 min': ['Monk', 'Scholar', 'Entrepreneur'],
  'Journal': ['Monk', 'Scholar', 'Creator', 'Entrepreneur'],
  'Doing something creative': ['Creator', 'Jack of All Trades'],
  'Think before speaking (end of day reflection)': ['Monk', 'Social Guy', 'Family Man'],
  'Standing for your morals (end of day reflection)': ['Monk', 'Family Man', 'Social Guy'],
  'Being grounded (end of day reflection)': ['Monk', 'Family Man'],
  'Be content with yourself (end of day reflection)': ['Monk', 'Healthy Guy'],
  'Being social': ['Social Guy', 'Family Man'],
  'Initiate a conversation with a stranger': ['Social Guy'],
  'Give someone a genuine compliment': ['Social Guy', 'Family Man'],
  'Organise or attend a social event': ['Social Guy', 'Family Man'],
  "Call or meet a friend you haven't spoken to in a while": ['Social Guy', 'Family Man'],
  'Practice public speaking (mirror/recording)': ['Social Guy', 'Entrepreneur'],
  'Active listening — full presence, no phone': ['Social Guy', 'Family Man', 'Monk'],
  'Do something kind without expecting anything': ['Social Guy', 'Family Man', 'Monk'],
  'Networking': ['Entrepreneur'],
  'Spend quality time with family (no phones)': ['Family Man'],
  'Have a meaningful conversation with a family member': ['Family Man'],
  'Plan a family activity': ['Family Man'],
  'Financial planning session': ['Family Man', 'Entrepreneur'],
  'Tell someone you love them': ['Family Man'],
  'Publish something (post, video, article)': ['Creator'],
  'Brainstorm session (15 min minimum)': ['Creator', 'Entrepreneur'],
  "Study someone you admire's work": ['Creator', 'Scholar'],
  'Engage with your audience': ['Creator'],
  'Batch content creation session (1hr minimum)': ['Creator'],
  'Seek feedback on your work': ['Creator', 'Entrepreneur'],
  'Review finances/business metrics': ['Entrepreneur'],
  'Outreach to a potential client or collaborator': ['Entrepreneur'],
  'Work on the business not in it (30min strategic)': ['Entrepreneur'],
  'Sales or negotiation practice': ['Entrepreneur'],
  '1 hour silence': ['Monk', 'Entrepreneur'],
  '1 day fast': ['Monk', 'Healthy Guy'],
  'Skill audit': ['Entrepreneur', 'Scholar', 'Jack of All Trades'],
  'Misogi': ALL,
  "New Year's review": ALL,
  '1 week total digital detox': ['Monk', 'Healthy Guy', 'Entrepreneur'],
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
        const savedArchetype = await AsyncStorage.getItem('elevo_archetype');
        const today = new Date().toISOString().split('T')[0];
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
    if (activityName === 'Misogi') {
      setLevel((level ?? 1) + 5);
      setXp(0);
      return;
    }
    const isOnArchetype = archetype && activityArchetypes[activityName]?.includes(archetype);
    const adjustedAmount = Math.round(amount * (isOnArchetype ? 1.0 : 0.7));
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

  const filteredCategories = categories.map(category => ({
    ...category,
    activities: archetype
      ? category.activities.filter(a => activityArchetypes[a.name]?.includes(archetype))
      : category.activities,
  })).filter(category => category.activities.length > 0);

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
        {filteredCategories.map((category) => (
          <View key={category.title}>
            <Text style={styles.categoryHeader}>{category.title.toUpperCase()}</Text>
            {category.activities.map((activity) => {
              const isMatch = archetype && activityArchetypes[activity.name]?.includes(archetype);
              return (
                <TouchableOpacity
                  key={activity.name}
                  style={[styles.logButton, styles.logButtonMatch]}
                  onPress={() => handleLogActivity(activity.xp, activity.name)}>
                  <Text style={styles.logButtonText}>{activity.name}</Text>
                  <Text style={styles.logButtonXp}>+{activity.xp} XP</Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
    paddingVertical: 12,
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
  activityTitleText: {
    color: '#e8e0cc',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 24,
    marginBottom: 4,
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
