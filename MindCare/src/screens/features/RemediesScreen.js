import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS, DEMO_SCENARIOS, getRiskLevel } from '../../theme';
import { useAppState } from '../../context/AppStateContext';

const { width } = Dimensions.get('window');

const REMEDY_DATA = {
  healthy: [
    { id: 1, icon: 'run-fast', title: 'Daily 10k Steps', category: 'Exercise', duration: '45 min', difficulty: 'Easy', desc: 'Maintain your excellent activity streak. Walk, jog or cycle to keep endorphins flowing.' },
    { id: 2, icon: 'meditation', title: 'Morning Mindfulness', category: 'Meditation', duration: '10 min', difficulty: 'Easy', desc: 'Start each day with a 10-minute body-scan meditation to reinforce your mental wellness.' },
    { id: 3, icon: 'notebook-outline', title: 'Gratitude Journaling', category: 'Journaling', duration: '5 min', difficulty: 'Easy', desc: 'Write 3 things you\'re grateful for. Strengthens positive neural pathways over time.' },
    { id: 4, icon: 'sleep', title: 'Sleep Hygiene', category: 'Sleep', duration: 'Nightly', difficulty: 'Medium', desc: 'Maintain a consistent sleep schedule. Aim for 7–9 hours. Avoid screens 1 hour before bed.' },
  ],
  mild: [
    { id: 1, icon: 'walk', title: 'Outdoor Walk', category: 'Exercise', duration: '20 min', difficulty: 'Easy', desc: 'A brisk 20-minute walk in nature significantly reduces cortisol levels. No equipment needed.' },
    { id: 2, icon: 'phone', title: 'Connect With a Friend', category: 'Social', duration: '15 min', difficulty: 'Easy', desc: 'A short phone call with someone you trust can break the cycle of social withdrawal.' },
    { id: 3, icon: 'wind-power', title: '4-7-8 Breathing', category: 'Breathing', duration: '5 min', difficulty: 'Easy', desc: 'Inhale 4s → Hold 7s → Exhale 8s. Repeat 4 times. Activates the parasympathetic nervous system.' },
    { id: 4, icon: 'television', title: 'Reduce Screen Time', category: 'Digital Wellness', duration: 'All day', difficulty: 'Medium', desc: 'Set a 3-hour daily screen limit. Use phone grayscale mode to reduce dopamine-driven scrolling.' },
    { id: 5, icon: 'music-box-outline', title: 'Music Therapy', category: 'Therapy', duration: '30 min', difficulty: 'Easy', desc: 'Listen to 60 BPM binaural tracks. Studies show measurable mood improvement within 20 minutes.' },
  ],
  moderate: [
    { id: 1, icon: 'hospital-box-outline', title: 'Speak to a Counselor', category: 'Professional', duration: '1 hr', difficulty: 'Medium', desc: 'Consider booking a session with a mental health professional. iCall (9152987821) offers free teletherapy.' },
    { id: 2, icon: 'brain', title: 'CBT Thought Record', category: 'Therapy', duration: '15 min', difficulty: 'Medium', desc: 'Write down a negative thought, identify cognitive distortions, and reframe it with balanced evidence.' },
    { id: 3, icon: 'dumbbell', title: 'Resistance Training', category: 'Exercise', duration: '30 min', difficulty: 'Medium', desc: 'Weightlifting reduces depression symptoms as effectively as antidepressants in multiple clinical studies.' },
    { id: 4, icon: 'hot-tub', title: 'Warm Bath + Relaxation', category: 'Self-Care', duration: '20 min', difficulty: 'Easy', desc: 'A 40°C bath for 20 minutes lowers anxiety and promotes deeper sleep onset.' },
    { id: 5, icon: 'leaf', title: 'Reduce Caffeine & Alcohol', category: 'Nutrition', duration: 'All day', difficulty: 'Hard', desc: 'Both substances worsen anxiety and disrupt REM sleep. Try chamomile tea instead.' },
    { id: 6, icon: 'sun-clock-outline', title: 'Morning Sunlight', category: 'Light Therapy', duration: '10 min', difficulty: 'Easy', desc: 'Expose yourself to natural light within 1 hour of waking. Regulates circadian rhythms and serotonin.' },
  ],
  severe: [
    { id: 1, icon: 'phone-alert', title: 'Contact Crisis Line NOW', category: 'Urgent', duration: 'Now', difficulty: 'Critical', desc: 'iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345 | NIMHANS: 080-46110007. You are not alone.' },
    { id: 2, icon: 'hospital-box-outline', title: 'Psychiatrist Referral', category: 'Professional', duration: 'ASAP', difficulty: 'High', desc: 'Your risk score warrants a clinical evaluation. Your clinician has been notified and will follow up.' },
    { id: 3, icon: 'account-multiple-outline', title: 'Do Not Be Alone', category: 'Social Safety', duration: 'Today', difficulty: 'High', desc: 'Ask a trusted person to stay with you or check in regularly. Isolation worsens severe depression rapidly.' },
    { id: 4, icon: 'pill', title: 'Medication Check-in', category: 'Medical', duration: '5 min', difficulty: 'Medium', desc: 'If prescribed antidepressants, verify you have taken today\'s dose. Do not adjust dosage without consulting your doctor.' },
    { id: 5, icon: 'block-helper', title: 'Limit Decision-Making', category: 'Coping', duration: 'All day', difficulty: 'Medium', desc: 'Severe depression impairs judgment. Postpone major financial or life decisions until you have professional support.' },
  ],
  critical: [
    { id: 1, icon: 'phone-alert', title: 'EMERGENCY — Call Now', category: 'Emergency', duration: 'NOW', difficulty: 'Critical', desc: 'Emergency: 112 | iCall: 9152987821 | Vandrevala: 1860-2662-345. If you are in immediate danger, call 112 now.' },
    { id: 2, icon: 'hospital-box', title: 'Go to Nearest ER', category: 'Emergency', duration: 'NOW', difficulty: 'Critical', desc: 'If you cannot guarantee your safety, go to the nearest hospital emergency room. Tell them you are in a mental health crisis.' },
    { id: 3, icon: 'phone', title: 'Stay on Call', category: 'Support', duration: 'Now', difficulty: 'High', desc: 'Keep your phone with you and stay connected to the crisis counselor until you feel safe.' },
    { id: 4, icon: 'account-outline', title: 'Stay With Someone', category: 'Safety', duration: 'Now', difficulty: 'High', desc: 'Do not be alone. Your clinician and emergency contacts have been notified automatically.' },
  ],
};

const CATEGORIES = ['All', 'Exercise', 'Meditation', 'Social', 'Therapy', 'Professional', 'Sleep', 'Nutrition', 'Urgent', 'Emergency'];

const difficultyColor = (d) => ({
  Easy: COLORS.safeGreen,
  Medium: COLORS.mildYellow,
  Hard: COLORS.moderateOrange,
  High: COLORS.severeRed,
  Critical: COLORS.criticalPurple,
}[d] || COLORS.textMuted);

const RemedyCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const dColor = difficultyColor(item.difficulty);

  return (
    <TouchableOpacity
      style={[remedyCard.wrap, expanded && { borderColor: dColor + '60' }]}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.8}
    >
      <View style={remedyCard.top}>
        <View style={[remedyCard.iconBox, { backgroundColor: dColor + '15' }]}>
          <MaterialCommunityIcons name={item.icon} size={24} color={dColor} />
        </View>
        <View style={remedyCard.info}>
          <Text style={remedyCard.title}>{item.title}</Text>
          <View style={remedyCard.meta}>
            <Text style={[remedyCard.pill, { color: dColor, borderColor: dColor + '40' }]}>
              {item.difficulty}
            </Text>
            <Text style={remedyCard.duration}>⏱ {item.duration}</Text>
            <Text style={remedyCard.category}>{item.category}</Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={COLORS.textMuted}
          style={expanded && { transform: [{ rotate: '90deg' }] }}
        />
      </View>
      {expanded && (
        <View style={remedyCard.body}>
          <View style={[remedyCard.divider, { backgroundColor: dColor + '30' }]} />
          <Text style={remedyCard.desc}>{item.desc}</Text>
          <TouchableOpacity style={[remedyCard.startBtn, { backgroundColor: dColor }]}>
            <Text style={remedyCard.startText}>Start Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const remedyCard = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusLg,
    borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SIZES.sm,
    overflow: 'hidden',
  },
  top: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, gap: SIZES.sm },
  iconBox: {
    width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1, gap: 4 },
  title: { fontSize: SIZES.small, fontWeight: FONTS.weightBold, color: COLORS.textPrimary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  pill: {
    fontSize: SIZES.caption, fontWeight: FONTS.weightSemiBold,
    borderWidth: 1, borderRadius: SIZES.radiusFull, paddingHorizontal: 8, paddingVertical: 2,
  },
  duration: { fontSize: SIZES.caption, color: COLORS.textMuted },
  category: { fontSize: SIZES.caption, color: COLORS.textMuted },
  body: { paddingHorizontal: SIZES.md, paddingBottom: SIZES.md, gap: SIZES.sm },
  divider: { height: 1, marginBottom: SIZES.sm },
  desc: { fontSize: SIZES.small, color: COLORS.textSecondary, lineHeight: 20 },
  startBtn: {
    alignSelf: 'flex-start', paddingHorizontal: SIZES.lg,
    paddingVertical: 8, borderRadius: SIZES.radiusMd, marginTop: 4,
  },
  startText: { fontSize: SIZES.small, fontWeight: FONTS.weightBold, color: COLORS.deepSpace },
});

const RemediesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { scenario } = useAppState();
  const data = DEMO_SCENARIOS[scenario] || DEMO_SCENARIOS.moderate;
  const risk = getRiskLevel(data.riskScore);
  const remedies = REMEDY_DATA[scenario] || REMEDY_DATA.moderate;

  const [catFilter, setCatFilter] = useState('All');

  const visible = catFilter === 'All'
    ? remedies
    : remedies.filter(r => r.category === catFilter || r.category.includes(catFilter));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SIZES.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Wellness Plan</Text>
          <Text style={[styles.subtitle, { color: risk.color }]}>Tailored for {risk.label} risk level</Text>
        </View>
        <View style={[styles.scoreBadge, { borderColor: risk.color }]}>
          <Text style={[styles.scoreText, { color: risk.color }]}>{data.riskScore}</Text>
        </View>
      </View>

      {/* Category Scroll */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
      >
        {['All', ...new Set(remedies.map(r => r.category))].map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catPill, catFilter === cat && { backgroundColor: risk.color }]}
            onPress={() => setCatFilter(cat)}
          >
            <Text style={[styles.catText, catFilter === cat && { color: COLORS.deepSpace }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + SIZES.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Risk context banner */}
        <View style={[styles.contextBanner, { borderColor: risk.color + '40', backgroundColor: risk.color + '08' }]}>
          <MaterialCommunityIcons 
            name={risk.label === 'Critical' ? 'phone-alert' : risk.label === 'Severe' ? 'alert-circle-outline' : 'lightbulb-on-outline'} 
            size={20} 
            color={risk.color} 
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.contextTitle, { color: risk.color }]}>{risk.label} Risk — Personalised Remedies</Text>
            <Text style={styles.contextDesc}>{risk.description}</Text>
          </View>
        </View>

        {visible.map(item => <RemedyCard key={item.id} item={item} />)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepSpace },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    paddingHorizontal: SIZES.screenPadding, paddingBottom: SIZES.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 30, color: COLORS.textPrimary, lineHeight: 34 },
  title: { fontSize: SIZES.title, fontWeight: FONTS.weightBlack, color: COLORS.textPrimary },
  subtitle: { fontSize: SIZES.caption, fontWeight: FONTS.weightMedium, marginTop: 1 },
  scoreBadge: {
    marginLeft: 'auto', width: 42, height: 42, borderRadius: 21,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  scoreText: { fontSize: SIZES.small, fontWeight: FONTS.weightBlack },
  catRow: { paddingHorizontal: SIZES.screenPadding, paddingVertical: SIZES.sm, gap: 8 },
  catPill: {
    paddingHorizontal: SIZES.md, paddingVertical: 6,
    borderRadius: SIZES.radiusFull, backgroundColor: COLORS.navyCard,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  catText: { fontSize: SIZES.caption, color: COLORS.textSecondary, fontWeight: FONTS.weightSemiBold },
  list: { paddingHorizontal: SIZES.screenPadding, paddingTop: SIZES.sm, gap: SIZES.sm },
  contextBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.sm,
    borderWidth: 1, borderRadius: SIZES.radiusLg, padding: SIZES.md, marginBottom: SIZES.sm,
  },
  contextTitle: { fontSize: SIZES.small, fontWeight: FONTS.weightBold, marginBottom: 4 },
  contextDesc: { fontSize: SIZES.caption, color: COLORS.textSecondary, lineHeight: 18 },
});

export default RemediesScreen;
