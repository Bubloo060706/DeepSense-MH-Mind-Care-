import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar, LogBox } from "react-native";

import HomeScreen      from "./screens/HomeScreen";
import RiskScoreScreen from "./screens/RiskScoreScreen";
import SettingsScreen  from "./screens/SettingsScreen";
import LocalDatabase   from "./storage/LocalDatabase";
import BackendClient   from "./api/BackendClient";
import RiskScorePredictor from "./ml/RiskScorePredictor";

// Suppress known third-party warnings
LogBox.ignoreLogs([
  "ViewPropTypes will be removed",
  "AsyncStorage has been extracted",
  "new NativeEventEmitter",
]);

const Stack = createNativeStackNavigator();

export default function App() {

  useEffect(() => {
    _bootstrapApp();
  }, []);

  const _bootstrapApp = async () => {
    try {
      // Init DB first — all other modules depend on it
      await LocalDatabase.init();
      console.log("[App] LocalDatabase ready");

      // Init backend client (load stored token)
      await BackendClient.init();
      console.log("[App] BackendClient ready");

      // Pre-load TFLite model
      await RiskScorePredictor.load();
      console.log("[App] TFLite model ready");

    } catch (err) {
      console.error("[App] Bootstrap error:", err);
    }
  };

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack.Navigator
        initialRouteName = "Home"
        screenOptions    = {{
          headerShown:      false,
          animation:        "slide_from_right",
          contentStyle:     { backgroundColor: "#f7fafc" },
        }}
      >
        <Stack.Screen name="Home"      component={HomeScreen}      />
        <Stack.Screen name="RiskScore" component={RiskScoreScreen} />
        <Stack.Screen name="Settings"  component={SettingsScreen}  />
      </Stack.Navigator>
    </NavigationContainer>
  );
}