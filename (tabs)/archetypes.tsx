import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { archetypes, subArchetypes } from '../utils';

export default function ArchetypesScreen() {
  const [saved, setSaved] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);
  const [selectedSubArchetype, setSelectedSubArchetype] = useState<string | null>(null);
  const [subSaved, setSubSaved] = useState(false);
  const [selectedSideArchetypes, setSelectedSideArchetypes] = useState<string[]>([]);
  const [sideSaved, setSideSaved] = useState(false);

  const subs = selectedArchetype ? subArchetypes[selectedArchetype] : [];
  const hasSubArchetypes = subs.length > 0;

  useFocusEffect(
    useCallback(() => {
      const loadSaved = async () => {
        const [savedArchetype, savedSub, savedSide] = await Promise.all([
          AsyncStorage.getItem('elevo_archetype'),
          AsyncStorage.getItem('elevo_subarchetype'),
          AsyncStorage.getItem('elevo_side_archetypes'),
        ]);
        setSelectedArchetype(savedArchetype);
        setSelectedSubArchetype(savedSub);
        setSaved(!!savedArchetype);
        setSubSaved(!!savedSub);
        if (savedSide !== null) {
          setSelectedSideArchetypes(JSON.parse(savedSide) as string[]);
          setSideSaved(true);
        } else {
          setSideSaved(false);
        }
      };
      loadSaved();
    }, [])
  );

  const toggleSideArchetype = (name: string) => {
    setSelectedSideArchetypes(prev => {
      if (prev.includes(name)) return prev.filter(n => n !== name);
      if (prev.length >= 2) return prev;
      return [...prev, name];
    });
  };

  // Step 4: Done
  if (sideSaved) {
    return (
      <View style={styles.container}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={styles.title}>Elevo</Text>
          <Text style={styles.subtitle}>Path chosen</Text>
          <Text style={styles.archetypeLabel}>{selectedArchetype}</Text>
          {selectedSubArchetype && <Text style={styles.archetypeLabel}>{selectedSubArchetype}</Text>}
          {selectedSideArchetypes.length > 0 && (
            <Text style={styles.sideLabel}>+ {selectedSideArchetypes.join(' · ')}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={async () => {
            await AsyncStorage.multiRemove(['elevo_archetype', 'elevo_subarchetype', 'elevo_side_archetypes']);
            setSelectedArchetype(null);
            setSelectedSubArchetype(null);
            setSelectedSideArchetypes([]);
            setSaved(false);
            setSubSaved(false);
            setSideSaved(false);
          }}>
          <Text style={styles.confirmButtonText}>Change path</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Step 3: Side archetype picker
  if (subSaved || (saved && !hasSubArchetypes)) {
    const sideOptions = archetypes.filter(a => a.name !== selectedArchetype);
    return (
      <View style={styles.container}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={styles.title}>Elevo</Text>
          <Text style={styles.subtitle}>Add side paths (optional)</Text>
          <Text style={styles.archetypeLabel}>{selectedArchetype}</Text>
          <Text style={styles.sideHint}>Pick up to 2 · 0.9× multiplier on their tasks</Text>
        </View>
        <ScrollView>
          {sideOptions.map((a) => {
            const selected = selectedSideArchetypes.includes(a.name);
            const maxed = !selected && selectedSideArchetypes.length >= 2;
            return (
              <TouchableOpacity
                key={a.name}
                style={[
                  styles.archetypeBox,
                  selected && { borderColor: '#c9a84c', borderWidth: 2 },
                  maxed && { opacity: 0.4 },
                ]}
                onPress={() => { if (!maxed) toggleSideArchetype(a.name); }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.archetypeTitle}>{a.name}</Text>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.archetypeDescription}>{a.description}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={async () => {
            await AsyncStorage.setItem('elevo_side_archetypes', JSON.stringify(selectedSideArchetypes));
            setSideSaved(true);
          }}>
          <Text style={styles.confirmButtonText}>
            {selectedSideArchetypes.length === 0 ? 'Skip' : `Confirm (${selectedSideArchetypes.length} selected)`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Step 2: Sub-archetype picker
  if (saved && hasSubArchetypes && !subSaved) {
    return (
      <View style={styles.container}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={styles.title}>Elevo</Text>
          <Text style={styles.subtitle}>Choose your sub-path</Text>
          <Text style={styles.archetypeLabel}>{selectedArchetype}</Text>
        </View>
        <ScrollView>
          {subs.map((sub) => (
            <TouchableOpacity
              key={sub}
              style={[
                styles.archetypeBox,
                selectedSubArchetype === sub && { borderColor: '#c9a84c', borderWidth: 2 },
              ]}
              onPress={() => setSelectedSubArchetype(sub)}>
              <Text style={styles.archetypeTitle}>{sub}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {selectedSubArchetype && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={async () => {
              await AsyncStorage.setItem('elevo_subarchetype', selectedSubArchetype);
              setSubSaved(true);
            }}>
            <Text style={styles.confirmButtonText}>Confirm — {selectedSubArchetype}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Step 1: Main archetype picker
  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Text style={styles.title}>Elevo</Text>
        <Text style={styles.subtitle}>Choose your path</Text>
      </View>
      <ScrollView>
        {archetypes.map((archetype) => (
          <TouchableOpacity
            key={archetype.name}
            style={[
              styles.archetypeBox,
              selectedArchetype === archetype.name && { borderColor: '#c9a84c', borderWidth: 2 },
            ]}
            onPress={() => setSelectedArchetype(archetype.name)}>
            <Text style={styles.archetypeTitle}>{archetype.name}</Text>
            <Text style={styles.archetypeDescription}>{archetype.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedArchetype && (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={async () => {
            await AsyncStorage.setItem('elevo_archetype', selectedArchetype);
            setSaved(true);
          }}>
          <Text style={styles.confirmButtonText}>Confirm — {selectedArchetype}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  title: {
    color: '#c9a84c',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#5a5650',
    fontSize: 16,
    marginTop: 8,
  },
  archetypeLabel: {
    color: '#c9a84c',
    fontSize: 14,
    marginTop: 6,
  },
  sideLabel: {
    color: '#5a5650',
    fontSize: 13,
    marginTop: 4,
  },
  sideHint: {
    color: '#5a5650',
    fontSize: 12,
    marginTop: 4,
  },
  checkmark: {
    color: '#c9a84c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  archetypeBox: {
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e1e1e',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  archetypeTitle: {
    color: '#e8e0cc',
    fontSize: 15,
    fontWeight: 'bold',
  },
  archetypeDescription: {
    color: '#5a5650',
    fontSize: 13,
    marginTop: 2,
  },
  confirmButton: {
    margin: 16,
    backgroundColor: '#c9a84c',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#1e1e1e',
  },
  confirmButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
