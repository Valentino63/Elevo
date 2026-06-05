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

const MAX = 500;

export default function Q4() {
    const router = useRouter();
    const [answer, setAnswer] = useState('');
    const trimmed = answer.trim();
    const isValid = trimmed.length >= 20;

    const handleContinue = async () => {
        await AsyncStorage.setItem('elevo_q4', trimmed);
        router.push('/onboarding/q5');
    };

    return (
        <KeyboardAvoidingView
            style={styles.outer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.container}>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>Step 6 of 11</Text>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: '55%' }]} />
                    </View>
                </View>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                    <Text style={styles.question}>
                        What are you willing to give up to become who you want to be?
                    </Text>
                    <Text style={styles.subtitle}>
                        The things we're willing to sacrifice reveal what we truly want.
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Write your answer here..."
                        placeholderTextColor="#5a5650"
                        value={answer}
                        onChangeText={t => setAnswer(t.slice(0, MAX))}
                        multiline
                        textAlignVertical="top"
                    />
                    <Text style={[styles.charCount, trimmed.length > MAX - 20 && styles.charCountWarn]}>
                        {trimmed.length} / {MAX}
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
    input: {
        backgroundColor: '#0f0f0f',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#e8e0cc',
        minHeight: 140,
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
});
