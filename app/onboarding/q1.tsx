import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
                <Text style={styles.progressText}>Step 3 of 11</Text>
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
                        <Text style={styles.optionText}>{option}</Text>
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
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    optionSelected: { borderColor: '#c9a84c', borderWidth: 2 },
    optionText: { color: '#e8e0cc', fontSize: 15 },
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
