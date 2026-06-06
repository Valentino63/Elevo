import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MIN = 100;
const MAX = 500;

export default function Q8() {
    const router = useRouter();
    const [answer, setAnswer] = useState('');
    const trimmed = answer.trim();
    const isValid = trimmed.length >= MIN;

    const handleContinue = async () => {
        await AsyncStorage.setItem('elevo_q8', trimmed);
        router.push('/onboarding/final');
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem('elevo_q8', '');
        router.push('/onboarding/final');
    };

    return (
        <KeyboardAvoidingView
            style={styles.outer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.container}>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>Step 10 of 11</Text>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: '91%' }]} />
                    </View>
                </View>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                    <Text style={styles.title}>One final task.</Text>
                    <Text style={styles.instructions}>
                        Find a quiet place. Put your phone down for 30 minutes. Think about what you
                        actually want your life to look like in 3 years — no filters, no judgment.
                        Then come back and write it here.
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Write your vision here..."
                        placeholderTextColor="#5a5650"
                        value={answer}
                        onChangeText={t => setAnswer(t.slice(0, MAX))}
                        multiline
                        textAlignVertical="top"
                    />
                    <Text style={[styles.charCount, trimmed.length > MAX - 20 && styles.charCountWarn]}>
                        {trimmed.length} / {MAX} (minimum {MIN})
                    </Text>
                </ScrollView>
                <TouchableOpacity
                    style={[styles.button, !isValid && styles.buttonDisabled]}
                    onPress={handleContinue}
                    disabled={!isValid}>
                    <Text style={[styles.buttonText, !isValid && styles.buttonTextDisabled]}>
                        Continue
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipButtonText}>Skip for now</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    outer: { flex: 1, backgroundColor: '#0a0a0a' },
    container: { flex: 1, paddingBottom: 32 },
    progressContainer: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
    progressText: { color: '#5a5650', fontSize: 12, marginBottom: 8 },
    progressTrack: { height: 2, backgroundColor: '#2a2a2a', borderRadius: 1 },
    progressFill: { height: 2, backgroundColor: '#c9a84c', borderRadius: 1 },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#c9a84c',
        marginBottom: 16,
    },
    instructions: {
        fontSize: 15,
        color: '#5a5650',
        lineHeight: 24,
        marginBottom: 28,
    },
    input: {
        backgroundColor: '#0f0f0f',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#e8e0cc',
        minHeight: 180,
    },
    charCount: {
        color: '#5a5650',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'right',
    },
    charCountWarn: { color: '#c9a84c' },
    button: {
        marginHorizontal: 24,
        marginTop: 16,
        backgroundColor: '#c9a84c',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonDisabled: { backgroundColor: '#2a2a2a' },
    buttonText: { color: '#0a0a0a', fontSize: 16, fontWeight: 'bold' },
    buttonTextDisabled: { color: '#5a5650' },
    skipButton: {
        marginHorizontal: 24,
        marginTop: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    skipButtonText: {
        color: '#5a5650',
        fontSize: 14,
    },
});
