import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ACHIEVEMENTS,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  type AchievementCategory,
} from '../lib/achievements';

export default function AchievementsScreen() {
  const router = useRouter();
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('elevo_unlocked_achievements').then(raw => {
        setUnlockedIds(raw ? JSON.parse(raw) : []);
      });
    }, [])
  );

  const total = ACHIEVEMENTS.length;
  const unlockedCount = ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id)).length;

  const byCategory = CATEGORY_ORDER.reduce<Record<AchievementCategory, typeof ACHIEVEMENTS>>(
    (acc, cat) => {
      acc[cat] = ACHIEVEMENTS.filter(a => a.category === cat);
      return acc;
    },
    {} as Record<AchievementCategory, typeof ACHIEVEMENTS>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.summary}>{unlockedCount} of {total} unlocked</Text>

      <ScrollView contentContainerStyle={styles.content}>
        {CATEGORY_ORDER.map(cat => (
          <View key={cat} style={styles.section}>
            <Text style={styles.sectionHeader}>{CATEGORY_LABELS[cat].toUpperCase()}</Text>
            {byCategory[cat].map(achievement => {
              const unlocked = unlockedIds.includes(achievement.id);
              return (
                <View
                  key={achievement.id}
                  style={[styles.card, unlocked && styles.cardUnlocked]}>
                  <View style={styles.cardLeft}>
                    <Ionicons
                      name={unlocked ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={unlocked ? '#c9a84c' : '#2a2a2a'}
                    />
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={[styles.cardTitle, !unlocked && styles.dimText]}>
                      {achievement.title}
                    </Text>
                    <Text style={[styles.cardDesc, !unlocked && styles.dimDesc]}>
                      {achievement.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  backText: { color: '#c9a84c', fontSize: 22 },
  headerTitle: { color: '#c9a84c', fontSize: 18, fontWeight: 'bold' },
  summary: {
    color: '#5a5650',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionHeader: {
    color: '#c9a84c',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  cardUnlocked: { backgroundColor: '#1a1610' },
  cardLeft: { width: 24, alignItems: 'center' },
  cardRight: { flex: 1 },
  cardTitle: { color: '#e8e0cc', fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  cardDesc: { color: '#5a5650', fontSize: 12, lineHeight: 18 },
  dimText: { color: '#5a5650' },
  dimDesc: { color: '#3a3a3a' },
});
