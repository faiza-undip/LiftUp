import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams, useRouter } from "expo-router";

import HexBadge from "@/components/hex-badge";
import { supabase } from "@/app/lib/supabase";

const OG_EXERCISES = [
  "Pull Ups",
  "Push Ups",
  "Bench Press",
  "Squat",
  "Deadlift",
];

export default function CalculatorScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [exerciseId, setExerciseId] = useState<number | null>(null);
  const [exerciseName, setExerciseName] = useState<string>("Pull Ups");
  const [ogList, setOgList] = useState<{ id: number; name: string }[]>([]);

  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [result, setResult] = useState<any>(null);

  const captureRef = useRef<ViewShot>(null);

  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  // Load OG exercises from Supabase so we have real IDs
  useEffect(() => {
    async function loadOG() {
      const { data, error } = await supabase
        .from("exercises")
        .select("id, name")
        .in("name", OG_EXERCISES);

      if (!error && data) {
        // keep OG order
        const ordered = OG_EXERCISES.map((name) =>
          data.find((d) => d.name === name)
        ).filter(Boolean) as { id: number; name: string }[];

        setOgList(ordered);

        // if nothing selected yet, default to first OG (Pull Ups)
        if (!exerciseId && ordered.length > 0) {
          setExerciseId(ordered[0].id);
          setExerciseName(ordered[0].name);
        }
      }
    }

    loadOG();
  }, []);

  // Handle coming back from exercise-search
  useEffect(() => {
    if (params.selectedId && params.selectedName) {
      setExerciseId(Number(params.selectedId));
      setExerciseName(String(params.selectedName));
    }
  }, [params]);

  const rankDef = result?.rank || null;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (rankDef) {
      scale.value = 0.6;
      opacity.value = 0;

      scale.value = withSpring(1, { damping: 12, stiffness: 160 });
      opacity.value = withTiming(1, { duration: 250 });
    }
  }, [rankDef]);

  async function onCalculate() {
    if (!exerciseId) {
      alert("Pick an exercise first");
      return;
    }

    if (
      !reps ||
      (!weight && exerciseName !== "Pull Ups" && exerciseName !== "Push Ups")
    ) {
      alert("Please fill all fields");
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
      alert(json.error);
      return;
    }

    setResult(json);
  }

  const handleShare = async () => {
    if (captureRef.current && captureRef.current.capture) {
      const uri = await captureRef.current.capture();
      await Sharing.shareAsync(uri);
    }
  };

  const color = rankDef?.color ?? "#4ECDC4";

  const selectOg = (name: string) => {
    const found = ogList.find((o) => o.name === name);
    if (found) {
      setExerciseId(found.id);
      setExerciseName(found.name);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rank Calculator</Text>

      <Text style={styles.label}>Exercise</Text>

      {/* Current exercise name */}
      <Text style={styles.exercise}>{exerciseName}</Text>

      {/* OG exercise quick-select pills */}
      <View style={styles.ogRow}>
        {OG_EXERCISES.map((name) => {
          const isActive = exerciseName === name;
          return (
            <TouchableOpacity
              key={name}
              style={[styles.ogPill, isActive && styles.ogPillActive]}
              onPress={() => selectOg(name)}
            >
              <Text
                style={[styles.ogPillText, isActive && styles.ogPillTextActive]}
              >
                {name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Button to go to full exercise search */}
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => router.push("/exercise-search")}
      >
        <Text style={styles.searchButtonText}>Search for another exercise</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        placeholder="0"
      />

      <Text style={styles.label}>Reps</Text>
      <TextInput
        style={styles.input}
        value={reps}
        onChangeText={setReps}
        keyboardType="numeric"
        placeholder="0"
      />

      <Button title="Calculate" onPress={onCalculate} />

      {rankDef && (
        <ViewShot ref={captureRef}>
          <Animated.View
            style={[styles.resultCard, animatedStyle, { borderColor: color }]}
          >
            <HexBadge color={color} size={140} icon="◆" label={rankDef.label} />

            <Text style={styles.rankLabel}>{rankDef.label}</Text>

            <Text style={styles.resultSub}>
              {exerciseName} — {weight || 0} kg × {reps} reps
            </Text>

            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </Animated.View>
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
    padding: 10,
    borderRadius: 8,
  },
  exercise: { color: "white", fontSize: 16, marginTop: 4 },
  ogRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  ogPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  ogPillActive: {
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
  },
  ogPillText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  ogPillTextActive: {
    color: "#050814",
    fontWeight: "600",
  },
  searchButton: {
    marginTop: 4,
    marginBottom: 8,
  },
  searchButtonText: {
    color: "#7B9FE8",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  resultCard: {
    marginTop: 20,
    borderWidth: 2,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#10131A",
  },
  rankLabel: { color: "white", fontSize: 20, fontWeight: "600" },
  resultSub: { color: "#9CA3AF", marginTop: 6 },
  shareButton: {
    marginTop: 14,
    backgroundColor: "#4ECDC4",
    padding: 10,
    borderRadius: 10,
  },
  shareText: { color: "#050814", fontWeight: "600" },
});
