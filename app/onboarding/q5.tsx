import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, F } from '../../lib/tokens';

const ARCHETYPES = [
    'Healthy Guy',
    'Gymbro / Athlete',
    'Entrepreneur',
    'Scholar',
    'Creator',
    'Monk',
    'Social Guy',
    'Family Man',
    'Looksmaxer',
    'Jack of All Trades',
];

const PRIORITY_MAP: Record<string, string[]> = {
    'My body and health': ['Healthy Guy', 'Gymbro / Athlete', 'Looksmaxer'],
    'My mind and knowledge': ['Scholar', 'Monk'],
    'My business and money': ['Entrepreneur', 'Creator'],
    'My relationships and social life': ['Social Guy', 'Family Man'],
    'All of the above': ['Jack of All Trades'],
};

const SUB_ARCHETYPES: Record<string, string[]> = {
    'Healthy Guy': ['Weight Loss', 'Longevity', 'Energy Optimisation'],
    'Gymbro / Athlete': ['Bulk', 'Cut', 'Maintain / Recomp', 'Sport-Specific'],
    'Entrepreneur': ['Early Stage Builder', 'Operator / Scaler', 'Freelancer'],
    'Scholar': ['Academic', 'Self-Taught', 'Reader'],
    'Creator': ['Short Form', 'Long Form', 'Writer'],
    'Monk': ['Stoic', 'Spiritual'],
    'Social Guy': ['Connector', 'Public Speaker', 'Dating / Charisma'],
    'Family Man': ['Father', 'Partner', 'Provider'],
    'Looksmaxer': ['Skin / Grooming', 'Style', 'Aesthetic Physique'],
    'Jack of All Trades': [],
};

export default function Q5() {
    const router = useRouter();
    const [archetype, setArchetype] = useState<string | null>(null);
    const [subArchetype, setSubArchetype] = useState<string | null>(null);
    const [showingSub, setShowingSub] = useState(false);
    const [recommended, setRecommended] = useState<string[]>([]);
    const [sortedArchetypes, setSortedArchetypes] = useState(ARCHETYPES);

    useEffect(() => {
        AsyncStorage.getItem('elevo_focus').then(focus => {
            if (!focus) return;
            const recs = PRIORITY_MAP[focus] ?? [];
            setRecommended(recs);
            if (recs.length > 0) {
                setSortedArchetypes([
                    ...ARCHETYPES.filter(a => recs.includes(a)),
                    ...ARCHETYPES.filter(a => !recs.includes(a)),
                ]);
            }
        });
    }, []);

    const subs = archetype ? SUB_ARCHETYPES[archetype] ?? [] : [];

    const handleArchetypeContinue = async () => {
        await AsyncStorage.setItem('elevo_archetype', archetype!);
        if (subs.length > 0) {
            setShowingSub(true);
        } else {
            router.push('/onboarding/q6');
        }
    };

    const handleSubContinue = async () => {
        await AsyncStorage.setItem('elevo_subarchetype', subArchetype!);
        router.push('/onboarding/q6');
    };

    if (showingSub) {
        return (
            <View style={styles.container}>
                <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.stepCounter}>07 / 11</Text>
                        <Text style={styles.progressLabel}>Building your plan</Text>
                    </View>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: '64%' }]} />
                    </View>
                </View>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                    <Text style={styles.question}>Narrow it down — which sub-path fits best?</Text>
                    <Text style={styles.subtitle}>Fine-tune your path so your tasks actually match your goals.</Text>
                    <Text style={styles.archetypeLabel}>{archetype}</Text>
                    {subs.map((sub) => (
                        <TouchableOpacity
                            key={sub}
                            style={[styles.option, subArchetype === sub && styles.optionSelected]}
                            onPress={() => setSubArchetype(sub)}>
                            <View style={styles.optionRow}>
                                <Text style={styles.optionText}>{sub}</Text>
                                <View style={[styles.radioRing, subArchetype === sub && styles.radioRingSelected]}>
                                    {subArchetype === sub && <View style={styles.radioDot} />}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <TouchableOpacity
                    style={[styles.button, !subArchetype && styles.buttonDisabled]}
                    onPress={handleSubContinue}
                    disabled={!subArchetype}>
                    <Text style={[styles.buttonText, !subArchetype && styles.buttonTextDisabled]}>
                        Continue
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                    <Text style={styles.stepCounter}>07 / 11</Text>
                    <Text style={styles.progressLabel}>Building your plan</Text>
                </View>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: '64%' }]} />
                </View>
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                <Text style={styles.question}>Which path feels most like you?</Text>
                <Text style={styles.subtitle}>
                    This determines your task library and XP multipliers.
                </Text>
                {sortedArchetypes.map((name) => (
                    <TouchableOpacity
                        key={name}
                        style={[styles.option, archetype === name && styles.optionSelected]}
                        onPress={() => setArchetype(name)}>
                        <View style={styles.optionRow}>
                            <Text style={styles.optionText}>{name}</Text>
                            {recommended.includes(name) && (
                                <Text style={styles.badge}>Based on your focus</Text>
                            )}
                            <View style={[styles.radioRing, archetype === name && styles.radioRingSelected]}>
                                {archetype === name && <View style={styles.radioDot} />}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity
                style={[styles.button, !archetype && styles.buttonDisabled]}
                onPress={handleArchetypeContinue}
                disabled={!archetype}>
                <Text style={[styles.buttonText, !archetype && styles.buttonTextDisabled]}>
                    Continue
                </Text>
            </TouchableOpacity>
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
        marginBottom: 20,
        lineHeight: 22,
    },
    archetypeLabel: {
        color: C.gold,
        fontSize: 13,
        marginBottom: 20,
    },
    option: {
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    optionSelected: { borderColor: C.gold, borderWidth: 2, backgroundColor: C.cardSelected },
    optionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    optionText: { color: C.text, fontSize: 15, flex: 1 },
    badge: { color: C.gold, fontSize: 11, fontWeight: 'bold', opacity: 0.8 },
    radioRing: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: C.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioRingSelected: { borderColor: C.gold },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.gold },
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
