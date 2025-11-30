import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import "react-native-reanimated";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";

import {
  useFonts,
  Quicksand_300Light,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/app/context/AuthContext";
import applyGlobalFont from "@/utils/FontOverride";

// Apply the font override ONCE at module load time
applyGlobalFont();

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Quicksand_300Light,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  const { loading } = useAuth();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Add delay state
  const [showSplash, setShowSplash] = React.useState(true);

  useEffect(() => {
    if (loading || !fontsLoaded) {
      // Start animations
      Animated.parallel([
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 0.95,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, fontsLoaded]);

  useEffect(() => {
    // Add minimum splash screen display time
    if (!loading && fontsLoaded) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1500); // Show splash for at least 1.5 seconds after loading completes

      return () => clearTimeout(timer);
    }
  }, [loading, fontsLoaded]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (loading || !fontsLoaded || showSplash) {
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#60B7E8",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { rotate: spin }],
            }}
          >
            <Svg
              width="120"
              height="120"
              viewBox="0 0 88.732 88.732"
              style={{ transform: [{ rotate: "180deg" }] }}
            >
              <Path
                d="M83.961,29.85v-2.161h-6.518v-3.834H64.409v16.421H24.322V23.855H11.288v3.834H4.77v2.161H0v28.881h4.771v2.312h6.518
                  v3.833h13.034V48.454H64.41v16.422h13.034v-3.833h6.519V58.73h4.77V29.85H83.961z M10.392,36.251H6.687v-5.622h3.705V36.251z
                  M20.744,34.973h-5.368v-8.307h5.368V34.973z M73.137,34.973h-5.365v-8.307h5.365V34.973z M81.701,36.251h-3.705v-5.622h3.705
                  V36.251z"
                fill="#1E3A5F"
              />
            </Svg>
          </Animated.View>
        </View>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerTitleStyle: { fontFamily: "Quicksand_600SemiBold" },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
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
