import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated as RNAnimated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { useRouter, useLocalSearchParams } from "expo-router";

import RankBadge from "@/components/rank-badge";

const { width } = Dimensions.get("window");

function getRankGradient(color: string): [string, string] {
  const gradients: { [key: string]: [string, string] } = {
    "#5DD9E8": ["#5DD9E8", "#3AB4C7"],
    "#E63946": ["#E63946", "#C41E2E"],
    "#C77DFF": ["#C77DFF", "#9D4EDD"],
    "#7B9FE8": ["#7B9FE8", "#5B7FD8"],
    "#4ECDC4": ["#4ECDC4", "#3AADA4"],
    "#F4C430": ["#F4C430", "#D4A420"],
    "#C0D6DF": ["#C0D6DF", "#A0B6BF"],
    "#CD9575": ["#CD9575", "#AD7555"],
  };
  return gradients[color] || [color, color];
}

export default function RankRevealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get data from params
  const rankData = {
    rank: JSON.parse(params.rank as string),
    exercise: params.exercise as string,
    weight: Number(params.weight),
    reps: Number(params.reps),
  };

  const captureRef = useRef<ViewShot>(null);
  const spinValue = useRef(new RNAnimated.Value(0)).current;
  const scaleValue = useRef(new RNAnimated.Value(0)).current;
  const fadeValue = useRef(new RNAnimated.Value(0)).current;
  const [animationComplete, setAnimationComplete] = useState(false);

  const gradientColors = getRankGradient(rankData.rank.color);
  const bgGradient: [string, string, string] = [
    gradientColors[0] + "20",
    gradientColors[1] + "30",
    "#050814",
  ];

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(spinValue, {
        toValue: 360,
        duration: 1200,
        useNativeDriver: true,
      }),
      RNAnimated.sequence([
        RNAnimated.timing(scaleValue, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        RNAnimated.spring(scaleValue, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      RNAnimated.timing(fadeValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAnimationComplete(true);
    });
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const handleShare = async () => {
    if (captureRef.current && captureRef.current.capture) {
      try {
        const uri = await captureRef.current.capture();
        await Sharing.shareAsync(uri);
      } catch (error) {
        console.error("Share error:", error);
      }
    }
  };

  const handleGoBack = () => {
    router.push("/(tabs)/");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={bgGradient}
        style={styles.gradientBg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <ViewShot
        ref={captureRef}
        style={styles.captureContainer}
        options={{ format: "png", quality: 1 }}
      >
        <LinearGradient
          colors={bgGradient}
          style={styles.captureGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        <View style={styles.content}>
          {/* Animated Badge */}
          <RNAnimated.View
            style={[
              styles.badgeWrapper,
              {
                transform: [{ rotate: spin }, { scale: scaleValue }],
              },
            ]}
          >
            <RankBadge
              colors={gradientColors}
              rankKey={rankData.rank.key}
              size={160}
            />
          </RNAnimated.View>

          {/* Rank Label */}
          <RNAnimated.Text style={[styles.rankTitle, { opacity: fadeValue }]}>
            {rankData.rank.label.toUpperCase()}
          </RNAnimated.Text>

          {/* Exercise Details Card */}
          <RNAnimated.View style={[styles.detailsCard, { opacity: fadeValue }]}>
            <View style={styles.detailRow}>
              <Ionicons name="barbell" size={24} color={gradientColors[0]} />
              <Text style={styles.exerciseText}>{rankData.exercise}</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Weight</Text>
                <Text style={styles.statValue}>{rankData.weight} kg</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Reps</Text>
                <Text style={styles.statValue}>{rankData.reps}</Text>
              </View>
            </View>
          </RNAnimated.View>
        </View>
      </ViewShot>

      {/* Action Buttons */}
      {animationComplete && (
        <RNAnimated.View
          style={[styles.buttonContainer, { opacity: fadeValue }]}
        >
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <LinearGradient
              colors={gradientColors}
              style={styles.shareGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="share-social" size={20} color="white" />
              <Text style={styles.shareButtonText}>Share Result</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </RNAnimated.View>
      )}
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
  captureContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  captureGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  badgeWrapper: {
    marginBottom: 40,
  },
  rankTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: "white",
    marginBottom: 32,
    letterSpacing: 2,
    textAlign: "center",
    fontFamily: "Quicksand_700Bold",
  },
  detailsCard: {
    backgroundColor: "#0F1623",
    borderRadius: 20,
    padding: 24,
    width: width - 48,
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
    fontSize: 24,
    fontWeight: "600",
    color: "white",
    fontFamily: "Quicksand_600SemiBold",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "Quicksand_400Regular",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    fontFamily: "Quicksand_700Bold",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#1E2936",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
    gap: 12,
  },
  shareButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  shareGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    fontFamily: "Quicksand_600SemiBold",
  },
  backButton: {
    backgroundColor: "#1E2936",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
    fontFamily: "Quicksand_600SemiBold",
  },
});
