import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { C, F } from '../../lib/tokens';

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
                <View style={styles.progressHeader}>
                    <Text style={styles.stepCounter}>02 / 11</Text>
                    <Text style={styles.progressLabel}>Building your plan</Text>
                </View>
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
    container: { flex: 1, backgroundColor: C.bg, paddingBottom: 32 },
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
        marginBottom: 28,
        lineHeight: 22,
    },
    iosPicker: {
        marginBottom: 8,
        height: 200,
    },
    selectedDateText: {
        color: C.gold,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 16,
    },
    dobButton: {
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    dobButtonText: {
        color: C.text,
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
        backgroundColor: C.gold,
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonDisabled: { backgroundColor: C.border },
    buttonText: { color: C.bg, fontSize: 16, fontWeight: 'bold' },
    buttonTextDisabled: { color: C.faint },
});
