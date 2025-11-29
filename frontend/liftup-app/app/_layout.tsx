import React from "react";
import { View, Text } from "react-native";
import "react-native-reanimated";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/app/context/AuthContext";

export const unstable_settings = {
  // default tab layout group
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { loading } = useAuth();

  if (loading) {
    // simple splash while we check session
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#050814",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 32 }}>🏋️‍♂️ LiftUp</Text>
        </View>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth group (login / signup) */}
        <Stack.Screen name="(auth)" />

        {/* Onboarding – cannot skip */}
        <Stack.Screen name="onboarding" />

        {/* Main app tabs */}
        <Stack.Screen name="(tabs)" />

        {/* Extra stack screens */}
        <Stack.Screen name="rank-ladder" />
        <Stack.Screen name="exercise-search" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
