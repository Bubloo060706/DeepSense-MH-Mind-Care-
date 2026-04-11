import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, FONTS } from '../theme';
import { AppStateContext } from '../context/AppStateContext';

// Screens — Core
import SplashScreen from '../screens/core/SplashScreen';

// Screens — Auth
import LoginScreen from '../screens/auth/LoginScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

// Screens — Main
import HomeScreen from '../screens/main/HomeScreen';
import RiskScoreScreen from '../screens/main/RiskScoreScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Screens — Features
import AlertScreen from '../screens/features/AlertScreen';
import RemediesScreen from '../screens/features/RemediesScreen';
import MoodLogScreen from '../screens/features/MoodLogScreen';
import SensorDashboardScreen from '../screens/features/SensorDashboardScreen';
import HistoryScreen from '../screens/features/HistoryScreen';

// Screens — Assessment & Settings
import PHQ9Screen from '../screens/assessment/PHQ9Screen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Tab Icons using Material Design Icons ─────────────────────────────
const TAB_ICONS = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Pulse: { focused: 'pulse', unfocused: 'pulse' },
  Alerts: { focused: 'alert-circle', unfocused: 'alert-circle-outline' },
  History: { focused: 'history', unfocused: 'history' },
  Profile: { focused: 'account-circle', unfocused: 'account-circle-outline' },
};

const TabIcon = ({ label, focused, color }) => {
  const iconConfig = TAB_ICONS[label] || { focused: 'help-circle', unfocused: 'help-circle-outline' };
  const iconName = focused ? iconConfig.focused : iconConfig.unfocused;

  return (
    <View style={tabIconStyles.wrap}>
      <MaterialCommunityIcons name={iconName} size={24} color={color} />
      <Text style={[tabIconStyles.label, { color }]}>{label}</Text>
    </View>
  );
};

const tabIconStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 4, gap: 2 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 0.1 },
});

// ─── Bottom Tab Navigator ─────────────────────────────────────────────────
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: COLORS.navyCard,
        borderTopColor: COLORS.cardBorder,
        borderTopWidth: 1,
        height: 72,
        paddingBottom: 8,
      },
      tabBarActiveTintColor: COLORS.safeGreen,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarShowLabel: false,
      tabBarIcon: ({ focused, color }) => (
        <TabIcon label={route.name} focused={focused} color={color} />
      ),
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Pulse" component={RiskScoreScreen} />
    <Tab.Screen name="Alerts" component={AlertScreen} />
    <Tab.Screen name="History" component={HistoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// ─── Root Stack Navigator ─────────────────────────────────────────────────
const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      {/* Auth Flow */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />

      {/* Main App */}
      <Stack.Screen name="Main" component={MainTabs} />

      {/* Modal-style screens accessible from anywhere */}
      <Stack.Screen
        name="Remedies"
        component={RemediesScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="MoodLog"
        component={MoodLogScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="SensorDashboard"
        component={SensorDashboardScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="PHQ9"
        component={PHQ9Screen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
