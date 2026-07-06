import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, F } from '../../lib/tokens';

const NONE = "None of these yet — I'm starting fresh";

const OPTIONS = [
    'I sleep 7-9 hours consistently',
    'I drink enough water daily',
    'I get sunlight / go outside every day',
    'I stay off my phone for the first hour awake',
    'I train or move my body daily',
    'I read or learn something every day',
    'I eat clean most days',
    NONE,
];

export default function Q2() {
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (option: string) => {
        if (option === NONE) {
            setSelected(prev => prev.includes(NONE) ? [] : [NONE]);
        } else {
            setSelected(prev => {
                const without = prev.filter(o => o !== NONE);
                return without.includes(option)
                    ? without.filter(o => o !== option)
                    : [...without, option];
            });
        }
    };

    const handleContinue = async () => {
        const habits = selected.filter(o => o !== NONE);
        const count = habits.length;
        let rampLevel: string;
        if (count <= 1) {
            rampLevel = 'full';
        } else if (count <= 4) {
            rampLevel = 'mid';
        } else {
            rampLevel = 'skip';
        }
        await Promise.all([
            AsyncStorage.setItem('elevo_existing_habits', JSON.stringify(habits)),
            AsyncStorage.setItem('elevo_ramp_level', rampLevel),
        ]);
        router.push('/onboarding/q3');
    };

    const canContinue = selected.length > 0;

    return (
        <View style={styles.container}>
            <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                    <Text style={styles.stepCounter}>04 / 11</Text>
                    <Text style={styles.progressLabel}>Building your plan</Text>
                </View>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: '36%' }]} />
                </View>
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                <Text style={styles.question}>
                    Which of these are already daily habits for you?
                </Text>
                <Text style={styles.subtitle}>
                    Not a test. We're just finding where to start you — so you're not bored and not buried.
                </Text>
                {OPTIONS.map((option) => {
                    const isSelected = selected.includes(option);
                    return (
                        <TouchableOpacity
                            key={option}
                            style={[styles.option, isSelected && styles.optionSelected]}
                            onPress={() => toggle(option)}
                            activeOpacity={0.7}>
                            <View style={styles.optionRow}>
                                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                    {option}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            <TouchableOpacity
                style={[styles.button, !canContinue && styles.buttonDisabled]}
                onPress={handleContinue}
                disabled={!canContinue}>
                <Text style={[styles.buttonText, !canContinue && styles.buttonTextDisabled]}>
                    Continue
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg, paddingBottom: 32 },
    progressContainer: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    stepCounter: { color: C.gold, fontSize: 12, fontWeight: '600', letterSpacing: 1 },
    progressLabel: { color: C.muted, fontSize: 12 },
    progressTrack: { height: 2, backgroundColor: C.border, borderRadius: 1 },
    progressFill: { height: 2, backgroundColor: C.gold, borderRadius: 1 },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
    question: {
        fontSize: 26,
        fontFamily: F.serif,
        color: C.text,
        marginBottom: 8,
        lineHeight: 34,
    },
    subtitle: {
        fontSize: 14,
        color: C.muted,
        marginBottom: 24,
        lineHeight: 22,
    },
    option: {
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    optionSelected: { borderColor: C.gold, borderWidth: 2, backgroundColor: C.cardSelected },
    optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: C.border,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    checkboxSelected: {
        backgroundColor: C.gold,
        borderColor: C.gold,
    },
    checkmark: {
        color: C.bg,
        fontSize: 13,
        fontWeight: 'bold',
        lineHeight: 16,
    },
    optionText: { color: C.text, fontSize: 15, flex: 1 },
    optionTextSelected: { color: C.text },
    button: {
        marginHorizontal: 24,
        marginTop: 8,
        backgroundColor: C.gold,
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonDisabled: { backgroundColor: C.border },
    buttonText: { color: C.bg, fontSize: 16, fontWeight: 'bold' },
    buttonTextDisabled: { color: C.faint },
});
