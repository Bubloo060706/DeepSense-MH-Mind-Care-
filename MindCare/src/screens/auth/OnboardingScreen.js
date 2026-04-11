import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, ScrollView, FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, DEMO_SCENARIOS } from '../../theme';
import { useAppState } from '../../context/AppStateContext';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'satellite-uplink',
    iconColor: COLORS.safeGreen,
    title: 'Passive Sensing',
    subtitle: 'Your phone, quietly watching over you',
    body: 'MindPulse uses your phone\'s sensors — GPS, accelerometer, screen events — to detect subtle behavioral shifts that often precede depressive episodes.',
    visual: 'sensors',
  },
  {
    id: '2',
    icon: 'hexagon',
    iconColor: COLORS.mildYellow,
    title: 'On-Device AI',
    subtitle: 'Smart. Private. Always on.',
    body: 'A TFLite model runs entirely on your device, computing a real-time Depression Risk Score every hour — no data leaves your phone without consent.',
    visual: 'ai',
  },
  {
    id: '3',
    icon: 'diamond',
    iconColor: COLORS.moderateOrange,
    title: 'PHQ-9 Validated',
    subtitle: 'Clinically grounded insights',
    body: 'Our risk scores correlate with PHQ-9 clinical assessments, reviewed by psychiatric professionals. Clinicians receive alerts only when risk thresholds are crossed.',
    visual: 'clinical',
  },
  {
    id: '4',
    icon: 'circle-outline',
    iconColor: COLORS.criticalPurple,
    title: 'Choose Your Scenario',
    subtitle: 'This is simulation mode',
    body: 'Select a mental health scenario to explore how MindPulse responds — from a healthy baseline to a critical alert situation.',
    visual: 'scenario',
  },
];

const SensorVisual = () => (
  <View style={vis.container}>
    {['GPS', 'Motion', 'Screen', 'Light', 'Social', 'Circadian'].map((s, i) => (
      <View key={s} style={[vis.sensorPill, { borderColor: i % 2 === 0 ? COLORS.safeGreen : COLORS.mildYellow }]}>
        <View style={[vis.dot, { backgroundColor: i % 2 === 0 ? COLORS.safeGreen : COLORS.mildYellow }]} />
        <Text style={vis.sensorLabel}>{s}</Text>
      </View>
    ))}
  </View>
);

const AIVisual = () => (
  <View style={vis.aiWrap}>
    <View style={vis.aiCore}>
      <MaterialCommunityIcons name="brain" size={32} color={COLORS.mildYellow} />
      <Text style={vis.aiLabel}>TFLite</Text>
    </View>
    {['Features', 'Risk Score', 'Alert'].map((step, i) => (
      <View key={step} style={vis.aiStep}>
        <View style={[vis.aiDot, { backgroundColor: [COLORS.safeGreen, COLORS.mildYellow, COLORS.moderateOrange][i] }]} />
        <Text style={vis.aiStepText}>{step}</Text>
      </View>
    ))}
  </View>
);

const ClinicalVisual = () => (
  <View style={vis.clinWrap}>
    {[
      { label: 'PHQ-9 Score', val: '12', color: COLORS.moderateOrange },
      { label: 'Risk Score', val: '58%', color: COLORS.moderateOrange },
      { label: 'AUC-ROC', val: '0.87', color: COLORS.safeGreen },
    ].map(item => (
      <View key={item.label} style={vis.clinCard}>
        <Text style={[vis.clinVal, { color: item.color }]}>{item.val}</Text>
        <Text style={vis.clinLabel}>{item.label}</Text>
      </View>
    ))}
  </View>
);

const vis = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', padding: 10 },
  sensorPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: COLORS.cardSurface,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sensorLabel: { color: COLORS.textSecondary, fontSize: SIZES.small, fontWeight: FONTS.weightMedium },
  aiWrap: { alignItems: 'center', gap: 12 },
  aiCore: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.cardSurface,
    borderWidth: 2, borderColor: COLORS.mildYellow, alignItems: 'center', justifyContent: 'center',
  },
  aiLabel: { color: COLORS.mildYellow, fontSize: SIZES.caption, fontWeight: FONTS.weightBold, marginTop: 2 },
  aiStep: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiDot: { width: 10, height: 10, borderRadius: 5 },
  aiStepText: { color: COLORS.textSecondary, fontSize: SIZES.small },
  clinWrap: { flexDirection: 'row', gap: 12 },
  clinCard: {
    flex: 1, backgroundColor: COLORS.cardSurface, borderRadius: SIZES.radiusMd,
    padding: SIZES.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  clinVal: { fontSize: SIZES.heading, fontWeight: FONTS.weightBlack },
  clinLabel: { color: COLORS.textMuted, fontSize: SIZES.caption, textAlign: 'center', marginTop: 4 },
});

const ScenarioVisual = ({ onSelect }) => (
  <View style={{ gap: 8, width: '100%' }}>
    {Object.entries(DEMO_SCENARIOS).map(([key, s]) => (
      <TouchableOpacity
        key={key}
        style={scen.item}
        onPress={() => onSelect(key)}
        activeOpacity={0.75}
      >
        <View style={scen.left}>
          <Text style={scen.name}>{s.label}</Text>
          <Text style={scen.score}>Risk: {s.riskScore}%</Text>
        </View>
        <View style={[scen.badge, { borderColor: getRiskColor(s.riskScore) }]}>
          <View style={[scen.badgeDot, { backgroundColor: getRiskColor(s.riskScore) }]} />
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

const getRiskColor = (score) => {
  if (score < 15) return COLORS.safeGreen;
  if (score < 40) return COLORS.mildYellow;
  if (score < 65) return COLORS.moderateOrange;
  if (score < 85) return COLORS.severeRed;
  return COLORS.criticalPurple;
};

const scen = StyleSheet.create({
  item: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.cardSurface, borderRadius: SIZES.radiusMd,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: SIZES.md,
  },
  left: { gap: 2 },
  name: { color: COLORS.textPrimary, fontSize: SIZES.body, fontWeight: FONTS.weightSemiBold },
  score: { color: COLORS.textMuted, fontSize: SIZES.small },
  badge: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  badgeDot: { width: 12, height: 12, borderRadius: 6 },
});

const OnboardingScreen = ({ navigation }) => {
  const { setScenario } = useAppState();
  const [current, setCurrent] = useState(0);
  const flatRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const goTo = (index) => {
    flatRef.current?.scrollToIndex({ index, animated: true });
    setCurrent(index);
    Animated.timing(progressAnim, {
      toValue: index / (SLIDES.length - 1),
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleScenarioSelect = (key) => {
    setScenario(key);
    navigation.replace('Main');
  };

  const renderSlide = ({ item, index }) => (
    <View style={sl.slide}>
      {/* Visual area */}
      <View style={sl.visualBox}>
        {item.visual === 'sensors' && <SensorVisual />}
        {item.visual === 'ai' && <AIVisual />}
        {item.visual === 'clinical' && <ClinicalVisual />}
        {item.visual === 'scenario' && (
          <ScenarioVisual onSelect={handleScenarioSelect} />
        )}
      </View>

      {/* Icon */}
      <MaterialCommunityIcons name={item.icon} size={40} color={item.iconColor} />

      {/* Text */}
      <Text style={sl.title}>{item.title}</Text>
      <Text style={sl.subtitle}>{item.subtitle}</Text>
      <Text style={sl.body}>{item.body}</Text>
    </View>
  );

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressBarWidth }]} />
      </View>

      {/* Step counter */}
      <View style={styles.stepRow}>
        <Text style={styles.stepText}>{current + 1} / {SLIDES.length}</Text>
        {current < SLIDES.length - 1 && (
          <TouchableOpacity onPress={() => handleScenarioSelect('healthy')}>
            <Text style={styles.skipText}>Skip →</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === current && styles.dotActive]}
          />
        ))}
      </View>

      {/* Navigation buttons */}
      <View style={styles.btnRow}>
        {current > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => goTo(current - 1)}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        )}
        {current < SLIDES.length - 1 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => goTo(current + 1)}>
            <Text style={styles.nextBtnText}>Continue →</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const sl = StyleSheet.create({
  slide: {
    width,
    paddingHorizontal: SIZES.xl,
    paddingBottom: SIZES.lg,
    alignItems: 'center',
  },
  visualBox: {
    width: '100%',
    minHeight: 180,
    backgroundColor: COLORS.navyCard,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SIZES.md,
    marginBottom: SIZES.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: SIZES.heading,
    fontWeight: FONTS.weightBlack,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.safeGreen,
    textAlign: 'center',
    marginBottom: SIZES.md,
    fontWeight: FONTS.weightMedium,
  },
  body: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepSpace, paddingTop: 60 },
  progressTrack: {
    height: 3,
    backgroundColor: COLORS.cardBorder,
    marginHorizontal: SIZES.xl,
    borderRadius: SIZES.radiusFull,
    overflow: 'hidden',
    marginBottom: SIZES.md,
  },
  progressFill: { height: '100%', backgroundColor: COLORS.safeGreen, borderRadius: SIZES.radiusFull },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.xl,
    marginBottom: SIZES.lg,
  },
  stepText: { color: COLORS.textMuted, fontSize: SIZES.small, fontWeight: FONTS.weightMedium },
  skipText: { color: COLORS.safeGreen, fontSize: SIZES.small, fontWeight: FONTS.weightSemiBold },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: SIZES.lg },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.cardBorder },
  dotActive: { width: 20, backgroundColor: COLORS.safeGreen },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.xl,
    gap: SIZES.md,
    paddingBottom: SIZES.xl,
  },
  backBtn: {
    flex: 1,
    height: 52,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: COLORS.textSecondary, fontSize: SIZES.body, fontWeight: FONTS.weightMedium },
  nextBtn: {
    flex: 2,
    height: 52,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.safeGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: { color: COLORS.deepSpace, fontSize: SIZES.body, fontWeight: FONTS.weightBold },
});

export default OnboardingScreen;
