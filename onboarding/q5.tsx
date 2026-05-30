import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    'All of the above': [],
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
        AsyncStorage.getItem('elevo_q1').then(q1 => {
            if (!q1) return;
            const recs = PRIORITY_MAP[q1] ?? [];
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
                    <Text style={styles.progressText}>Step 6 of 9</Text>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: '67%' }]} />
                    </View>
                </View>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                    <Text style={styles.question}>Narrow it down — which sub-path fits best?</Text>
                    <Text style={styles.archetypeLabel}>{archetype}</Text>
                    {subs.map((sub) => (
                        <TouchableOpacity
                            key={sub}
                            style={[styles.option, subArchetype === sub && styles.optionSelected]}
                            onPress={() => setSubArchetype(sub)}>
                            <Text style={styles.optionText}>{sub}</Text>
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
                <Text style={styles.progressText}>Step 6 of 9</Text>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: '67%' }]} />
                </View>
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                <Text style={styles.question}>Which path feels most like you?</Text>
                {sortedArchetypes.map((name) => (
                    <TouchableOpacity
                        key={name}
                        style={[styles.option, archetype === name && styles.optionSelected]}
                        onPress={() => setArchetype(name)}>
                        <View style={styles.optionRow}>
                            <Text style={styles.optionText}>{name}</Text>
                            {recommended.includes(name) && (
                                <Text style={styles.badge}>Recommended</Text>
                            )}
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
    archetypeLabel: {
        color: '#c9a84c',
        fontSize: 13,
        marginBottom: 20,
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
    optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    optionText: { color: '#e8e0cc', fontSize: 15 },
    badge: { color: '#c9a84c', fontSize: 11, fontWeight: 'bold', opacity: 0.8 },
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
