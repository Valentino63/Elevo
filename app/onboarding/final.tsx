import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { localDateString } from '../../lib/utils';
import { C, F } from '../../lib/tokens';

type Choice = 'ease' | 'jump';

export default function Final() {
    const router = useRouter();
    const [choice, setChoice] = useState<Choice | null>(null);

    const handleBegin = async () => {
        const today = localDateString();
        const writes: Promise<void>[] = [
            AsyncStorage.setItem('elevo_ramp_start_date', today),
            AsyncStorage.setItem('elevo_onboarding_done', 'true'),
        ];
        if (choice === 'jump') {
            writes.push(AsyncStorage.setItem('elevo_ramp_level', 'skip'));
        }
        await Promise.all(writes);
        router.replace('/(tabs)');
    };

    return (
        <View style={styles.container}>
            <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                    <Text style={styles.stepCounter}>11 / 11</Text>
                    <Text style={styles.progressLabel}>Building your plan</Text>
                </View>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: '100%' }]} />
                </View>
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                <Text style={styles.title}>How do you want to start?</Text>
                <Text style={styles.subtitle}>
                    You can always change your mind later in settings.
                </Text>

                <TouchableOpacity
                    style={[styles.card, choice === 'ease' && styles.cardSelected]}
                    onPress={() => setChoice('ease')}
                    activeOpacity={0.8}>
                    <Text style={styles.cardHeading}>Ease me in</Text>
                    <Text style={styles.cardBody}>
                        Start with the essentials. New tasks unlock gradually over the first few weeks as habits stack.
                    </Text>
                    {choice === 'ease' && <View style={styles.cardCheck}><View style={styles.cardCheckDot} /></View>}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, choice === 'jump' && styles.cardSelected]}
                    onPress={() => setChoice('jump')}
                    activeOpacity={0.8}>
                    <Text style={styles.cardHeading}>Jump straight in</Text>
                    <Text style={styles.cardBody}>
                        Show me everything from day one. Full task list, all XP — no gradual unlock.
                    </Text>
                    {choice === 'jump' && <View style={styles.cardCheck}><View style={styles.cardCheckDot} /></View>}
                </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
                style={[styles.button, !choice && styles.buttonDisabled]}
                onPress={handleBegin}
                disabled={!choice}>
                <Text style={[styles.buttonText, !choice && styles.buttonTextDisabled]}>
                    Begin my journey
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
    title: {
        fontSize: 26,
        fontFamily: F.serif,
        color: C.text,
        marginBottom: 8,
        lineHeight: 34,
    },
    subtitle: {
        fontSize: 14,
        color: C.muted,
        marginBottom: 28,
        lineHeight: 22,
    },
    card: {
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 12,
        paddingVertical: 20,
        paddingHorizontal: 20,
        marginBottom: 14,
        position: 'relative',
    },
    cardSelected: {
        borderColor: C.gold,
        borderWidth: 2,
        backgroundColor: C.cardSelected,
    },
    cardHeading: {
        color: C.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardBody: {
        color: C.muted,
        fontSize: 14,
        lineHeight: 22,
    },
    cardCheck: {
        position: 'absolute',
        top: 18,
        right: 18,
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: C.gold,
        backgroundColor: C.gold,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardCheckDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: C.bg,
    },
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
