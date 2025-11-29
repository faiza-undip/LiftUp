import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import { RANKS } from "@/constants/ranks";

const OG_EXERCISES = [
  "Pull Ups",
  "Push Ups",
  "Bench Press",
  "Squat",
  "Deadlift",
];

export default function CalculatorScreen({ navigation }: any) {
  const router = useRouter();

  const [exerciseName, setExerciseName] = useState<string>(OG_EXERCISES[0]);
  const [exerciseId, setExerciseId] = useState<number | null>(null); // set from search/lookup
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [result, setResult] = useState<any>(null);
  const [captureRef, setCaptureRef] = useState<any>(null);

  const onCalculate = async () => {
    if (!exerciseId) {
      Alert.alert("Missing exercise", "Please choose an exercise.");
      return;
    }
    if (
      !reps ||
      (!weight && exerciseName !== "Pull Ups" && exerciseName !== "Push Ups")
    ) {
      Alert.alert("Missing fields", "Please fill required weight / reps.");
      return;
    }

    const token = await SecureStore.getItemAsync("access_token");

    const res = await fetch("http://localhost:4000/calculate-and-save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        exerciseId,
        weightKg: Number(weight || 0),
        reps: Number(reps),
      }),
    });
    const json = await res.json();
    if (json.error) {
      Alert.alert("Error", json.error);
    } else {
      setResult(json);
    }
  };

  const onShare = async () => {
    if (!captureRef) return;
    const uri = await captureRef.capture();
    await Sharing.shareAsync(uri);
  };

  const rankDef = result?.rank;
  const color = rankDef?.color ?? "#4ECDC4";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rank Exercises</Text>

      <Text style={styles.label}>Exercise</Text>
      {/* For now simple; can open ExerciseSearchScreen */}
      <TouchableOpacity onPress={() => router.push("/exercise-search")}>
        <Text style={styles.exercise}>{exerciseName}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        placeholder="0"
      />

      <Text style={styles.label}>Reps</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={reps}
        onChangeText={setReps}
        placeholder="0"
      />

      <Button title="Calculate" onPress={onCalculate} />

      {rankDef && (
        <ViewShot
          ref={(ref) => setCaptureRef(ref)}
          style={[
            styles.resultCard,
            { borderColor: color, backgroundColor: "#050814" },
          ]}
        >
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={styles.badgeIcon}>◆</Text>
          </View>
          <Text style={styles.resultText}>{rankDef.label}</Text>
          <Text style={styles.resultSub}>
            {exerciseName} – {weight || 0} kg × {reps} reps
          </Text>
          <TouchableOpacity style={styles.shareButton} onPress={onShare}>
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </ViewShot>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050814", padding: 16 },
  title: { color: "white", fontSize: 22, marginBottom: 16 },
  label: { color: "#9CA3AF", marginTop: 12 },
  input: {
    backgroundColor: "#111827",
    color: "white",
    borderRadius: 8,
    padding: 10,
  },
  exercise: { color: "white", paddingVertical: 8, fontSize: 16 },
  resultCard: {
    marginTop: 20,
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  badgeIcon: { color: "#050814", fontSize: 32 },
  resultText: { color: "white", fontSize: 20, fontWeight: "600" },
  resultSub: { color: "#9CA3AF", marginTop: 4, marginBottom: 12 },
  shareButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareText: { color: "#050814", fontWeight: "600" },
});
