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
import { getMultiplier, localDateString } from '../../lib/utils';
import { awardXp, checkAchievements } from '../../lib/xpEngine';
import type { Achievement } from '../../lib/achievements';
import { C, F } from '../../lib/tokens';

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
    const [expandedExId, setExpandedExId] = useState<string | null>(null);

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
        if (!builderName.trim()) {
            Alert.alert('Name required', 'Please enter a template name.');
            return;
        }
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
        if (exercises.length === 0) {
            Alert.alert('Name required', 'Please add at least one exercise name.');
            return;
        }

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

        const today = localDateString();
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

        // XP dedup: only award XP once per template per day
        const rawXpAwarded = await AsyncStorage.getItem('elevo_workout_xp_awarded');
        const xpAwarded: Record<string, string[]> = rawXpAwarded ? JSON.parse(rawXpAwarded) : {};
        const todayAwarded = xpAwarded[today] ?? [];
        if (todayAwarded.includes(activeTemplate.name)) {
            const repeatPrMsg = prCount > 0 ? `${prCount} PR${prCount > 1 ? 's' : ''} · ` : '';
            Alert.alert(
                'Workout Saved',
                `${repeatPrMsg}Already logged today — no XP, but progress saved.`,
                [{ text: 'Got it', onPress: () => setView('list') }]
            );
            return;
        }
        const updatedAwarded = { ...xpAwarded, [today]: [...todayAwarded, activeTemplate.name] };
        await AsyncStorage.setItem('elevo_workout_xp_awarded', JSON.stringify(updatedAwarded));

        const ACTIVITY = 'Training (weights/calisthenics/plyometrics)';

        // Read archetype for multiplier; everything else is owned by awardXp
        const [rawArchetype, rawSubArchetype, rawSideArchetypes, rawLogged, rawLastLogDate] = await Promise.all([
            AsyncStorage.getItem('elevo_archetype'),
            AsyncStorage.getItem('elevo_subarchetype'),
            AsyncStorage.getItem('elevo_side_archetypes'),
            AsyncStorage.getItem('elevo_logged_today'),
            AsyncStorage.getItem('elevo_last_log_date'),
        ]);
        const archetype = rawArchetype ?? null;
        const subArchetype = rawSubArchetype ?? null;
        const sideArchetypes: string[] = rawSideArchetypes ? JSON.parse(rawSideArchetypes) : [];
        const effectiveLoggedToday: string[] = rawLastLogDate === today && rawLogged ? JSON.parse(rawLogged) : [];

        const baseXp = 150 + prCount * 50;
        // No 3x new-habit bonus for workouts — workout XP uses its own formula
        const xpEarned = Math.round(baseXp * getMultiplier(ACTIVITY, archetype, subArchetype, effectiveLoggedToday, sideArchetypes));

        const r = await awardXp(xpEarned, ACTIVITY);

        // Write to elevo_earned_xp so the home-screen "done today" row shows the real amount.
        // Must happen after awardXp (first-workout path only — repeat returns before this).
        const rawEarned = await AsyncStorage.getItem('elevo_earned_xp');
        const existingEarned: Record<string, number> = rawEarned ? JSON.parse(rawEarned) : {};
        await AsyncStorage.setItem('elevo_earned_xp', JSON.stringify({ ...existingEarned, [ACTIVITY]: xpEarned }));

        const newlyUnlocked: Achievement[] = await checkAchievements(r.newLevel, r.newStreak, r.newCompletions);
        const levelUpMsg = r.didLevelUp ? `\nLevel up! → ${r.newLevel}` : '';
        const prMsg = prCount > 0 ? `${prCount} PR${prCount > 1 ? 's' : ''}  •  ` : '';
        const achievementMsg = newlyUnlocked.length > 0
            ? `\n🏆 ${newlyUnlocked.map(a => a.title).join(', ')}`
            : '';
        Alert.alert(
            'Workout Complete!',
            `${prMsg}+${xpEarned} XP${levelUpMsg}${achievementMsg}`,
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
                    <Text style={styles.fieldLabel}>TEMPLATE NAME</Text>
                    <TextInput
                        style={styles.templateNameInput}
                        placeholder="Template name"
                        placeholderTextColor={C.faint}
                        value={builderName}
                        onChangeText={setBuilderName}
                    />
                    <Text style={styles.sectionLabel}>EXERCISES</Text>
                    {(() => {
                        const expandedExists = builderExercises.some(e => e.id === expandedExId);
                        return builderExercises.map((ex, i) => {
                            const isExpanded = expandedExists ? expandedExId === ex.id : i === builderExercises.length - 1;
                            const summary = ex.type === 'reps'
                                ? `${ex.sets || 0} × ${ex.reps || 0}${parseFloat(ex.weight) > 0 ? ` · ${ex.weight}kg` : ''}`
                                : `${ex.sets || 0} × ${ex.duration || 0}s`;

                            if (!isExpanded) {
                                return (
                                    <TouchableOpacity
                                        key={ex.id}
                                        style={styles.collapsedExRow}
                                        onPress={() => setExpandedExId(ex.id)}>
                                        <Text style={styles.collapsedExName} numberOfLines={1}>
                                            {ex.name.trim() || 'Unnamed exercise'}
                                        </Text>
                                        <Text style={styles.collapsedExSummary}>{summary}</Text>
                                    </TouchableOpacity>
                                );
                            }

                            return (
                                <View key={ex.id} style={styles.builderExRow}>
                                    <View style={styles.builderExTopRow}>
                                        <TextInput
                                            style={[styles.input, styles.builderExNameInput]}
                                            placeholder="Exercise name"
                                            placeholderTextColor={C.faint}
                                            value={ex.name}
                                            onChangeText={v => updateExerciseRow(i, 'name', v)}
                                        />
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
                                        <TouchableOpacity onPress={() => removeExerciseRow(i)} style={styles.removeBtn}>
                                            <Text style={styles.removeBtnText}>×</Text>
                                        </TouchableOpacity>
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
                            );
                        });
                    })()}
                    <TouchableOpacity
                        style={styles.addExBtn}
                        onPress={() => {
                            setBuilderExercises(prev => [...prev, newExerciseRow()]);
                            setExpandedExId(null);
                        }}>
                        <Text style={styles.addExBtnText}>+ Add Exercise</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.primaryBtn, !canSave && styles.primaryBtnDisabled]}
                        onPress={saveTemplate}>
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
                    <View style={styles.timerBadge}>
                        <View style={styles.timerDot} />
                        <Text style={styles.timerText}>0:00</Text>
                    </View>
                </View>
                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}>
                    {activeExercises.map((ex, ei) => (
                        <View key={ei} style={styles.exerciseBlock}>
                            <Text style={styles.exerciseCounter}>EXERCISE {ei + 1}/{activeExercises.length}</Text>
                            <Text style={styles.exerciseName}>{ex.name}</Text>
                            {(() => {
                                const currentIdx = ex.sets.findIndex(s2 => !s2.done);
                                return ex.type === 'reps' ? (
                                <>
                                    <View style={styles.setHeaderRow}>
                                        <Text style={[styles.setHeaderCell, { width: 28 }]}>SET</Text>
                                        <Text style={[styles.setHeaderCell, { flex: 1 }]}>WEIGHT (kg)</Text>
                                        <Text style={[styles.setHeaderCell, { flex: 1 }]}>REPS</Text>
                                        <View style={{ width: 72 }} />
                                    </View>
                                    {ex.sets.map((s, si) => {
                                        const pr = s.done && isPR(ex.name, s.weight, s.reps);
                                        const isCurrent = si === currentIdx;
                                        const lastSet = lastSessionData[ex.name]?.[si];
                                        const lastLabel = lastSet ? `Last: ${lastSet.weight}kg × ${lastSet.reps}` : '—';
                                        return (
                                            <View key={si}>
                                                {isCurrent && (
                                                    <View style={styles.currentSetHeader}>
                                                        <Text style={styles.currentSetLabel}>SET {si + 1} · WORKING</Text>
                                                        {lastLabel !== '—' && <Text style={styles.currentSetLast}>{lastLabel}</Text>}
                                                    </View>
                                                )}
                                                <View style={[styles.setRow, isCurrent ? styles.setRowCurrent : styles.setRowDim]}>
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
                                                            style={[styles.doneBtn, s.done && styles.doneBtnActive, isCurrent && !s.done && styles.doneBtnCurrent]}
                                                            onPress={() => markSetDone(ei, si)}>
                                                            <Text style={[styles.doneBtnText, s.done && styles.doneBtnTextActive, isCurrent && !s.done && styles.doneBtnTextCurrent]}>✓</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                {isCurrent && !s.done && (
                                                    <TouchableOpacity style={styles.logSetBtn} onPress={() => markSetDone(ei, si)}>
                                                        <Text style={styles.logSetBtnText}>Log Set {si + 1}</Text>
                                                    </TouchableOpacity>
                                                )}
                                                {!isCurrent && lastLabel !== '—' && <Text style={styles.lastSetText}>{lastLabel}</Text>}
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
                                        const isTimePR = s.done && (parseInt(s.duration) || 0) > (bestTimeMap[ex.name] ?? 0);
                                        const isCurrent = si === currentIdx;
                                        const lastSet = lastSessionData[ex.name]?.[si];
                                        const lastLabel = lastSet ? `Last: ${lastSet.duration}s` : '—';
                                        return (
                                            <View key={si}>
                                                {isCurrent && (
                                                    <View style={styles.currentSetHeader}>
                                                        <Text style={styles.currentSetLabel}>SET {si + 1} · WORKING</Text>
                                                        {lastLabel !== '—' && <Text style={styles.currentSetLast}>{lastLabel}</Text>}
                                                    </View>
                                                )}
                                                <View style={[styles.setRow, isCurrent ? styles.setRowCurrent : styles.setRowDim]}>
                                                    <Text style={styles.setNum}>{si + 1}</Text>
                                                    <TextInput
                                                        style={[styles.setInput, { flex: 1 }]}
                                                        value={s.duration}
                                                        onChangeText={v => updateSetField(ei, si, 'duration', v)}
                                                        keyboardType="number-pad"
                                                        editable={!s.done}
                                                    />
                                                    <View style={styles.setActions}>
                                                        {isTimePR && <Text style={styles.prBadge}>PR</Text>}
                                                        <TouchableOpacity
                                                            style={[styles.doneBtn, s.done && styles.doneBtnActive, isCurrent && !s.done && styles.doneBtnCurrent]}
                                                            onPress={() => markSetDone(ei, si)}>
                                                            <Text style={[styles.doneBtnText, s.done && styles.doneBtnTextActive, isCurrent && !s.done && styles.doneBtnTextCurrent]}>✓</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                {isCurrent && !s.done && (
                                                    <TouchableOpacity style={styles.logSetBtn} onPress={() => markSetDone(ei, si)}>
                                                        <Text style={styles.logSetBtnText}>Log Set {si + 1}</Text>
                                                    </TouchableOpacity>
                                                )}
                                                {!isCurrent && lastLabel !== '—' && <Text style={styles.lastSetText}>{lastLabel}</Text>}
                                            </View>
                                        );
                                    })}
                                </>
                            );
                            })()}
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
                        <View style={styles.playBtn}>
                            <Text style={styles.playBtnText}>▶</Text>
                        </View>
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
        backgroundColor: C.bg,
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
        color: C.text,
        fontSize: 22,
        fontFamily: F.serif,
        flex: 1,
        textAlign: 'center',
    },
    backBtn: {
        color: C.gold,
        fontSize: 24,
        width: 32,
    },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        width: 52,
        justifyContent: 'flex-end',
    },
    timerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: C.gold,
    },
    timerText: {
        color: C.muted,
        fontSize: 13,
    },
    newTemplateBtn: {
        backgroundColor: C.gold,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        shadowColor: C.gold,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    newTemplateBtnText: {
        color: C.bg,
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyText: {
        color: C.faint,
        textAlign: 'center',
        marginTop: 60,
        fontSize: 15,
        lineHeight: 24,
    },
    hintText: {
        color: C.faint,
        textAlign: 'center',
        fontSize: 12,
        marginTop: 16,
    },
    templateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: C.border,
        padding: 16,
        marginBottom: 10,
        gap: 10,
    },
    templateName: {
        color: C.text,
        fontSize: 16,
        fontFamily: F.serif,
    },
    templateMeta: {
        color: C.muted,
        fontSize: 13,
        marginTop: 2,
    },
    editBtn: {
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    editBtnText: {
        color: C.muted,
        fontSize: 13,
    },
    playBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: C.gold,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: C.gold,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    playBtnText: {
        color: C.bg,
        fontSize: 13,
    },
    fieldLabel: {
        color: C.muted,
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
    },
    templateNameInput: {
        backgroundColor: C.card,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: C.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: C.text,
        marginBottom: 24,
    },
    sectionLabel: {
        color: C.muted,
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 12,
    },
    builderExRow: {
        backgroundColor: '#16130c',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2a2620',
        padding: 12,
        marginBottom: 10,
    },
    builderExTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    builderExNameInput: {
        flex: 1,
    },
    collapsedExRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#16130c',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2a2620',
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 10,
        gap: 10,
    },
    collapsedExName: {
        color: C.text,
        fontSize: 14,
        fontWeight: 'bold',
        flex: 1,
    },
    collapsedExSummary: {
        color: C.muted,
        fontSize: 12,
    },
    typeToggleRow: {
        flexDirection: 'row',
        gap: 6,
    },
    typeBtn: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: C.bg,
        borderWidth: 1,
        borderColor: C.border,
        alignItems: 'center',
    },
    typeBtnActive: {
        backgroundColor: C.gold,
        borderColor: C.gold,
        shadowColor: C.gold,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    typeBtnText: {
        color: C.faint,
        fontSize: 13,
        fontWeight: 'bold',
    },
    typeBtnTextActive: {
        color: C.bg,
    },
    input: {
        backgroundColor: C.bg,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: C.border,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: C.text,
    },
    removeBtn: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeBtnText: {
        color: C.faint,
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
        color: C.faint,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    numInput: {
        width: '100%',
        backgroundColor: C.bg,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#2a2620',
        paddingHorizontal: 8,
        paddingVertical: 8,
        fontSize: 15,
        color: C.text,
        textAlign: 'center',
    },
    addExBtn: {
        backgroundColor: 'transparent',
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: C.border,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    addExBtnText: {
        color: C.muted,
        fontSize: 15,
    },
    primaryBtn: {
        backgroundColor: C.gold,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: C.gold,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    primaryBtnDisabled: {
        backgroundColor: C.border,
    },
    primaryBtnText: {
        color: C.bg,
        fontWeight: 'bold',
        fontSize: 16,
    },
    exerciseBlock: {
        marginBottom: 24,
    },
    exerciseCounter: {
        color: C.muted,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 4,
    },
    exerciseName: {
        color: C.text,
        fontSize: 20,
        fontFamily: F.serif,
        marginBottom: 8,
    },
    currentSetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
        paddingHorizontal: 4,
    },
    currentSetLabel: {
        color: C.gold,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    currentSetLast: {
        color: C.muted,
        fontSize: 11,
    },
    logSetBtn: {
        backgroundColor: C.gold,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        marginBottom: 8,
        marginTop: -2,
        shadowColor: C.gold,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    logSetBtnText: {
        color: C.bg,
        fontWeight: 'bold',
        fontSize: 14,
    },
    setHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        marginBottom: 4,
        gap: 8,
    },
    setHeaderCell: {
        color: C.faint,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.card,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: C.border,
        paddingHorizontal: 8,
        paddingVertical: 8,
        marginBottom: 8,
        gap: 8,
    },
    setRowCurrent: {
        backgroundColor: C.cardSelected,
        borderColor: C.gold,
    },
    setRowDim: {
        opacity: 0.5,
    },
    setNum: {
        color: C.faint,
        fontSize: 14,
        fontWeight: 'bold',
        width: 28,
        textAlign: 'center',
    },
    setInput: {
        backgroundColor: C.bg,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 6,
        fontSize: 15,
        color: C.text,
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
        backgroundColor: C.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    doneBtnActive: {
        backgroundColor: C.gold,
        shadowColor: C.gold,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    doneBtnCurrent: {
        backgroundColor: C.gold,
        shadowColor: C.gold,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    doneBtnText: {
        color: C.faint,
        fontSize: 14,
        fontWeight: 'bold',
    },
    doneBtnTextActive: {
        color: C.bg,
    },
    doneBtnTextCurrent: {
        color: C.bg,
    },
    prBadge: {
        color: C.bg,
        backgroundColor: C.gold,
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 2,
        shadowColor: C.gold,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    lastSetText: {
        color: C.faint,
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
        backgroundColor: C.bg,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: C.border,
    },
});
