import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS, DEMO_SCENARIOS } from '../../theme';
import { useAppState } from '../../context/AppStateContext';

const SCENARIO_OPTIONS = [
  { key: 'healthy',  label: 'Healthy',  icon: 'emoticon-happy-outline', sub: 'Risk score: 8',  color: COLORS.safeGreen },
  { key: 'mild',     label: 'Mild',      icon: 'emoticon-neutral-outline', sub: 'Risk score: 32', color: COLORS.mildYellow },
  { key: 'moderate', label: 'Moderate',  icon: 'emoticon-confused-outline', sub: 'Risk score: 58', color: COLORS.moderateOrange },
  { key: 'severe',   label: 'Severe',    icon: 'emoticon-sad-outline', sub: 'Risk score: 79', color: COLORS.severeRed },
  { key: 'critical', label: 'Critical',  icon: 'emoticon-cry-outline', sub: 'Risk score: 94', color: COLORS.criticalPurple },
];

const SectionHeader = ({ title, icon }) => (
  <View style={sec.headerWrap}>
    {icon && <MaterialCommunityIcons name={icon} size={14} color={COLORS.textMuted} />}
    <Text style={sec.header}>{title}</Text>
  </View>
);

const sec = StyleSheet.create({
  headerWrap: { flexDirection: 'row', alignItems: 'center', gap: SIZES.xs },
  header: {
    fontSize: 10, color: COLORS.textMuted, fontWeight: FONTS.weightBold,
    letterSpacing: 2, paddingVertical: SIZES.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider, marginBottom: SIZES.sm, flex: 1,
  },
});

const Row = ({ label, sub, right, onPress, noBorder }) => (
  <TouchableOpacity
    style={[rowS.wrap, noBorder && { borderBottomWidth: 0 }]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={{ flex: 1 }}>
      <Text style={rowS.label}>{label}</Text>
      {sub ? <Text style={rowS.sub}>{sub}</Text> : null}
    </View>
    {right}
  </TouchableOpacity>
);

const rowS = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    paddingVertical: SIZES.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  label: { fontSize: SIZES.small, color: COLORS.textPrimary, fontWeight: FONTS.weightMedium },
  sub: { fontSize: SIZES.caption, color: COLORS.textMuted, marginTop: 2 },
});

const SettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { scenario, setScenario, user, setUser } = useAppState();

  const [name, setName] = useState(user?.name || '');
  const [nameEditing, setNameEditing] = useState(false);

  // Toggles (UI only)
  const [darkMode, setDarkMode] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [clinicianSync, setClinicianSync] = useState(true);
  const [anonymousData, setAnonymousData] = useState(false);
  const [locationTracking, setLocationTracking] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('5 min');

  const saveName = () => {
    setUser(u => ({ ...u, name }));
    setNameEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SIZES.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.simBadge}>
          <Text style={styles.simText}>SIM MODE</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SIZES.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Simulation Scenario ── */}
        <View style={styles.card}>
          <SectionHeader title="SIMULATION SCENARIO" icon="play-circle-outline" />
          <Text style={styles.scenarioHint}>
            Change the simulated patient scenario to preview all risk states throughout the app.
          </Text>
          <View style={styles.scenarioGrid}>
            {SCENARIO_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.scenarioBtn,
                  scenario === opt.key && { borderColor: opt.color, backgroundColor: opt.color + '15' },
                ]}
                onPress={() => setScenario(opt.key)}
              >
                <MaterialCommunityIcons name={opt.icon} size={20} color={opt.color} />
                <Text style={styles.scenarioLabel}>{opt.label}</Text>
                <Text style={[styles.scenarioSub, scenario === opt.key && { color: opt.color }]}>{opt.sub}</Text>
                {scenario === opt.key && (
                  <View style={[styles.activeDot, { backgroundColor: opt.color }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Profile ── */}
        <View style={styles.card}>
          <SectionHeader title="PROFILE" icon="account-circle-outline" />
          <Row
            label="Display Name"
            sub={nameEditing ? undefined : user?.name}
            right={
              nameEditing ? (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    style={styles.nameInput}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <TouchableOpacity onPress={saveName} style={styles.saveBtn}>
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setNameEditing(true)}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              )
            }
          />
          <Row label="Email" sub={user?.email || 'alex@mindpulse.io'} noBorder />
        </View>

        {/* ── Monitoring ── */}
        <View style={styles.card}>
          <SectionHeader title="MONITORING" icon="satellite-uplink" />
          <Row
            label="Auto Refresh"
            sub="Sensor data sync frequency"
            right={<Switch value={autoRefresh} onValueChange={setAutoRefresh} trackColor={{ true: COLORS.safeGreen + '80' }} thumbColor={autoRefresh ? COLORS.safeGreen : COLORS.textMuted} />}
          />
          <Row
            label="Refresh Interval"
            sub="How often sensors sync"
            right={
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {['1 min', '5 min', '15 min'].map(v => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.intervalBtn, refreshInterval === v && { backgroundColor: COLORS.safeGreen, borderColor: COLORS.safeGreen }]}
                    onPress={() => setRefreshInterval(v)}
                  >
                    <Text style={[styles.intervalText, refreshInterval === v && { color: COLORS.deepSpace }]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            }
          />
          <Row
            label="Location Tracking"
            sub="Required for GPS entropy scoring"
            right={<Switch value={locationTracking} onValueChange={setLocationTracking} trackColor={{ true: COLORS.safeGreen + '80' }} thumbColor={locationTracking ? COLORS.safeGreen : COLORS.textMuted} />}
            noBorder
          />
        </View>

        {/* ── Clinician ── */}
        <View style={styles.card}>
          <SectionHeader title="CLINICIAN" icon="hospital-box-outline" />
          <Row
            label="Clinician Sync"
            sub="Send risk data to your assigned clinician"
            right={<Switch value={clinicianSync} onValueChange={setClinicianSync} trackColor={{ true: COLORS.safeGreen + '80' }} thumbColor={clinicianSync ? COLORS.safeGreen : COLORS.textMuted} />}
          />
          <Row label="Clinician Name" sub="Dr. Priya Sharma" noBorder />
        </View>

        {/* ── Appearance ── */}
        <View style={styles.card}>
          <SectionHeader title="APPEARANCE" icon="palette-outline" />
          <Row
            label="Dark Mode"
            sub="Always on in simulation"
            right={<Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: COLORS.safeGreen + '80' }} thumbColor={darkMode ? COLORS.safeGreen : COLORS.textMuted} />}
          />
          <Row
            label="Haptic Feedback"
            right={<Switch value={haptics} onValueChange={setHaptics} trackColor={{ true: COLORS.safeGreen + '80' }} thumbColor={haptics ? COLORS.safeGreen : COLORS.textMuted} />}
            noBorder
          />
        </View>

        {/* ── Privacy ── */}
        <View style={styles.card}>
          <SectionHeader title="PRIVACY" icon="shield-outline" />
          <Row
            label="Share Anonymous Data"
            sub="Help improve IoT depression models"
            right={<Switch value={anonymousData} onValueChange={setAnonymousData} trackColor={{ true: COLORS.safeGreen + '80' }} thumbColor={anonymousData ? COLORS.safeGreen : COLORS.textMuted} />}
          />
          <Row label="Export My Data" onPress={() => {}} right={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Text style={styles.editText}>Export</Text><MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.safeGreen} /></View>} />
          <Row label="Delete Account" onPress={() => {}} right={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Text style={{ color: COLORS.severeRed, fontSize: SIZES.small }}>Delete</Text><MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.severeRed} /></View>} noBorder />
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>MindPulse v1.0.0 · Simulation Build</Text>
          <Text style={styles.footerSub}>IoT-Based Depression Detection System</Text>
          <Text style={styles.footerSub}>No real sensor data is collected or transmitted.</Text>
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
  title: { fontSize: SIZES.title, fontWeight: FONTS.weightBlack, color: COLORS.textPrimary, flex: 1 },
  simBadge: {
    backgroundColor: COLORS.safeGreen + '20', borderRadius: SIZES.radiusFull,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.safeGreen + '50',
  },
  simText: { fontSize: 10, color: COLORS.safeGreen, fontWeight: FONTS.weightBold, letterSpacing: 1 },
  content: { paddingHorizontal: SIZES.screenPadding, paddingTop: SIZES.md, gap: SIZES.md },
  card: {
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusLg,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: SIZES.md,
  },
  scenarioHint: { fontSize: SIZES.caption, color: COLORS.textMuted, marginBottom: SIZES.sm, lineHeight: 18 },
  scenarioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  scenarioBtn: {
    width: '47%', borderRadius: SIZES.radiusMd, borderWidth: 1.5,
    borderColor: COLORS.cardBorder, padding: SIZES.sm, gap: 4, position: 'relative',
    alignItems: 'center',
  },
  scenarioLabel: { fontSize: SIZES.small, color: COLORS.textPrimary, fontWeight: FONTS.weightBold },
  scenarioSub: { fontSize: SIZES.caption, color: COLORS.textMuted },
  activeDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
  },
  nameInput: {
    backgroundColor: COLORS.cardSurface, borderRadius: SIZES.radiusSm,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: 6,
    color: COLORS.textPrimary, fontSize: SIZES.small, minWidth: 120,
  },
  saveBtn: {
    backgroundColor: COLORS.safeGreen, paddingHorizontal: SIZES.sm,
    paddingVertical: 6, borderRadius: SIZES.radiusSm,
  },
  saveBtnText: { fontSize: SIZES.caption, fontWeight: FONTS.weightBold, color: COLORS.deepSpace },
  editText: { fontSize: SIZES.small, color: COLORS.safeGreen, fontWeight: FONTS.weightSemiBold },
  intervalBtn: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: SIZES.radiusMd, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  intervalText: { fontSize: 11, color: COLORS.textMuted, fontWeight: FONTS.weightSemiBold },
  footer: { alignItems: 'center', gap: 3, paddingVertical: SIZES.lg },
  footerText: { fontSize: SIZES.small, color: COLORS.textMuted, fontWeight: FONTS.weightMedium },
  footerSub: { fontSize: SIZES.caption, color: COLORS.textMuted, opacity: 0.6, textAlign: 'center' },
});

export default SettingsScreen;
