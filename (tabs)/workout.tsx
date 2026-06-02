import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getXpForLevel, getMultiplier } from '../utils';

type ExerciseType = 'reps' | 'time';
type Exercise = {
    name: string;
    type: ExerciseType;
    sets: number;
    reps: number;
    weight: number;
    duration: number; // seconds, used when type === 'time'
};
type Template = { id: string; name: string; exercises: Exercise[] };
type SetLog = { weight: string; reps: string; duration: string; done: boolean };
type ActiveExercise = { name: string; type: ExerciseType; sets: SetLog[] };
type HistorySet = { reps: number; weight: number; duration: number };
type WorkoutSession = {
    id: string;
    templateName: string;
    date: string;
    isPR: boolean;
    exercises: { name: string; sets: HistorySet[] }[];
};
type BuilderExercise = {
    id: string;
    name: string;
    type: ExerciseType;
    sets: string;
    reps: string;
    weight: string;
    duration: string;
};

function bestVolume(history: WorkoutSession[], exerciseName: string): number {
    let best = 0;
    for (const s of history) {
        for (const ex of s.exercises) {
            if (ex.name === exerciseName) {
                for (const set of ex.sets) {
                    best = Math.max(best, set.weight * set.reps);
                }
            }
        }
    }
    return best;
}

function bestDuration(history: WorkoutSession[], exerciseName: string): number {
    let best = 0;
    for (const s of history) {
        for (const ex of s.exercises) {
            if (ex.name === exerciseName) {
                for (const set of ex.sets) {
                    best = Math.max(best, set.duration ?? 0);
                }
            }
        }
    }
    return best;
}

export default function WorkoutScreen() {
    const [view, setView] = useState<'list' | 'builder' | 'workout'>('list');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [history, setHistory] = useState<WorkoutSession[]>([]);

    const [builderName, setBuilderName] = useState('');
    const [builderExercises, setBuilderExercises] = useState<BuilderExercise[]>([]);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
    const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([]);
    const [bestMap, setBestMap] = useState<Record<string, number>>({});
    const [bestTimeMap, setBestTimeMap] = useState<Record<string, number>>({});
    const [lastSessionData, setLastSessionData] = useState<Record<string, HistorySet[]>>({});

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const [t, h] = await Promise.all([
                    AsyncStorage.getItem('elevo_workout_templates'),
                    AsyncStorage.getItem('elevo_workout_history'),
                ]);
                if (t) setTemplates(JSON.parse(t));
                if (h) setHistory(JSON.parse(h));
            };
            load();
        }, [])
    );

    const newExerciseRow = (): BuilderExercise =>
        ({ id: Date.now().toString() + Math.random(), name: '', type: 'reps', sets: '3', reps: '8', weight: '0', duration: '30' });

    const openBuilder = (template?: Template) => {
        if (template) {
            setEditingTemplate(template);
            setBuilderName(template.name);
            setBuilderExercises(template.exercises.map(e => ({
                id: Date.now().toString() + Math.random(),
                name: e.name,
                type: e.type ?? 'reps',
                sets: String(e.sets),
                reps: String(e.reps),
                weight: String(e.weight),
                duration: String(e.duration ?? 30),
            })));
        } else {
            setEditingTemplate(null);
            setBuilderName('');
            setBuilderExercises([newExerciseRow()]);
        }
        setView('builder');
    };

    const updateExerciseRow = (index: number, field: keyof Omit<BuilderExercise, 'type' | 'id'>, value: string) => {
        setBuilderExercises(prev => prev.map((ex, i) => i === index ? { ...ex, [field]: value } : ex));
    };

    const setExerciseType = (index: number, type: ExerciseType) => {
        setBuilderExercises(prev => prev.map((ex, i) => i === index ? { ...ex, type } : ex));
    };

    const removeExerciseRow = (index: number) => {
        setBuilderExercises(prev => prev.filter((_, i) => i !== index));
    };

    const saveTemplate = async () => {
        const exercises: Exercise[] = builderExercises
            .filter(e => e.name.trim())
            .map(e => ({
                name: e.name.trim(),
                type: e.type,
                sets: parseInt(e.sets) || 3,
                reps: parseInt(e.reps) || 8,
                weight: parseFloat(e.weight) || 0,
                duration: parseInt(e.duration) || 30,
            }));
        if (!builderName.trim() || exercises.length === 0) return;

        let updated: Template[];
        if (editingTemplate) {
            updated = templates.map(t =>
                t.id === editingTemplate.id ? { ...t, name: builderName.trim(), exercises } : t
            );
        } else {
            updated = [...templates, { id: Date.now().toString(), name: builderName.trim(), exercises }];
        }
        setTemplates(updated);
        await AsyncStorage.setItem('elevo_workout_templates', JSON.stringify(updated));
        setView('list');
    };

    const deleteTemplate = (id: string) => {
        Alert.alert('Delete Template', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    const updated = templates.filter(t => t.id !== id);
                    setTemplates(updated);
                    await AsyncStorage.setItem('elevo_workout_templates', JSON.stringify(updated));
                },
            },
        ]);
    };

    const startWorkout = (template: Template) => {
        setActiveTemplate(template);
        const bm: Record<string, number> = {};
        const btm: Record<string, number> = {};
        for (const ex of template.exercises) {
            bm[ex.name] = bestVolume(history, ex.name);
            if ((ex.type ?? 'reps') === 'time') btm[ex.name] = bestDuration(history, ex.name);
        }
        setBestMap(bm);
        setBestTimeMap(btm);
        const lastSession = [...history].reverse().find(s => s.templateName === template.name);
        const lsd: Record<string, HistorySet[]> = {};
        if (lastSession) {
            for (const ex of lastSession.exercises) lsd[ex.name] = ex.sets;
        }
        setLastSessionData(lsd);
        setActiveExercises(template.exercises.map(ex => ({
            name: ex.name,
            type: ex.type ?? 'reps',
            sets: Array.from({ length: ex.sets }, () => ({
                weight: String(ex.weight),
                reps: String(ex.reps),
                duration: String(ex.duration ?? 30),
                done: false,
            })),
        })));
        setView('workout');
    };

    const markSetDone = (exIndex: number, setIndex: number) => {
        setActiveExercises(prev => prev.map((ex, ei) =>
            ei === exIndex
                ? { ...ex, sets: ex.sets.map((s, si) => si === setIndex ? { ...s, done: !s.done } : s) }
                : ex
        ));
    };

    const updateSetField = (exIndex: number, setIndex: number, field: 'weight' | 'reps' | 'duration', value: string) => {
        setActiveExercises(prev => prev.map((ex, ei) =>
            ei === exIndex
                ? { ...ex, sets: ex.sets.map((s, si) => si === setIndex ? { ...s, [field]: value } : s) }
                : ex
        ));
    };

    const isPR = (exName: string, weight: string, reps: string): boolean => {
        const vol = parseFloat(weight) * parseInt(reps);
        if (vol <= 0) return false;
        return vol > (bestMap[exName] ?? 0); // best === 0 means first ever lift → PR
    };

    const finishWorkout = async () => {
        if (!activeTemplate) return;

        let prCount = 0;
        const sessionExercises: WorkoutSession['exercises'] = [];

        for (const ex of activeExercises) {
            const doneSets = ex.sets.filter(s => s.done);
            if (doneSets.length > 0) {
                sessionExercises.push({
                    name: ex.name,
                    sets: doneSets.map(s => ({
                        weight: ex.type === 'reps' ? parseFloat(s.weight) || 0 : 0,
                        reps: ex.type === 'reps' ? parseInt(s.reps) || 0 : 0,
                        duration: ex.type === 'time' ? parseInt(s.duration) || 0 : 0,
                    })),
                });
                if (ex.type === 'reps' && doneSets.some(s => isPR(ex.name, s.weight, s.reps))) prCount++;
                if (ex.type === 'time' && doneSets.some(s => (parseInt(s.duration) || 0) > (bestTimeMap[ex.name] ?? 0))) prCount++;
            }
        }

        if (sessionExercises.length === 0) {
            Alert.alert('No sets logged', 'Mark at least one set done before finishing.');
            return;
        }

        const session: WorkoutSession = {
            id: Date.now().toString(),
            templateName: activeTemplate.name,
            date: new Date().toISOString(),
            isPR: prCount > 0,
            exercises: sessionExercises,
        };

        const newHistory = [...history, session].slice(-50);
        setHistory(newHistory);
        await AsyncStorage.setItem('elevo_workout_history', JSON.stringify(newHistory));

        const ACTIVITY = 'Training (weights/calisthenics/plyometrics)';
        const [rawXp, rawLevel, rawArchetype, rawSubArchetype, rawSideArchetypes, rawLoggedToday] =
            await Promise.all([
                AsyncStorage.getItem('elevo_xp'),
                AsyncStorage.getItem('elevo_level'),
                AsyncStorage.getItem('elevo_archetype'),
                AsyncStorage.getItem('elevo_subarchetype'),
                AsyncStorage.getItem('elevo_side_archetypes'),
                AsyncStorage.getItem('elevo_logged_today'),
            ]);

        const currentXp = parseFloat(rawXp ?? '0') || 0;
        const currentLevel = parseInt(rawLevel ?? '1') || 1;
        const archetype = rawArchetype ?? null;
        const subArchetype = rawSubArchetype ?? null;
        const sideArchetypes: string[] = rawSideArchetypes ? JSON.parse(rawSideArchetypes) : [];
        const loggedToday: string[] = rawLoggedToday ? JSON.parse(rawLoggedToday) : [];

        const baseXp = 150 + prCount * 50;
        const multiplier = getMultiplier(ACTIVITY, archetype, subArchetype, [], sideArchetypes);
        const xpEarned = Math.round(baseXp * multiplier);

        let newXp = currentXp + xpEarned;
        let newLevel = currentLevel;
        while (newXp >= getXpForLevel(newLevel + 1)) {
            newXp -= getXpForLevel(newLevel + 1);
            newLevel += 1;
        }
        const finalXp = Math.round(newXp / 5) * 5;

        const newLoggedToday = loggedToday.includes(ACTIVITY) ? loggedToday : [...loggedToday, ACTIVITY];

        await Promise.all([
            AsyncStorage.setItem('elevo_xp', String(finalXp)),
            AsyncStorage.setItem('elevo_level', String(newLevel)),
            AsyncStorage.setItem('elevo_logged_today', JSON.stringify(newLoggedToday)),
        ]);

        const levelUpMsg = newLevel > currentLevel ? `\nLevel up! → ${newLevel}` : '';
        const prMsg = prCount > 0 ? `${prCount} PR${prCount > 1 ? 's' : ''}  •  ` : '';
        Alert.alert(
            'Workout Complete!',
            `${prMsg}+${xpEarned} XP${levelUpMsg}`,
            [{ text: 'Nice!', onPress: () => setView('list') }]
        );
    };

    // ── Builder ──────────────────────────────────────────────────────────────
    if (view === 'builder') {
        const canSave = builderName.trim().length > 0 && builderExercises.some(e => e.name.trim());
        return (
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setView('list')}>
                        <Text style={styles.backBtn}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{editingTemplate ? 'Edit Template' : 'New Template'}</Text>
                    <View style={{ width: 32 }} />
                </View>
                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                    <TextInput
                        style={styles.templateNameInput}
                        placeholder="Template name"
                        placeholderTextColor="#5a5650"
                        value={builderName}
                        onChangeText={setBuilderName}
                    />
                    <Text style={styles.sectionLabel}>EXERCISES</Text>
                    {builderExercises.map((ex, i) => (
                        <View key={ex.id} style={styles.builderExRow}>
                            <View style={styles.builderExNameRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Exercise name"
                                    placeholderTextColor="#5a5650"
                                    value={ex.name}
                                    onChangeText={v => updateExerciseRow(i, 'name', v)}
                                />
                                <TouchableOpacity onPress={() => removeExerciseRow(i)} style={styles.removeBtn}>
                                    <Text style={styles.removeBtnText}>×</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.typeToggleRow}>
                                {(['reps', 'time'] as ExerciseType[]).map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.typeBtn, ex.type === t && styles.typeBtnActive]}
                                        onPress={() => setExerciseType(i, t)}>
                                        <Text style={[styles.typeBtnText, ex.type === t && styles.typeBtnTextActive]}>
                                            {t === 'reps' ? 'Reps' : 'Time'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {ex.type === 'reps' ? (
                                <View style={styles.builderNumRow}>
                                    {(['sets', 'reps', 'weight'] as const).map(field => (
                                        <View key={field} style={styles.numField}>
                                            <Text style={styles.numLabel}>
                                                {field === 'weight' ? 'kg' : field.charAt(0).toUpperCase() + field.slice(1)}
                                            </Text>
                                            <TextInput
                                                style={styles.numInput}
                                                value={ex[field]}
                                                onChangeText={v => updateExerciseRow(i, field, v)}
                                                keyboardType={field === 'weight' ? 'numeric' : 'number-pad'}
                                            />
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.builderNumRow}>
                                    <View style={styles.numField}>
                                        <Text style={styles.numLabel}>Sets</Text>
                                        <TextInput
                                            style={styles.numInput}
                                            value={ex.sets}
                                            onChangeText={v => updateExerciseRow(i, 'sets', v)}
                                            keyboardType="number-pad"
                                        />
                                    </View>
                                    <View style={[styles.numField, { flex: 2 }]}>
                                        <Text style={styles.numLabel}>Duration (sec)</Text>
                                        <TextInput
                                            style={styles.numInput}
                                            value={ex.duration}
                                            onChangeText={v => updateExerciseRow(i, 'duration', v)}
                                            keyboardType="number-pad"
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    ))}
                    <TouchableOpacity
                        style={styles.addExBtn}
                        onPress={() => setBuilderExercises(prev => [...prev, newExerciseRow()])}>
                        <Text style={styles.addExBtnText}>+ Add Exercise</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.primaryBtn, !canSave && styles.primaryBtnDisabled]}
                        onPress={saveTemplate}
                        disabled={!canSave}>
                        <Text style={styles.primaryBtnText}>Save Template</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    // ── Active Workout ───────────────────────────────────────────────────────
    if (view === 'workout') {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() =>
                        Alert.alert('Quit Workout?', 'Progress will be lost.', [
                            { text: 'Keep Going', style: 'cancel' },
                            { text: 'Quit', style: 'destructive', onPress: () => setView('list') },
                        ])}>
                        <Text style={styles.backBtn}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title} numberOfLines={1}>{activeTemplate?.name}</Text>
                    <View style={{ width: 32 }} />
                </View>
                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}>
                    {activeExercises.map((ex, ei) => (
                        <View key={ei} style={styles.exerciseBlock}>
                            <Text style={styles.exerciseName}>{ex.name}</Text>
                            {ex.type === 'reps' ? (
                                <>
                                    <View style={styles.setHeaderRow}>
                                        <Text style={[styles.setHeaderCell, { width: 28 }]}>SET</Text>
                                        <Text style={[styles.setHeaderCell, { flex: 1 }]}>WEIGHT (kg)</Text>
                                        <Text style={[styles.setHeaderCell, { flex: 1 }]}>REPS</Text>
                                        <View style={{ width: 72 }} />
                                    </View>
                                    {ex.sets.map((s, si) => {
                                        const pr = s.done && isPR(ex.name, s.weight, s.reps);
                                        const lastSet = lastSessionData[ex.name]?.[si];
                                        const lastLabel = lastSet ? `Last: ${lastSet.weight}kg × ${lastSet.reps}` : '—';
                                        return (
                                            <View key={si}>
                                                <View style={[styles.setRow, s.done && styles.setRowDone]}>
                                                    <Text style={styles.setNum}>{si + 1}</Text>
                                                    <TextInput
                                                        style={[styles.setInput, { flex: 1 }]}
                                                        value={s.weight}
                                                        onChangeText={v => updateSetField(ei, si, 'weight', v)}
                                                        keyboardType="numeric"
                                                        editable={!s.done}
                                                    />
                                                    <TextInput
                                                        style={[styles.setInput, { flex: 1 }]}
                                                        value={s.reps}
                                                        onChangeText={v => updateSetField(ei, si, 'reps', v)}
                                                        keyboardType="number-pad"
                                                        editable={!s.done}
                                                    />
                                                    <View style={styles.setActions}>
                                                        {pr && <Text style={styles.prBadge}>PR</Text>}
                                                        <TouchableOpacity
                                                            style={[styles.doneBtn, s.done && styles.doneBtnActive]}
                                                            onPress={() => markSetDone(ei, si)}>
                                                            <Text style={[styles.doneBtnText, s.done && styles.doneBtnTextActive]}>✓</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                <Text style={styles.lastSetText}>{lastLabel}</Text>
                                            </View>
                                        );
                                    })}
                                </>
                            ) : (
                                <>
                                    <View style={styles.setHeaderRow}>
                                        <Text style={[styles.setHeaderCell, { width: 28 }]}>SET</Text>
                                        <Text style={[styles.setHeaderCell, { flex: 1 }]}>DURATION (sec)</Text>
                                        <View style={{ width: 72 }} />
                                    </View>
                                    {ex.sets.map((s, si) => {
                                        const lastSet = lastSessionData[ex.name]?.[si];
                                        const lastLabel = lastSet ? `Last: ${lastSet.duration}s` : '—';
                                        return (
                                            <View key={si}>
                                                <View style={[styles.setRow, s.done && styles.setRowDone]}>
                                                    <Text style={styles.setNum}>{si + 1}</Text>
                                                    <TextInput
                                                        style={[styles.setInput, { flex: 1 }]}
                                                        value={s.duration}
                                                        onChangeText={v => updateSetField(ei, si, 'duration', v)}
                                                        keyboardType="number-pad"
                                                        editable={!s.done}
                                                    />
                                                    <View style={styles.setActions}>
                                                        <TouchableOpacity
                                                            style={[styles.doneBtn, s.done && styles.doneBtnActive]}
                                                            onPress={() => markSetDone(ei, si)}>
                                                            <Text style={[styles.doneBtnText, s.done && styles.doneBtnTextActive]}>✓</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                <Text style={styles.lastSetText}>{lastLabel}</Text>
                                            </View>
                                        );
                                    })}
                                </>
                            )}
                        </View>
                    ))}
                </ScrollView>
                <View style={styles.finishBar}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={finishWorkout}>
                        <Text style={styles.primaryBtnText}>Finish Workout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ── Templates List ───────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flex: 1 }} />
                <Text style={[styles.title, { flex: 0 }]}>Workout</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <TouchableOpacity style={styles.newTemplateBtn} onPress={() => openBuilder()}>
                        <Text style={styles.newTemplateBtnText}>+ New</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                {templates.length === 0 && (
                    <Text style={styles.emptyText}>No templates yet.{'\n'}Tap + New to create one.</Text>
                )}
                {templates.map(t => (
                    <TouchableOpacity
                        key={t.id}
                        style={styles.templateRow}
                        onPress={() => startWorkout(t)}
                        onLongPress={() => deleteTemplate(t.id)}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.templateName}>{t.name}</Text>
                            <Text style={styles.templateMeta}>
                                {t.exercises.length} exercise{t.exercises.length !== 1 ? 's' : ''}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => openBuilder(t)} style={styles.editBtn}>
                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
                {templates.length > 0 && (
                    <Text style={styles.hintText}>Long press a template to delete</Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    title: {
        color: '#c9a84c',
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    backBtn: {
        color: '#c9a84c',
        fontSize: 24,
        width: 32,
    },
    newTemplateBtn: {
        backgroundColor: '#c9a84c',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    newTemplateBtnText: {
        color: '#0a0a0a',
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyText: {
        color: '#5a5650',
        textAlign: 'center',
        marginTop: 60,
        fontSize: 15,
        lineHeight: 24,
    },
    hintText: {
        color: '#2a2a2a',
        textAlign: 'center',
        fontSize: 12,
        marginTop: 16,
    },
    templateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f0f0f',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 10,
        padding: 16,
        marginBottom: 10,
    },
    templateName: {
        color: '#e8e0cc',
        fontSize: 16,
        fontWeight: 'bold',
    },
    templateMeta: {
        color: '#5a5650',
        fontSize: 13,
        marginTop: 2,
    },
    editBtn: {
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    editBtnText: {
        color: '#5a5650',
        fontSize: 13,
    },
    templateNameInput: {
        backgroundColor: '#0f0f0f',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#e8e0cc',
        marginBottom: 24,
    },
    sectionLabel: {
        color: '#c9a84c',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    builderExRow: {
        backgroundColor: '#0f0f0f',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    builderExNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    typeToggleRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        alignItems: 'center',
    },
    typeBtnActive: {
        borderColor: '#c9a84c',
        backgroundColor: '#c9a84c1a',
    },
    typeBtnText: {
        color: '#5a5650',
        fontSize: 13,
        fontWeight: 'bold',
    },
    typeBtnTextActive: {
        color: '#c9a84c',
    },
    input: {
        backgroundColor: '#0a0a0a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: '#e8e0cc',
    },
    removeBtn: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeBtnText: {
        color: '#5a5650',
        fontSize: 22,
    },
    builderNumRow: {
        flexDirection: 'row',
        gap: 8,
    },
    numField: {
        flex: 1,
        alignItems: 'center',
    },
    numLabel: {
        color: '#5a5650',
        fontSize: 11,
        marginBottom: 4,
    },
    numInput: {
        width: '100%',
        backgroundColor: '#0a0a0a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 8,
        fontSize: 15,
        color: '#e8e0cc',
        textAlign: 'center',
    },
    addExBtn: {
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    addExBtnText: {
        color: '#5a5650',
        fontSize: 15,
    },
    primaryBtn: {
        backgroundColor: '#c9a84c',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryBtnDisabled: {
        backgroundColor: '#2a2a2a',
    },
    primaryBtnText: {
        color: '#0a0a0a',
        fontWeight: 'bold',
        fontSize: 16,
    },
    exerciseBlock: {
        marginBottom: 24,
    },
    exerciseName: {
        color: '#e8e0cc',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    setHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        marginBottom: 4,
        gap: 8,
    },
    setHeaderCell: {
        color: '#5a5650',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f0f0f',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 8,
        marginBottom: 6,
        gap: 8,
    },
    setRowDone: {
        borderColor: '#c9a84c33',
    },
    setNum: {
        color: '#5a5650',
        fontSize: 14,
        fontWeight: 'bold',
        width: 28,
        textAlign: 'center',
    },
    setInput: {
        backgroundColor: '#0a0a0a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 6,
        fontSize: 15,
        color: '#e8e0cc',
        textAlign: 'center',
    },
    setActions: {
        width: 72,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
    },
    doneBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#2a2a2a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    doneBtnActive: {
        backgroundColor: '#c9a84c',
        borderColor: '#c9a84c',
    },
    doneBtnText: {
        color: '#2a2a2a',
        fontSize: 14,
        fontWeight: 'bold',
    },
    doneBtnTextActive: {
        color: '#0a0a0a',
    },
    prBadge: {
        color: '#c9a84c',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        borderWidth: 1,
        borderColor: '#c9a84c',
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    lastSetText: {
        color: '#5a5650',
        fontSize: 11,
        marginLeft: 36,
        marginTop: -2,
        marginBottom: 4,
    },
    finishBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0a0a0a',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#1e1e1e',
    },
});
