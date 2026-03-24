import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, FlatList
} from "react-native";
import RiskScorePredictor from "../ml/RiskScorePredictor";
import BackendClient      from "../api/BackendClient";

export default function RiskScoreScreen({ navigation }) {
  const [scores,       setScores]       = useState([]);
  const [weeklyTrend,  setWeeklyTrend]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  useEffect(() => { _loadData(); }, []);

  const _loadData = async () => {
    setLoading(true);
    try {
      const [localScores, trend] = await Promise.all([
        RiskScorePredictor.getScoreHistory(14),
        BackendClient.getWeeklyTrend(4).catch(() => []),
      ]);
      setScores(localScores.reverse());
      setWeeklyTrend(Array.isArray(trend) ? trend : []);
    } catch (err) {
      console.error("[RiskScoreScreen] Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const _onRefresh = async () => {
    setRefreshing(true);
    await _loadData();
    setRefreshing(false);
  };

  const _severityColor = (score) => {
    if (score >= 0.65) return "#e53e3e";
    if (score >= 0.30) return "#dd6b20";
    return "#38a169";
  };

  const _severityLabel = (score) => {
    if (score >= 0.65) return "HIGH";
    if (score >= 0.30) return "MOD";
    return "LOW";
  };

  const renderScoreItem = ({ item }) => (
    <View style={styles.scoreRow}>
      <View style={styles.scoreLeft}>
        <View style={[
          styles.severityBadge,
          { backgroundColor: _severityColor(item.score) + "20" }
        ]}>
          <Text style={[styles.severityText, { color: _severityColor(item.score) }]}>
            {_severityLabel(item.score)}
          </Text>
        </View>
        <View>
          <Text style={styles.scoreDate}>
            {new Date(item.timestamp).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
            })}
          </Text>
          <Text style={styles.scoreWindow}>
            Window: {new Date(item.window_start).toLocaleDateString()} –{" "}
            {new Date(item.window_end).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Text style={[styles.scoreNum, { color: _severityColor(item.score) }]}>
        {(item.score * 100).toFixed(0)}%
      </Text>
    </View>
  );

  const avgScore = scores.length
    ? scores.reduce((s, r) => s + r.score, 0) / scores.length
    : null;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Risk History</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={_onRefresh} />
        }
      >
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <SummaryCard
            label = "Total Windows"
            value = {scores.length}
            color = "#4c51bf"
          />
          <SummaryCard
            label = "14-Day Avg"
            value = {avgScore != null ? `${(avgScore * 100).toFixed(0)}%` : "—"}
            color = {_severityColor(avgScore || 0)}
          />
          <SummaryCard
            label = "High Risk Days"
            value = {scores.filter((s) => s.score >= 0.65).length}
            color = "#e53e3e"
          />
        </View>

        {/* Weekly trend */}
        {weeklyTrend.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Average</Text>
            {weeklyTrend.map((w, i) => (
              <View key={i} style={styles.trendRow}>
                <Text style={styles.trendDate}>{w.week_start}</Text>
                <View style={styles.trendBarWrap}>
                  <View style={[
                    styles.trendBar,
                    {
                      width:           `${(w.avg_score || 0) * 100}%`,
                      backgroundColor: _severityColor(w.avg_score || 0),
                    }
                  ]} />
                </View>
                <Text style={[styles.trendPct, { color: _severityColor(w.avg_score || 0) }]}>
                  {w.avg_score != null ? `${(w.avg_score * 100).toFixed(0)}%` : "—"}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Score list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            All Readings ({scores.length})
          </Text>
          {loading ? (
            <Text style={styles.muted}>Loading...</Text>
          ) : scores.length === 0 ? (
            <Text style={styles.muted}>No scores recorded yet</Text>
          ) : (
            scores.map((item, index) => (
              <View key={index}>{renderScoreItem({ item })}</View>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: "#f7fafc" },
  header:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  backBtn:       { fontSize: 14, color: "#4c51bf", fontWeight: "500" },
  headerTitle:   { fontSize: 17, fontWeight: "700", color: "#1a202c" },
  summaryRow:    { flexDirection: "row", padding: 16, gap: 10 },
  summaryCard:   { flex: 1, backgroundColor: "#fff", borderRadius: 10, padding: 14, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.04, elevation: 1 },
  summaryLabel:  { fontSize: 11, color: "#a0aec0", marginBottom: 4, textAlign: "center" },
  summaryValue:  { fontSize: 22, fontWeight: "700" },
  section:       { margin: 16, backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  sectionTitle:  { fontSize: 14, fontWeight: "600", color: "#2d3748", marginBottom: 12 },
  trendRow:      { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  trendDate:     { fontSize: 11, color: "#718096", width: 72 },
  trendBarWrap:  { flex: 1, height: 8, backgroundColor: "#f0f0f0", borderRadius: 4, overflow: "hidden" },
  trendBar:      { height: "100%", borderRadius: 4 },
  trendPct:      { fontSize: 11, fontWeight: "600", width: 36, textAlign: "right" },
  scoreRow:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  scoreLeft:     { flexDirection: "row", alignItems: "center", gap: 10 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  severityText:  { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  scoreDate:     { fontSize: 13, color: "#2d3748", fontWeight: "500" },
  scoreWindow:   { fontSize: 11, color: "#a0aec0", marginTop: 1 },
  scoreNum:      { fontSize: 22, fontWeight: "800" },
  muted:         { fontSize: 14, color: "#a0aec0", textAlign: "center", paddingVertical: 20 },
});