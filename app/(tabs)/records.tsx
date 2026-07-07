import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTitle, getXpForLevel } from '../../lib/utils';
import { C, F } from '../../lib/tokens';

type RecordEntry = { name: string; unit: string };
type RecordData = { current: number | null; history: number[] };

const CATEGORIES: { title: string; records: RecordEntry[] }[] = [
    {
        title: 'Body Weight',
        records: [
            { name: 'Pushups', unit: 'reps' },
            { name: 'Pullups', unit: 'reps' },
            { name: 'Dips', unit: 'reps' },
            { name: 'Deadhang', unit: 'seconds' },
            { name: 'Plank', unit: 'seconds' },
            { name: 'Vertical jump', unit: 'cm' },
            { name: 'Broad jump', unit: 'cm' },
        ],
    },
    {
        title: 'Gym',
        records: [
            { name: 'Squat', unit: 'kg' },
            { name: 'Deadlift', unit: 'kg' },
            { name: 'Bench press', unit: 'kg' },
        ],
    },
    {
        title: 'Running',
        records: [
            { name: '100m', unit: 'seconds' },
            { name: '400m', unit: 'seconds' },
            { name: '1mi', unit: 'seconds' },
            { name: '2km', unit: 'seconds' },
            { name: '5km', unit: 'seconds' },
            { name: '10km', unit: 'seconds' },
            { name: 'Half marathon', unit: 'seconds' },
            { name: 'Marathon', unit: 'seconds' },
        ],
    },
    {
        title: 'Other',
        records: [
            { name: 'VO2 max', unit: 'ml/kg/min' },
        ],
    },
];

function formatValue(value: number | null | undefined, unit: string): string {
    if (value == null) return 'Not set';
    if (unit === 'seconds') {
        const m = Math.floor(value / 60);
        const s = value % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
    return `${value} ${unit}`;
}

function formatNum(value: number, unit: string): string {
    if (unit === 'seconds') {
        const m = Math.floor(value / 60);
        const s = value % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
    return `${value}`;
}

function formatDelta(delta: number, unit: string): string {
    const sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
    const abs = Math.abs(delta);
    if (unit === 'seconds') {
        const m = Math.floor(abs / 60);
        const s = abs % 60;
        return `${sign}${m}:${s.toString().padStart(2, '0')}`;
    }
    return `${sign}${abs} ${unit}`;
}

function migrate(raw: Record<string, unknown>): Record<string, RecordData> {
    const out: Record<string, RecordData> = {};
    for (const [key, val] of Object.entries(raw)) {
        if (val === null) {
            out[key] = { current: null, history: [] };
        } else if (typeof val === 'number') {
            out[key] = { current: val, history: [] };
        } else {
            out[key] = val as RecordData;
        }
    }
    return out;
}

const RING_R = 32;
const RING_SIZE = RING_R * 2 + 12;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

export default function RecordsScreen() {
    const [values, setValues] = useState<Record<string, RecordData>>({});
    const [editing, setEditing] = useState<RecordEntry | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [inputMinutes, setInputMinutes] = useState('');
    const [inputSeconds, setInputSeconds] = useState('');
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                const [saved, savedLevel, savedXp] = await Promise.all([
                    AsyncStorage.getItem('elevo_records'),
                    AsyncStorage.getItem('elevo_level'),
                    AsyncStorage.getItem('elevo_xp'),
                ]);
                if (saved) setValues(migrate(JSON.parse(saved)));
                setLevel(parseInt(savedLevel ?? '1') || 1);
                setXp(parseInt(savedXp ?? '0') || 0);
            };
            loadData();
        }, [])
    );

    const handleTap = (record: RecordEntry) => {
        const current = values[record.name]?.current ?? null;
        if (record.unit === 'seconds') {
            setInputMinutes(current != null ? String(Math.floor(current / 60)) : '');
            setInputSeconds(current != null ? String(current % 60) : '');
        } else {
            setInputValue(current != null ? String(current) : '');
        }
        setEditing(record);
    };

    const handleSave = async () => {
        if (!editing) return;
        let num: number | null;
        if (editing.unit === 'seconds') {
            if (!inputMinutes && !inputSeconds) {
                num = null;
            } else {
                const m = parseInt(inputMinutes || '0', 10);
                const s = Math.min(parseInt(inputSeconds || '0', 10), 59);
                num = (isNaN(m) ? 0 : m) * 60 + (isNaN(s) ? 0 : s);
            }
        } else {
            const parsed = parseFloat(inputValue);
            num = isNaN(parsed) ? null : parsed;
        }
        const existing = values[editing.name] ?? { current: null, history: [] };
        const newHistory =
            num !== null && existing.current !== null
                ? [...existing.history, existing.current]
                : existing.history;
        const newValues = { ...values, [editing.name]: { current: num, history: newHistory } };
        setValues(newValues);
        await AsyncStorage.setItem('elevo_records', JSON.stringify(newValues));
        setEditing(null);
    };

    const xpForNext = getXpForLevel(level + 1);
    const xpProgress = xpForNext > 0 ? Math.min(xp / xpForNext, 1) : 0;
    const dash = CIRCUMFERENCE * xpProgress;
    const levelTitle = getTitle(level);
    const fillPct = `${Math.round(xpProgress * 100)}%`;

    const prevBestValue = editing ? values[editing.name]?.current ?? null : null;
    const enteredValue = (() => {
        if (!editing) return null;
        if (editing.unit === 'seconds') {
            if (!inputMinutes && !inputSeconds) return null;
            const m = parseInt(inputMinutes || '0', 10);
            const s = Math.min(parseInt(inputSeconds || '0', 10), 59);
            return (isNaN(m) ? 0 : m) * 60 + (isNaN(s) ? 0 : s);
        }
        const parsed = parseFloat(inputValue);
        return isNaN(parsed) ? null : parsed;
    })();
    const delta = prevBestValue != null && enteredValue != null ? enteredValue - prevBestValue : null;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header card */}
                <View style={styles.headerCard}>
                    <View style={styles.ringWrap}>
                        <Svg width={RING_SIZE} height={RING_SIZE}>
                            <Circle
                                cx={RING_SIZE / 2}
                                cy={RING_SIZE / 2}
                                r={RING_R}
                                stroke={C.border}
                                strokeWidth={6}
                                fill="none"
                            />
                            <Circle
                                cx={RING_SIZE / 2}
                                cy={RING_SIZE / 2}
                                r={RING_R}
                                stroke={C.gold}
                                strokeWidth={6}
                                fill="none"
                                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                                strokeLinecap="round"
                                transform={`rotate(-90, ${RING_SIZE / 2}, ${RING_SIZE / 2})`}
                            />
                        </Svg>
                        <View style={styles.ringCenter}>
                            <Text style={styles.levelNum}>{level}</Text>
                        </View>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>Records</Text>
                        <Text style={styles.headerSubtitle}>{levelTitle}</Text>
                        <View style={styles.xpTrack}>
                            <View style={[styles.xpFill, { width: fillPct as any }]} />
                        </View>
                        <Text style={styles.xpLabel}>{xp} / {xpForNext} XP</Text>
                    </View>
                </View>

                {CATEGORIES.map(cat => (
                    <View key={cat.title}>
                        <Text style={styles.categoryHeader}>{cat.title.toUpperCase()}</Text>
                        <View style={styles.categoryCard}>
                            {cat.records.map((record, idx) => {
                                const entry = values[record.name];
                                const current = entry?.current ?? null;
                                const hist = entry?.history ?? [];
                                const isLast = idx === cat.records.length - 1;
                                return (
                                    <View key={record.name} style={[styles.outerRow, !isLast && styles.outerRowDivider]}>
                                        <TouchableOpacity
                                            style={styles.row}
                                            onPress={() => handleTap(record)}>
                                            <View style={styles.rowLeft}>
                                                <Text style={styles.recordName}>{record.name}</Text>
                                                {current != null && (
                                                    <View style={styles.prBadge}>
                                                        <Text style={styles.prBadgeText}>PR</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={styles.valueWrap}>
                                                <Text style={[
                                                    styles.recordValue,
                                                    current == null && styles.recordEmpty,
                                                ]}>
                                                    {current == null ? '—' : formatNum(current, record.unit)}
                                                </Text>
                                                {current != null && record.unit !== 'seconds' && (
                                                    <Text style={styles.recordUnit}>{record.unit}</Text>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                        {hist.length > 0 && (
                                            <Text style={styles.prevBest}>
                                                prev #{hist.length}{'  '}{formatValue(hist[hist.length - 1], record.unit)}
                                            </Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </ScrollView>

            <Modal visible={editing !== null} transparent animationType="fade">
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setEditing(null)}>
                    <TouchableOpacity style={styles.modalBox} activeOpacity={1} onPress={() => {}}>
                        <Text style={styles.modalTitle}>{editing?.name}</Text>
                        <Text style={styles.modalUnit}>
                            {editing?.unit === 'seconds'
                                ? 'Enter minutes and seconds'
                                : `Value in ${editing?.unit}`}
                        </Text>
                        {editing?.unit === 'seconds' ? (
                            <View style={styles.timeRow}>
                                <View style={styles.timeGroup}>
                                    <TextInput
                                        style={[styles.modalInput, { marginBottom: 4 }]}
                                        value={inputMinutes}
                                        onChangeText={setInputMinutes}
                                        keyboardType="number-pad"
                                        autoFocus
                                        placeholder="0"
                                        placeholderTextColor={C.faint}
                                    />
                                    <Text style={styles.timeLabel}>min</Text>
                                </View>
                                <Text style={styles.timeSeparator}>:</Text>
                                <View style={styles.timeGroup}>
                                    <TextInput
                                        style={[styles.modalInput, { marginBottom: 4 }]}
                                        value={inputSeconds}
                                        onChangeText={setInputSeconds}
                                        keyboardType="number-pad"
                                        placeholder="00"
                                        placeholderTextColor={C.faint}
                                    />
                                    <Text style={styles.timeLabel}>sec</Text>
                                </View>
                            </View>
                        ) : (
                            <TextInput
                                style={styles.modalInput}
                                value={inputValue}
                                onChangeText={setInputValue}
                                keyboardType="numeric"
                                autoFocus
                                placeholder="0"
                                placeholderTextColor={C.faint}
                            />
                        )}
                        {prevBestValue != null && (
                            <View style={styles.prevBestRow}>
                                <Text style={styles.prevBestLabel}>
                                    Previous best {formatValue(prevBestValue, editing?.unit ?? '')}
                                </Text>
                                {delta != null && (
                                    <View style={styles.deltaChip}>
                                        <Text style={styles.deltaChipText}>
                                            {formatDelta(delta, editing?.unit ?? '')}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setEditing(null)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={async () => {
                                    if (!editing) return;
                                    const newValues = {
                                        ...values,
                                        [editing.name]: { current: null, history: [] },
                                    };
                                    setValues(newValues);
                                    await AsyncStorage.setItem('elevo_records', JSON.stringify(newValues));
                                    setEditing(null);
                                }}>
                                <Text style={styles.clearText}>Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
        paddingTop: 60,
    },
    // ── Header card ──
    headerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 4,
        backgroundColor: C.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.border,
        padding: 16,
        gap: 16,
    },
    ringWrap: {
        width: RING_SIZE,
        height: RING_SIZE,
        shadowColor: C.gold,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    ringCenter: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelNum: {
        color: C.gold,
        fontSize: 18,
        fontFamily: F.serif,
        fontWeight: '700',
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        color: C.text,
        fontSize: 22,
        fontFamily: F.serif,
        marginBottom: 2,
    },
    headerSubtitle: {
        color: C.muted,
        fontSize: 12,
        marginBottom: 8,
    },
    xpTrack: {
        height: 3,
        backgroundColor: C.border,
        borderRadius: 2,
        marginBottom: 4,
    },
    xpFill: {
        height: 3,
        backgroundColor: C.gold,
        borderRadius: 2,
        shadowColor: C.gold,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    xpLabel: {
        color: C.faint,
        fontSize: 11,
    },
    // ── Categories ──
    categoryHeader: {
        color: C.gold,
        fontSize: 10,
        letterSpacing: 3.5,
        marginHorizontal: 24,
        marginTop: 24,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    categoryCard: {
        marginHorizontal: 16,
        backgroundColor: C.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: C.border,
        overflow: 'hidden',
    },
    outerRow: {},
    outerRowDivider: {
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    recordName: {
        color: C.text,
        fontSize: 14,
        flex: 1,
    },
    prBadge: {
        backgroundColor: C.gold,
        borderRadius: 5,
        paddingHorizontal: 6,
        paddingVertical: 2,
        shadowColor: C.gold,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    prBadgeText: {
        color: C.bg,
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    valueWrap: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    recordValue: {
        color: C.gold,
        fontSize: 22,
        fontFamily: F.serif,
        shadowColor: C.gold,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    recordUnit: {
        color: C.muted,
        fontSize: 10,
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    recordEmpty: {
        color: C.faint,
        fontSize: 16,
        fontFamily: undefined,
    },
    prevBest: {
        color: C.muted,
        fontSize: 11,
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    // ── Modal ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.82)',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    modalBox: {
        backgroundColor: C.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.border,
        padding: 24,
    },
    modalTitle: {
        color: C.text,
        fontSize: 18,
        fontFamily: F.serif,
        marginBottom: 4,
    },
    modalUnit: {
        color: C.faint,
        fontSize: 13,
        marginBottom: 16,
    },
    modalInput: {
        backgroundColor: C.bg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: C.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 26,
        fontFamily: F.serif,
        color: C.text,
        marginBottom: 20,
    },
    prevBestRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: -8,
        marginBottom: 20,
    },
    prevBestLabel: {
        color: C.muted,
        fontSize: 12,
    },
    deltaChip: {
        backgroundColor: C.gold,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        shadowColor: C.gold,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    deltaChipText: {
        color: C.bg,
        fontSize: 12,
        fontWeight: '700',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelText: {
        color: C.faint,
        fontSize: 15,
        fontWeight: 'bold',
    },
    clearButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    clearText: {
        color: C.faint,
        fontSize: 15,
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: C.gold,
        alignItems: 'center',
        shadowColor: C.gold,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },
    saveText: {
        color: C.bg,
        fontSize: 15,
        fontWeight: 'bold',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    timeGroup: {
        flex: 1,
        alignItems: 'center',
    },
    timeLabel: {
        color: C.faint,
        fontSize: 12,
    },
    timeSeparator: {
        color: C.faint,
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});
