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

const PRESETS = [
    'Lost motivation',
    'No time',
    'Got discouraged',
    "Didn't know how",
    'Kept restarting',
];

const OTHER_MAX = 500;

export default function Q6() {
    const router = useRouter();
    const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
    const [other, setOther] = useState('');

    const togglePreset = (p: string) => {
        setSelectedPresets(prev =>
            prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
        );
    };

    const canContinue = selectedPresets.length > 0 || other.trim().length > 0;

    const handleContinue = async () => {
        await AsyncStorage.setItem(
            'elevo_q6',
            JSON.stringify({ selected: selectedPresets, other: other.trim() })
        );
        router.push('/onboarding/q7');
    };

    return (
        <KeyboardAvoidingView
            style={styles.outer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.container}>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>Step 8 of 11</Text>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: '73%' }]} />
                    </View>
                </View>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                    <Text style={styles.question}>What has stopped you before?</Text>
                    <Text style={styles.subtitle}>
                        Knowing what's held you back helps us help you push through it.
                    </Text>
                    {PRESETS.map((p) => {
                        const isSelected = selectedPresets.includes(p);
                        return (
                            <TouchableOpacity
                                key={p}
                                style={[styles.option, isSelected && styles.optionSelected]}
                                onPress={() => togglePreset(p)}
                                activeOpacity={0.7}>
                                <View style={styles.optionRow}>
                                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                        {p}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                    <Text style={styles.otherLabel}>Something else?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Write it here (optional)..."
                        placeholderTextColor="#5a5650"
                        value={other}
                        onChangeText={t => setOther(t.slice(0, OTHER_MAX))}
                        multiline
                        textAlignVertical="top"
                    />
                    {other.length > 0 && (
                        <Text style={[styles.charCount, other.length > OTHER_MAX - 20 && styles.charCountWarn]}>
                            {other.length} / {OTHER_MAX}
                        </Text>
                    )}
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
    checkboxSelected: { backgroundColor: '#c9a84c', borderColor: '#c9a84c' },
    checkmark: { color: '#0a0a0a', fontSize: 13, fontWeight: 'bold', lineHeight: 16 },
    optionText: { color: '#e8e0cc', fontSize: 15, flex: 1 },
    optionTextSelected: { color: '#e8e0cc' },
    otherLabel: {
        color: '#5a5650',
        fontSize: 13,
        marginTop: 8,
        marginBottom: 10,
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
        minHeight: 100,
    },
    charCount: { color: '#5a5650', fontSize: 12, marginTop: 8, textAlign: 'right' },
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
