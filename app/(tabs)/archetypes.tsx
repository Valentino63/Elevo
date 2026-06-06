import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { archetypes, subArchetypes } from '../../lib/utils';

type Mode = 'summary' | 'pickMain' | 'pickSub' | 'pickSide';

// 'setup'  → picker is part of the initial first-run chain; confirm advances to next step
// 'summary' → picker was opened from the summary screen; confirm always returns to summary
type EnteredFrom = 'setup' | 'summary';

// Stored when user explicitly picks no sub-path. getMultiplier treats this as
// 1.0× on all archetype tasks — see lib/utils.ts line 895 (if (subArchetype) check).
const GENERALIST = 'none';

export default function ArchetypesScreen() {
  const [mode, setMode] = useState<Mode>('pickMain');

  // Set at the moment we switch INTO a picker. Tells confirm handlers whether to
  // chain forward (setup) or return to summary (summary). Never read from
  // useFocusEffect — only written by the button that triggers the mode switch.
  const [enteredFrom, setEnteredFrom] = useState<EnteredFrom>('setup');

  // Committed (persisted) state
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);
  const [selectedSubArchetype, setSelectedSubArchetype] = useState<string | null>(null);
  const [selectedSideArchetypes, setSelectedSideArchetypes] = useState<string[]>([]);

  // Draft (in-picker) state — only used while the user is inside a picker
  const [draftMain, setDraftMain] = useState<string | null>(null);
  const [draftSub, setDraftSub] = useState<string | null>(null);
  const [draftSides, setDraftSides] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const [savedMain, savedSub, savedSide] = await Promise.all([
          AsyncStorage.getItem('elevo_archetype'),
          AsyncStorage.getItem('elevo_subarchetype'),
          AsyncStorage.getItem('elevo_side_archetypes'),
        ]);
        setSelectedArchetype(savedMain);
        setSelectedSubArchetype(savedSub);
        setSelectedSideArchetypes(savedSide ? JSON.parse(savedSide) : []);
        if (savedMain) {
          // Always force summary when an archetype is saved, even on re-focus.
          // Do NOT touch enteredFrom here — it's only meaningful inside pickers
          // and is set by the button that opens them.
          setMode('summary');
        } else {
          // Genuine first-run: no archetype saved yet.
          setEnteredFrom('setup');
          setDraftMain(null);
          setMode('pickMain');
        }
      };
      load();
    }, [])
  );

  const subsForCurrent = selectedArchetype ? subArchetypes[selectedArchetype] ?? [] : [];
  const hasSubs = subsForCurrent.length > 0;

  function subDisplayName(sub: string | null): string {
    return !sub || sub === GENERALIST ? 'Generalist' : sub;
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  if (mode === 'summary') {
    return (
      <View style={styles.container}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={styles.title}>Elevo</Text>
          <Text style={styles.subtitle}>Your path</Text>
          <Text style={styles.archetypeLabel}>{selectedArchetype}</Text>
          {hasSubs && (
            <Text style={styles.subLabel}>{subDisplayName(selectedSubArchetype)}</Text>
          )}
          {selectedSideArchetypes.length > 0 && (
            <Text style={styles.sideLabel}>+ {selectedSideArchetypes.join(' · ')}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setDraftMain(selectedArchetype);
            setEnteredFrom('summary');
            setMode('pickMain');
          }}>
          <Text style={styles.editButtonText}>Change main path</Text>
        </TouchableOpacity>

        {hasSubs && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setDraftSub(selectedSubArchetype);
              setEnteredFrom('summary');
              setMode('pickSub');
            }}>
            <Text style={styles.editButtonText}>Change sub-path</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setDraftSides([...selectedSideArchetypes]);
            setEnteredFrom('summary');
            setMode('pickSide');
          }}>
          <Text style={styles.editButtonText}>Edit side paths</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Pick Main ────────────────────────────────────────────────────────────────
  if (mode === 'pickMain') {
    return (
      <View style={styles.container}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={styles.title}>Elevo</Text>
          <Text style={styles.subtitle}>Choose your path</Text>
        </View>
        <ScrollView>
          {archetypes.map((a) => (
            <TouchableOpacity
              key={a.name}
              style={[
                styles.archetypeBox,
                draftMain === a.name && { borderColor: '#c9a84c', borderWidth: 2 },
              ]}
              onPress={() => setDraftMain(a.name)}>
              <Text style={styles.archetypeTitle}>{a.name}</Text>
              <Text style={styles.archetypeDescription}>{a.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {enteredFrom === 'summary' && (
          <TouchableOpacity style={styles.cancelButton} onPress={() => setMode('summary')}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        {draftMain && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={async () => {
              const mainChanged = draftMain !== selectedArchetype;
              const writes: Promise<void>[] = [
                AsyncStorage.setItem('elevo_archetype', draftMain),
              ];
              let newSides = [...selectedSideArchetypes];
              if (mainChanged) {
                writes.push(AsyncStorage.removeItem('elevo_subarchetype'));
                newSides = newSides.filter(s => s !== draftMain);
                if (newSides.length !== selectedSideArchetypes.length) {
                  writes.push(AsyncStorage.setItem('elevo_side_archetypes', JSON.stringify(newSides)));
                }
              }
              await Promise.all(writes);
              const newMain = draftMain;
              setSelectedArchetype(newMain);
              if (mainChanged) {
                setSelectedSubArchetype(null);
                setSelectedSideArchetypes(newSides);
              }
              if (enteredFrom === 'summary') {
                setMode('summary');
              } else {
                // Initial setup: chain forward
                const newHasSubs = (subArchetypes[newMain] ?? []).length > 0;
                setDraftSub(null);
                if (newHasSubs) {
                  setEnteredFrom('setup');
                  setMode('pickSub');
                } else {
                  setDraftSides(mainChanged ? newSides : [...selectedSideArchetypes]);
                  setEnteredFrom('setup');
                  setMode('pickSide');
                }
              }
            }}>
            <Text style={styles.confirmButtonText}>Confirm — {draftMain}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── Pick Sub ─────────────────────────────────────────────────────────────────
  if (mode === 'pickSub') {
    const subsForPick = selectedArchetype ? subArchetypes[selectedArchetype] ?? [] : [];
    const isGeneralist = !draftSub || draftSub === GENERALIST;

    return (
      <View style={styles.container}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={styles.title}>Elevo</Text>
          <Text style={styles.subtitle}>Choose your sub-path</Text>
          <Text style={styles.archetypeLabel}>{selectedArchetype}</Text>
        </View>
        <ScrollView>
          <TouchableOpacity
            style={[
              styles.archetypeBox,
              isGeneralist && { borderColor: '#c9a84c', borderWidth: 2 },
            ]}
            onPress={() => setDraftSub(GENERALIST)}>
            <Text style={styles.archetypeTitle}>Generalist</Text>
            <Text style={styles.archetypeDescription}>No sub-path bonus · flat 1.0× on all archetype tasks</Text>
          </TouchableOpacity>
          {subsForPick.map((sub) => (
            <TouchableOpacity
              key={sub}
              style={[
                styles.archetypeBox,
                draftSub === sub && { borderColor: '#c9a84c', borderWidth: 2 },
              ]}
              onPress={() => setDraftSub(sub)}>
              <Text style={styles.archetypeTitle}>{sub}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {enteredFrom === 'summary' && (
          <TouchableOpacity style={styles.cancelButton} onPress={() => setMode('summary')}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={async () => {
            const subToSave = (!draftSub || draftSub === GENERALIST) ? GENERALIST : draftSub;
            await AsyncStorage.setItem('elevo_subarchetype', subToSave);
            setSelectedSubArchetype(subToSave);
            if (enteredFrom === 'summary') {
              setMode('summary');
            } else {
              // Initial setup: chain to side picker
              setDraftSides([...selectedSideArchetypes]);
              setEnteredFrom('setup');
              setMode('pickSide');
            }
          }}>
          <Text style={styles.confirmButtonText}>
            {isGeneralist ? 'Confirm — Generalist' : `Confirm — ${draftSub}`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Pick Side ────────────────────────────────────────────────────────────────
  const sideOptions = archetypes.filter(a => a.name !== selectedArchetype);

  const toggleDraftSide = (name: string) => {
    setDraftSides(prev => {
      if (prev.includes(name)) return prev.filter(n => n !== name);
      if (prev.length >= 2) return prev;
      return [...prev, name];
    });
  };

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
          const selected = draftSides.includes(a.name);
          const maxed = !selected && draftSides.length >= 2;
          return (
            <TouchableOpacity
              key={a.name}
              style={[
                styles.archetypeBox,
                selected && { borderColor: '#c9a84c', borderWidth: 2 },
                maxed && { opacity: 0.4 },
              ]}
              onPress={() => { if (!maxed) toggleDraftSide(a.name); }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.archetypeTitle}>{a.name}</Text>
                {selected && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.archetypeDescription}>{a.description}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {enteredFrom === 'summary' && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => setMode('summary')}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={async () => {
          await AsyncStorage.setItem('elevo_side_archetypes', JSON.stringify(draftSides));
          setSelectedSideArchetypes(draftSides);
          setMode('summary');
        }}>
        <Text style={styles.confirmButtonText}>
          {draftSides.length === 0 ? 'Skip' : `Confirm (${draftSides.length} selected)`}
        </Text>
      </TouchableOpacity>
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
  subLabel: {
    color: '#9a9488',
    fontSize: 13,
    marginTop: 4,
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
  editButton: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingVertical: 14,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#c9a84c',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginHorizontal: 16,
    marginBottom: 4,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#5a5650',
    fontSize: 14,
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
