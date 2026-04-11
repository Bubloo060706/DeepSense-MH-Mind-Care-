import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS, DEMO_SCENARIOS, getRiskLevel } from '../../theme';
import { useAppState } from '../../context/AppStateContext';

const StatCard = ({ icon, value, label, color }) => (
  <View style={stat.card}>
    <MaterialCommunityIcons name={icon} size={24} color={color} />
    <Text style={[stat.value, { color }]}>{value}</Text>
    <Text style={stat.label}>{label}</Text>
  </View>
);

const stat = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: COLORS.cardSurface, borderRadius: SIZES.radiusMd,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: SIZES.md, alignItems: 'center', gap: 4,
  },
  value: { fontSize: SIZES.heading, fontWeight: FONTS.weightBlack },
  label: { fontSize: SIZES.caption, color: COLORS.textMuted, textAlign: 'center' },
});

const MenuRow = ({ icon, label, value, onPress, danger, toggle, toggled, onToggle }) => (
  <TouchableOpacity style={menu.row} onPress={onPress} activeOpacity={toggle ? 1 : 0.7}>
    <View style={[menu.iconBox, danger && { backgroundColor: COLORS.severeRedDim }]}>
      <MaterialCommunityIcons 
        name={icon} 
        size={18} 
        color={danger ? COLORS.severeRed : COLORS.textPrimary} 
      />
    </View>
    <Text style={[menu.label, danger && { color: COLORS.severeRed }]}>{label}</Text>
    <View style={menu.right}>
      {value ? <Text style={menu.value}>{value}</Text> : null}
      {toggle ? (
        <Switch
          value={toggled}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.cardBorder, true: COLORS.safeGreen + '80' }}
          thumbColor={toggled ? COLORS.safeGreen : COLORS.textMuted}
        />
      ) : (
        <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textMuted} />
      )}
    </View>
  </TouchableOpacity>
);

const menu = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
    paddingVertical: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  iconBox: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.cardSurface,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { flex: 1, fontSize: SIZES.body, color: COLORS.textPrimary, fontWeight: FONTS.weightMedium },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { fontSize: SIZES.small, color: COLORS.textMuted },
});

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, scenario } = useAppState();
  const data = DEMO_SCENARIOS[scenario] || DEMO_SCENARIOS.healthy;
  const risk = getRiskLevel(data.riskScore);

  const [notifications, setNotifications] = useState(true);
  const [clinicianAlerts, setClinicianAlerts] = useState(true);
  const [biometric, setBiometric] = useState(false);

  const initials = (user?.name || 'U').slice(0, 2).toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SIZES.md }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar & Name */}
      <View style={styles.profileHead}>
        <View style={[styles.avatar, { borderColor: risk.color }]}>
          <Text style={styles.avatarText}>{initials}</Text>
          <View style={[styles.statusDot, { backgroundColor: risk.color }]} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'Alex'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'alex@mindpulse.io'}</Text>
          <View style={[styles.rolePill, { borderColor: COLORS.safeGreen }]}>
            <Text style={styles.roleText}>Patient · Simulation Mode</Text>
          </View>
        </View>
      </View>

      {/* PHQ-9 Card */}
      <View style={[styles.phqCard, { borderColor: risk.color + '50' }]}>
        <View style={styles.phqLeft}>
          <Text style={styles.phqLabel}>CURRENT STATUS</Text>
          <Text style={[styles.phqLevel, { color: risk.color }]}>{risk.label}</Text>
          <Text style={styles.phqSub}>PHQ-9 Equivalent: {risk.phq}</Text>
        </View>
        <TouchableOpacity
          style={[styles.phqBtn, { backgroundColor: risk.color }]}
          onPress={() => navigation.navigate('PHQ9')}
        >
          <Text style={styles.phqBtnText}>Take PHQ-9</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard icon="calendar-outline" value="14d" label="Monitoring" color={COLORS.safeGreen} />
        <StatCard icon="chart-bar" value="96%" label="Data Quality" color={COLORS.mildYellow} />
        <StatCard icon="bell-outline" value="3" label="Alerts" color={COLORS.moderateOrange} />
      </View>

      {/* Section: Monitoring */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>MONITORING</Text>
        <MenuRow icon="satellite-uplink" label="Sensor Dashboard" onPress={() => navigation.navigate('SensorDashboard')} />
        <MenuRow icon="clipboard-list-outline" label="PHQ-9 History" onPress={() => navigation.navigate('History')} />
        <MenuRow icon="emoticon-neutral-outline" label="Mood Log" onPress={() => navigation.navigate('MoodLog')} />
        <MenuRow icon="chart-line" label="Risk History" value={`${data.riskScore}/100`} onPress={() => navigation.navigate('Pulse')} />
      </View>

      {/* Section: Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <MenuRow icon="bell-outline" label="Notifications" toggle toggled={notifications} onToggle={setNotifications} />
        <MenuRow icon="hospital-box-outline" label="Clinician Alerts" toggle toggled={clinicianAlerts} onToggle={setClinicianAlerts} />
        <MenuRow icon="lock-outline" label="Biometric Login" toggle toggled={biometric} onToggle={setBiometric} />
        <MenuRow icon="cog-outline" label="Settings" onPress={() => navigation.navigate('Settings')} />
      </View>

      {/* Section: Support */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <MenuRow icon="pill" label="Wellness Remedies" onPress={() => navigation.navigate('Remedies')} />
        <MenuRow icon="phone-incoming" label="Crisis Helpline" value="iCall: 9152987821" onPress={() => {}} />
        <MenuRow icon="information-outline" label="About MindPulse" onPress={() => {}} />
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <MenuRow icon="logout" label="Sign Out" onPress={() => navigation.replace('Login')} danger />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>MindPulse v1.0 · Simulation Mode</Text>
        <Text style={styles.footerSub}>IoT Depression Detection System</Text>
        <Text style={styles.footerSub}>No real sensor data is collected</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepSpace },
  content: { paddingHorizontal: SIZES.screenPadding, gap: SIZES.md, paddingBottom: SIZES.xxl },
  profileHead: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.lg,
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusXl,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: SIZES.xl,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 3,
    backgroundColor: COLORS.cardSurface, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: SIZES.heading, fontWeight: FONTS.weightBlack, color: COLORS.textPrimary },
  statusDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: COLORS.navyCard,
  },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: SIZES.title, fontWeight: FONTS.weightBlack, color: COLORS.textPrimary },
  profileEmail: { fontSize: SIZES.small, color: COLORS.textMuted },
  rolePill: {
    alignSelf: 'flex-start', borderWidth: 1, borderRadius: SIZES.radiusFull,
    paddingHorizontal: 10, paddingVertical: 3, marginTop: 4,
  },
  roleText: { fontSize: SIZES.caption, color: COLORS.safeGreen, fontWeight: FONTS.weightSemiBold },
  phqCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusLg, borderWidth: 1.5, padding: SIZES.lg,
  },
  phqLeft: { gap: 4 },
  phqLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: FONTS.weightBold, letterSpacing: 2 },
  phqLevel: { fontSize: SIZES.title, fontWeight: FONTS.weightBlack },
  phqSub: { fontSize: SIZES.caption, color: COLORS.textMuted },
  phqBtn: { paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, borderRadius: SIZES.radiusMd },
  phqBtnText: { fontSize: SIZES.small, fontWeight: FONTS.weightBold, color: COLORS.deepSpace },
  statsRow: { flexDirection: 'row', gap: SIZES.sm },
  section: {
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusLg,
    borderWidth: 1, borderColor: COLORS.cardBorder, paddingHorizontal: SIZES.lg, paddingTop: SIZES.sm,
  },
  sectionLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: FONTS.weightBold, letterSpacing: 2, paddingVertical: SIZES.sm },
  footer: { alignItems: 'center', gap: 4, paddingBottom: SIZES.xl },
  footerText: { fontSize: SIZES.small, color: COLORS.textMuted, fontWeight: FONTS.weightMedium },
  footerSub: { fontSize: SIZES.caption, color: COLORS.textMuted, opacity: 0.6 },
});

export default ProfileScreen;
