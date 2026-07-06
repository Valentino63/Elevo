import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, F } from '../../lib/tokens';

const OPTIONS = [
    'My body and health',
    'My mind and knowledge',
    'My business and money',
    'My relationships and social life',
    'All of the above',
];

export default function Q1() {
    const router = useRouter();
    const [selected, setSelected] = useState<string | null>(null);

    const handleContinue = async () => {
        await AsyncStorage.setItem('elevo_focus', selected!);
        router.push('/onboarding/q2');
    };

    return (
        <View style={styles.container}>
            <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                    <Text style={styles.stepCounter}>03 / 11</Text>
                    <Text style={styles.progressLabel}>Building your plan</Text>
                </View>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: '27%' }]} />
                </View>
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                <Text style={styles.question}>What is your main focus right now?</Text>
                <Text style={styles.subtitle}>
                    This shapes which tasks and archetypes we surface for you.
                </Text>
                {OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[styles.option, selected === option && styles.optionSelected]}
                        onPress={() => setSelected(option)}>
                        <View style={styles.optionRow}>
                            <Text style={styles.optionText}>{option}</Text>
                            <View style={[styles.radioRing, selected === option && styles.radioRingSelected]}>
                                {selected === option && <View style={styles.radioDot} />}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity
                style={[styles.button, !selected && styles.buttonDisabled]}
                onPress={handleContinue}
                disabled={!selected}>
                <Text style={[styles.buttonText, !selected && styles.buttonTextDisabled]}>
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
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    optionSelected: { borderColor: C.gold, borderWidth: 2, backgroundColor: C.cardSelected },
    optionRow: { flexDirection: 'row', alignItems: 'center' },
    optionText: { color: C.text, fontSize: 15, flex: 1 },
    radioRing: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: C.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioRingSelected: { borderColor: C.gold },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.gold },
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
