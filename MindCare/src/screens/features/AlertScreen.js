import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS, DEMO_SCENARIOS, getRiskLevel } from '../../theme';
import { useAppState } from '../../context/AppStateContext';

const { width } = Dimensions.get('window');

const SIMULATED_ALERTS = [
  {
    id: 1, type: 'critical', time: '2 min ago', read: false, icon: 'phone-alert',
    title: 'Clinician Notified',
    body: 'Dr. Priya Sharma has been automatically alerted due to elevated risk score (94/100). She will contact you within 30 minutes.',
    actions: ['Call Dr. Sharma', 'Dismiss'],
  },
  {
    id: 2, type: 'severe', time: '1 hr ago', read: false, icon: 'alert-circle',
    title: 'Risk Spike Detected',
    body: 'Your IoT sensors recorded sudden inactivity (< 200 steps) and abnormal sleep onset. Risk score jumped from 67 → 94.',
    actions: ['View Details', 'Dismiss'],
  },
  {
    id: 3, type: 'moderate', time: '3 hrs ago', read: true, icon: 'chart-bar',
    title: 'Weekly Report Ready',
    body: 'Your 7-day behavioral summary is available. Activity, sleep, and social patterns have been analysed.',
    actions: ['View Report', 'Dismiss'],
  },
  {
    id: 4, type: 'mild', time: '8 hrs ago', read: true, icon: 'sleep',
    title: 'Sleep Pattern Alert',
    body: 'Sleep duration averaged 3.5 hours over the past 3 nights. This is below the recommended 7–9 hours.',
    actions: ['View Remedies', 'Dismiss'],
  },
  {
    id: 5, type: 'safe', time: 'Yesterday', read: true, icon: 'check-circle-outline',
    title: 'Streak Maintained',
    body: 'Great job! You completed your mindfulness check-in for 5 days in a row. Keep it up!',
    actions: ['Share', 'Dismiss'],
  },
  {
    id: 6, type: 'moderate', time: '2 days ago', read: true, icon: 'satellite-uplink',
    title: 'Sensor Calibration Done',
    body: 'All 4 wearable sensors have been recalibrated. Data accuracy improved by 12%.',
    actions: ['View Sensors', 'Dismiss'],
  },
];

const typeStyle = (type) => ({
  critical: { color: COLORS.criticalPurple, bg: COLORS.criticalPurpleDim, bar: COLORS.criticalPurple },
  severe:   { color: COLORS.severeRed,      bg: COLORS.severeRedDim,      bar: COLORS.severeRed },
  moderate: { color: COLORS.moderateOrange, bg: COLORS.moderateOrangeDim, bar: COLORS.moderateOrange },
  mild:     { color: COLORS.mildYellow,     bg: COLORS.mildYellowDim,     bar: COLORS.mildYellow },
  safe:     { color: COLORS.safeGreen,      bg: COLORS.safeGreenDim,      bar: COLORS.safeGreen },
}[type] || { color: COLORS.textSecondary, bg: COLORS.overlayLight, bar: COLORS.textMuted });

const AlertCard = ({ alert, onDismiss, onAction }) => {
  const style = typeStyle(alert.type);
  const flashAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!alert.read) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, { toValue: 0.5, duration: 700, useNativeDriver: true }),
          Animated.timing(flashAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  return (
    <View style={[card.wrapper, { borderColor: style.color + (alert.read ? '30' : '80') }]}>
      {/* Left accent bar */}
      <View style={[card.bar, { backgroundColor: style.bar }]} />

      {/* Unread dot */}
      {!alert.read && (
        <Animated.View style={[card.dot, { backgroundColor: style.color, opacity: flashAnim }]} />
      )}

      <View style={card.body}>
        <View style={card.header}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1 }}>
            <MaterialCommunityIcons name={alert.icon} size={18} color={style.color} style={{ marginTop: 1 }} />
            <Text style={[card.title, { color: alert.read ? COLORS.textSecondary : COLORS.textPrimary, flex: 1 }]}>
              {alert.title}
            </Text>
          </View>
          <Text style={card.time}>{alert.time}</Text>
        </View>
        <Text style={card.message}>{alert.body}</Text>

        <View style={card.actions}>
          {alert.actions.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={[
                card.actionBtn,
                i === 0
                  ? { backgroundColor: style.color }
                  : { borderWidth: 1, borderColor: COLORS.cardBorder },
              ]}
              onPress={() => i === alert.actions.length - 1 ? onDismiss() : onAction(action)}
            >
              <Text style={[
                card.actionText,
                i === 0 ? { color: COLORS.deepSpace } : { color: COLORS.textSecondary },
              ]}>
                {action}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const card = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusLg,
    borderWidth: 1.5, marginBottom: SIZES.md, flexDirection: 'row',
    overflow: 'hidden',
  },
  bar: { width: 4, borderRadius: 0 },
  dot: {
    position: 'absolute', top: SIZES.md, right: SIZES.md,
    width: 9, height: 9, borderRadius: 5,
  },
  body: { flex: 1, padding: SIZES.md, gap: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { fontSize: SIZES.small, fontWeight: FONTS.weightBold, flex: 1 },
  time: { fontSize: SIZES.caption, color: COLORS.textMuted },
  message: { fontSize: SIZES.small, color: COLORS.textSecondary, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: {
    paddingHorizontal: SIZES.md, paddingVertical: 6,
    borderRadius: SIZES.radiusMd, backgroundColor: COLORS.cardSurface,
  },
  actionText: { fontSize: SIZES.caption, fontWeight: FONTS.weightSemiBold },
});

// ── Critical Banner ──────────────────────────────────────────────────────────
const CriticalBanner = ({ scenario, navigation }) => {
  const risk = getRiskLevel(DEMO_SCENARIOS[scenario]?.riskScore ?? 8);
  if (risk.label !== 'Critical' && risk.label !== 'Severe') return null;
  const isCritical = risk.label === 'Critical';

  return (
    <View style={[banner.wrap, { borderColor: risk.color }]}>
      <View style={[banner.icon, { backgroundColor: risk.color + '20' }]}>
        <MaterialCommunityIcons name={isCritical ? 'phone-alert' : 'alert-circle'} size={26} color={risk.color} />
      </View>
      <View style={banner.text}>
        <Text style={[banner.title, { color: risk.color }]}>
          {isCritical ? 'Crisis Mode Active' : 'High Risk Detected'}
        </Text>
        <Text style={banner.sub}>
          {isCritical
            ? 'Clinician has been alerted. Immediate support recommended.'
            : 'Consider reaching out to a trusted person or clinician.'}
        </Text>
      </View>
      <TouchableOpacity
        style={[banner.btn, { backgroundColor: risk.color }]}
        onPress={() => navigation.navigate('Remedies')}
      >
        <Text style={banner.btnText}>Help</Text>
      </TouchableOpacity>
    </View>
  );
};

const banner = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.navyCard, borderWidth: 1.5, borderRadius: SIZES.radiusLg,
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  icon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 3 },
  title: { fontSize: SIZES.small, fontWeight: FONTS.weightBold },
  sub: { fontSize: SIZES.caption, color: COLORS.textSecondary, lineHeight: 16 },
  btn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: SIZES.radiusMd },
  btnText: { fontSize: SIZES.caption, fontWeight: FONTS.weightBold, color: COLORS.deepSpace },
});

// ── Main Screen ──────────────────────────────────────────────────────────────
const AlertScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { scenario } = useAppState();
  const [alerts, setAlerts] = useState(SIMULATED_ALERTS);
  const [filter, setFilter] = useState('all');

  const unreadCount = alerts.filter(a => !a.read).length;

  const FILTERS = ['all', 'unread', 'critical', 'severe', 'moderate'];

  const visible = alerts.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !a.read;
    return a.type === filter;
  });

  const dismiss = (id) => setAlerts(prev => prev.filter(a => a.id !== id));
  const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, read: true })));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SIZES.sm }]}>
        <View>
          <Text style={styles.headerTitle}>Alerts</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map(f => {
          const s = typeStyle(f === 'all' || f === 'unread' ? 'safe' : f);
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.pill, active && { backgroundColor: s.color }]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.pillText, active && { color: COLORS.deepSpace }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + SIZES.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <CriticalBanner scenario={scenario} navigation={navigation} />

        {visible.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔕</Text>
            <Text style={styles.emptyText}>No alerts to show</Text>
          </View>
        ) : (
          visible.map(a => (
            <AlertCard
              key={a.id}
              alert={a}
              onDismiss={() => dismiss(a.id)}
              onAction={(action) => {
                if (action === 'View Remedies') navigation.navigate('Remedies');
                else if (action === 'View Sensors') navigation.navigate('SensorDashboard');
              }}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepSpace },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding, paddingBottom: SIZES.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  headerTitle: { fontSize: SIZES.title, fontWeight: FONTS.weightBlack, color: COLORS.textPrimary },
  headerSub: { fontSize: SIZES.small, color: COLORS.severeRed, fontWeight: FONTS.weightMedium, marginTop: 2 },
  markAllBtn: {
    backgroundColor: COLORS.navyCard, paddingHorizontal: SIZES.md,
    paddingVertical: 6, borderRadius: SIZES.radiusMd, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  markAllText: { fontSize: SIZES.caption, color: COLORS.safeGreen, fontWeight: FONTS.weightSemiBold },
  filterRow: { paddingHorizontal: SIZES.screenPadding, paddingVertical: SIZES.sm, gap: 8 },
  pill: {
    paddingHorizontal: SIZES.md, paddingVertical: 6,
    borderRadius: SIZES.radiusFull, backgroundColor: COLORS.navyCard,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  pillText: { fontSize: SIZES.caption, color: COLORS.textSecondary, fontWeight: FONTS.weightSemiBold },
  list: { paddingHorizontal: SIZES.screenPadding, paddingTop: SIZES.sm },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: SIZES.xxxl, gap: SIZES.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: SIZES.body, color: COLORS.textMuted },
});

export default AlertScreen;
