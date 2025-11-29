import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

import { supabase } from "@/app/lib/supabase";

export default function LoginScreen({ navigation }: any) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={onLogin} />
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
  title: { color: "white", fontSize: 24, marginBottom: 16 },
  input: {
    backgroundColor: "#111827",
    color: "white",
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  link: { color: "#7B9FE8", marginTop: 16 },
});
