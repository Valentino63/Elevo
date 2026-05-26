import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getTitle, getXpForLevel } from '../utils';

export default function ProfileScreen() {
  const [username, setUsername] = useState('');
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [archetype, setArchetype] = useState('');
  const [subArchetype, setSubArchetype] = useState('');
  const [streak, setStreak] = useState(0);
  const [completions, setCompletions] = useState<Record<string, number>>({});
  const [joinDate, setJoinDate] = useState('');
  const [lifetimeXp, setLifetimeXp] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const [
          savedUsername, savedLevel, savedXp, savedArchetype, savedSubArchetype,
          savedStreak, savedCompletions, savedLifetimeXp, rawJoinDate,
        ] = await Promise.all([
          AsyncStorage.getItem('elevo_username'),
          AsyncStorage.getItem('elevo_level'),
          AsyncStorage.getItem('elevo_xp'),
          AsyncStorage.getItem('elevo_archetype'),
          AsyncStorage.getItem('elevo_subarchetype'),
          AsyncStorage.getItem('elevo_streak'),
          AsyncStorage.getItem('elevo_completions'),
          AsyncStorage.getItem('elevo_lifetime_xp'),
          AsyncStorage.getItem('elevo_join_date'),
        ]);

        let savedJoinDate = rawJoinDate;
        if (!savedJoinDate) {
          savedJoinDate = new Date().toISOString().split('T')[0];
          await AsyncStorage.setItem('elevo_join_date', savedJoinDate);
        }

        setUsername(savedUsername || '');
        setLevel(savedLevel ? Number(savedLevel) : 1);
        setXp(savedXp ? Number(savedXp) : 0);
        setArchetype(savedArchetype || '');
        setSubArchetype(savedSubArchetype || '');
        setStreak(savedStreak ? Number(savedStreak) : 0);
        setCompletions(savedCompletions ? JSON.parse(savedCompletions) : {});
        setJoinDate(savedJoinDate);
        setLifetimeXp(savedLifetimeXp ? Number(savedLifetimeXp) : 0);
      };
      loadData();
    }, [])
  );

  const totalTasksLogged = Object.values(completions).reduce((a, b) => a + b, 0);
  const mostLoggedTask = Object.entries(completions).sort((a, b) => b[1] - a[1])[0];
  const xpProgress = Math.min((xp / getXpForLevel(level + 1)) * 100, 100);

  const formatJoinDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => Alert.prompt(
          'Set Username',
          'Enter your username',
          (newUsername) => {
            const trimmed = newUsername?.trim();
            if (trimmed) {
              AsyncStorage.setItem('elevo_username', trimmed);
              setUsername(trimmed);
            }
          },
          'plain-text',
          username,
        )}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{username ? username.charAt(0).toUpperCase() : '?'}</Text>
        </View>
        {username ? (
          <Text style={styles.username}>{username}</Text>
        ) : (
          <Text style={styles.usernamePlaceholder}>Tap to set username</Text>
        )}
        {joinDate ? (
          <Text style={styles.joinDate}>Member since {formatJoinDate(joinDate)}</Text>
        ) : null}
      </TouchableOpacity>

      {/* Level + XP */}
      <View style={styles.card}>
        <View style={styles.levelRow}>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.titleText}>{getTitle(level)}</Text>
        </View>
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBar, { width: `${xpProgress}%` }]} />
        </View>
        <Text style={styles.xpLabel}>{xp} / {getXpForLevel(level + 1)} XP to next level</Text>
      </View>

      {/* Streak + Archetype */}
      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardLabel}>STREAK</Text>
          <Text style={styles.cardValueOrange}>🔥 {streak}</Text>
          <Text style={styles.cardSub}>days</Text>
        </View>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardLabel}>PATH</Text>
          <Text style={styles.cardValue}>{archetype || '—'}</Text>
          {subArchetype ? <Text style={styles.cardSub}>{subArchetype}</Text> : null}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardLabel}>TOTAL XP</Text>
          <Text style={styles.cardValue}>{lifetimeXp.toLocaleString()}</Text>
          <Text style={styles.cardSub}>lifetime</Text>
        </View>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardLabel}>ACTIONS</Text>
          <Text style={styles.cardValue}>{totalTasksLogged}</Text>
          <Text style={styles.cardSub}>logged total</Text>
        </View>
      </View>

      {/* Most consistent habit */}
      {mostLoggedTask && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>MOST CONSISTENT HABIT</Text>
          <Text style={styles.habitName}>{mostLoggedTask[0]}</Text>
          <Text style={styles.cardSub}>{mostLoggedTask[1]} times logged</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e1e1e',
    borderWidth: 2,
    borderColor: '#c9a84c',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#c9a84c',
    fontSize: 28,
    fontWeight: 'bold',
  },
  username: {
    color: '#c9a84c',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  joinDate: {
    color: '#5a5650',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e1e1e',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  halfCard: {
    flex: 1,
    marginBottom: 12,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelText: {
    color: '#e8e0cc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleText: {
    color: '#c9a84c',
    fontSize: 13,
    fontWeight: 'bold',
  },
  xpBarContainer: {
    height: 8,
    backgroundColor: '#1e1e1e',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpBar: {
    height: '100%',
    backgroundColor: '#c9a84c',
    borderRadius: 6,
  },
  xpLabel: {
    color: '#5a5650',
    fontSize: 12,
    textAlign: 'right',
  },
  cardLabel: {
    color: '#5a5650',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  cardValue: {
    color: '#e8e0cc',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardValueOrange: {
    color: '#FF6B35',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardSub: {
    color: '#5a5650',
    fontSize: 12,
  },
  habitName: {
    color: '#e8e0cc',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 4,
  },
  usernamePlaceholder: {
    color: '#5a5650',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});