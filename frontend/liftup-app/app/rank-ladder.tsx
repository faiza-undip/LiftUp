import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import RankBadge from "@/components/rank-badge";

import { RANKS } from "../constants/ranks";
import { getRankGradient } from "@/utils/RankGradient";

export default function RankLadderScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={["#050814", "#0A1628", "#050814"]}
        style={styles.gradientBackground}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rank Ladder</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {RANKS.map((rank) => {
          const gradientColors = getRankGradient(rank.color);

          return (
            <View key={rank.key} style={styles.rankRow}>
              <Text style={styles.rankLabel}>{rank.label.toUpperCase()}</Text>
              <View style={styles.badgeWrapper}>
                <RankBadge
                  colors={gradientColors}
                  rankKey={rank.key}
                  size={90}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050814",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "transparent",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "white",
    fontSize: 28,
    fontFamily: "Quicksand_700Bold",
    flex: 1,
    textAlign: "center",
    marginRight: 32,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 120,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 45,
    paddingBottom: 45,
    paddingHorizontal: 16,
  },
  rankLabel: {
    fontSize: 16,
    fontFamily: "Quicksand_600SemiBold",
    letterSpacing: 0.5,
    color: "#6B7280",
    flex: 1,
  },
  badgeWrapper: {
    position: "absolute",
    right: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeContainer: {
    position: "relative",
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  hexagonBg: {
    position: "absolute",
  },
  iconOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
