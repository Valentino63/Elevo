import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { C, F } from '../../lib/tokens';

function SettingsRow({ label, value, onPress }: {
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress ? <Text style={styles.rowChevron}>›</Text> : null}
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
          <SettingsRow
            label="Privacy Policy"
            onPress={() => Linking.openURL('https://valentino63.github.io/Elevo/')}
          />
        </View>

        <SectionHeader title="SUPPORT" />
        <View style={styles.section}>
          <SettingsRow label="Send feedback" onPress={() => Alert.alert('Feedback', 'Coming soon.')} />
          <SettingsRow label="Report a bug" onPress={() => Alert.alert('Bug report', 'Coming soon.')} />
        </View>

        <View style={styles.dangerZone}>
          <SectionHeader title="DANGER ZONE" />
          <TouchableOpacity style={styles.dangerButton} onPress={handleFullReset}>
            <Text style={styles.dangerButtonText}>Full Reset</Text>
            <Text style={styles.dangerButtonSubtext}>Wipes levels, records, achievements</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    color: C.text,
    fontSize: 26,
    fontFamily: F.serif,
  },
  scroll: {
    paddingBottom: 60,
  },
  sectionHeader: {
    color: C.muted,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 28,
    marginBottom: 4,
    marginHorizontal: 24,
  },
  section: {
    backgroundColor: C.card,
    borderRadius: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLabel: {
    color: C.text,
    fontSize: 15,
    flex: 1,
  },
  rowValue: {
    color: C.gold,
    fontSize: 14,
    marginRight: 8,
  },
  rowChevron: {
    color: C.gold,
    fontSize: 20,
  },
  dangerZone: {
    marginTop: 44,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  dangerButton: {
    marginHorizontal: 16,
    backgroundColor: '#2a0e0e',
    borderWidth: 1,
    borderColor: '#3a1414',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#e05555',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerButtonSubtext: {
    color: '#8a5555',
    fontSize: 12,
    marginTop: 4,
  },
});