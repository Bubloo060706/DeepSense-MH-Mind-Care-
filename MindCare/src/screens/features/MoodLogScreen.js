import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS } from '../../theme';
import { useAppState } from '../../context/AppStateContext';

const { width } = Dimensions.get('window');

const MOODS = [
  { id: 1, icon: 'emoticon-happy-outline', label: 'Great',    score: 5, color: COLORS.safeGreen },
  { id: 2, icon: 'emoticon-happy-outline', label: 'Good',     score: 4, color: '#66D9B0' },
  { id: 3, icon: 'emoticon-neutral-outline', label: 'Okay',     score: 3, color: COLORS.mildYellow },
  { id: 4, icon: 'emoticon-sad-outline', label: 'Low',      score: 2, color: COLORS.moderateOrange },
  { id: 5, icon: 'emoticon-cry-outline', label: 'Very Low', score: 1, color: COLORS.severeRed },
];

const TAGS = [
  'Tired', 'Anxious', 'Frustrated', 'Calm', 'Overthinking',
  'Connected', 'Stressed', 'Focused', 'Loved', 'Confused',
  'Motivated', 'Numb', 'Grateful', 'Irritable',
];

const DEMO_HISTORY = [
  { id: 10, icon: 'emoticon-happy-outline', label: 'Good',  score: 4, note: 'Felt productive at work today.', tags: ['Focused', 'Calm'], ts: '2026-04-01T09:00:00' },
  { id: 11, icon: 'emoticon-neutral-outline', label: 'Okay',  score: 3, note: 'Couldn\'t sleep well last night.', tags: ['Tired', 'Stressed'], ts: '2026-03-31T20:30:00' },
  { id: 12, icon: 'emoticon-sad-outline', label: 'Low',   score: 2, note: '', tags: ['Anxious', 'Numb'], ts: '2026-03-30T18:00:00' },
  { id: 13, icon: 'emoticon-happy-outline', label: 'Great', score: 5, note: 'Went for a walk and felt refreshed!', tags: ['Motivated', 'Grateful'], ts: '2026-03-29T11:00:00' },
];

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const HistoryItem = ({ item }) => (
  <View style={histItem.wrap}>
    <MaterialCommunityIcons name={item.icon} size={24} color={item.color || COLORS.safeGreen} />
    <View style={histItem.body}>
      <View style={histItem.row}>
        <Text style={histItem.label}>{item.label}</Text>
        <Text style={histItem.date}>{fmtDate(item.ts)}</Text>
      </View>
      {item.note ? <Text style={histItem.note}>{item.note}</Text> : null}
      {item.tags?.length > 0 && (
        <View style={histItem.tagRow}>
          {item.tags.map(t => (
            <Text key={t} style={histItem.tag}>{t}</Text>
          ))}
        </View>
      )}
    </View>
    {/* Score bar */}
    <View style={histItem.barWrap}>
      {[1,2,3,4,5].map(s => (
        <View
          key={s}
          style={[histItem.barDot, s <= item.score && { backgroundColor: MOODS[5 - item.score]?.color || COLORS.safeGreen }]}
        />
      ))}
    </View>
  </View>
);

const histItem = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.sm,
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusMd,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: SIZES.md,
  },
  body: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: SIZES.small, fontWeight: FONTS.weightBold, color: COLORS.textPrimary },
  date: { fontSize: SIZES.caption, color: COLORS.textMuted },
  note: { fontSize: SIZES.caption, color: COLORS.textSecondary, lineHeight: 16 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  tag: { fontSize: 11, color: COLORS.textMuted, backgroundColor: COLORS.cardSurface, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  barWrap: { flexDirection: 'column', gap: 3, justifyContent: 'center' },
  barDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.cardBorder },
});

const MoodLogScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { moodLog, addMoodEntry } = useAppState();
  const [selected, setSelected] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [tab, setTab] = useState('log'); // log | history

  const toggleTag = (tag) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleSubmit = () => {
    if (!selected) return;
    addMoodEntry({ icon: selected.icon, label: selected.label, score: selected.score, note, tags: selectedTags });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelected(null);
      setSelectedTags([]);
      setNote('');
      setTab('history');
    }, 1600);
  };

  const allHistory = [...moodLog, ...DEMO_HISTORY];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SIZES.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mood Log</Text>
        <View style={styles.tabs}>
          {['log', 'history'].map(t => (
            <TouchableOpacity
              key={t} onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'log' ? 'Log' : 'History'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === 'log' ? (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SIZES.xxl }]}>
          {submitted ? (
            <View style={styles.successCard}>
              <MaterialCommunityIcons name="check-circle-outline" size={48} color={COLORS.safeGreen} />
              <Text style={styles.successTitle}>Mood Logged!</Text>
              <Text style={styles.successSub}>Your entry has been saved and will update your risk analysis.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionLabel}>How are you feeling right now?</Text>
              <View style={styles.moodRow}>
                {MOODS.map(m => (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.moodBtn, selected?.id === m.id && { borderColor: m.color, backgroundColor: m.color + '15' }]}
                    onPress={() => setSelected(m)}
                  >
                    <MaterialCommunityIcons name={m.icon} size={28} color={m.color} />
                    <Text style={[styles.moodLabel, selected?.id === m.id && { color: m.color }]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>What's influencing your mood?</Text>
              <View style={styles.tagGrid}>
                {TAGS.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagChip, selectedTags.includes(tag) && { backgroundColor: COLORS.safeGreen + '20', borderColor: COLORS.safeGreen }]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[styles.tagText, selectedTags.includes(tag) && { color: COLORS.safeGreen }]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Anything else on your mind? (optional)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Write a note…"
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={4}
                value={note}
                onChangeText={setNote}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.submitBtn, !selected && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={!selected}
              >
                <Text style={styles.submitText}>Save Entry</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SIZES.xxl }]}>
          <Text style={styles.sectionLabel}>Recent Entries</Text>
          <View style={{ gap: SIZES.sm }}>
            {allHistory.map(item => <HistoryItem key={item.id} item={item} />)}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepSpace },
  header: {
    paddingHorizontal: SIZES.screenPadding, paddingBottom: SIZES.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, flexWrap: 'wrap',
  },
  back: { padding: 4 },
  backIcon: { fontSize: 30, color: COLORS.textPrimary, lineHeight: 34 },
  title: { fontSize: SIZES.title, fontWeight: FONTS.weightBlack, color: COLORS.textPrimary, flex: 1 },
  tabs: { flexDirection: 'row', gap: 6 },
  tab: { paddingHorizontal: SIZES.sm, paddingVertical: 5, borderRadius: SIZES.radiusMd, borderWidth: 1, borderColor: COLORS.cardBorder },
  tabActive: { backgroundColor: COLORS.safeGreen },
  tabText: { fontSize: SIZES.caption, color: COLORS.textMuted, fontWeight: FONTS.weightSemiBold },
  tabTextActive: { color: COLORS.deepSpace },
  content: { paddingHorizontal: SIZES.screenPadding, paddingTop: SIZES.md, gap: SIZES.md },
  sectionLabel: { fontSize: SIZES.small, color: COLORS.textSecondary, fontWeight: FONTS.weightSemiBold },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  moodBtn: {
    flex: 1, alignItems: 'center', paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd, borderWidth: 1.5, borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.navyCard, gap: 4,
  },
  moodLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: FONTS.weightSemiBold },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    paddingHorizontal: SIZES.sm, paddingVertical: 6,
    borderRadius: SIZES.radiusFull, borderWidth: 1, borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.navyCard,
  },
  tagText: { fontSize: SIZES.caption, color: COLORS.textMuted, fontWeight: FONTS.weightMedium },
  noteInput: {
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusMd,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: SIZES.md,
    color: COLORS.textPrimary, fontSize: SIZES.small, minHeight: 90,
  },
  submitBtn: {
    backgroundColor: COLORS.safeGreen, borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md, alignItems: 'center',
  },
  submitDisabled: { backgroundColor: COLORS.cardSurface },
  submitText: { fontSize: SIZES.body, fontWeight: FONTS.weightBold, color: COLORS.deepSpace },
  successCard: {
    alignItems: 'center', gap: SIZES.sm, paddingVertical: SIZES.xxxl,
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusXl,
    borderWidth: 1, borderColor: COLORS.safeGreen + '40',
  },
  successTitle: { fontSize: SIZES.title, fontWeight: FONTS.weightBlack, color: COLORS.safeGreen },
  successSub: { fontSize: SIZES.small, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: SIZES.xl },
});

export default MoodLogScreen;
