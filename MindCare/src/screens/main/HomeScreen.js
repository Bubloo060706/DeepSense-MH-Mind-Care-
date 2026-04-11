import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS, DEMO_SCENARIOS, getRiskLevel } from '../../theme';
import { useAppState } from '../../context/AppStateContext';

const { width } = Dimensions.get('window');

const AnimatedCard = ({ delay, children, style }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 50, friction: 8, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[{ opacity: anim, transform: [{ translateY: slide }] }, style]}>
      {children}
    </Animated.View>
  );
};

const SensorRow = ({ icon, label, value, unit, barPct, color }) => (
  <View style={sensor.row}>
    <MaterialCommunityIcons name={icon} size={22} color={color} style={{ width: 32, textAlign: 'center' }} />
    <View style={sensor.mid}>
      <View style={sensor.labelRow}>
        <Text style={sensor.label}>{label}</Text>
        <Text style={[sensor.value, { color }]}>{value}<Text style={sensor.unit}> {unit}</Text></Text>
      </View>
      <View style={sensor.track}>
        <View style={[sensor.bar, { width: `${barPct}%`, backgroundColor: color }]} />
      </View>
    </View>
  </View>
);

const sensor = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md, marginBottom: SIZES.md },
  mid: { flex: 1 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: COLORS.textSecondary, fontSize: SIZES.small },
  value: { fontSize: SIZES.small, fontWeight: FONTS.weightBold },
  unit: { fontSize: SIZES.caption, color: COLORS.textMuted, fontWeight: FONTS.weightRegular },
  track: { height: 4, backgroundColor: COLORS.cardBorder, borderRadius: SIZES.radiusFull, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: SIZES.radiusFull },
});

const QuickAction = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={[qa.btn, { borderColor: color + '40' }]} onPress={onPress} activeOpacity={0.75}>
    <View style={[qa.iconWrap, { backgroundColor: color + '15' }]}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
    </View>
    <Text style={qa.label}>{label}</Text>
  </TouchableOpacity>
);

const qa = StyleSheet.create({
  btn: {
    flex: 1, alignItems: 'center', paddingVertical: SIZES.md,
    backgroundColor: COLORS.cardSurface, borderRadius: SIZES.radiusMd,
    borderWidth: 1, gap: 8,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  label: { color: COLORS.textSecondary, fontSize: SIZES.caption, fontWeight: FONTS.weightSemiBold, textAlign: 'center' },
});

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, scenario, setScenario } = useAppState();
  const data = DEMO_SCENARIOS[scenario] || DEMO_SCENARIOS.healthy;
  const risk = getRiskLevel(data.riskScore);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]).start(pulse);
    };
    pulse();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const scenarioKeys = Object.keys(DEMO_SCENARIOS);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SIZES.md }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <AnimatedCard delay={0}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <MaterialCommunityIcons name="hand-wave" size={20} color={COLORS.textPrimary} />
          </View>
          <View style={styles.timeWrap}>
            <Text style={styles.timeText}>{time}</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </Text>
          </View>
        </View>
      </AnimatedCard>

      {/* Scenario Switcher */}
      <AnimatedCard delay={80}>
        <View style={styles.scenarioWrap}>
          <Text style={styles.scenarioLabel}>SCENARIO</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scenarioPills}>
            {scenarioKeys.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.pill,
                  scenario === key && { backgroundColor: COLORS.safeGreen + '20', borderColor: COLORS.safeGreen },
                ]}
                onPress={() => setScenario(key)}
              >
                <Text style={[styles.pillText, scenario === key && { color: COLORS.safeGreen }]}>
                  {DEMO_SCENARIOS[key].label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </AnimatedCard>

      {/* Risk Score Card */}
      <AnimatedCard delay={160}>
        <TouchableOpacity
          style={[styles.riskCard, { borderColor: risk.color + '40' }]}
          onPress={() => navigation.navigate('Pulse')}
          activeOpacity={0.85}
        >
          <View style={styles.riskLeft}>
            <Text style={styles.riskCardLabel}>DEPRESSION RISK SCORE</Text>
            <Text style={[styles.riskScore, { color: risk.color }]}>{data.riskScore}</Text>
            <Text style={styles.riskScoreUnit}>/ 100</Text>
            <View style={[styles.riskBadge, { backgroundColor: risk.color + '20', borderColor: risk.color }]}>
              <View style={[styles.riskDot, { backgroundColor: risk.color }]} />
              <Text style={[styles.riskBadgeText, { color: risk.color }]}>{risk.label}</Text>
            </View>
          </View>
          <View style={styles.riskRight}>
            <Animated.View style={[styles.riskRing, { borderColor: risk.color, transform: [{ scale: pulseAnim }] }]}>
              <MaterialCommunityIcons name="heart-outline" size={32} color={risk.color} />
            </Animated.View>
            <Text style={styles.riskDesc}>{risk.description}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.riskTap, { color: risk.color }]}>View Details</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={risk.color} />
            </View>
          </View>
        </TouchableOpacity>
      </AnimatedCard>

      {/* Sensor Summary */}
      <AnimatedCard delay={240}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today's Behavioural Signals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SensorDashboard')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.cardLink}>Details</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.safeGreen} />
              </View>
            </TouchableOpacity>
          </View>
          <SensorRow icon="walk" label="Steps" value={data.steps.toLocaleString()} unit="steps"
            barPct={Math.min((data.steps / 12000) * 100, 100)} color={COLORS.safeGreen} />
          <SensorRow icon="sleep" label="Sleep" value={data.sleepHours.toFixed(1)} unit="hrs"
            barPct={Math.min((data.sleepHours / 9) * 100, 100)} color={COLORS.mildYellow} />
          <SensorRow icon="phone" label="Screen Time" value={data.screenTime.toFixed(1)} unit="hrs"
            barPct={Math.min((data.screenTime / 16) * 100, 100)} color={COLORS.moderateOrange} />
          <SensorRow icon="home-map-marker" label="Home Stay" value={data.homePct} unit="%"
            barPct={data.homePct} color={COLORS.criticalPurple} />
        </View>
      </AnimatedCard>

      {/* Quick Actions */}
      <AnimatedCard delay={320}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.qaRow}>
            <QuickAction icon="emoticon-neutral-outline" label="Log Mood" color={COLORS.safeGreen} onPress={() => navigation.navigate('MoodLog')} />
            <QuickAction icon="clipboard-list-outline" label="PHQ-9 Test" color={COLORS.mildYellow} onPress={() => navigation.navigate('PHQ9')} />
            <QuickAction icon="pill" label="Remedies" color={COLORS.moderateOrange} onPress={() => navigation.navigate('Remedies')} />
          </View>
        </View>
      </AnimatedCard>

      {/* Insight Strip */}
      <AnimatedCard delay={400}>
        <View style={[styles.insightStrip, { borderColor: risk.color + '30', backgroundColor: risk.color + '08' }]}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={COLORS.textSecondary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.insightTitle}>Today's Insight</Text>
            <Text style={styles.insightText}>
              {data.homePct > 80
                ? 'You\'ve stayed home most of today. A short walk can significantly uplift your mood.'
                : data.steps > 7000
                ? 'Great movement today! Physical activity is one of the strongest buffers against depression.'
                : 'Your step count is lower than usual. Try a 15-minute walk after meals.'}
            </Text>
          </View>
        </View>
      </AnimatedCard>

      <View style={{ height: SIZES.xxl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepSpace },
  content: { paddingHorizontal: SIZES.screenPadding, gap: SIZES.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: SIZES.sm },
  greeting: { fontSize: SIZES.small, color: COLORS.textMuted, fontWeight: FONTS.weightMedium },
  userName: { fontSize: SIZES.heading, fontWeight: FONTS.weightBlack, color: COLORS.textPrimary },
  timeWrap: { alignItems: 'flex-end' },
  timeText: { fontSize: SIZES.title, fontWeight: FONTS.weightBold, color: COLORS.textPrimary },
  dateText: { fontSize: SIZES.caption, color: COLORS.textMuted, marginTop: 2 },
  scenarioWrap: { gap: 8 },
  scenarioLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: FONTS.weightBold, letterSpacing: 2 },
  scenarioPills: { flexDirection: 'row' },
  pill: {
    marginRight: SIZES.sm, paddingHorizontal: SIZES.md, paddingVertical: 6,
    borderRadius: SIZES.radiusFull, borderWidth: 1, borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardSurface,
  },
  pillText: { color: COLORS.textMuted, fontSize: SIZES.caption, fontWeight: FONTS.weightMedium },
  riskCard: {
    flexDirection: 'row', backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusXl,
    borderWidth: 1.5, padding: SIZES.xl, gap: SIZES.lg,
  },
  riskLeft: { flex: 1, justifyContent: 'center' },
  riskCardLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: FONTS.weightBold, letterSpacing: 2, marginBottom: SIZES.sm },
  riskScore: { fontSize: SIZES.mega, fontWeight: FONTS.weightBlack, lineHeight: 60 },
  riskScoreUnit: { fontSize: SIZES.body, color: COLORS.textMuted, marginTop: -6, marginBottom: SIZES.md },
  riskBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    borderWidth: 1, borderRadius: SIZES.radiusFull, paddingHorizontal: 12, paddingVertical: 5,
  },
  riskDot: { width: 8, height: 8, borderRadius: 4 },
  riskBadgeText: { fontSize: SIZES.small, fontWeight: FONTS.weightBold },
  riskRight: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  riskRing: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center',
  },
  riskDesc: { fontSize: SIZES.caption, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18 },
  riskTap: { fontSize: SIZES.caption, fontWeight: FONTS.weightBold },
  card: {
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusLg,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: SIZES.lg,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  cardTitle: { fontSize: SIZES.body, fontWeight: FONTS.weightBold, color: COLORS.textPrimary, marginBottom: SIZES.sm },
  cardLink: { fontSize: SIZES.small, color: COLORS.safeGreen, fontWeight: FONTS.weightSemiBold },
  qaRow: { flexDirection: 'row', gap: SIZES.sm, marginTop: SIZES.sm },
  insightStrip: {
    flexDirection: 'row', gap: SIZES.md, padding: SIZES.md,
    borderRadius: SIZES.radiusLg, borderWidth: 1, alignItems: 'flex-start',
  },
  insightTitle: { fontSize: SIZES.small, fontWeight: FONTS.weightBold, color: COLORS.textPrimary, marginBottom: 4 },
  insightText: { fontSize: SIZES.small, color: COLORS.textSecondary, lineHeight: 20 },
});

export default HomeScreen;
