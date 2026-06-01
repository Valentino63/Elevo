import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

function calcAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
}

function formatDate(d: Date): string {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Dob() {
    const router = useRouter();
    const defaultDate = new Date(2000, 0, 1);
    const [dob, setDob] = useState<Date>(defaultDate);
    const [hasSelected, setHasSelected] = useState(false);
    const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

    const age = hasSelected ? calcAge(dob) : null;
    const isBlocked = age !== null && age < 16;
    const canContinue = hasSelected && !isBlocked;

    const onChange = (_: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowPicker(false);
        if (selectedDate) {
            setDob(selectedDate);
            setHasSelected(true);
        }
    };

    const handleContinue = async () => {
        await AsyncStorage.setItem('elevo_dob', dob.toISOString());
        router.push('/onboarding/q1');
    };

    return (
        <View style={styles.container}>
            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>Step 2 of 11</Text>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: '18%' }]} />
                </View>
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                <Text style={styles.question}>When were you born?</Text>
                <Text style={styles.subtitle}>
                    We're required to verify you're old enough to use Elevo.
                </Text>

                {Platform.OS === 'ios' ? (
                    <DateTimePicker
                        value={dob}
                        mode="date"
                        display="spinner"
                        onChange={onChange}
                        maximumDate={new Date()}
                        minimumDate={new Date(1900, 0, 1)}
                        textColor="#e8e0cc"
                        style={styles.iosPicker}
                    />
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.dobButton}
                            onPress={() => setShowPicker(true)}>
                            <Text style={styles.dobButtonText}>
                                {hasSelected ? formatDate(dob) : 'Select date of birth'}
                            </Text>
                        </TouchableOpacity>
                        {showPicker && (
                            <DateTimePicker
                                value={dob}
                                mode="date"
                                display="default"
                                onChange={onChange}
                                maximumDate={new Date()}
                                minimumDate={new Date(1900, 0, 1)}
                            />
                        )}
                    </>
                )}

                {Platform.OS === 'ios' && hasSelected && (
                    <Text style={styles.selectedDateText}>{formatDate(dob)}</Text>
                )}

                {isBlocked && (
                    <View style={styles.blockBox}>
                        <Text style={styles.blockTitle}>You must be 16 or older to use Elevo.</Text>
                        <Text style={styles.blockBody}>
                            Elevo is designed for adults. Come back when you're ready.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {!isBlocked && (
                <TouchableOpacity
                    style={[styles.button, !canContinue && styles.buttonDisabled]}
                    onPress={handleContinue}
                    disabled={!canContinue}>
                    <Text style={[styles.buttonText, !canContinue && styles.buttonTextDisabled]}>
                        Continue
                    </Text>
                </TouchableOpacity>
            )}
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
        marginBottom: 28,
        lineHeight: 20,
    },
    iosPicker: {
        marginBottom: 8,
        height: 200,
    },
    selectedDateText: {
        color: '#c9a84c',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 16,
    },
    dobButton: {
        backgroundColor: '#0f0f0f',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    dobButtonText: {
        color: '#e8e0cc',
        fontSize: 15,
    },
    blockBox: {
        marginTop: 24,
        backgroundColor: '#1a0a0a',
        borderWidth: 1,
        borderColor: '#8b2020',
        borderRadius: 10,
        padding: 20,
    },
    blockTitle: {
        color: '#e07070',
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    blockBody: {
        color: '#8b5050',
        fontSize: 14,
        lineHeight: 21,
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
