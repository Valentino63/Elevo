import { StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';



const TITLES = ['Novice', 'Apprentice', 'Warrior'];

export default function ProfileScreen() {
  const [username, setUsername] = useState('');
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const loadData = async () => {
  const savedUsername = await AsyncStorage.getItem('elevo_username');
  const savedLevel = await AsyncStorage.getItem('elevo_level');
  const savedXp = await AsyncStorage.getItem('elevo_xp');
  setUsername(savedUsername || 'JohnDoe');
  setLevel(savedLevel ? Number(savedLevel) : 1);
  setXp(savedXp ? Number(savedXp) : 0);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{username.charAt(0)}</Text>
      </View>
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.stat}>Level: {level}</Text>
      <Text style={styles.stat}>Title: {TITLES[level - 1] || 'Legend'}</Text>
      <Text style={styles.stat}>XP: {xp}</Text>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
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
});