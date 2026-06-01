import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NONE = 'None of these yet — I\'m starting fresh';

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
            Alert.alert(
                'Solid foundation.',
                "You're already building solid habits — want to jump straight to the full task list?",
                [
                    {
                        text: 'No, start guided',
                        onPress: async () => {
                            await save(habits, 'mid');
                            router.push('/onboarding/q3');
                        },
                    },
                    {
                        text: 'Yes, jump in',
                        onPress: async () => {
                            await save(habits, 'skip');
                            router.push('/onboarding/q3');
                        },
                    },
                ]
            );
            return;
        }

        await save(habits, rampLevel);
        router.push('/onboarding/q3');
    };

    const save = async (habits: string[], rampLevel: string) => {
        await Promise.all([
            AsyncStorage.setItem('elevo_existing_habits', JSON.stringify(habits)),
            AsyncStorage.setItem('elevo_ramp_level', rampLevel),
        ]);
    };

    const canContinue = selected.length > 0;

    return (
        <View style={styles.container}>
            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>Step 3 of 9</Text>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: '33%' }]} />
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
    container: { flex: 1, backgroundColor: '#0a0a0a', paddingBottom: 32 },
    progressContainer: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
    progressText: { color: '#5a5650', fontSize: 12, marginBottom: 8 },
    progressTrack: { height: 2, backgroundColor: '#2a2a2a', borderRadius: 1 },
    progressFill: { height: 2, backgroundColor: '#c9a84c', borderRadius: 1 },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
    question: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#e8e0cc',
        marginBottom: 8,
        lineHeight: 28,
    },
    subtitle: {
        fontSize: 13,
        color: '#5a5650',
        marginBottom: 24,
        lineHeight: 20,
    },
    option: {
        backgroundColor: '#0f0f0f',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    optionSelected: { borderColor: '#c9a84c', borderWidth: 2 },
    optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#2a2a2a',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    checkboxSelected: {
        backgroundColor: '#c9a84c',
        borderColor: '#c9a84c',
    },
    checkmark: {
        color: '#0a0a0a',
        fontSize: 13,
        fontWeight: 'bold',
        lineHeight: 16,
    },
    optionText: { color: '#e8e0cc', fontSize: 15, flex: 1 },
    optionTextSelected: { color: '#e8e0cc' },
    button: {
        marginHorizontal: 24,
        marginTop: 8,
        backgroundColor: '#c9a84c',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonDisabled: { backgroundColor: '#2a2a2a' },
    buttonText: { color: '#0a0a0a', fontSize: 16, fontWeight: 'bold' },
    buttonTextDisabled: { color: '#5a5650' },
});
