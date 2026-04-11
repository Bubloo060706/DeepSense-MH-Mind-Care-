import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS, DEMO_SCENARIOS, getRiskLevel, RISK_LEVELS } from '../../theme';
import { useAppState } from '../../context/AppStateContext';

const { width } = Dimensions.get('window');
const GAUGE_SIZE = 220;
const STROKE = 18;

// Arc Gauge drawn with absolute positioned Views (no SVG lib)
const ArcGauge = ({ score, color }) => {
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, { toValue: score, duration: 1200, useNativeDriver: false }).start();
  }, [score]);

  const ticks = 30;
  return (
    <View style={{ width: GAUGE_SIZE, height: GAUGE_SIZE, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer ring */}
      <View style={[gauge.outerRing, { borderColor: color + '20' }]} />
      <View style={[gauge.innerRing, { borderColor: color + '10' }]} />

      {/* Tick marks */}
      {[...Array(ticks)].map((_, i) => {
        const angle = (i / ticks) * 360;
        const isActive = (i / ticks) * 100 <= score;
        return (
          <View
            key={i}
            style={[
              gauge.tick,
              {
                transform: [
                  { rotate: `${angle}deg` },
                  { translateY: -GAUGE_SIZE / 2 + STROKE },
                ],
                backgroundColor: isActive ? color : COLORS.cardBorder,
                opacity: isActive ? 1 : 0.3,
              },
            ]}
          />
        );
      })}

      {/* Center content */}
      <View style={gauge.center}>
        <Text style={[gauge.scoreText, { color }]}>{score}</Text>
        <Text style={gauge.maxText}>/ 100</Text>
        <Text style={gauge.scoreLabel}>Risk Score</Text>
      </View>
    </View>
  );
};

const gauge = StyleSheet.create({
  outerRing: {
    position: 'absolute',
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    borderRadius: GAUGE_SIZE / 2,
    borderWidth: 1.5,
  },
  innerRing: {
    position: 'absolute',
    width: GAUGE_SIZE - 36,
    height: GAUGE_SIZE - 36,
    borderRadius: (GAUGE_SIZE - 36) / 2,
    borderWidth: 1,
  },
  tick: {
    position: 'absolute',
    width: 3,
    height: 10,
    borderRadius: 2,
    top: '50%',
    left: '50%',
    marginLeft: -1.5,
  },
  center: { alignItems: 'center' },
  scoreText: { fontSize: SIZES.mega, fontWeight: FONTS.weightBlack, lineHeight: 64 },
  maxText: { fontSize: SIZES.body, color: COLORS.textMuted, marginTop: -8 },
  scoreLabel: { fontSize: SIZES.caption, color: COLORS.textMuted, letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' },
});

const FeatureBar = ({ label, value, max, unit, color, icon }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: (value / max) * 100, duration: 1000, delay: 300, useNativeDriver: false }).start();
  }, [value]);

  const barWidth = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={fb.row}>
      <MaterialCommunityIcons name={icon} size={20} color={color} style={{ width: 28, textAlign: 'center' }} />
      <View style={fb.content}>
        <View style={fb.labelRow}>
          <Text style={fb.label}>{label}</Text>
          <Text style={[fb.val, { color }]}>{value}{unit}</Text>
        </View>
        <View style={fb.track}>
          <Animated.View style={[fb.fill, { width: barWidth, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
};

const fb = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md, marginBottom: SIZES.lg },
  content: { flex: 1 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: COLORS.textSecondary, fontSize: SIZES.small },
  val: { fontSize: SIZES.small, fontWeight: FONTS.weightBold },
  track: { height: 6, backgroundColor: COLORS.cardBorder, borderRadius: SIZES.radiusFull, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: SIZES.radiusFull },
});

const HISTORY_MOCK = [72, 68, 75, 80, 79, 73, 58]; // last 7 days
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MiniChart = ({ data, color }) => {
  const maxVal = Math.max(...data);
  return (
    <View style={chart.wrap}>
      {data.map((val, i) => {
        const pct = (val / maxVal) * 100;
        const isLast = i === data.length - 1;
        return (
          <View key={i} style={chart.colWrap}>
            <View style={chart.barCol}>
              <View style={[
                chart.bar,
                { height: `${pct}%`, backgroundColor: isLast ? color : COLORS.cardBorder },
              ]} />
            </View>
            <Text style={chart.dayLabel}>{DAYS[i]}</Text>
            <Text style={[chart.valLabel, { color: isLast ? color : COLORS.textMuted }]}>{val}</Text>
          </View>
        );
      })}
    </View>
  );
};

const chart = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 100 },
  colWrap: { flex: 1, alignItems: 'center', gap: 4 },
  barCol: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4 },
  dayLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: FONTS.weightMedium },
  valLabel: { fontSize: 9, fontWeight: FONTS.weightBold },
});

const RiskScoreScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { scenario } = useAppState();
  const data = DEMO_SCENARIOS[scenario] || DEMO_SCENARIOS.healthy;
  const risk = getRiskLevel(data.riskScore);

  const [activeTab, setActiveTab] = useState('overview');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const allLevels = Object.values(RISK_LEVELS);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SIZES.md }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>LIVE ASSESSMENT</Text>
          <Text style={styles.headerTitle}>Risk Analysis</Text>
        </View>
        <View style={[styles.livePill, { borderColor: risk.color }]}>
          <View style={[styles.liveDot, { backgroundColor: risk.color }]} />
          <Text style={[styles.liveText, { color: risk.color }]}>LIVE</Text>
        </View>
      </View>

      {/* Gauge */}
      <Animated.View style={[styles.gaugeCard, { borderColor: risk.color + '30', opacity: fadeAnim }]}>
        <ArcGauge score={data.riskScore} color={risk.color} />
        <Text style={styles.gaugeDesc}>{risk.description}</Text>
        <View style={[styles.riskTag, { backgroundColor: risk.color + '15', borderColor: risk.color }]}>
          <Text style={[styles.riskTagText, { color: risk.color }]}>
            PHQ-9 Equivalent: {risk.phq}
          </Text>
        </View>
      </Animated.View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['overview', 'features', 'history'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: COLORS.safeGreen, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && { color: COLORS.safeGreen }]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'overview' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Risk Level Spectrum</Text>
          {allLevels.map((level) => {
            const isActive = level.label === risk.label;
            return (
              <View key={level.label} style={[styles.spectrumRow, isActive && { backgroundColor: level.color + '10' }]}>
                <View style={[styles.spectrumDot, { backgroundColor: level.color, opacity: isActive ? 1 : 0.4 }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.spectrumLabel, { color: isActive ? level.color : COLORS.textMuted }]}>
                    {level.label}
                  </Text>
                  <Text style={styles.spectrumPHQ}>PHQ-9: {level.phq}</Text>
                </View>
                {isActive && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="chevron-left" size={16} color={level.color} />
                    <Text style={[styles.spectrumActive, { color: level.color }]}>YOU</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {activeTab === 'features' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Feature Contributions</Text>
          <FeatureBar label="Step Count" value={data.steps} max={12000} unit="" color={COLORS.safeGreen} icon="walk" />
          <FeatureBar label="Sleep Hours" value={data.sleepHours} max={9} unit="h" color={COLORS.mildYellow} icon="sleep" />
          <FeatureBar label="Screen Time" value={data.screenTime} max={16} unit="h" color={COLORS.moderateOrange} icon="phone" />
          <FeatureBar label="Home Stay" value={data.homePct} max={100} unit="%" color={COLORS.criticalPurple} icon="home-map-marker" />
          <FeatureBar label="Social Calls" value={data.socialCalls} max={10} unit="" color={COLORS.safeGreen} icon="phone-incoming" />
        </View>
      )}

      {activeTab === 'history' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>7-Day Risk Trend</Text>
          <MiniChart data={HISTORY_MOCK} color={risk.color} />
          <View style={styles.trendNote}>
            <MaterialCommunityIcons name="trending-up" size={16} color={COLORS.textSecondary} />
            <Text style={styles.trendNoteText}>
              Risk increased {Math.abs(HISTORY_MOCK[6] - HISTORY_MOCK[0])} points over the week.
            </Text>
          </View>
        </View>
      )}

      {/* Action */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: risk.color }]}
        onPress={() => navigation.navigate('Remedies')}
      >
        <Text style={styles.actionBtnText}>View Personalised Remedies</Text>
        <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.deepSpace} />
      </TouchableOpacity>

      <View style={{ height: SIZES.xxl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepSpace },
  content: { paddingHorizontal: SIZES.screenPadding, gap: SIZES.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SIZES.sm },
  headerLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: FONTS.weightBold, letterSpacing: 2 },
  headerTitle: { fontSize: SIZES.heading, fontWeight: FONTS.weightBlack, color: COLORS.textPrimary },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: SIZES.radiusFull, paddingHorizontal: 12, paddingVertical: 6,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: FONTS.weightBold, letterSpacing: 1.5 },
  gaugeCard: {
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusXl, borderWidth: 1.5,
    padding: SIZES.xl, alignItems: 'center', gap: SIZES.md,
  },
  gaugeDesc: { fontSize: SIZES.small, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  riskTag: {
    paddingHorizontal: SIZES.md, paddingVertical: 8, borderRadius: SIZES.radiusFull, borderWidth: 1,
  },
  riskTagText: { fontSize: SIZES.small, fontWeight: FONTS.weightSemiBold },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  tab: { flex: 1, paddingVertical: SIZES.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: SIZES.small, fontWeight: FONTS.weightSemiBold, color: COLORS.textMuted },
  card: {
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusLg,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: SIZES.lg,
  },
  cardTitle: { fontSize: SIZES.body, fontWeight: FONTS.weightBold, color: COLORS.textPrimary, marginBottom: SIZES.md },
  spectrumRow: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
    paddingVertical: SIZES.sm, paddingHorizontal: SIZES.sm, borderRadius: SIZES.radiusSm, marginBottom: 4,
  },
  spectrumDot: { width: 12, height: 12, borderRadius: 6 },
  spectrumLabel: { fontSize: SIZES.small, fontWeight: FONTS.weightSemiBold },
  spectrumPHQ: { fontSize: SIZES.caption, color: COLORS.textMuted, marginTop: 2 },
  spectrumActive: { fontSize: SIZES.caption, fontWeight: FONTS.weightBold },
  trendNote: {
    marginTop: SIZES.md, padding: SIZES.sm,
    backgroundColor: COLORS.cardSurface, borderRadius: SIZES.radiusSm,
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
  },
  trendNoteText: { color: COLORS.textSecondary, fontSize: SIZES.small, flex: 1 },
  actionBtn: {
    height: 54, borderRadius: SIZES.radiusMd, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: SIZES.sm,
  },
  actionBtnText: { fontSize: SIZES.body, fontWeight: FONTS.weightBold, color: COLORS.deepSpace },
});

export default RiskScoreScreen;
