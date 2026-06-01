import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Welcome() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const isValid = username.trim().length >= 3;

    const handleContinue = async () => {
        await AsyncStorage.setItem('elevo_username', username.trim());
        router.push('/onboarding/dob');
    };

    return (
        <KeyboardAvoidingView
            style={styles.outer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.container}>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>Step 1 of 11</Text>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: '9%' }]} />
                    </View>
                </View>
                <View style={styles.content}>
                    <Text style={styles.title}>Welcome to Elevo</Text>
                    <Text style={styles.subtitle}>
                        Before we begin, we need to know who you are.
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your username"
                        placeholderTextColor="#5a5650"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoFocus
                    />
                </View>
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
    content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#c9a84c', marginBottom: 12 },
    subtitle: { fontSize: 15, color: '#5a5650', lineHeight: 22, marginBottom: 32 },
    input: {
        backgroundColor: '#0f0f0f',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#e8e0cc',
    },
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
