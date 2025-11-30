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
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
  Rect,
} from "react-native-svg";

import { RANKS } from "../constants/ranks";

// SVG Icon component based on rank tier
interface RankIconProps {
  rankKey: string;
  size?: number;
}

function RankIcon({ rankKey, size = 35 }: RankIconProps) {
  const viewBox = "0 0 24 24";
  const strokeWidth = "2";
  const iconColor = "white";

  // Wood ranks
  if (rankKey.includes("WOOD")) {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M365.284,332.418 365.284,305.202 272.767,305.202 387.051,212.689 376.17,174.592 169.368,316.092 180.253,141.939 147.601,152.828 125.83,348.761 0.664,452.14 0.664,512 49.643,512 240.114,343.3"
          fill={iconColor}
        />
        <Path
          d="M448.163,41.908c-67.94,15.609-85.271,84.366-46.608,131.48C435.48,175.564,496.759,99.05,448.163,41.908z"
          fill={iconColor}
        />
        <Path
          d="M388.215,327.476c13.457,19.787,82.469,20.759,93.207-30.955C443.376,265.519,397.673,285.616,388.215,327.476z"
          fill={iconColor}
        />
        <Path
          d="M194.275,410.152c-2.594,28.061,59.378,80.659,107.876,41.708C290.815,395.196,234.234,379.221,194.275,410.152z"
          fill={iconColor}
        />
        <Path
          d="M395.844,214.419c5.895,27.582,80.787,59.318,115.492,7.646C483.585,171.331,424.774,172.95,395.844,214.419z"
          fill={iconColor}
        />
        <Path
          d="M273.866,79.44c-26.323-12.93-100.453,27.83-80.575,89.436C252.613,178.872,289.141,129.774,273.866,79.44z"
          fill={iconColor}
        />
        <Path
          d="M155.457,137.594C184.645,117.665,185.881,15.721,109.463,0C63.772,56.297,93.599,123.747,155.457,137.594z"
          fill={iconColor}
        />
        <Path
          d="M122.828,279.804c16.633-25.486-16.028-106.951-81.979-94.235C23.096,245.414,69.069,289.203,122.828,279.804z"
          fill={iconColor}
        />
        <Path
          d="M368.488,362.114c-21.842,27.79,7.657,125.373,85.267,117.377C480.386,412.058,431.645,356.709,368.488,362.114z"
          fill={iconColor}
        />
      </Svg>
    );
  }

  // Bronze ranks
  if (rankKey.includes("BRONZE")) {
    return (
      <Svg width={size} height={size} viewBox={viewBox}>
        <Path
          d="M5 7L12 3L19 7L21 12L19 17L12 21L5 17L3 12L5 7Z"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M12 7L7 12L12 17L17 12L12 7Z"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M12 3V7"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M3 12H7"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M17 12H21"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 21V17"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // Silver ranks
  if (rankKey.includes("SILVER")) {
    return (
      <Svg width={size} height={size} viewBox={viewBox}>
        <Path
          d="M12 3L14 7V17L12 21"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M12 3L10 7V17L12 21"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M12 21L17 17V7L12 3L7 7V17L12 21Z"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M7 7H17"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M7 17H17"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // Gold ranks
  // Gold ranks
  if (rankKey.includes("GOLD")) {
    return (
      <Svg width={size} height={size} viewBox={viewBox}>
        <Path
          d="M12 3L3 15L12 21L21 15L12 3Z"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M3 15L12 12L21 15"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M12 3V21"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    );
  }

  // Platinum ranks
  if (rankKey.includes("PLATINUM")) {
    return (
      <Svg width={size} height={size} viewBox={viewBox}>
        <Path
          d="M4 8L12 3L20 8V16L12 21L4 16V8Z"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M7 9.5L12 6L17 9.5V14.6667L12 18L7 14.6667V9.5Z"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M4 8L7 9.5"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 3V6"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M4 16L7 14.5"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 21V18"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M20 16L17 14.5"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M17 9.5L20 8"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // Diamond ranks
  if (rankKey.includes("DIAMOND")) {
    return (
      <Svg width={size} height={size} viewBox={viewBox}>
        <Path
          d="M14 3L17 9L12 21"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M10 3L7 9L12 21"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M17 3H7L3 9L12 21L21 9L17 3Z"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M3 9H21"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // Champion ranks
  if (rankKey.includes("CHAMPION")) {
    return (
      <Svg width={size} height={size} viewBox={viewBox}>
        <Path
          d="M21 9L19 5L16 3H8L5 5L3 9L12 21L21 9Z"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M5 5L8 7H16L19 5"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M8 7L7 10L12 21L17 10L16 7"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    );
  }

  // Titan ranks
  if (rankKey.includes("TITAN")) {
    return (
      <Svg width={size} height={size} viewBox={viewBox}>
        <Path
          d="M6 7L12 3L18 7L19 12L18 17L12 21L6 17L5 12L6 7Z"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M6 7L9 8.5"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 3V7"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M6 17L9 15.5"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 21V17"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M18 17L15 15.5"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M15 8.5L18 7"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Rect
          height="10"
          rx="3"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          width="6"
          x="9"
          y="7"
          fill="none"
        />
      </Svg>
    );
  }

  // Olympian rank
  if (rankKey.includes("OLYMPIAN")) {
    return (
      <Svg width={size} height={size} viewBox={viewBox}>
        <Path
          d="M4 14L8 21L16 21L20 14L17.5 7.5L12 3L6.5 7.5L4 14Z"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M12 3V9"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M16 21L13 15M17.5 7.5L14 10"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M6.5 7.5L10 10M11 15L8 21"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M4 14L10 13M20 14L14 13"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Rect
          height="6"
          rx="2"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          width="4"
          x="10"
          y="9"
          fill="none"
        />
      </Svg>
    );
  }

  return null;
}

// Hexagon badge with gradient background
interface RankBadgeProps {
  colors: string[];
  rankKey: string;
  size?: number;
}

function RankBadge({ colors, rankKey, size = 90 }: RankBadgeProps) {
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <View style={styles.badgeContainer}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={styles.hexagonBg}
      >
        <Defs>
          <SvgLinearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={colors[0]} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors[1]} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z"
          fill={`url(#${gradientId})`}
          stroke={colors[0]}
          strokeWidth="3"
        />
        {/* Inner hexagon for depth */}
        <Path
          d="M50 20 L75 35 L75 65 L50 80 L25 65 L25 35 Z"
          fill={colors[1]}
          opacity="0.3"
        />
      </Svg>

      {/* Overlay SVG Icon */}
      <View style={styles.iconOverlay}>
        <RankIcon rankKey={rankKey} size={rankKey.includes("WOOD") ? 35 : 40} />
      </View>
    </View>
  );
}

// Get gradient colors based on rank
function getRankGradient(color: string): string[] {
  const gradients: { [key: string]: string[] } = {
    "#5DD9E8": ["#5DD9E8", "#3AB4C7"], // Olympian - Cyan
    "#E63946": ["#E63946", "#C41E2E"], // Titan - Red
    "#C77DFF": ["#C77DFF", "#9D4EDD"], // Champion - Purple
    "#7B9FE8": ["#7B9FE8", "#5B7FD8"], // Diamond - Blue
    "#4ECDC4": ["#4ECDC4", "#3AADA4"], // Platinum - Teal
    "#F4C430": ["#F4C430", "#D4A420"], // Gold - Gold
    "#C0D6DF": ["#C0D6DF", "#A0B6BF"], // Silver - Silver
    "#CD9575": ["#CD9575", "#AD7555"], // Bronze/Wood - Bronze
  };
  return gradients[color] || [color, color];
}

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
