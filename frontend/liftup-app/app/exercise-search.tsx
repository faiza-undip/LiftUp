import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

import { CONFIG } from "./lib/config";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Exercise type icons mapping based on category
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

interface Exercise {
  id: number;
  name: string;
  category: string;
  is_bodyweight: boolean;
  is_default: boolean;
}

interface Placement {
  exercise_id: number;
  rank_key: string;
  performed_count: number;
}

type SortType = "alphabetical" | "rank" | "performed";

const RANK_ORDER: Record<string, number> = {
  DIAMOND: 1,
  PLATINUM: 2,
  GOLD: 3,
  SILVER: 4,
  BRONZE: 5,
  UNRANKED: 6,
};

export default function ExerciseSearchScreen() {
  const router = useRouter();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filtered, setFiltered] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [sortType, setSortType] = useState<SortType>("alphabetical");
  const [placements, setPlacements] = useState<Placement[]>([]);

  // Dynamically populated filter options from actual data
  const [categories, setCategories] = useState<string[]>([]);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBodyweight, setSelectedBodyweight] = useState<
    "all" | "bodyweight" | "weighted"
  >("all");

  useEffect(() => {
    loadExercises();
    loadPlacements();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    query,
    selectedCategories,
    selectedBodyweight,
    exercises,
    sortType,
    placements,
  ]);

  useEffect(() => {
    if (showFilters) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showFilters]);

  async function loadExercises() {
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data) {
      setExercises(data);
      setFiltered(data);

      // Extract unique categories from the data
      const uniqueCategories = [
        ...new Set(data.map((ex) => ex.category).filter(Boolean)),
      ] as string[];
      setCategories(uniqueCategories.sort());
    } else if (error) {
      console.error("Error loading exercises:", error);
    }
  }

  async function loadPlacements() {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      const res = await fetch(`${CONFIG.API_URL}/placements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const placementData = json.placements || [];

      // Group by exercise_id to get latest rank and count
      const exerciseMap = new Map<number, Placement>();
      placementData.forEach((p: any) => {
        const exerciseId = p.exercise_id;
        if (!exerciseMap.has(exerciseId)) {
          exerciseMap.set(exerciseId, {
            exercise_id: exerciseId,
            rank_key: p.rank_key,
            performed_count: 1,
          });
        } else {
          const existing = exerciseMap.get(exerciseId)!;
          existing.performed_count += 1;
        }
      });

      setPlacements(Array.from(exerciseMap.values()));
    } catch (error) {
      console.error("Error loading placements:", error);
    }
  }

  function applyFilters() {
    let result = exercises;

    // Search query filter
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((ex) => ex.name.toLowerCase().includes(q));
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((ex) => selectedCategories.includes(ex.category));
    }

    // Bodyweight filter
    if (selectedBodyweight === "bodyweight") {
      result = result.filter((ex) => ex.is_bodyweight === true);
    } else if (selectedBodyweight === "weighted") {
      result = result.filter((ex) => ex.is_bodyweight === false);
    }

    // Apply sorting
    result = sortExercises(result);

    setFiltered(result);
  }

  function sortExercises(exerciseList: Exercise[]): Exercise[] {
    const sorted = [...exerciseList];

    if (sortType === "alphabetical") {
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === "rank") {
      return sorted.sort((a, b) => {
        const aPlacement = placements.find((p) => p.exercise_id === a.id);
        const bPlacement = placements.find((p) => p.exercise_id === b.id);

        const aRank = aPlacement ? RANK_ORDER[aPlacement.rank_key] || 999 : 999;
        const bRank = bPlacement ? RANK_ORDER[bPlacement.rank_key] || 999 : 999;

        if (aRank !== bRank) {
          return aRank - bRank;
        }
        return a.name.localeCompare(b.name);
      });
    } else if (sortType === "performed") {
      return sorted.sort((a, b) => {
        const aPlacement = placements.find((p) => p.exercise_id === a.id);
        const bPlacement = placements.find((p) => p.exercise_id === b.id);

        const aCount = aPlacement ? aPlacement.performed_count : 0;
        const bCount = bPlacement ? bPlacement.performed_count : 0;

        if (aCount !== bCount) {
          return bCount - aCount; // Descending order
        }
        return a.name.localeCompare(b.name);
      });
    }

    return sorted;
  }

  function toggleCategory(category: string) {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  }

  function clearFilters() {
    setSelectedCategories([]);
    setSelectedBodyweight("all");
  }

  function selectExercise(item: Exercise) {
    router.push({
      pathname: "/(tabs)/calculator",
      params: {
        selectedId: item.id.toString(),
        selectedName: item.name,
      },
    });
  }

  const activeFilterCount =
    selectedCategories.length + (selectedBodyweight !== "all" ? 1 : 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#bdbbbb"
          style={styles.searchIcon}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Exercise"
          style={styles.searchInput}
          placeholderTextColor="#bdbbbb"
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={24} color="white" />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Sorting Tabs */}
      <View style={styles.sortingTabs}>
        <TouchableOpacity
          style={[styles.tab, sortType === "alphabetical" && styles.activeTab]}
          onPress={() => setSortType("alphabetical")}
        >
          <Text
            style={
              sortType === "alphabetical"
                ? styles.activeTabText
                : styles.tabText
            }
          >
            Alphabetical
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, sortType === "rank" && styles.activeTab]}
          onPress={() => setSortType("rank")}
        >
          <Text
            style={sortType === "rank" ? styles.activeTabText : styles.tabText}
          >
            By Rank
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, sortType === "performed" && styles.activeTab]}
          onPress={() => setSortType("performed")}
        >
          <Text
            style={
              sortType === "performed" ? styles.activeTabText : styles.tabText
            }
          >
            Performed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Exercise List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          // Only show section headers for alphabetical sort
          const showHeader =
            sortType === "alphabetical" &&
            (() => {
              const firstLetter = item.name[0].toUpperCase();
              const prevFirstLetter =
                index > 0 ? filtered[index - 1].name[0].toUpperCase() : null;
              return firstLetter !== prevFirstLetter;
            })();

          const placement = placements.find((p) => p.exercise_id === item.id);

          return (
            <>
              {showHeader && (
                <Text style={styles.sectionHeader}>
                  {item.name[0].toUpperCase()}
                </Text>
              )}
              <TouchableOpacity
                style={styles.exerciseCard}
                onPress={() => selectExercise(item)}
              >
                <View style={styles.exerciseIconContainer}>
                  <View style={styles.exerciseIcon}>
                    <Ionicons
                      name={
                        exerciseTypeIcons[item.category?.toLowerCase()] ||
                        "barbell-outline"
                      }
                      size={24}
                      color="#007bff"
                    />
                  </View>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseCategory}>
                    {item.category.charAt(0).toUpperCase() +
                      item.category.slice(1)}
                    {sortType === "rank" && placement && (
                      <Text style={styles.rankBadgeText}>
                        {" "}
                        • {placement.rank_key.replace("_", " ")}
                      </Text>
                    )}
                    {sortType === "performed" && placement && (
                      <Text style={styles.performedBadgeText}>
                        {" "}
                        • {placement.performed_count}x
                      </Text>
                    )}
                  </Text>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                </View>
                {item.is_bodyweight && (
                  <View style={styles.bodyweightBadge}>
                    <Ionicons name="body-outline" size={20} color="#4ECDC4" />
                  </View>
                )}
              </TouchableOpacity>
            </>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#4B5563" />
            <Text style={styles.emptyText}>No exercises found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters or search query
            </Text>
          </View>
        }
      />

      {/* Filter Modal - Slides from bottom */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowFilters(false)}
          />
          <Animated.View
            style={[
              styles.filterPanel,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.filterHandle} />
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>
                Filters ({filtered.length})
              </Text>
              <TouchableOpacity
                style={styles.filterCloseButton}
                onPress={() => setShowFilters(false)}
              >
                <Ionicons name="close" size={28} color="#bdbbbb" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.filterScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Category Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Category</Text>
                <View style={styles.filterChips}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.filterChip,
                        selectedCategories.includes(category) &&
                          styles.filterChipActive,
                      ]}
                      onPress={() => toggleCategory(category)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedCategories.includes(category) &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Equipment Type Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Equipment</Text>
                <View style={styles.filterChips}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      selectedBodyweight === "all" && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedBodyweight("all")}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedBodyweight === "all" &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      selectedBodyweight === "bodyweight" &&
                        styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedBodyweight("bodyweight")}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedBodyweight === "bodyweight" &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      Bodyweight
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      selectedBodyweight === "weighted" &&
                        styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedBodyweight("weighted")}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedBodyweight === "weighted" &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      Weighted
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {activeFilterCount > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearFilters}
                >
                  <Text style={styles.clearButtonText}>Clear All Filters</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050814",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A2332",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "white",
    padding: 12,
    fontSize: 16,
    fontFamily: "Quicksand_400Regular",
  },
  filterButton: {
    padding: 8,
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#007bff",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
  sortingTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginRight: 8,
    backgroundColor: "transparent",
  },
  activeTab: {
    backgroundColor: "#007bff",
  },
  tabText: {
    color: "#6B7280",
    fontSize: 14,
    fontFamily: "Quicksand_400Regular",
  },
  activeTabText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Quicksand_600SemiBold",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    color: "white",
    backgroundColor: "#1A2332",
    fontSize: 20,
    fontFamily: "Quicksand_700Bold",
    marginTop: 24,
    marginBottom: 16,
    marginLeft: 2.5,
    paddingLeft: 10,
    paddingTop: 2.5,
    paddingBottom: 2.5,
    borderRadius: 7,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  exerciseIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1A2332",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    padding: 3,
  },
  exerciseIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#0F1419",
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseCategory: {
    color: "#7B9FE8",
    fontSize: 12,
    fontFamily: "Quicksand_400Regular",
  },
  exerciseName: {
    color: "white",
    fontSize: 17,
    fontFamily: "Quicksand_500Medium",
  },
  rankBadgeText: {
    color: "#FFD700",
    fontSize: 12,
    fontFamily: "Quicksand_600SemiBold",
  },
  performedBadgeText: {
    color: "#4ECDC4",
    fontSize: 12,
    fontFamily: "Quicksand_600SemiBold",
  },
  bodyweightBadge: {
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
    fontFamily: "Quicksand_600SemiBold",
    marginTop: 12,
  },
  emptySubtext: {
    color: "#4B5563",
    fontSize: 14,
    fontFamily: "Quicksand_400Regular",
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  filterPanel: {
    backgroundColor: "#0F1419",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    height: SCREEN_HEIGHT * 0.75,
  },
  filterHandle: {
    width: 80,
    height: 5,
    backgroundColor: "#374151",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  filterTitle: {
    color: "white",
    fontSize: 22,
    fontFamily: "Quicksand_600SemiBold",
    textAlign: "center",
    flex: 1,
  },
  filterCloseButton: {
    position: "absolute",
    right: 0,
  },
  filterScroll: {
    flexGrow: 1,
  },
  filterSection: {
    marginBottom: 28,
  },
  filterSectionTitle: {
    color: "white",
    fontSize: 17,
    fontFamily: "Quicksand_600SemiBold",
    marginBottom: 14,
    backgroundColor: "#1A2332",
    padding: 14,
    borderRadius: 10,
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterChip: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 25,
    backgroundColor: "#1A2332",
    borderWidth: 1.5,
    borderColor: "#2A3442",
  },
  filterChipActive: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  filterChipText: {
    color: "#9CA3AF",
    fontSize: 15,
    fontFamily: "Quicksand_400Regular",
  },
  filterChipTextActive: {
    color: "white",
    fontFamily: "Quicksand_600SemiBold",
  },
  clearButton: {
    backgroundColor: "#374151",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  clearButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Quicksand_600SemiBold",
  },
});
