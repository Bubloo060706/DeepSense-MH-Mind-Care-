import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS, getRiskLevel } from '../../theme';
import { useAppState } from '../../context/AppStateContext';

const { width } = Dimensions.get('window');

const DEMO_HISTORY = [
  { id: 1, date: '2026-04-01', riskScore: 94, label: 'Critical',  phq: 23, steps: 200,  sleep: 2.0, screen: 13.5, mood: 'emoticon-cry-outline' },
  { id: 2, date: '2026-03-31', riskScore: 79, label: 'Severe',    phq: 17, steps: 800,  sleep: 3.5, screen: 10.1, mood: 'emoticon-sad-outline' },
  { id: 3, date: '2026-03-28', riskScore: 58, label: 'Moderate',  phq: 12, steps: 2800, sleep: 5.0, screen: 7.2,  mood: 'emoticon-confused-outline' },
  { id: 4, date: '2026-03-21', riskScore: 32, label: 'Mild',      phq: 7,  steps: 5200, sleep: 6.1, screen: 4.8,  mood: 'emoticon-neutral-outline' },
  { id: 5, date: '2026-03-14', riskScore: 8,  label: 'No Risk',   phq: 2,  steps: 9400, sleep: 7.8, screen: 2.3,  mood: 'emoticon-happy-outline' },
  { id: 6, date: '2026-03-07', riskScore: 15, label: 'Mild',      phq: 5,  steps: 7200, sleep: 7.2, screen: 3.1,  mood: 'emoticon-neutral-outline' },
  { id: 7, date: '2026-02-28', riskScore: 44, label: 'Moderate',  phq: 11, steps: 4100, sleep: 5.5, screen: 5.9,  mood: 'emoticon-confused-outline' },
];

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Mini sparkline built purely from Views
const Sparkline = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const H = 32;
  const W = (width - SIZES.screenPadding * 2 - 32) / data.length;

  return (
    <View style={{ height: H, flexDirection: 'row', alignItems: 'flex-end' }}>
      {data.map((v, i) => {
        const h = Math.max(3, ((v - min) / range) * H);
        return (
          <View key={i} style={{ width: W - 2, height: h, backgroundColor: color, borderRadius: 2, marginRight: 2, opacity: 0.7 + (i / data.length) * 0.3 }} />
        );
      })}
    </View>
  );
};

const TrendCard = () => {
  const scores = DEMO_HISTORY.slice().reverse().map(h => h.riskScore);
  const latest = scores[scores.length - 1];
  const prev = scores[scores.length - 2];
  const isWorsening = latest > prev;
  const isImproving = latest < prev;
  const trendIcon = isWorsening ? 'trending-up' : isImproving ? 'trending-down' : 'minus';
  const trendLabel = isWorsening ? 'Worsening' : isImproving ? 'Improving' : 'Stable';
  const trendColor = isWorsening ? COLORS.severeRed : isImproving ? COLORS.safeGreen : COLORS.mildYellow;

  return (
    <View style={trend_.wrap}>
      <View style={trend_.top}>
        <View>
          <Text style={trend_.label}>14-DAY RISK TREND</Text>
          <Text style={trend_.score}>{latest}<Text style={trend_.unit}>/100</Text></Text>
        </View>
        <View style={[trend_.trendPill, { borderColor: trendColor + '60', backgroundColor: trendColor + '10' }]}>
          <MaterialCommunityIcons name={trendIcon} size={16} color={trendColor} />
          <Text style={[trend_.trendText, { color: trendColor }]}>{trendLabel}</Text>
        </View>
      </View>
      <Sparkline data={scores} color={getRiskLevel(latest).color} />
      <Text style={trend_.hint}>Tap any record below to view full breakdown</Text>
    </View>
  );
};

const trend_ = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusXl,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: SIZES.lg,
    gap: SIZES.sm, marginBottom: SIZES.md,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { fontSize: 9, color: COLORS.textMuted, fontWeight: FONTS.weightBold, letterSpacing: 2 },
  score: { fontSize: SIZES.display, fontWeight: FONTS.weightBlack, color: COLORS.textPrimary },
  unit: { fontSize: SIZES.body, color: COLORS.textMuted },
  trendPill: { paddingHorizontal: SIZES.sm, paddingVertical: 4, borderRadius: SIZES.radiusFull, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendText: { fontSize: SIZES.caption, fontWeight: FONTS.weightBold },
  hint: { fontSize: SIZES.caption, color: COLORS.textMuted, marginTop: 4 },
});

const HistoryRow = ({ item, onPress, expanded }) => {
  const risk = getRiskLevel(item.riskScore);
  return (
    <>
      <TouchableOpacity style={[row_.wrap, expanded && { borderColor: risk.color + '60' }]} onPress={onPress}>
        <View style={[row_.scoreBall, { borderColor: risk.color }]}>
          <Text style={[row_.scoreNum, { color: risk.color }]}>{item.riskScore}</Text>
        </View>
        <View style={row_.info}>
          <Text style={row_.date}>{fmtDate(item.date)}</Text>
          <Text style={[row_.level, { color: risk.color }]}>{item.label}</Text>
        </View>
        <View style={row_.right}>
          <MaterialCommunityIcons name={item.mood} size={20} color={risk.color} />
          <Text style={row_.phq}>PHQ {item.phq}</Text>
        </View>
        <MaterialCommunityIcons name={expanded ? 'chevron-down' : 'chevron-right'} size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
      {expanded && (
        <View style={[row_.detail, { borderColor: risk.color + '30' }]}>
          {[
            ['walk', 'Steps', item.steps.toLocaleString(), COLORS.safeGreen],
            ['sleep', 'Sleep', `${item.sleep}h`, COLORS.mildYellow],
            ['phone', 'Screen', `${item.screen}h`, COLORS.moderateOrange],
            ['chart-bar', 'PHQ-9', `${item.phq}/27`, risk.color],
          ].map(([icon, label, val, col]) => (
            <View key={label} style={row_.detailItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                <MaterialCommunityIcons name={icon} size={14} color={col} />
                <Text style={row_.detailLabel}>{label}</Text>
              </View>
              <Text style={[row_.detailVal, { color: col }]}>{val}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
};

const row_ = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusMd,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: SIZES.md,
  },
  scoreBall: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreNum: { fontSize: SIZES.body, fontWeight: FONTS.weightBlack },
  info: { flex: 1, gap: 2 },
  date: { fontSize: SIZES.small, color: COLORS.textPrimary, fontWeight: FONTS.weightSemiBold },
  level: { fontSize: SIZES.caption, fontWeight: FONTS.weightBold },
  right: { alignItems: 'flex-end', gap: 2 },
  phq: { fontSize: SIZES.caption, color: COLORS.textMuted },
  detail: {
    backgroundColor: COLORS.cardSurface, borderRadius: SIZES.radiusMd,
    borderWidth: 1, padding: SIZES.md, flexDirection: 'row', flexWrap: 'wrap',
    gap: SIZES.sm, marginTop: -6,
  },
  detailItem: { width: '45%', gap: 2 },
  detailLabel: { fontSize: SIZES.caption, color: COLORS.textMuted },
  detailVal: { fontSize: SIZES.small, fontWeight: FONTS.weightBold },
});

const HistoryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { phqHistory } = useAppState();
  const [expandedId, setExpandedId] = useState(null);
  const [tab, setTab] = useState('risk'); // risk | phq

  const allHistory = [...DEMO_HISTORY];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SIZES.sm }]}>
        <Text style={styles.title}>History</Text>
        <View style={styles.tabs}>
          {[['risk', 'chart-line', 'Risk'], ['phq', 'clipboard-list-outline', 'PHQ-9']].map(([k, icon, l]) => (
            <TouchableOpacity
              key={k} onPress={() => setTab(k)}
              style={[styles.tab, tab === k && styles.tabActive]}
            >
              <MaterialCommunityIcons name={icon} size={16} color={tab === k ? COLORS.safeGreen : COLORS.textMuted} />
              <Text style={[styles.tabText, tab === k && styles.tabTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SIZES.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'risk' ? (
          <>
            <TrendCard />
            <Text style={styles.sectionLabel}>ALL RECORDS</Text>
            <View style={{ gap: SIZES.sm }}>
              {allHistory.map(item => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  expanded={expandedId === item.id}
                  onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                />
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionLabel}>PHQ-9 ASSESSMENT HISTORY</Text>
            {phqHistory.length === 0 ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="clipboard-list-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No PHQ-9 Records Yet</Text>
                <Text style={styles.emptySub}>Take your first PHQ-9 assessment to track your progress over time.</Text>
                <TouchableOpacity
                  style={styles.takeBtn}
                  onPress={() => navigation.navigate('PHQ9')}
                >
                  <Text style={styles.takeBtnText}>Take PHQ-9 Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              phqHistory.map(r => {
                const risk = getRiskLevel((r.total / 27) * 100);
                return (
                  <View key={r.id} style={[styles.phqRow, { borderColor: risk.color + '40' }]}>
                    <Text style={[styles.phqScore, { color: risk.color }]}>{r.total}/27</Text>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.phqLevel}>{risk.label}</Text>
                      <Text style={styles.phqDate}>{new Date(r.ts).toLocaleDateString('en-IN')}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </>
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
  title: { fontSize: SIZES.title, fontWeight: FONTS.weightBlack, color: COLORS.textPrimary },
  tabs: { flexDirection: 'row', gap: 6 },
  tab: { paddingHorizontal: SIZES.sm, paddingVertical: 5, borderRadius: SIZES.radiusMd, borderWidth: 1, borderColor: COLORS.cardBorder, flexDirection: 'row', alignItems: 'center', gap: 4 },
  tabActive: { backgroundColor: COLORS.safeGreen },
  tabText: { fontSize: SIZES.caption, color: COLORS.textMuted, fontWeight: FONTS.weightSemiBold },
  tabTextActive: { color: COLORS.deepSpace },
  content: { paddingHorizontal: SIZES.screenPadding, paddingTop: SIZES.md, gap: SIZES.sm },
  sectionLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: FONTS.weightBold, letterSpacing: 2 },
  empty: {
    alignItems: 'center', gap: SIZES.sm, paddingVertical: SIZES.xxxl,
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusXl,
    borderWidth: 1, borderColor: COLORS.cardBorder, paddingHorizontal: SIZES.xl,
  },
  emptyTitle: { fontSize: SIZES.subtitle, fontWeight: FONTS.weightBlack, color: COLORS.textPrimary },
  emptySub: { fontSize: SIZES.small, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  takeBtn: { backgroundColor: COLORS.safeGreen, paddingHorizontal: SIZES.xl, paddingVertical: SIZES.sm, borderRadius: SIZES.radiusMd, marginTop: SIZES.sm },
  takeBtnText: { fontSize: SIZES.small, fontWeight: FONTS.weightBold, color: COLORS.deepSpace },
  phqRow: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusMd,
    borderWidth: 1, padding: SIZES.md,
  },
  phqScore: { fontSize: SIZES.heading, fontWeight: FONTS.weightBlack },
  phqLevel: { fontSize: SIZES.small, color: COLORS.textPrimary, fontWeight: FONTS.weightBold },
  phqDate: { fontSize: SIZES.caption, color: COLORS.textMuted },
});

export default HistoryScreen;
