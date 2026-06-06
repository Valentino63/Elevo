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
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

type HistoryItem = { label: string; value: string; separator: boolean };

function getHistoryItems(history: number[], unit: string): HistoryItem[] {
    if (history.length === 0) return [];
    if (history.length <= 4) {
        return history.map((v, i) => ({
            label: i === 0 ? 'Day 1' : `#${i + 1}`,
            value: formatValue(v, unit),
            separator: false,
        }));
    }
    const last4Start = history.length - 4;
    return [
        { label: 'Day 1', value: formatValue(history[0], unit), separator: false },
        { label: '···', value: '', separator: true },
        ...history.slice(-4).map((v, i) => ({
            label: `#${last4Start + i + 1}`,
            value: formatValue(v, unit),
            separator: false,
        })),
    ];
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

export default function RecordsScreen() {
    const [values, setValues] = useState<Record<string, RecordData>>({});
    const [editing, setEditing] = useState<RecordEntry | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [inputMinutes, setInputMinutes] = useState('');
    const [inputSeconds, setInputSeconds] = useState('');

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                const saved = await AsyncStorage.getItem('elevo_records');
                if (saved) setValues(migrate(JSON.parse(saved)));
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

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={styles.title}>Records</Text>
                {CATEGORIES.map(cat => (
                    <View key={cat.title}>
                        <Text style={styles.categoryHeader}>{cat.title.toUpperCase()}</Text>
                        {cat.records.map(record => {
                            const entry = values[record.name];
                            const current = entry?.current ?? null;
                            const historyItems = getHistoryItems(entry?.history ?? [], record.unit);
                            return (
                                <View key={record.name} style={styles.outerRow}>
                                    <TouchableOpacity
                                        style={styles.row}
                                        onPress={() => handleTap(record)}>
                                        <Text style={styles.recordName}>{record.name}</Text>
                                        <Text style={[
                                            styles.recordValue,
                                            current == null && styles.recordEmpty,
                                        ]}>
                                            {formatValue(current, record.unit)}
                                        </Text>
                                    </TouchableOpacity>
                                    {historyItems.length > 0 && (
                                        <View style={styles.historyRow}>
                                            {historyItems.map((item, idx) =>
                                                item.separator ? (
                                                    <Text key={idx} style={styles.historySep}>···</Text>
                                                ) : (
                                                    <View key={idx} style={styles.historyChip}>
                                                        <Text style={styles.historyLabel}>{item.label} </Text>
                                                        <Text style={styles.historyValue}>{item.value}</Text>
                                                    </View>
                                                )
                                            )}
                                        </View>
                                    )}
                                </View>
                            );
                        })}
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
                                        placeholderTextColor="#5a5650"
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
                                        placeholderTextColor="#5a5650"
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
                                placeholderTextColor="#5a5650"
                            />
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
        backgroundColor: '#0a0a0a',
        paddingTop: 60,
    },
    title: {
        color: '#c9a84c',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    categoryHeader: {
        color: '#c9a84c',
        fontSize: 13,
        fontWeight: 'bold',
        marginHorizontal: 24,
        marginTop: 20,
        marginBottom: 8,
        letterSpacing: 1.5,
    },
    outerRow: {
        marginHorizontal: 24,
        marginBottom: 8,
        backgroundColor: '#0f0f0f',
        borderRadius: 8,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    recordName: {
        color: '#e8e0cc',
        fontSize: 15,
    },
    recordValue: {
        color: '#c9a84c',
        fontSize: 15,
        fontWeight: 'bold',
    },
    recordEmpty: {
        color: '#5a5650',
    },
    historyRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingTop: 2,
        paddingBottom: 10,
    },
    historyChip: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    historyLabel: {
        color: '#4a4640',
        fontSize: 11,
        fontWeight: '600',
    },
    historyValue: {
        color: '#7a7268',
        fontSize: 14,
        fontWeight: '700',
    },
    historySep: {
        color: '#2a2820',
        fontSize: 12,
        marginHorizontal: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    modalBox: {
        backgroundColor: '#0f0f0f',
        borderRadius: 12,
        padding: 24,
    },
    modalTitle: {
        color: '#e8e0cc',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    modalUnit: {
        color: '#5a5650',
        fontSize: 13,
        marginBottom: 16,
    },
    modalInput: {
        backgroundColor: '#0a0a0a',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 20,
        color: '#e8e0cc',
        marginBottom: 20,
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
        color: '#5a5650',
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
        color: '#5a5650',
        fontSize: 15,
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#c9a84c',
        alignItems: 'center',
    },
    saveText: {
        color: '#0a0a0a',
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
        color: '#5a5650',
        fontSize: 12,
    },
    timeSeparator: {
        color: '#5a5650',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});
