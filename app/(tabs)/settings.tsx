import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

function SettingsRow({ label, value, onPress, danger }: {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress && !danger ? <Text style={styles.rowChevron}>›</Text> : null}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const [username, setUsername] = useState('');
  const [archetype, setArchetype] = useState('');
  const [subArchetype, setSubArchetype] = useState('');
  const [sideArchetypes, setSideArchetypes] = useState<string[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const [savedUsername, savedArchetype, savedSubArchetype, savedSide] = await Promise.all([
          AsyncStorage.getItem('elevo_username'),
          AsyncStorage.getItem('elevo_archetype'),
          AsyncStorage.getItem('elevo_subarchetype'),
          AsyncStorage.getItem('elevo_side_archetypes'),
        ]);
        if (savedUsername) setUsername(savedUsername);
        if (savedArchetype) setArchetype(savedArchetype);
        if (savedSubArchetype) setSubArchetype(savedSubArchetype);
        setSideArchetypes(savedSide ? JSON.parse(savedSide) : []);
      };
      loadData();
    }, [])
  );

  const handleChangeUsername = () => {
    Alert.prompt(
      'Change Username',
      'Enter new username',
      (newUsername) => {
        if (newUsername?.trim()) {
          AsyncStorage.setItem('elevo_username', newUsername.trim());
          setUsername(newUsername.trim());
        }
      },
      'plain-text',
      username
    );
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Clears XP, level, streak, and activity logs. Keeps your username, archetype, and onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Progress', style: 'destructive', onPress: async () => {
            const PROGRESS_KEYS = [
              'elevo_xp', 'elevo_level', 'elevo_streak',
              'elevo_last_log_date', 'elevo_logged_today',
              'elevo_completions', 'elevo_new_task_starts',
              'elevo_workout_history', 'elevo_records',
              'elevo_lifetime_xp', 'elevo_earned_xp',
            ];
            await AsyncStorage.multiRemove(PROGRESS_KEYS);
          },
        },
      ]
    );
  };

  const handleFullReset = () => {
    Alert.alert(
      'Full Reset',
      'Deletes everything. Onboarding will restart on next launch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Full Reset', style: 'destructive', onPress: async () => {
            await AsyncStorage.clear();
            setUsername('');
            setArchetype('');
            setSubArchetype('');
            setSideArchetypes([]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>

        <SectionHeader title="ACCOUNT" />
        <View style={styles.section}>
          <SettingsRow label="Username" value={username || 'Not set'} onPress={handleChangeUsername} />
        </View>

        <SectionHeader title="PATH" />
        <View style={styles.section}>
          <SettingsRow
            label="Archetype"
            value={archetype || 'Not set'}
            onPress={() => router.push('/(tabs)/archetypes')}
          />
          {subArchetype && subArchetype !== 'none' ? (
            <SettingsRow
              label="Sub-archetype"
              value={subArchetype}
              onPress={async () => {
                await AsyncStorage.multiRemove(['elevo_subarchetype', 'elevo_side_archetypes']);
                setSubArchetype('');
                setSideArchetypes([]);
                router.push('/(tabs)/archetypes');
              }}
            />
          ) : null}
          <SettingsRow
            label="Side paths"
            value={sideArchetypes.length > 0 ? sideArchetypes.join(', ') : 'None'}
            onPress={async () => {
              await AsyncStorage.removeItem('elevo_side_archetypes');
              setSideArchetypes([]);
              router.push('/(tabs)/archetypes');
            }}
          />
        </View>

        <SectionHeader title="APPEARANCE" />
        <View style={styles.section}>
          <SettingsRow label="Theme" value="Dark" />
        </View>

        <SectionHeader title="APP" />
        <View style={styles.section}>
          <SettingsRow label="Version" value="0.1.0" />
        </View>

        <SectionHeader title="SUPPORT" />
        <View style={styles.section}>
          <SettingsRow label="Send feedback" onPress={() => Alert.alert('Feedback', 'Coming soon.')} />
          <SettingsRow label="Report a bug" onPress={() => Alert.alert('Bug report', 'Coming soon.')} />
        </View>

        <SectionHeader title="DANGER ZONE" />
        <View style={styles.section}>
          <SettingsRow label="Reset Progress" onPress={handleResetProgress} danger />
          <SettingsRow label="Full Reset" onPress={handleFullReset} danger />
        </View>

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
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  headerTitle: {
    color: '#e8e0cc',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scroll: {
    paddingBottom: 60,
  },
  sectionHeader: {
    color: '#5a5650',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 28,
    marginBottom: 4,
    marginHorizontal: 24,
  },
  section: {
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLabel: {
    color: '#e8e0cc',
    fontSize: 15,
    flex: 1,
  },
  rowLabelDanger: {
    color: '#e05555',
  },
  rowValue: {
    color: '#5a5650',
    fontSize: 14,
    marginRight: 8,
  },
  rowChevron: {
    color: '#5a5650',
    fontSize: 20,
  },
});