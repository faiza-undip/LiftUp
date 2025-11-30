import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { supabase } from "@/app/lib/supabase";

export default function SignupScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const passwordIconScale = useState(new Animated.Value(1))[0];
  const confirmIconScale = useState(new Animated.Value(1))[0];

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

  async function handleSignup() {
    if (!email || !password || !confirm) {
      Alert.alert("Incomplete", "Please fill all fields.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Use at least 6 characters.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      console.log(error);
      Alert.alert("Sign up failed", error.message);
      return;
    }

    if (data.session) {
      router.replace("/onboarding");
    } else {
      Alert.alert(
        "Check your email",
        "We have sent you a confirmation link. Please confirm to continue."
      );
      router.replace("/(auth)/login");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LiftUp Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#bdbbbb"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
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

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          placeholderTextColor="#bdbbbb"
          secureTextEntry={!showConfirm}
          value={confirm}
          onChangeText={setConfirm}
        />
        <Pressable
          style={styles.eyeIcon}
          onPress={() => {
            animateIcon(confirmIconScale);
            setShowConfirm(!showConfirm);
          }}
        >
          <Animated.View style={{ transform: [{ scale: confirmIconScale }] }}>
            <Ionicons
              name={showConfirm ? "eye-off" : "eye"}
              size={20}
              color="#bdbbbb"
            />
          </Animated.View>
        </Pressable>
      </View>

      <Pressable
        style={styles.buttonContainer}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.button}>Sign Up</Text>
        )}
      </Pressable>

      <Text style={styles.link} onPress={() => router.push("/(auth)/login")}>
        Already have an account? Log in
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