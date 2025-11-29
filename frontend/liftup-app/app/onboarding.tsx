import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";

export default function OnboardingScreen({ navigation }: any) {
  const router = useRouter();
  const { session } = useAuth();

  const userId = session?.user.id;

  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState(""); // yyyy-mm-dd
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (data) {
        // already onboarded → go to app
        router.replace("/(tabs)");
      } else {
        setLoading(false);
      }
    })();
  }, [userId]);

  const onSave = async () => {
    if (!gender || !birthDate || !heightCm || !weightKg) {
      return Alert.alert(
        "Incomplete",
        "Please fill all fields. This step cannot be skipped."
      );
    }
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      gender,
      birth_date: birthDate,
      height_cm: Number(heightCm),
      weight_kg: Number(weightKg),
    });
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      router.replace("/(tabs)");
    }
  };

  if (loading)
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Loading...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tell us about you</Text>
      <TextInput
        placeholder="Gender"
        style={styles.input}
        value={gender}
        onChangeText={setGender}
      />
      <TextInput
        placeholder="Birthdate (YYYY-MM-DD)"
        style={styles.input}
        value={birthDate}
        onChangeText={setBirthDate}
      />
      <TextInput
        placeholder="Height (cm)"
        style={styles.input}
        value={heightCm}
        onChangeText={setHeightCm}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Weight (kg)"
        style={styles.input}
        value={weightKg}
        onChangeText={setWeightKg}
        keyboardType="numeric"
      />
      <Button title="Continue" onPress={onSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050814",
    padding: 24,
    justifyContent: "center",
  },
  title: { color: "white", fontSize: 22, marginBottom: 16 },
  input: {
    backgroundColor: "#111827",
    color: "white",
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
});
