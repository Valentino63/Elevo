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
import { getTitle } from '../lib/utils';
import { C, F } from '../lib/tokens';

const SPINE_TITLES = [
  'New Beginning',
  'Gaining Momentum',
  'Locked In',
  'Building a New Life',
  'Leveled Up',
  'The One Who Never Quit',
] as const;

export default function AchievementsScreen() {
  const router = useRouter();
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [level, setLevel] = useState(1);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        AsyncStorage.getItem('elevo_unlocked_achievements'),
        AsyncStorage.getItem('elevo_level'),
      ]).then(([raw, savedLevel]) => {
        setUnlockedIds(raw ? JSON.parse(raw) : []);
        setLevel(parseInt(savedLevel ?? '1') || 1);
      });
    }, [])
  );

  const total = ACHIEVEMENTS.length;
  const unlockedCount = ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id)).length;
  const currentTitle = getTitle(level);

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

      <View style={styles.spine}>
        {SPINE_TITLES.map((title, i) => {
          const isCurrent = title === currentTitle;
          return (
            <View key={title} style={styles.spineItem}>
              <Text style={[styles.spineText, isCurrent && styles.spineTextCurrent]}>
                {title}
              </Text>
              {i < SPINE_TITLES.length - 1 && <Text style={styles.spineArrow}>→</Text>}
            </View>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {CATEGORY_ORDER.map(cat => (
          <View key={cat} style={styles.section}>
            <Text style={styles.sectionHeader}>{CATEGORY_LABELS[cat].toUpperCase()}</Text>
            <View style={styles.grid}>
              {[...byCategory[cat]]
                .sort((a, b) => Number(unlockedIds.includes(b.id)) - Number(unlockedIds.includes(a.id)))
                .map(achievement => {
                const unlocked = unlockedIds.includes(achievement.id);
                const hiddenLocked = achievement.hidden === true && !unlocked;
                return (
                  <View
                    key={achievement.id}
                    style={[styles.badge, unlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
                    <Ionicons
                      name={unlocked ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={unlocked ? C.gold : C.faint}
                      style={styles.badgeIcon}
                    />
                    <Text style={[styles.badgeTitle, !unlocked && styles.dimText]}>
                      {hiddenLocked ? '??? — Hidden' : achievement.title}
                    </Text>
                    {!hiddenLocked && (
                      <Text style={[styles.badgeDesc, !unlocked && styles.dimDesc]} numberOfLines={3}>
                        {achievement.description}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  backText: { color: C.gold, fontSize: 22 },
  headerTitle: { color: C.text, fontSize: 20, fontFamily: F.serif },
  summary: {
    color: C.muted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
  spine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 4,
  },
  spineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spineText: {
    color: C.faint,
    fontSize: 11,
  },
  spineTextCurrent: {
    color: C.gold,
    fontFamily: F.serif,
    fontSize: 13,
    fontWeight: '700',
  },
  spineArrow: {
    color: C.faint,
    fontSize: 11,
  },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionHeader: {
    color: C.gold,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    width: '47%',
    backgroundColor: C.card,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  badgeUnlocked: {
    borderColor: C.gold,
    shadowColor: C.gold,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  badgeLocked: {
    borderColor: C.border,
  },
  badgeIcon: { marginBottom: 8 },
  badgeTitle: { color: C.text, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  badgeDesc: { color: C.muted, fontSize: 11, lineHeight: 15 },
  dimText: { color: C.faint },
  dimDesc: { color: C.faint },
});
