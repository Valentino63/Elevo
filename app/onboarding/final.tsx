import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { localDateString } from '../../lib/utils';

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
                <Text style={styles.progressText}>Step 11 of 11</Text>
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
                    {choice === 'ease' && <Text style={styles.cardCheck}>✓</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, choice === 'jump' && styles.cardSelected]}
                    onPress={() => setChoice('jump')}
                    activeOpacity={0.8}>
                    <Text style={styles.cardHeading}>Jump straight in</Text>
                    <Text style={styles.cardBody}>
                        Show me everything from day one. Full task list, all XP — no gradual unlock.
                    </Text>
                    {choice === 'jump' && <Text style={styles.cardCheck}>✓</Text>}
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
    container: { flex: 1, backgroundColor: '#0a0a0a', paddingBottom: 32 },
    progressContainer: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
    progressText: { color: '#5a5650', fontSize: 12, marginBottom: 8 },
    progressTrack: { height: 2, backgroundColor: '#2a2a2a', borderRadius: 1 },
    progressFill: { height: 2, backgroundColor: '#c9a84c', borderRadius: 1 },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#e8e0cc',
        marginBottom: 8,
        lineHeight: 30,
    },
    subtitle: {
        fontSize: 13,
        color: '#5a5650',
        marginBottom: 28,
        lineHeight: 20,
    },
    card: {
        backgroundColor: '#0f0f0f',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 12,
        paddingVertical: 20,
        paddingHorizontal: 20,
        marginBottom: 14,
        position: 'relative',
    },
    cardSelected: {
        borderColor: '#c9a84c',
        borderWidth: 2,
    },
    cardHeading: {
        color: '#e8e0cc',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardBody: {
        color: '#5a5650',
        fontSize: 14,
        lineHeight: 22,
    },
    cardCheck: {
        position: 'absolute',
        top: 18,
        right: 18,
        color: '#c9a84c',
        fontSize: 16,
        fontWeight: 'bold',
    },
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
