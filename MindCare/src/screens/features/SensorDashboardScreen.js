import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS, DEMO_SCENARIOS, getRiskLevel } from '../../theme';
import { useAppState } from '../../context/AppStateContext';

const SENSORS = [
  { id: 'accel',    icon: 'run-fast', name: 'Accelerometer',     desc: 'Wrist movement & step detection',    unit: 'steps/day',  key: 'steps' },
  { id: 'gps',      icon: 'map-marker', name: 'GPS Entropy',        desc: 'Location diversity index',           unit: 'rating',     key: 'locationEntropy' },
  { id: 'screen',   icon: 'phone', name: 'Screen Time',        desc: 'Daily phone usage duration',         unit: 'hrs/day',    key: 'screenTime' },
  { id: 'sleep',    icon: 'sleep', name: 'Sleep Monitor',      desc: 'Average sleep duration via actigraphy', unit: 'hrs/night', key: 'sleepHours' },
  { id: 'social',   icon: 'phone-incoming', name: 'Social Interaction', desc: 'Outgoing call count per day',        unit: 'calls/day',  key: 'socialCalls' },
  { id: 'home',     icon: 'home-map-marker', name: 'Home Dwell Time',    desc: 'Percentage of time at home location', unit: '%',         key: 'homePct' },
];

const scoreForSensor = (key, value) => {
  // Returns 0–100 where 100 = healthiest
  switch (key) {
    case 'steps':         return Math.min(100, (value / 10000) * 100);
    case 'locationEntropy': return { High: 90, Medium: 65, Low: 40, 'Very Low': 20, Minimal: 5 }[value] ?? 50;
    case 'screenTime':    return Math.max(0, 100 - (value / 14) * 100);
    case 'sleepHours':    return value >= 7 ? 100 : Math.max(0, (value / 7) * 100);
    case 'socialCalls':   return Math.min(100, (value / 5) * 100);
    case 'homePct':       return Math.max(0, 100 - value);
    default: return 50;
  }
};

const sensorColor = (score) => {
  if (score > 70) return COLORS.safeGreen;
  if (score > 45) return COLORS.mildYellow;
  if (score > 25) return COLORS.moderateOrange;
  return COLORS.severeRed;
};

const AnimatedBar = ({ score, color }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: score / 100, duration: 900, useNativeDriver: false }).start();
  }, [score]);
  return (
    <View style={bar.track}>
      <Animated.View style={[bar.fill, { flex: anim, backgroundColor: color }]} />
      <View style={{ flex: Animated.subtract(new Animated.Value(1), anim) }} />
    </View>
  );
};

const bar = StyleSheet.create({
  track: { height: 6, flexDirection: 'row', borderRadius: 3, backgroundColor: COLORS.cardBorder, overflow: 'hidden', borderRadius: 3 },
  fill: { borderRadius: 3 },
});

const SensorCard = ({ sensor, value }) => {
  const score = scoreForSensor(sensor.key, value);
  const color = sensorColor(score);
  const [expanded, setExpanded] = useState(false);

  const statusLabel = score > 70 ? 'Healthy' : score > 45 ? 'Watch' : score > 25 ? 'Concern' : 'Critical';

  return (
    <TouchableOpacity
      style={[sCard.wrap, { borderColor: expanded ? color + '60' : COLORS.cardBorder }]}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.85}
    >
      <View style={sCard.top}>
        <View style={[sCard.iconBox, { backgroundColor: color + '15' }]}>
          <Text style={sCard.icon}>{sensor.icon}</Text>
        </View>
        <View style={sCard.info}>
          <View style={sCard.titleRow}>
            <Text style={sCard.name}>{sensor.name}</Text>
            <View style={[sCard.badge, { backgroundColor: color + '20', borderColor: color + '50' }]}>
              <Text style={[sCard.badgeText, { color }]}>{statusLabel}</Text>
            </View>
          </View>
          <Text style={sCard.desc}>{sensor.desc}</Text>
          <AnimatedBar score={score} color={color} />
        </View>
        <View style={sCard.right}>
          <Text style={[sCard.value, { color }]}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
          <Text style={sCard.unit}>{sensor.unit}</Text>
        </View>
      </View>

      {expanded && (
        <View style={sCard.expanded}>
          <View style={[sCard.divider, { backgroundColor: color + '30' }]} />
          <View style={sCard.detailRow}>
            <View style={sCard.detailItem}>
              <Text style={sCard.detailLabel}>HEALTH SCORE</Text>
              <Text style={[sCard.detailValue, { color }]}>{Math.round(score)}/100</Text>
            </View>
            <View style={sCard.detailItem}>
              <Text style={sCard.detailLabel}>STATUS</Text>
              <Text style={[sCard.detailValue, { color }]}>{statusLabel}</Text>
            </View>
            <View style={sCard.detailItem}>
              <Text style={sCard.detailLabel}>LAST READ</Text>
              <Text style={sCard.detailValue}>2 min ago</Text>
            </View>
          </View>
          <Text style={sCard.insight}>
            {score > 70
              ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="check-circle-outline" size={14} color={COLORS.safeGreen} />
                  <Text style={{ color: COLORS.safeGreen }}>
                    {sensor.name} is in a healthy range. Keep it up!
                  </Text>
                </View>
              )
              : score > 45
              ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={14} color={COLORS.mildYellow} />
                  <Text style={{ color: COLORS.mildYellow }}>
                    {sensor.name} needs attention. Try to improve this metric.
                  </Text>
                </View>
              )
              : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="phone-alert" size={14} color={COLORS.severeRed} />
                  <Text style={{ color: COLORS.severeRed }}>
                    {sensor.name} is at a concerning level and contributing to elevated risk.
                  </Text>
                </View>
              )
            }
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const sCard = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusLg,
    borderWidth: 1, marginBottom: SIZES.sm, overflow: 'hidden',
  },
  title: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 5 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: SIZES.small, fontWeight: FONTS.weightBold, color: COLORS.textPrimary },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: SIZES.radiusFull, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: FONTS.weightBold },
  desc: { fontSize: SIZES.caption, color: COLORS.textMuted },
  right: { alignItems: 'flex-end', gap: 2 },
  value: { fontSize: SIZES.subtitle, fontWeight: FONTS.weightBlack },
  unit: { fontSize: 10, color: COLORS.textMuted },
  expanded: { paddingHorizontal: SIZES.md, paddingBottom: SIZES.md },
  divider: { height: 1, marginBottom: SIZES.sm },
  detailRow: { flexDirection: 'row', gap: SIZES.md, marginBottom: SIZES.sm },
  detailItem: { flex: 1, gap: 2 },
  detailLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: FONTS.weightBold, letterSpacing: 1.5 },
  detailValue: { fontSize: SIZES.small, fontWeight: FONTS.weightBold, color: COLORS.textPrimary },
  insight: { fontSize: SIZES.caption, color: COLORS.textSecondary, lineHeight: 18 },
});

// ── Summary Ring ─────────────────────────────────────────────────────────────
const OverallHealth = ({ data, risk }) => {
  const scores = SENSORS.map(s => scoreForSensor(s.key, data[s.key]));
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const color = sensorColor(avg);

  return (
    <View style={[overall.wrap, { borderColor: color + '40' }]}>
      <View style={overall.left}>
        <Text style={overall.sectionLabel}>SENSOR HEALTH</Text>
        <Text style={[overall.score, { color }]}>{avg}<Text style={overall.outOf}>/100</Text></Text>
        <Text style={overall.riskLabel}>Risk Score: <Text style={{ color: risk.color }}>{data.riskScore}/100</Text></Text>
      </View>
      <View style={overall.bars}>
        {SENSORS.map(s => {
          const sc = scoreForSensor(s.key, data[s.key]);
          const c = sensorColor(sc);
          return (
            <View key={s.id} style={overall.barItem}>
              <MaterialCommunityIcons name={s.icon} size={14} color={c} />
              <View style={[overall.miniBar, { backgroundColor: c + '30' }]}>
                <View style={[overall.miniFill, { width: `${sc}%`, backgroundColor: c }]} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const overall = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusXl,
    borderWidth: 1.5, padding: SIZES.lg, flexDirection: 'row',
    gap: SIZES.lg, marginBottom: SIZES.md,
  },
  left: { gap: 4 },
  sectionLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: FONTS.weightBold, letterSpacing: 2 },
  score: { fontSize: SIZES.mega, fontWeight: FONTS.weightBlack, lineHeight: 60 },
  outOf: { fontSize: SIZES.body, color: COLORS.textMuted },
  riskLabel: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  bars: { flex: 1, gap: 6, justifyContent: 'center' },
  barItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniBar: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  miniFill: { height: 5, borderRadius: 3 },
});

const SensorDashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { scenario } = useAppState();
  const data = DEMO_SCENARIOS[scenario] || DEMO_SCENARIOS.moderate;
  const risk = getRiskLevel(data.riskScore);
  const [lastRefresh] = useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SIZES.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Sensor Dashboard</Text>
          <Text style={styles.subtitle}>Last synced {lastRefresh} · Simulation</Text>
        </View>
        <View style={[styles.liveChip, { borderColor: COLORS.safeGreen + '60' }]}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SIZES.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <OverallHealth data={data} risk={risk} />

        <Text style={styles.sectionLabel}>Individual Sensors</Text>
        {SENSORS.map(s => (
          <SensorCard key={s.id} sensor={s} value={data[s.key]} />
        ))}

        <View style={styles.note}>
          <Text style={styles.noteText}>
            📡 This is a simulation. In the real app, data streams from wearable sensors via Bluetooth LE and passive phone APIs in real time.
          </Text>
        </View>
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
  back: { padding: 4 },
  backIcon: { fontSize: 30, color: COLORS.textPrimary, lineHeight: 34 },
  title: { fontSize: SIZES.title, fontWeight: FONTS.weightBlack, color: COLORS.textPrimary },
  subtitle: { fontSize: SIZES.caption, color: COLORS.textMuted, marginTop: 1 },
  liveChip: {
    marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: SIZES.radiusFull, paddingHorizontal: 10, paddingVertical: 4,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.safeGreen },
  liveText: { fontSize: 10, color: COLORS.safeGreen, fontWeight: FONTS.weightBold, letterSpacing: 1 },
  content: { paddingHorizontal: SIZES.screenPadding, paddingTop: SIZES.md, gap: SIZES.xs },
  sectionLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: FONTS.weightBold, letterSpacing: 1.5, marginBottom: SIZES.xs, marginTop: SIZES.sm },
  note: {
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusMd,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: SIZES.md, marginTop: SIZES.sm,
  },
  noteText: { fontSize: SIZES.caption, color: COLORS.textMuted, lineHeight: 18 },
});

export default SensorDashboardScreen;
