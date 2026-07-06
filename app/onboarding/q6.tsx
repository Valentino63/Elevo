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
                    <View style={styles.progressHeader}>
                        <Text style={styles.stepCounter}>08 / 11</Text>
                        <Text style={styles.progressLabel}>Building your plan</Text>
                    </View>
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
    option: {
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    optionSelected: { borderColor: C.gold, borderWidth: 2, backgroundColor: C.cardSelected },
    optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: C.border,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    checkboxSelected: { backgroundColor: C.gold, borderColor: C.gold },
    checkmark: { color: C.bg, fontSize: 13, fontWeight: 'bold', lineHeight: 16 },
    optionText: { color: C.text, fontSize: 15, flex: 1 },
    optionTextSelected: { color: C.text },
    otherLabel: {
        color: C.muted,
        fontSize: 13,
        marginTop: 8,
        marginBottom: 10,
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
        minHeight: 100,
    },
    charCount: { color: C.faint, fontSize: 12, marginTop: 8, textAlign: 'right' },
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
