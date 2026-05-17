import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OPTIONS = [
    'Pretty inactive, just getting started',
    'I have some good habits but inconsistent',
    "I'm fairly disciplined but want more",
    "I'm already consistent, just want to level up",
];

export default function Q2() {
    const router = useRouter();
    const [selected, setSelected] = useState<string | null>(null);

    const handleContinue = async () => {
        await AsyncStorage.setItem('elevo_q2', selected!);
        router.push('/onboarding/q3');
    };

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
                    How would you describe your current lifestyle?
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
        marginBottom: 24,
        lineHeight: 28,
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
