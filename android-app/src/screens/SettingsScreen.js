import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert, TextInput
} from "react-native";
import AsyncStorage   from "@react-native-async-storage/async-storage";
import LocalDatabase  from "../storage/LocalDatabase";
import BackendClient  from "../api/BackendClient";
import GpsSensor      from "../sensors/GpsSensor";
import AccelerometerSensor from "../sensors/AccelerometerSensor";
import ScreenEventListener from "../sensors/ScreenEventListener";
import CallLogReader       from "../sensors/CallLogReader";

export default function SettingsScreen({ navigation }) {
  const [userId,         setUserId]         = useState("");
  const [gpsEnabled,     setGpsEnabled]     = useState(true);
  const [accelEnabled,   setAccelEnabled]   = useState(true);
  const [callEnabled,    setCallEnabled]    = useState(true);
  const [screenEnabled,  setScreenEnabled]  = useState(true);
  const [syncInterval,   setSyncInterval]   = useState("60");
  const [dbSize,         setDbSize]         = useState(0);
  const [saved,          setSaved]          = useState(false);

  useEffect(() => { _loadSettings(); }, []);

  const _loadSettings = async () => {
    const uid      = await AsyncStorage.getItem("user_id")     || "";
    const gps      = await AsyncStorage.getItem("gps_enabled");
    const accel    = await AsyncStorage.getItem("accel_enabled");
    const call     = await AsyncStorage.getItem("call_enabled");
    const screen   = await AsyncStorage.getItem("screen_enabled");
    const interval = await AsyncStorage.getItem("sync_interval") || "60";

    setUserId(uid);
    setGpsEnabled(gps    !== "false");
    setAccelEnabled(accel !== "false");
    setCallEnabled(call   !== "false");
    setScreenEnabled(screen !== "false");
    setSyncInterval(interval);

    // Get approximate DB row count as size proxy
    const count = await LocalDatabase.count("sensor_readings", {});
    setDbSize(count);
  };

  const _saveSettings = async () => {
    await AsyncStorage.multiSet([
      ["gps_enabled",     String(gpsEnabled)],
      ["accel_enabled",   String(accelEnabled)],
      ["call_enabled",    String(callEnabled)],
      ["screen_enabled",  String(screenEnabled)],
      ["sync_interval",   syncInterval],
    ]);

    // Apply sensor toggles immediately
    if (!gpsEnabled)    GpsSensor.stop();
    if (!accelEnabled)  AccelerometerSensor.stop();
    if (!callEnabled)   CallLogReader.stop();
    if (!screenEnabled) ScreenEventListener.stop();

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const _clearLocalData = () => {
    Alert.alert(
      "Clear Local Data",
      "This will delete all locally stored sensor readings and risk scores. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text:    "Clear",
          style:   "destructive",
          onPress: async () => {
            await LocalDatabase.clearAll();
            setDbSize(0);
            Alert.alert("Done", "Local data cleared successfully.");
          },
        },
      ]
    );
  };

  const _logout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text:    "Sign Out",
          style:   "destructive",
          onPress: async () => {
            await BackendClient.logout();
            navigation.reset({ index: 0, routes: [{ name: "Home" }] });
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Account */}
      <Section title="Account">
        <SettingRow label="User ID">
          <Text style={styles.valueText}>{userId || "Not logged in"}</Text>
        </SettingRow>
        <TouchableOpacity onPress={_logout} style={styles.dangerBtn}>
          <Text style={styles.dangerBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </Section>

      {/* Sensors */}
      <Section title="Active Sensors">
        <ToggleRow
          label   = "GPS Location"
          sub     = "Radius of gyration, home stay, entropy"
          value   = {gpsEnabled}
          onToggle = {setGpsEnabled}
        />
        <ToggleRow
          label   = "Accelerometer"
          sub     = "Step count, sedentary bouts"
          value   = {accelEnabled}
          onToggle = {setAccelEnabled}
        />
        <ToggleRow
          label   = "Screen Events"
          sub     = "Unlock count, screen duration"
          value   = {screenEnabled}
          onToggle = {setScreenEnabled}
        />
        <ToggleRow
          label   = "Call Log"
          sub     = "Call frequency (anonymized)"
          value   = {callEnabled}
          onToggle = {setCallEnabled}
        />
      </Section>

      {/* Sync */}
      <Section title="Backend Sync">
        <SettingRow label="Sync interval (minutes)">
          <TextInput
            style        = {styles.textInput}
            value        = {syncInterval}
            onChangeText = {setSyncInterval}
            keyboardType = "numeric"
            maxLength    = {3}
          />
        </SettingRow>
      </Section>

      {/* Privacy */}
      <Section title="Privacy & Data">
        <SettingRow label="Local sensor readings">
          <Text style={styles.valueText}>{dbSize.toLocaleString()} rows</Text>
        </SettingRow>
        <SettingRow label="Raw data sent to server">
          <Text style={[styles.valueText, { color: "#38a169" }]}>Never</Text>
        </SettingRow>
        <SettingRow label="On-device ML inference">
          <Text style={[styles.valueText, { color: "#38a169" }]}>Enabled</Text>
        </SettingRow>
        <TouchableOpacity onPress={_clearLocalData} style={styles.dangerBtn}>
          <Text style={styles.dangerBtnText}>Clear All Local Data</Text>
        </TouchableOpacity>
      </Section>

      {/* Save button */}
      <TouchableOpacity
        style   = {[styles.saveBtn, saved && { backgroundColor: "#38a169" }]}
        onPress = {_saveSettings}
      >
        <Text style={styles.saveBtnText}>
          {saved ? "✓ Saved" : "Save Settings"}
        </Text>
      </TouchableOpacity>

      {/* App info */}
      <Text style={styles.versionText}>
        IoT Depression Detection v1.0.0 · MIT License
      </Text>

    </ScrollView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function SettingRow({ label, children }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ToggleRow({ label, sub, value, onToggle }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleLeft}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingSub}>{sub}</Text>
      </View>
      <Switch
        value          = {value}
        onValueChange  = {onToggle}
        trackColor     = {{ false: "#e2e8f0", true: "#c3dafe" }}
        thumbColor     = {value ? "#4c51bf" : "#a0aec0"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: "#f7fafc" },
  header:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  backBtn:       { fontSize: 14, color: "#4c51bf", fontWeight: "500" },
  headerTitle:   { fontSize: 17, fontWeight: "700", color: "#1a202c" },
  section:       { margin: 16, marginBottom: 0 },
  sectionTitle:  { fontSize: 11, fontWeight: "600", color: "#a0aec0", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  sectionBody:   { backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.04, elevation: 1 },
  settingRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottomWidth: 1, borderBottomColor: "#f7fafc" },
  settingLabel:  { fontSize: 14, color: "#2d3748", fontWeight: "500" },
  settingSub:    { fontSize: 11, color: "#a0aec0", marginTop: 2 },
  toggleRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderBottomWidth: 1, borderBottomColor: "#f7fafc" },
  toggleLeft:    { flex: 1, marginRight: 12 },
  valueText:     { fontSize: 14, color: "#718096" },
  textInput:     { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, padding: 6, fontSize: 14, width: 70, textAlign: "center", color: "#2d3748" },
  dangerBtn:     { margin: 12, padding: 12, borderRadius: 8, backgroundColor: "#fff5f5", alignItems: "center", borderWidth: 1, borderColor: "#fc8181" },
  dangerBtnText: { color: "#e53e3e", fontSize: 14, fontWeight: "600" },
  saveBtn:       { margin: 16, marginTop: 24, padding: 14, backgroundColor: "#4c51bf", borderRadius: 12, alignItems: "center" },
  saveBtnText:   { color: "#fff", fontSize: 15, fontWeight: "600" },
  versionText:   { textAlign: "center", fontSize: 11, color: "#a0aec0", marginBottom: 32 },
});