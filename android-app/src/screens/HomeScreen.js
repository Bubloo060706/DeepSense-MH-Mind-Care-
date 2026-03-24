import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, Alert, Animated
} from "react-native";
import RiskScorePredictor  from "../ml/RiskScorePredictor";
import BackendClient       from "../api/BackendClient";
import WorkManagerTask     from "../background/WorkManagerTask";
import GpsSensor           from "../sensors/GpsSensor";
import AccelerometerSensor from "../sensors/AccelerometerSensor";
import ScreenEventListener from "../sensors/ScreenEventListener";
import CallLogReader       from "../sensors/CallLogReader";

// ─────────────────────────────────────────────
// Remedy & prevention content per risk level
// ─────────────────────────────────────────────
const REMEDY_DATA = {
  low: {
    title:       "You're doing well 🌱",
    subtitle:    "Keep maintaining these healthy habits",
    color:       "#38a169",
    bgColor:     "#f0fff4",
    borderColor: "#9ae6b4",
    sections: [
      {
        heading: "✅ Keep It Up",
        items: [
          "Maintain your current sleep schedule — consistency is key",
          "Continue your physical activity routine",
          "Stay socially connected with friends and family",
          "Practice gratitude journaling — even 3 lines a day helps",
        ],
      },
      {
        heading: "🧘 Preventive Wellness",
        items: [
          "Try 10 minutes of mindfulness or meditation daily",
          "Spend at least 20 minutes outdoors in natural light",
          "Limit screen time 1 hour before bed",
          "Eat balanced meals at regular intervals",
        ],
      },
      {
        heading: "📅 Weekly Check-in",
        items: [
          "Complete your PHQ-9 questionnaire on schedule",
          "Review your behavioral trends on the dashboard",
          "Share your progress with your clinician if enrolled",
        ],
      },
    ],
  },

  moderate: {
    title:       "Some signs to watch 🌤️",
    subtitle:    "Your behavioral patterns show early stress indicators",
    color:       "#c05621",
    bgColor:     "#fffaf0",
    borderColor: "#f6ad55",
    sections: [
      {
        heading: "⚠️ Immediate Actions",
        items: [
          "Reach out to one trusted person today — a friend, family member, or mentor",
          "Take a 15-minute walk outside, even a short one helps regulate mood",
          "Avoid isolating yourself — reduced social contact worsens symptoms",
          "Reduce alcohol and caffeine intake this week",
        ],
      },
      {
        heading: "🛌 Sleep Hygiene",
        items: [
          "Set a fixed bedtime and wake-up time and stick to it daily",
          "Keep your bedroom dark, cool, and phone-free during sleep",
          "Avoid naps longer than 20 minutes if having trouble sleeping at night",
          "Try the 4-7-8 breathing technique before sleep",
        ],
      },
      {
        heading: "🏃 Physical Activity",
        items: [
          "Aim for at least 30 minutes of moderate exercise 3x this week",
          "Even a 10-minute walk after meals significantly reduces sedentary risk",
          "Yoga and stretching are proven to reduce cortisol levels",
        ],
      },
      {
        heading: "🧠 Cognitive Strategies",
        items: [
          "Write down 3 things you are grateful for each evening",
          "Break large tasks into smaller ones to avoid feeling overwhelmed",
          "Challenge negative thoughts — write them down and reframe them",
          "Limit news and social media to 30 minutes per day",
        ],
      },
      {
        heading: "👨‍⚕️ Professional Support",
        items: [
          "Consider booking an appointment with a counselor or therapist",
          "Inform your clinician about your current mood if enrolled",
          "Complete your weekly PHQ-9 — your score helps guide your care",
        ],
      },
    ],
  },

  high: {
    title:       "Please seek support 🆘",
    subtitle:    "Your risk score is elevated — you are not alone",
    color:       "#c53030",
    bgColor:     "#fff5f5",
    borderColor: "#fc8181",
    sections: [
      {
        heading: "🚨 Please Do This Now",
        items: [
          "Talk to someone you trust immediately — do not stay alone with these feelings",
          "Contact a mental health professional or your enrolled clinician today",
          "If you feel unsafe, call iCall (India): 9152987821 or Vandrevala Foundation: 1860-2662-345",
          "Avoid making major life decisions while in this state",
        ],
      },
      {
        heading: "🏥 Crisis Resources (India)",
        items: [
          "iCall (TISS): 9152987821 — Mon–Sat, 8AM–10PM",
          "Vandrevala Foundation: 1860-2662-345 — 24/7 free helpline",
          "NIMHANS Helpline: 080-46110007",
          "Snehi: 044-24640050 — emotional support helpline",
        ],
      },
      {
        heading: "🛡️ Immediate Coping",
        items: [
          "Practice box breathing: inhale 4s → hold 4s → exhale 4s → hold 4s",
          "Ground yourself: name 5 things you can see, 4 you can touch, 3 you can hear",
          "Move to a safe, comfortable space and avoid being alone if possible",
          "Drink water, eat something light, and avoid alcohol or substances",
        ],
      },
      {
        heading: "💊 Medical Attention",
        items: [
          "A psychiatrist can evaluate whether medication may help alongside therapy",
          "Do not self-medicate — consult a licensed professional",
          "Cognitive Behavioral Therapy (CBT) is highly effective for MDD",
          "Bring your PHQ-9 history and risk score trends to your appointment",
        ],
      },
      {
        heading: "👨‍👩‍👧 Support Network",
        items: [
          "Share how you feel with at least one family member or close friend",
          "Ask someone to check in on you daily this week",
          "Consider joining a peer support group — iCall and NIMHANS have referrals",
          "Remember: seeking help is a sign of strength, not weakness",
        ],
      },
    ],
  },
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const [latestScore,   setLatestScore]   = useState(null);
  const [alerts,        setAlerts]        = useState([]);
  const [isMonitoring,  setIsMonitoring]  = useState(false);
  const [refreshing,    setRefreshing]    = useState(false);
  const [statusMsg,     setStatusMsg]     = useState("Tap Start to begin monitoring");
  const [expandedSection, setExpandedSection] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    _init();
    return () => _cleanup();
  }, []);

  useEffect(() => {
    if (latestScore) {
      Animated.timing(fadeAnim, {
        toValue:         1,
        duration:        600,
        useNativeDriver: true,
      }).start();
    }
  }, [latestScore]);

  const _init = async () => {
    await BackendClient.init();
    await RiskScorePredictor.load();
    const score = await BackendClient.getLatestScore().catch(() => null);
    if (score) setLatestScore(score);
    const alertRes = await BackendClient.getAlerts(true).catch(() => []);
    setAlerts(Array.isArray(alertRes) ? alertRes : []);
  };

  const _cleanup = () => {
    if (isMonitoring) _stopMonitoring();
  };

  const _startMonitoring = async () => {
    setStatusMsg("Starting sensors...");
    try {
      await GpsSensor.start();
      AccelerometerSensor.start();
      ScreenEventListener.start();
      await CallLogReader.start();
      await WorkManagerTask.configure();
      setIsMonitoring(true);
      setStatusMsg("Monitoring active — sensors running");
    } catch (err) {
      setStatusMsg("Failed to start sensors");
      Alert.alert("Error", err.message);
    }
  };

  const _stopMonitoring = async () => {
    GpsSensor.stop();
    AccelerometerSensor.stop();
    ScreenEventListener.stop();
    CallLogReader.stop();
    await WorkManagerTask.stop();
    setIsMonitoring(false);
    setStatusMsg("Monitoring stopped");
  };

  const _runManualInference = async () => {
    setStatusMsg("Running inference...");
    const result = await RiskScorePredictor.runInference(new Date());
    if (result) {
      setLatestScore(result);
      setStatusMsg(`Score updated: ${(result.score * 100).toFixed(0)}%`);
      // Reset expanded section so remedies re-animate
      setExpandedSection(null);
      fadeAnim.setValue(0);
    } else {
      setStatusMsg("Inference failed — check sensor data");
    }
  };

  const _onRefresh = async () => {
    setRefreshing(true);
    await _init();
    setRefreshing(false);
  };

  // Derive risk level key
  const _getRiskLevel = (score) => {
    if (!score) return null;
    if (score >= 0.65) return "high";
    if (score >= 0.30) return "moderate";
    return "low";
  };

  const riskLevel  = _getRiskLevel(latestScore?.score);
  const remedyInfo = riskLevel ? REMEDY_DATA[riskLevel] : null;

  const scoreColor =
    riskLevel === "high"     ? "#c53030" :
    riskLevel === "moderate" ? "#c05621" :
    riskLevel === "low"      ? "#38a169" : "#718096";

  const toggleSection = (idx) => {
    setExpandedSection((prev) => (prev === idx ? null : idx));
  };

  return (
    <ScrollView
      style          = {styles.container}
      refreshControl = {
        <RefreshControl refreshing={refreshing} onRefresh={_onRefresh} />
      }
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧠 Depression Monitor</Text>
        <Text style={styles.headerSub}>IoT Behavioral Sensing</Text>
      </View>

      {/* ── Risk Score Card ── */}
      <View style={[
        styles.scoreCard,
        remedyInfo && { borderTopWidth: 4, borderTopColor: remedyInfo.color }
      ]}>
        <Text style={styles.scoreLabel}>Current Risk Score</Text>
        <Text style={[styles.scoreValue, { color: scoreColor }]}>
          {latestScore
            ? `${(latestScore.score * 100).toFixed(0)}%`
            : "—"}
        </Text>
        <Text style={[styles.scoreSeverity, { color: scoreColor }]}>
          {latestScore?.severity?.toUpperCase() || "NO DATA"}
        </Text>
        {latestScore?.window_end && (
          <Text style={styles.scoreTime}>
            Last updated: {new Date(latestScore.window_end).toLocaleString()}
          </Text>
        )}

        {/* Risk meter bar */}
        {latestScore && (
          <View style={styles.meterWrap}>
            <View style={styles.meterTrack}>
              <View style={styles.meterZoneLow}    />
              <View style={styles.meterZoneMod}    />
              <View style={styles.meterZoneHigh}   />
            </View>
            <View style={[
              styles.meterThumb,
              { left: `${Math.min(latestScore.score * 100, 97)}%` }
            ]} />
            <View style={styles.meterLabels}>
              <Text style={styles.meterLabel}>Low</Text>
              <Text style={styles.meterLabel}>Moderate</Text>
              <Text style={styles.meterLabel}>High</Text>
            </View>
          </View>
        )}
      </View>

      {/* ── Status & Controls ── */}
      <View style={styles.statusRow}>
        <View style={[
          styles.statusDot,
          { backgroundColor: isMonitoring ? "#38a169" : "#a0aec0" }
        ]} />
        <Text style={styles.statusText}>{statusMsg}</Text>
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: isMonitoring ? "#e53e3e" : "#38a169" }]}
          onPress={isMonitoring ? _stopMonitoring : _startMonitoring}
        >
          <Text style={styles.btnText}>
            {isMonitoring ? "⏹ Stop Monitoring" : "▶ Start Monitoring"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#4c51bf", opacity: isMonitoring ? 1 : 0.5 }]}
          onPress={_runManualInference}
          disabled={!isMonitoring}
        >
          <Text style={styles.btnText}>🔍 Run Inference Now</Text>
        </TouchableOpacity>
      </View>

      {/* ── Remedies & Preventive Measures ── */}
      {remedyInfo && (
        <Animated.View style={[styles.remedyContainer, { opacity: fadeAnim }]}>

          {/* Remedy header */}
          <View style={[
            styles.remedyHeader,
            {
              backgroundColor: remedyInfo.bgColor,
              borderColor:     remedyInfo.borderColor,
            }
          ]}>
            <Text style={[styles.remedyTitle,    { color: remedyInfo.color }]}>
              {remedyInfo.title}
            </Text>
            <Text style={[styles.remedySubtitle, { color: remedyInfo.color }]}>
              {remedyInfo.subtitle}
            </Text>
          </View>

          {/* Remedy sections — collapsible */}
          {remedyInfo.sections.map((section, idx) => (
            <View key={idx} style={styles.remedySection}>

              {/* Section header (tap to expand) */}
              <TouchableOpacity
                style={[
                  styles.remedySectionHeader,
                  { borderLeftColor: remedyInfo.color }
                ]}
                onPress={() => toggleSection(idx)}
                activeOpacity={0.7}
              >
                <Text style={styles.remedySectionHeading}>
                  {section.heading}
                </Text>
                <Text style={[styles.chevron, { color: remedyInfo.color }]}>
                  {expandedSection === idx ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>

              {/* Section items */}
              {expandedSection === idx && (
                <View style={styles.remedyItemsWrap}>
                  {section.items.map((item, i) => (
                    <View key={i} style={styles.remedyItem}>
                      <View style={[
                        styles.remedyDot,
                        { backgroundColor: remedyInfo.color }
                      ]} />
                      <Text style={styles.remedyItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Crisis banner for high risk */}
          {riskLevel === "high" && (
            <View style={styles.crisisBanner}>
              <Text style={styles.crisisBannerTitle}>
                🆘 Need immediate help?
              </Text>
              <Text style={styles.crisisBannerText}>
                iCall (TISS): 9152987821{"\n"}
                Vandrevala Foundation: 1860-2662-345{"\n"}
                Available 24/7 · Free · Confidential
              </Text>
            </View>
          )}

          {/* Encouragement footer */}
          <Text style={[styles.remedyFooter, { color: remedyInfo.color }]}>
            {riskLevel === "low"
              ? "Your data shows positive behavioral patterns. Keep it up!"
              : riskLevel === "moderate"
              ? "Small consistent changes make a significant difference over time."
              : "You are not alone. Help is available and recovery is possible."}
          </Text>
        </Animated.View>
      )}

      {/* ── Unread Alerts ── */}
      {alerts.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>
            Unread Alerts ({alerts.length})
          </Text>
          {alerts.slice(0, 3).map((alert) => (
            <View key={alert.id} style={styles.alertRow}>
              <View style={[
                styles.alertDot,
                { backgroundColor: alert.severity === "high" ? "#e53e3e" : "#dd6b20" }
              ]} />
              <Text style={styles.alertText} numberOfLines={2}>
                {alert.message}
              </Text>
            </View>
          ))}
          <TouchableOpacity onPress={() => navigation.navigate("RiskScore")}>
            <Text style={styles.viewMore}>View all →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Navigate to full history ── */}
      <TouchableOpacity
        style  = {styles.navBtn}
        onPress = {() => navigation.navigate("RiskScore")}
      >
        <Text style={styles.navBtnText}>View Detailed Risk History →</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: "#f7fafc" },

  // Header
  header:        { padding: 24, paddingBottom: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerTitle:   { fontSize: 22, fontWeight: "700", color: "#1a202c" },
  headerSub:     { fontSize: 13, color: "#718096", marginTop: 2 },

  // Score card
  scoreCard:     { margin: 16, padding: 24, backgroundColor: "#fff", borderRadius: 16, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  scoreLabel:    { fontSize: 13, color: "#718096", marginBottom: 8, fontWeight: "500" },
  scoreValue:    { fontSize: 60, fontWeight: "800", letterSpacing: -2 },
  scoreSeverity: { fontSize: 14, fontWeight: "700", marginTop: 4, letterSpacing: 1 },
  scoreTime:     { fontSize: 11, color: "#a0aec0", marginTop: 8 },

  // Risk meter
  meterWrap:     { width: "100%", marginTop: 16 },
  meterTrack:    { flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden" },
  meterZoneLow:  { flex: 30, backgroundColor: "#9ae6b4" },
  meterZoneMod:  { flex: 35, backgroundColor: "#f6ad55" },
  meterZoneHigh: { flex: 35, backgroundColor: "#fc8181" },
  meterThumb:    { position: "absolute", top: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: "#fff", borderWidth: 2, borderColor: "#2d3748", marginLeft: -8 },
  meterLabels:   { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  meterLabel:    { fontSize: 10, color: "#a0aec0" },

  // Status + buttons
  statusRow:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 10 },
  statusDot:     { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText:    { fontSize: 13, color: "#718096" },
  btnRow:        { paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  btn:           { padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 8 },
  btnText:       { color: "#fff", fontSize: 15, fontWeight: "600" },

  // Remedy container
  remedyContainer: { marginHorizontal: 16, marginBottom: 16 },
  remedyHeader:    { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  remedyTitle:     { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  remedySubtitle:  { fontSize: 13, fontWeight: "400", lineHeight: 18 },

  // Remedy sections
  remedySection:       { marginBottom: 6, backgroundColor: "#fff", borderRadius: 10, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.04, elevation: 1 },
  remedySectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderLeftWidth: 3 },
  remedySectionHeading:{ fontSize: 14, fontWeight: "600", color: "#2d3748", flex: 1 },
  chevron:             { fontSize: 11, marginLeft: 8 },
  remedyItemsWrap:     { paddingHorizontal: 14, paddingBottom: 14 },
  remedyItem:          { flexDirection: "row", alignItems: "flex-start", marginTop: 10 },
  remedyDot:           { width: 7, height: 7, borderRadius: 4, marginTop: 5, marginRight: 10, flexShrink: 0 },
  remedyItemText:      { flex: 1, fontSize: 13, color: "#4a5568", lineHeight: 20 },

  // Crisis banner
  crisisBanner:      { backgroundColor: "#fff5f5", borderWidth: 1, borderColor: "#fc8181", borderRadius: 10, padding: 14, marginTop: 8 },
  crisisBannerTitle: { fontSize: 14, fontWeight: "700", color: "#c53030", marginBottom: 6 },
  crisisBannerText:  { fontSize: 13, color: "#c53030", lineHeight: 20 },

  // Footer
  remedyFooter: { textAlign: "center", fontSize: 12, fontStyle: "italic", marginTop: 12, marginBottom: 4, paddingHorizontal: 8 },

  // Alerts
  alertsSection: { margin: 16, marginTop: 4, padding: 16, backgroundColor: "#fff", borderRadius: 12 },
  sectionTitle:  { fontSize: 14, fontWeight: "600", color: "#2d3748", marginBottom: 10 },
  alertRow:      { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  alertDot:      { width: 8, height: 8, borderRadius: 4, marginTop: 4, marginRight: 8 },
  alertText:     { flex: 1, fontSize: 13, color: "#4a5568", lineHeight: 18 },
  viewMore:      { fontSize: 13, color: "#4c51bf", fontWeight: "500", marginTop: 6 },

  // Nav
  navBtn:        { margin: 16, marginTop: 4, padding: 14, backgroundColor: "#4c51bf", borderRadius: 10, alignItems: "center" },
  navBtnText:    { color: "#fff", fontSize: 14, fontWeight: "600" },
});