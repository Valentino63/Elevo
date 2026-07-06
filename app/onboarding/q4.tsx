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
import { C, F } from '../../lib/tokens';

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
                    <View style={styles.progressHeader}>
                        <Text style={styles.stepCounter}>06 / 11</Text>
                        <Text style={styles.progressLabel}>Building your plan</Text>
                    </View>
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
    outer: { flex: 1, backgroundColor: C.bg },
    container: { flex: 1, paddingBottom: 32 },
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
    input: {
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: C.text,
        minHeight: 140,
    },
    charCount: {
        color: C.faint,
        fontSize: 12,
        marginTop: 8,
        textAlign: 'right',
    },
    charCountWarn: { color: C.gold },
    button: {
        marginHorizontal: 24,
        marginTop: 16,
        backgroundColor: C.gold,
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonDisabled: { backgroundColor: C.border },
    buttonText: { color: C.bg, fontSize: 16, fontWeight: 'bold' },
    buttonTextDisabled: { color: C.faint },
});
