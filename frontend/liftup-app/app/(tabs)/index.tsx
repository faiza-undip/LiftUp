import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

import { useAuth } from "../context/AuthContext";

interface Placement {
  id: string;
  created_at: string;
  weight_kg: number;
  reps: number;
  estimated_1rm: number;
  rank_key: string;
  exercises: { name: string };
}

export default function HomeScreen({ navigation }: any) {
  const router = useRouter();
  const { session } = useAuth();

  const [placements, setPlacements] = useState<Placement[]>([]);

  const loadPlacements = async () => {
    const token = await SecureStore.getItemAsync("access_token");
    const res = await fetch("http://localhost:4000/placements", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setPlacements(json.placements || []);
  };

  useEffect(() => {
    loadPlacements();
  }, [session]);

  const overallRankKey = placements[0]?.rank_key ?? "UNRANKED";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Rank</Text>
      <Text style={styles.rank}>{overallRankKey.replace("_", " ")}</Text>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Placements</Text>
          <TouchableOpacity onPress={() => router.push("/rank-ladder")}>
            <Text style={styles.link}>View Ladder</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={placements}
          keyExtractor={(item) => item.id}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.exercises.name}</Text>
              <Text style={styles.badgeSub}>
                {item.rank_key.replace("_", " ")}
              </Text>
            </View>
          )}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/calculator")}
        >
          <Text style={styles.buttonText}>Rank Exercises</Text>
        </TouchableOpacity>
      </View>

      {/* History list can be another FlatList below */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050814", padding: 16 },
  title: { color: "white", fontSize: 20, marginBottom: 4 },
  rank: { color: "#C77DFF", fontSize: 26, marginBottom: 16 },
  card: { backgroundColor: "#111827", borderRadius: 16, padding: 16 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { color: "white", fontSize: 16 },
  link: { color: "#5DD9E8" },
  badge: {
    backgroundColor: "#1F2937",
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: { color: "white" },
  badgeSub: { color: "#9CA3AF", fontSize: 12 },
  button: {
    marginTop: 12,
    backgroundColor: "#4ECDC4",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#050814", fontWeight: "600" },
});
