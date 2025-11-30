import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  PanResponder,
} from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { RulerPicker } from "react-native-ruler-picker";
import { LinearGradient } from "expo-linear-gradient";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import HexBadge from "@/components/hex-badge";
import { supabase } from "@/app/lib/supabase";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = 50;

const OG_EXERCISES = [
  "Pull Ups",
  "Push Ups",
  "Bench Press",
  "Squat",
  "Deadlift",
];

// Exercise type icons mapping (same as search page)
const exerciseTypeIcons: Record<string, any> = {
  compound: "barbell-outline",
  bodyweight: "body-outline",
  isolation: "fitness-outline",
  core: "shield-outline",
  cardio: "heart-outline",
  functional: "git-network-outline",
  power: "flash-outline",
  plyometric: "arrow-up-circle-outline",
  conditioning: "flame-outline",
  isometric: "pause-outline",
};

interface ExerciseData {
  id: number;
  name: string;
  is_bodyweight: boolean;
  category?: string;
  isOG: boolean;
}

export default function CalculatorScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [exerciseList, setExerciseList] = useState<ExerciseData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentExercise = exerciseList[currentIndex];

  const [weight, setWeight] = useState(0);
  const [extraWeight, setExtraWeight] = useState(0);
  const [showExtraWeight, setShowExtraWeight] = useState(false);
  const [reps, setReps] = useState(0);
  const [result, setResult] = useState<any>(null);

  const captureRef = useRef<ViewShot>(null);

  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);

  // Load OG exercises from Supabase
  useEffect(() => {
    async function loadOG() {
      const { data, error } = await supabase
        .from("exercises")
        .select("id, name, is_bodyweight, category")
        .in("name", OG_EXERCISES);

      if (!error && data) {
        const ordered = OG_EXERCISES.map((name) =>
          data.find((d) => d.name === name)
        )
          .filter(Boolean)
          .map((ex) => ({ ...ex, isOG: true })) as ExerciseData[];

        setExerciseList(ordered);
        setCurrentIndex(0);
        setIsLoading(false);
      }
    }

    loadOG();
  }, []);

  // Handle coming back from exercise-search
  useEffect(() => {
    if (params.selectedId && !isLoading) {
      const selectedId = Number(params.selectedId);

      // Check if exercise already exists in list
      const existingIndex = exerciseList.findIndex(
        (ex) => ex.id === selectedId
      );

      if (existingIndex !== -1) {
        // Exercise already in list, just navigate to it
        setCurrentIndex(existingIndex);
        setShowExtraWeight(false);
        setExtraWeight(0);
        setResult(null);
      } else {
        // Add new exercise to the list
        const fetchExerciseDetails = async () => {
          const { data } = await supabase
            .from("exercises")
            .select("id, name, is_bodyweight, category")
            .eq("id", selectedId)
            .single();

          if (data) {
            const newExercise: ExerciseData = {
              ...data,
              isOG: false,
            };

            setExerciseList((prev) => {
              const newList = [...prev, newExercise];
              // Set index after state update
              setTimeout(() => setCurrentIndex(newList.length - 1), 0);
              return newList;
            });
            setShowExtraWeight(false);
            setExtraWeight(0);
            setResult(null);
          }
        };

        fetchExerciseDetails();
      }
    }
  }, [params.selectedId, isLoading]);

  const rankDef = result?.rank || null;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const swipeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    if (rankDef) {
      scale.value = 0.6;
      opacity.value = 0;

      scale.value = withSpring(1, { damping: 12, stiffness: 160 });
      opacity.value = withTiming(1, { duration: 250 });
    }
  }, [rankDef]);

  const goToPrevExercise = () => {
    if (exerciseList.length === 0) return;
    const newIndex =
      currentIndex > 0 ? currentIndex - 1 : exerciseList.length - 1;
    setCurrentIndex(newIndex);
    setShowExtraWeight(false);
    setExtraWeight(0);
    setResult(null);
  };

  const goToNextExercise = () => {
    if (exerciseList.length === 0) return;
    const newIndex =
      currentIndex < exerciseList.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    setShowExtraWeight(false);
    setExtraWeight(0);
    setResult(null);
  };

  // Swipeable PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.value = gestureState.dx;
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeDistance = gestureState.dx;

        if (swipeDistance > SWIPE_THRESHOLD) {
          // Swiped right - go to previous
          translateX.value = withTiming(0, { duration: 200 });
          goToPrevExercise();
        } else if (swipeDistance < -SWIPE_THRESHOLD) {
          // Swiped left - go to next
          translateX.value = withTiming(0, { duration: 200 });
          goToNextExercise();
        } else {
          // Reset position
          translateX.value = withSpring(0);
        }
      },
    })
  ).current;

  async function onCalculate() {
    if (!currentExercise) {
      Alert.alert("Error", "Pick an exercise first");
      return;
    }

    if (reps === 0) {
      Alert.alert("Error", "Please set reps");
      return;
    }

    const totalWeight = currentExercise.is_bodyweight ? extraWeight : weight;

    const token = await SecureStore.getItemAsync("access_token");

    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/calculate-and-save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exerciseId: currentExercise.id,
          weightKg: totalWeight,
          reps: reps,
        }),
      }
    );

    const json = await res.json();

    if (json.error) {
      Alert.alert("Error", json.error);
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

  const getExerciseIcon = () => {
    if (!currentExercise) return "barbell-outline";

    if (currentExercise.isOG) {
      // OG exercises use emoji
      const ogExercise = OG_EXERCISES.find(
        (name) => name === currentExercise.name
      );
      return ogExercise;
    } else {
      // Non-OG exercises use Ionicons based on category
      return (
        exerciseTypeIcons[
          currentExercise.category?.toLowerCase() || "compound"
        ] || "barbell-outline"
      );
    }
  };

  if (!currentExercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Rank Calculator</Text>

        {/* Exercise Swiper Section */}
        <View style={styles.swiperContainer}>
          <TouchableOpacity
            onPress={goToPrevExercise}
            style={styles.arrowButton}
          >
            <Ionicons name="chevron-back" size={32} color="#7B9FE8" />
          </TouchableOpacity>

          <Animated.View
            style={[styles.exerciseCard, swipeAnimatedStyle]}
            {...panResponder.panHandlers}
          >
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            {currentExercise.isOG ? (
              <Text style={styles.exerciseIcon}>
                {currentExercise.name === "Pull Ups" && "💪"}
                {currentExercise.name === "Push Ups" && "🤸"}
                {currentExercise.name === "Bench Press" && "🏋️"}
                {currentExercise.name === "Squat" && "🦵"}
                {currentExercise.name === "Deadlift" && "⚡"}
              </Text>
            ) : (
              <View style={styles.exerciseIconContainer}>
                <Ionicons
                  name={
                    exerciseTypeIcons[
                      currentExercise.category?.toLowerCase() || "compound"
                    ] || "barbell-outline"
                  }
                  size={48}
                  color="#007bff"
                />
              </View>
            )}
            {!currentExercise.isOG && (
              <Text style={styles.exerciseCategory}>
                {(currentExercise.category?.charAt(0).toUpperCase() ?? "") +
                  (currentExercise.category?.slice(1) ?? "")}
              </Text>
            )}
          </Animated.View>

          <TouchableOpacity
            onPress={goToNextExercise}
            style={styles.arrowButton}
          >
            <Ionicons name="chevron-forward" size={32} color="#7B9FE8" />
          </TouchableOpacity>
        </View>

        {/* Exercise Counter */}
        <Text style={styles.exerciseCounter}>
          {currentIndex + 1} / {exerciseList.length}
        </Text>

        {/* Search Button */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => router.push("/exercise-search")}
        >
          <Ionicons name="search" size={16} color="#7B9FE8" />
          <Text style={styles.searchButtonText}>
            Search for another exercise...
          </Text>
        </TouchableOpacity>

        {/* Weight Section */}
        {currentExercise.is_bodyweight ? (
          // Bodyweight exercise - show add extra weight button
          !showExtraWeight ? (
            <TouchableOpacity
              style={styles.addWeightButton}
              onPress={() => setShowExtraWeight(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#9CA3AF" />
              <Text style={styles.addWeightText}>Add Extra Weight</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.weightPickerContainer}>
              <View style={styles.weightHeader}>
                <Text style={styles.label}>
                  Weight: {Math.round(extraWeight)} kg
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowExtraWeight(false);
                    setExtraWeight(0);
                  }}
                >
                  <Ionicons name="close-circle" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              <View style={styles.pickerWrapper}>
                <RulerPicker
                  min={0}
                  max={100}
                  step={1}
                  fractionDigits={0}
                  initialValue={extraWeight}
                  onValueChange={(value) => setExtraWeight(Number(value))}
                  unit="+kg"
                  indicatorColor="#7B9FE8"
                  valueTextStyle={styles.rulerValue}
                  unitTextStyle={styles.rulerUnit}
                  shortStepColor="#555"
                  longStepColor="#888"
                  shortStepHeight={15}
                  longStepHeight={30}
                  width={width - 48}
                  height={80}
                />
              </View>
            </View>
          )
        ) : (
          // Compound movement with weight
          <View style={styles.weightPickerContainer}>
            <Text style={styles.label}>Weight: {Math.round(weight)} kg</Text>
            <View style={styles.pickerWrapper}>
              <RulerPicker
                min={0}
                max={300}
                step={1}
                fractionDigits={0}
                initialValue={weight}
                onValueChange={(value) => setWeight(Number(value))}
                unit="kg"
                indicatorColor="#7B9FE8"
                valueTextStyle={styles.rulerValue}
                unitTextStyle={styles.rulerUnit}
                shortStepColor="#555"
                longStepColor="#888"
                shortStepHeight={15}
                longStepHeight={30}
                width={width - 48}
                height={80}
              />
            </View>
          </View>
        )}

        {/* Reps Section */}
        <View style={styles.repsPickerContainer}>
          <Text style={styles.label}>Reps: {Math.round(reps)}</Text>
          <View style={styles.pickerWrapper}>
            <RulerPicker
              min={0}
              max={50}
              step={1}
              fractionDigits={0}
              initialValue={reps}
              onValueChange={(value) => setReps(Number(value))}
              unit="reps"
              indicatorColor="#7B9FE8"
              valueTextStyle={styles.rulerValue}
              unitTextStyle={styles.rulerUnit}
              shortStepColor="#555"
              longStepColor="#888"
              shortStepHeight={15}
              longStepHeight={30}
              width={width - 48}
              height={80}
            />
          </View>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity
          onPress={onCalculate}
          style={styles.calculateButtonWrapper}
        >
          <LinearGradient
            colors={["#7B9FE8", "#9B7FE8", "#C77DFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.calculateButton}
          >
            <Text style={styles.calculateButtonText}>Calculate Rank</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Result Card */}
        {rankDef && (
          <ViewShot ref={captureRef}>
            <Animated.View
              style={[styles.resultCard, animatedStyle, { borderColor: color }]}
            >
              <HexBadge
                color={color}
                size={140}
                icon="◆"
                label={rankDef.label}
              />

              <Text style={styles.rankLabel}>{rankDef.label}</Text>

              <Text style={styles.resultSub}>
                {currentExercise.name} —{" "}
                {currentExercise.is_bodyweight ? extraWeight : weight} kg ×{" "}
                {reps} reps
              </Text>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
              >
                <Text style={styles.shareText}>Share</Text>
              </TouchableOpacity>
            </Animated.View>
          </ViewShot>
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
  loadingText: {
    color: "white",
    fontFamily: "Quicksand_400Regular",
    textAlign: "center",
    marginTop: 100,
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 32,
    fontFamily: "Quicksand_600SemiBold",
  },
  swiperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    height: 180,
  },
  arrowButton: {
    padding: 8,
  },
  exerciseCard: {
    flex: 1,
    backgroundColor: "#10131A",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    minHeight: 150,
  },
  exerciseName: {
    color: "white",
    fontSize: 20,
    fontFamily: "Quicksand_600SemiBold",
    marginBottom: 8,
    textAlign: "center",
  },
  exerciseIcon: {
    fontSize: 48,
    marginTop: 8,
  },
  exerciseIconContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#1A2332",
    borderRadius: 50,
  },
  exerciseCategory: {
    color: "#7B9FE8",
    fontSize: 12,
    fontFamily: "Quicksand_400Regular",
    marginTop: 8,
  },
  exerciseCounter: {
    color: "#6B7280",
    fontSize: 14,
    fontFamily: "Quicksand_400Regular",
    textAlign: "center",
    marginBottom: 16,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginBottom: 32,
  },
  searchButtonText: {
    color: "#7B9FE8",
    fontSize: 14,
    fontFamily: "Quicksand_400Regular",
  },
  addWeightButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    borderStyle: "dashed",
    marginBottom: 32,
  },
  addWeightText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontFamily: "Quicksand_400Regular",
  },
  weightPickerContainer: {
    marginBottom: 32,
  },
  weightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  repsPickerContainer: {
    marginBottom: 32,
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 12,
    fontFamily: "Quicksand_600SemiBold",
  },
  pickerWrapper: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  rulerValue: {
    color: "white",
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 20,
  },
  rulerUnit: {
    color: "#999",
    fontFamily: "Quicksand_400Regular",
    fontSize: 14,
  },
  calculateButtonWrapper: {
    marginBottom: 75,
    borderRadius: 12,
    overflow: "hidden",
  },
  calculateButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  calculateButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Quicksand_600SemiBold",
  },
  resultCard: {
    marginTop: 20,
    borderWidth: 2,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#10131A",
  },
  rankLabel: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Quicksand_600SemiBold",
    marginTop: 16,
  },
  resultSub: {
    color: "#9CA3AF",
    marginTop: 6,
    fontFamily: "Quicksand_400Regular",
  },
  shareButton: {
    marginTop: 14,
    backgroundColor: "#4ECDC4",
    padding: 10,
    borderRadius: 10,
  },
  shareText: {
    color: "#050814",
    fontWeight: "600",
    fontFamily: "Quicksand_600SemiBold",
  },
});
