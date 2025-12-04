import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";

import RankBadge from "@/components/rank-badge";

import { useAuth } from "../context/AuthContext";
import { RANK_COLORS } from "@/constants/rank-colors";
import { supabase } from "@/app/lib/supabase";
import { CONFIG } from "../lib/config";

const { width } = Dimensions.get("window");

interface Placement {
  id: string;
  created_at: string;
  weight_kg: number;
  reps: number;
  estimated_1rm: number;
  rank_key: string;
  exercises: { name: string };
}

function HexagonIcon({
  filled = false,
  gradient = false,
  rankColors,
}: {
  filled?: boolean;
  gradient?: boolean;
  rankColors?: [string, string];
}) {
  const size = 32;
  const gradientId = `hex-gradient-${Math.random().toString(36).substr(2, 9)}`;

  if (gradient && rankColors) {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <SvgLinearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={rankColors[0]} stopOpacity="1" />
            <Stop offset="100%" stopColor={rankColors[1]} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z"
          fill={`url(#${gradientId})`}
          stroke={rankColors[0]}
          strokeWidth="2"
        />
        <Path
          d="M50 15 L77 32 L77 68 L50 85 L23 68 L23 32 Z"
          fill={rankColors[1]}
          opacity="0.5"
        />
        <Path
          d="M50 25 L69 37 L69 63 L50 75 L31 63 L31 37 Z"
          fill={rankColors[0]}
          opacity="0.3"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z"
        fill={filled ? "#374151" : "transparent"}
        stroke="#374151"
        strokeWidth="3"
      />
    </Svg>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const user = session?.user;

  const [placements, setPlacements] = useState<Placement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const loadPlacements = async () => {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      const res = await fetch(`${CONFIG.API_URL}/placements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setPlacements(json.placements || []);
    } catch (error) {
      console.error("Error loading placements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.log("Profile load error", error);
    } else if (data) {
      setAvatarUrl(data.avatar_url ?? null);
    }
  };

  useEffect(() => {
    loadPlacements();
  }, [session]);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [user])
  );

  // Get unique exercises count
  const uniqueExercises = new Set(placements.map((p) => p.exercises.name));
  const uniqueCount = uniqueExercises.size;
  const hasFullRank = uniqueCount >= 10;

  // Get overall rank
  const overallRankKey =
    placements.length > 0 ? placements[0]?.rank_key : "UNRANKED";
  const rankColors = RANK_COLORS[overallRankKey] || RANK_COLORS.UNRANKED;
  const rankLabel = overallRankKey.replace("_", " ");

  // Get last 10 unique exercise placements for hexagons (latest rank per exercise)
  const latestPlacementsByExercise = new Map<string, Placement>();
  placements.forEach((placement) => {
    const exerciseName = placement.exercises.name;
    if (!latestPlacementsByExercise.has(exerciseName)) {
      latestPlacementsByExercise.set(exerciseName, placement);
    }
  });
  const latestPlacements = Array.from(
    latestPlacementsByExercise.values()
  ).slice(0, 10);

  // Group placements by date for history
  const groupedHistory = placements.reduce((acc, placement) => {
    const date = new Date(placement.created_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(placement);
    return acc;
  }, {} as Record<string, Placement[]>);

  const historyDates = Object.keys(groupedHistory).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const handleHistoryItemPress = (placement: Placement) => {
    const date = new Date(placement.created_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    router.push({
      pathname: "/exercise-detail",
      params: {
        rankKey: placement.rank_key,
        exerciseName: placement.exercises.name,
        weight: placement.weight_kg.toString(),
        reps: placement.reps.toString(),
        estimated1rm: placement.estimated_1rm.toString(),
        date: date,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture */}
        <TouchableOpacity
          style={styles.profilePictureContainer}
          onPress={() => router.push("/profile")}
          activeOpacity={0.8}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.profilePicture} />
          ) : (
            <View style={[styles.profilePicture, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {user?.email?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.title}>Your Rank</Text>

        {/* Overall Rank Card with Background Color */}
        <View style={styles.rankCard}>
          <LinearGradient
            colors={[
              rankColors[0] + (hasFullRank ? "40" : "20"),
              rankColors[1] + (hasFullRank ? "50" : "30"),
              "#050814",
            ]}
            style={styles.rankGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />

          <View
            style={[styles.rankContent, { opacity: hasFullRank ? 1 : 0.6 }]}
          >
            <RankBadge
              colors={rankColors}
              rankKey={overallRankKey}
              size={120}
            />
            <Text style={styles.rankLabel}>
              {hasFullRank ? rankLabel : `Predicted: ${rankLabel}`}
            </Text>
          </View>
        </View>

        {/* Placements Box */}
        <TouchableOpacity
          style={styles.placementsBox}
          onPress={() => router.push("/rank-ladder")}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[
              "#667eea",
              "#764ba2",
              "#f093fb",
              "#4facfe",
              "#00f2fe",
              "#43e97b",
              "#38f9d7",
              "#fa709a",
              "#fee140",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rainbowBorder}
          >
            <View style={styles.placementsInner}>
              <Text style={styles.placementsTitle}>Placements</Text>
              <Text style={styles.placementsSubtitle}>
                Rank {10 - uniqueCount} more exercise
                {10 - uniqueCount !== 1 ? "s" : ""} to get your Liftoff rank!
              </Text>

              {/* Hexagon Grid - Colored by Rank */}
              <View style={styles.hexagonGrid}>
                {[...Array(10)].map((_, index) => {
                  const placement = latestPlacements[index];
                  const hexColors = placement
                    ? RANK_COLORS[placement.rank_key] || RANK_COLORS.UNRANKED
                    : undefined;

                  return (
                    <View key={index} style={styles.hexagonItem}>
                      {placement ? (
                        <HexagonIcon gradient rankColors={hexColors} />
                      ) : (
                        <HexagonIcon filled={false} />
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Rank Exercises Button */}
              <TouchableOpacity
                style={styles.rankExercisesButton}
                onPress={(e) => {
                  e.stopPropagation();
                  router.push("/calculator");
                }}
              >
                <LinearGradient
                  colors={["#5DD9E8", "#7B9FE8", "#C77DFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>RANK EXERCISES</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* History Section */}
        {placements.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Ranking History</Text>

            {historyDates.map((date) => (
              <View key={date} style={styles.historyDateGroup}>
                <Text style={styles.historyDate}>{date}</Text>

                {groupedHistory[date].map((placement) => {
                  const colors =
                    RANK_COLORS[placement.rank_key] || RANK_COLORS.UNRANKED;

                  return (
                    <TouchableOpacity
                      key={placement.id}
                      style={styles.historyItem}
                      onPress={() => handleHistoryItemPress(placement)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.historyBadge}>
                        <RankBadge
                          colors={colors}
                          rankKey={placement.rank_key}
                          size={50}
                        />
                      </View>

                      <View style={styles.historyDetails}>
                        <Text style={styles.historyRank}>
                          {placement.rank_key.replace("_", " ")}
                        </Text>
                        <Text style={styles.historyExercise}>
                          {placement.exercises.name}
                        </Text>
                        <Text style={styles.historyStats}>
                          {placement.weight_kg}kg × {placement.reps} reps
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050814",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  profilePictureContainer: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1A2332",
    borderWidth: 2,
    borderColor: "#007bff",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#bdbbbb",
    fontSize: 20,
    fontFamily: "Quicksand_700Bold",
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 24,
    fontFamily: "Quicksand_600SemiBold",
  },
  rankCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    minHeight: 200,
  },
  rankGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  rankContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  rankLabel: {
    color: "white",
    fontSize: 28,
    fontFamily: "Quicksand_700Bold",
    marginTop: 16,
    letterSpacing: 1,
  },
  placementsBox: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 32,
  },
  rainbowBorder: {
    padding: 3,
  },
  placementsInner: {
    backgroundColor: "#0F1623",
    borderRadius: 17,
    padding: 24,
  },
  placementsTitle: {
    color: "white",
    fontSize: 20,
    fontFamily: "Quicksand_700Bold",
    marginBottom: 8,
  },
  placementsSubtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    fontFamily: "Quicksand_400Regular",
    marginBottom: 24,
    lineHeight: 20,
  },
  hexagonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  hexagonItem: {
    margin: 4,
  },
  rankExercisesButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Quicksand_700Bold",
    letterSpacing: 1,
  },
  historySection: {
    marginTop: 8,
    marginBottom: 60,
  },
  historyTitle: {
    color: "white",
    fontSize: 20,
    fontFamily: "Quicksand_600SemiBold",
    marginBottom: 16,
  },
  historyDateGroup: {
    marginBottom: 24,
  },
  historyDate: {
    color: "#6B7280",
    fontSize: 14,
    fontFamily: "Quicksand_600SemiBold",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginLeft: -24,
    marginBottom: 4,
  },
  historyBadge: {
    marginRight: 16,
  },
  historyDetails: {
    flex: 1,
  },
  historyRank: {
    color: "#7B9FE8",
    fontSize: 12,
    fontFamily: "Quicksand_400Regular",
    marginBottom: 2,
  },
  historyExercise: {
    color: "white",
    fontSize: 17,
    fontFamily: "Quicksand_500Medium",
    marginBottom: 2,
  },
  historyStats: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Quicksand_400Regular",
  },
});
