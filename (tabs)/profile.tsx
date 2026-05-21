import { StyleSheet, Text, View } from 'react-native';
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

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const savedUsername = await AsyncStorage.getItem('elevo_username');
        const savedLevel = await AsyncStorage.getItem('elevo_level');
        const savedXp = await AsyncStorage.getItem('elevo_xp');
        const savedArchetype = await AsyncStorage.getItem('elevo_archetype');
        const savedSubArchetype = await AsyncStorage.getItem('elevo_subarchetype');
        const savedStreak = await AsyncStorage.getItem('elevo_streak');
        setUsername(savedUsername || 'JohnDoe');
        setLevel(savedLevel ? Number(savedLevel) : 1);
        setXp(savedXp ? Number(savedXp) : 0);
        setArchetype(savedArchetype || '');
        setSubArchetype(savedSubArchetype || '');
        setStreak(savedStreak ? Number(savedStreak) : 0);
      };
      loadData();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{username.charAt(0)}</Text>
      </View>
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.stat}>Archetype: {archetype || 'None'}{subArchetype ? ` · ${subArchetype}` : ''}</Text>
      <Text style={styles.streak}>🔥 {streak} day streak</Text>
      <Text style={styles.stat}>Level: {level} · {getTitle(level)}</Text>
      <Text style={styles.stat}>XP: {xp} / {getXpForLevel(level + 1)}</Text>
      <View style={styles.xpBarContainer}>
        <View style={[styles.xpBar, { width: `${Math.min((xp / getXpForLevel(level + 1)) * 100, 100)}%` }]} />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  username: {
    color: '#c9a84c',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stat: {
    color: '#e8e0cc',
    fontSize: 16,
    marginBottom: 8,
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
    marginBottom: 16,
},
  avatarText: {
    color: '#c9a84c',
    fontSize: 28,
    fontWeight: 'bold',
  },
  streak: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  xpBarContainer: {
    width: '70%',
    height: 12,
    backgroundColor: '#1e1e1e',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 8,
  },
  xpBar: {
    height: '100%',
    backgroundColor: '#c9a84c',
    borderRadius: 6,
  },
});