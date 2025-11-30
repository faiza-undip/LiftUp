import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { supabase } from "@/app/lib/supabase";

export default function LoginScreen({ navigation }: any) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordIconScale = useState(new Animated.Value(1))[0];

  const animateIcon = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) Alert.alert("Login failed", error.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LiftUp Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#bdbbbb"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#bdbbbb"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <Pressable
          style={styles.eyeIcon}
          onPress={() => {
            animateIcon(passwordIconScale);
            setShowPassword(!showPassword);
          }}
        >
          <Animated.View style={{ transform: [{ scale: passwordIconScale }] }}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#bdbbbb"
            />
          </Animated.View>
        </Pressable>
      </View>

      <Pressable style={styles.buttonContainer} onPress={onLogin}>
        <Text style={styles.button}>Login</Text>
      </Pressable>
      <Text style={styles.link} onPress={() => router.push("/(auth)/signup")}>
        No account? Sign up
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#050814",
    justifyContent: "center",
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 16,
    fontFamily: "Quicksand_600SemiBold",
  },
  input: {
    backgroundColor: "#111827",
    fontFamily: "Quicksand_400Regular",
    color: "white",
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    marginBottom: 12,
    borderRadius: 8,
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    fontFamily: "Quicksand_400Regular",
    color: "white",
    padding: 12,
    paddingRight: 48,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  buttonContainer: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    fontFamily: "Quicksand_600SemiBold",
    color: "white",
    fontSize: 16,
  },
  link: {
    color: "#7B9FE8",
    marginTop: 16,
    fontFamily: "Quicksand_400Regular",
    textAlign: "left",
  },
});
