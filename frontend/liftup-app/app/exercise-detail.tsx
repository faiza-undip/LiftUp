import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

import RankBadge from "@/components/rank-badge";
import { RANKS } from "@/constants/ranks";
import { getRankGradient } from "@/utils/RankGradient";

const { width } = Dimensions.get("window");

// Rank descriptions
const RANK_DESCRIPTIONS: Record<string, string> = {
  UNRANKED:
    "You're just getting started. Keep training to establish your baseline strength and earn your first rank!",
  WOOD_I:
    "You've taken your first steps into structured strength training. This rank represents foundational fitness and the beginning of your journey.",
  WOOD_II:
    "You've taken your first steps into structured strength training. This rank represents foundational fitness and the beginning of your journey.",
  WOOD_III:
    "You've taken your first steps into structured strength training. This rank represents foundational fitness and the beginning of your journey.",
  BRONZE_I:
    "You're developing solid technique and consistency. Your lifts show progress beyond beginner levels, demonstrating dedication to your training.",
  BRONZE_II:
    "You're developing solid technique and consistency. Your lifts show progress beyond beginner levels, demonstrating dedication to your training.",
  BRONZE_III:
    "You're developing solid technique and consistency. Your lifts show progress beyond beginner levels, demonstrating dedication to your training.",
  SILVER_I:
    "You've achieved impressive strength that puts you above most casual gym-goers. Your training shows serious commitment and results.",
  SILVER_II:
    "You've achieved impressive strength that puts you above most casual gym-goers. Your training shows serious commitment and results.",
  SILVER_III:
    "You've achieved impressive strength that puts you above most casual gym-goers. Your training shows serious commitment and results.",
  GOLD_I:
    "You're in elite territory. This rank represents strength that only dedicated athletes achieve through years of consistent, focused training.",
  GOLD_II:
    "You're in elite territory. This rank represents strength that only dedicated athletes achieve through years of consistent, focused training.",
  GOLD_III:
    "You're in elite territory. This rank represents strength that only dedicated athletes achieve through years of consistent, focused training.",
  PLATINUM_I:
    "You've reached extraordinary levels of strength. This rank is reserved for those with exceptional genetics, training, and unwavering dedication.",
  PLATINUM_II:
    "You've reached extraordinary levels of strength. This rank is reserved for those with exceptional genetics, training, and unwavering dedication.",
  PLATINUM_III:
    "You've reached extraordinary levels of strength. This rank is reserved for those with exceptional genetics, training, and unwavering dedication.",
  DIAMOND_I:
    "You're among the strongest individuals in the world. This rank represents world-class strength that few ever achieve.",
  DIAMOND_II:
    "You're among the strongest individuals in the world. This rank represents world-class strength that few ever achieve.",
  DIAMOND_III:
    "You're among the strongest individuals in the world. This rank represents world-class strength that few ever achieve.",
  CHAMPION_I:
    "You've transcended human limits. This is near the pinnacle of strength achievement, representing legendary status in the strength community.",
  CHAMPION_II:
    "You've transcended human limits. This is near the pinnacle of strength achievement, representing legendary status in the strength community.",
  CHAMPION_III:
    "You've transcended human limits. This is near the pinnacle of strength achievement, representing legendary status in the strength community.",
  TITAN_I:
    "You're among the strongest beings on Earth. This rank represents truly superhuman strength that defies expectations.",
  TITAN_II:
    "You're among the strongest beings on Earth. This rank represents truly superhuman strength that defies expectations.",
  TITAN_III:
    "You're among the strongest beings on Earth. This rank represents truly superhuman strength that defies expectations.",
  OLYMPIAN:
    "You've achieved the absolute pinnacle. This is the highest rank possible, representing strength that rivals Olympic champions and world record holders.",
};

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse the data from params
  const rankKey = params.rankKey as string;
  const exerciseName = params.exerciseName as string;
  const weight = Number(params.weight);
  const reps = Number(params.reps);
  const estimated1rm = Number(params.estimated1rm);
  const date = params.date as string;

  // Find the rank object from RANKS to get the color
  const rank = RANKS.find((r) => r.key === rankKey);
  const rankColors = rank
    ? getRankGradient(rank.color)
    : getRankGradient("#4B5563");
  const rankLabel = rankKey.replace("_", " ");
  const rankDescription =
    RANK_DESCRIPTIONS[rankKey] || RANK_DESCRIPTIONS.UNRANKED;

  const bgGradient: [string, string, string] = [
    rankColors[0] + "30",
    rankColors[1] + "40",
    "#050814",
  ];

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={bgGradient}
        style={styles.gradientBg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Badge */}
        <View style={styles.badgeContainer}>
          <RankBadge colors={rankColors} rankKey={rankKey} size={140} />
        </View>

        {/* Rank Label */}
        <Text style={styles.rankTitle}>{rankLabel}</Text>

        {/* Rank Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{rankDescription}</Text>
        </View>

        {/* Exercise Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="barbell" size={24} color={rankColors[0]} />
            <Text style={styles.exerciseText}>{exerciseName}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Weight</Text>
              <Text style={styles.statValue}>{weight} kg</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Reps</Text>
              <Text style={styles.statValue}>{reps}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Est. 1RM</Text>
              <Text style={styles.statValue}>
                {Math.round(estimated1rm)} kg
              </Text>
            </View>
          </View>

          {/* Date */}
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.dateText}>{date}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050814",
  },
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A2332",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  badgeContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  rankTitle: {
    fontSize: 32,
    fontFamily: "Quicksand_700Bold",
    color: "white",
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 2,
  },
  descriptionCard: {
    backgroundColor: "#0F1623",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1E2936",
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: "Quicksand_400Regular",
    color: "#9CA3AF",
    lineHeight: 24,
    textAlign: "center",
  },
  detailsCard: {
    backgroundColor: "#0F1623",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1E2936",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    gap: 12,
  },
  exerciseText: {
    fontSize: 22,
    fontFamily: "Quicksand_600SemiBold",
    color: "white",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "Quicksand_400Regular",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Quicksand_700Bold",
    color: "white",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#1E2936",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#1E2936",
  },
  dateText: {
    fontSize: 14,
    fontFamily: "Quicksand_400Regular",
    color: "#6B7280",
  },
});
