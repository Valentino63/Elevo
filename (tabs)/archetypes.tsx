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
  const subs = selectedArchetype ? subArchetypes[selectedArchetype] : [];
  const hasSubArchetypes = subs.length > 0;

  const saveArchetype = async (archetype: string) => {
    await AsyncStorage.setItem('elevo_archetype', archetype);
  };

  const saveSubArchetype = async (subArchetype: string) => {
    await AsyncStorage.setItem('elevo_subarchetype', subArchetype);
  };

  useFocusEffect(
    useCallback(() => {
      const loadSaved = async () => {
        const savedArchetype = await AsyncStorage.getItem('elevo_archetype');
        const savedSub = await AsyncStorage.getItem('elevo_subarchetype');
        setSelectedArchetype(savedArchetype);
        setSelectedSubArchetype(savedSub);
        setSaved(!!savedArchetype);
        setSubSaved(!!savedSub);
      };
      loadSaved();
    }, [])
  );


  if (subSaved || (saved && !hasSubArchetypes)) {
  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Text style={styles.title}>Elevo</Text>
        <Text style={styles.subtitle}>Path chosen</Text>
        <Text style={styles.archetypeLabel}>{selectedArchetype}</Text>
        {selectedSubArchetype && <Text style={styles.archetypeLabel}>{selectedSubArchetype}</Text>}
      </View>
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={async () => {
          await AsyncStorage.multiRemove(['elevo_archetype', 'elevo_subarchetype']);
          setSelectedArchetype(null);
          setSelectedSubArchetype(null);
          setSaved(false);
          setSubSaved(false);
        }}>
        <Text style={styles.confirmButtonText}>Change path</Text>
      </TouchableOpacity>
    </View>
  );
  }
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
            onPress={() => saveSubArchetype(selectedSubArchetype).then(() => setSubSaved(true))}>
            <Text style={styles.confirmButtonText}>Confirm — {selectedSubArchetype}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Text style={styles.title}>Elevo</Text>
        <Text style={styles.subtitle}>
          {saved ? 'Path chosen' : 'Choose your path'}
        </Text>
        {saved && <Text style={styles.archetypeLabel}>{selectedArchetype}{selectedSubArchetype ? ` · ${selectedSubArchetype}` : ''}</Text>}
      </View>
      {!saved && (
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
      )}
      {selectedArchetype && !saved && (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => saveArchetype(selectedArchetype).then(() => setSaved(true))}>
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
  savedText: {
    color: '#c9a84c',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
