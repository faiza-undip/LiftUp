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

interface ExerciseWithRanking extends Exercise {
  highestScore?: number;
  latestPerformed?: string;
  rankSortOrder?: number;
}

type SortMode = "alphabetical" | "rank" | "performed";

export default function ExerciseSearchScreen() {
  const router = useRouter();

  const [exercises, setExercises] = useState<ExerciseWithRanking[]>([]);
  const [filtered, setFiltered] = useState<ExerciseWithRanking[]>([]);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [sortMode, setSortMode] = useState<SortMode>("alphabetical");

  // Dynamically populated filter options from actual data
  const [categories, setCategories] = useState<string[]>([]);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBodyweight, setSelectedBodyweight] = useState<
    "all" | "bodyweight" | "weighted"
  >("all");

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [query, selectedCategories, selectedBodyweight, exercises, sortMode]);

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
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch all exercises
    const { data: exercisesData, error: exercisesError } = await supabase
      .from("exercises")
      .select("*")
      .order("name", { ascending: true });

    if (exercisesError || !exercisesData) {
      console.error("Error loading exercises:", exercisesError);
      return;
    }

    // Fetch user's exercise rankings with rank sort order
    const { data: rankingsData, error: rankingsError } = await supabase
      .from("exercise_rankings")
      .select(
        `
        exercise_id,
        normalized_score,
        created_at,
        ranks!inner(sort_order)
      `
      )
      .eq("user_id", user.id);

    if (rankingsError) {
      console.error("Error loading rankings:", rankingsError);
    }

    // Create a map of exercise_id -> {highestScore, latestPerformed, rankSortOrder}
    const rankingMap = new Map<
      number,
      { highestScore: number; latestPerformed: string; rankSortOrder: number }
    >();

    if (rankingsData) {
      rankingsData.forEach((ranking: any) => {
        const existing = rankingMap.get(ranking.exercise_id);
        const score = ranking.normalized_score || 0;
        const sortOrder = ranking.ranks?.sort_order || 999;

        if (!existing || score > existing.highestScore) {
          rankingMap.set(ranking.exercise_id, {
            highestScore: score,
            latestPerformed: ranking.created_at,
            rankSortOrder: sortOrder,
          });
        } else if (
          score === existing.highestScore &&
          ranking.created_at > existing.latestPerformed
        ) {
          // If same score, keep the latest date
          rankingMap.set(ranking.exercise_id, {
            highestScore: score,
            latestPerformed: ranking.created_at,
            rankSortOrder: sortOrder,
          });
        }
      });
    }

    // Combine exercises with their ranking data
    const enrichedExercises: ExerciseWithRanking[] = exercisesData.map(
      (ex) => ({
        ...ex,
        highestScore: rankingMap.get(ex.id)?.highestScore,
        latestPerformed: rankingMap.get(ex.id)?.latestPerformed,
        rankSortOrder: rankingMap.get(ex.id)?.rankSortOrder,
      })
    );

    setExercises(enrichedExercises);

    // Extract unique categories
    const uniqueCategories = [
      ...new Set(exercisesData.map((ex) => ex.category).filter(Boolean)),
    ] as string[];
    setCategories(uniqueCategories.sort());
  }

  function applyFiltersAndSort() {
    let result = [...exercises];

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
    switch (sortMode) {
      case "rank":
        // Sort by rank (performed exercises first, then by highest rank/score)
        result.sort((a, b) => {
          const aHasRank = a.rankSortOrder !== undefined;
          const bHasRank = b.rankSortOrder !== undefined;

          // Performed exercises come first
          if (aHasRank && !bHasRank) return -1;
          if (!aHasRank && bHasRank) return 1;

          // Both performed: sort by rank (lower sort_order = higher rank)
          if (aHasRank && bHasRank) {
            const rankDiff =
              (a.rankSortOrder || 999) - (b.rankSortOrder || 999);
            if (rankDiff !== 0) return rankDiff;
            // If same rank, sort by score
            return (b.highestScore || 0) - (a.highestScore || 0);
          }

          // Neither performed: alphabetical
          return a.name.localeCompare(b.name);
        });
        break;

      case "performed":
        // Sort by latest performed date
        result.sort((a, b) => {
          const aDate = a.latestPerformed;
          const bDate = b.latestPerformed;

          // Performed exercises come first
          if (aDate && !bDate) return -1;
          if (!aDate && bDate) return 1;

          // Both performed: sort by date (most recent first)
          if (aDate && bDate) {
            return new Date(bDate).getTime() - new Date(aDate).getTime();
          }

          // Neither performed: alphabetical
          return a.name.localeCompare(b.name);
        });
        break;

      case "alphabetical":
      default:
        // Sort alphabetically
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFiltered(result);
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
          style={[styles.tab, sortMode === "alphabetical" && styles.activeTab]}
          onPress={() => setSortMode("alphabetical")}
        >
          <Text
            style={
              sortMode === "alphabetical"
                ? styles.activeTabText
                : styles.tabText
            }
          >
            Alphabetical
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, sortMode === "rank" && styles.activeTab]}
          onPress={() => setSortMode("rank")}
        >
          <Text
            style={sortMode === "rank" ? styles.activeTabText : styles.tabText}
          >
            By Rank
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, sortMode === "performed" && styles.activeTab]}
          onPress={() => setSortMode("performed")}
        >
          <Text
            style={
              sortMode === "performed" ? styles.activeTabText : styles.tabText
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
          // Show section headers only in alphabetical mode
          const firstLetter = item.name[0].toUpperCase();
          const prevFirstLetter =
            index > 0 ? filtered[index - 1].name[0].toUpperCase() : null;
          const showHeader =
            sortMode === "alphabetical" && firstLetter !== prevFirstLetter;

          return (
            <>
              {showHeader && (
                <Text style={styles.sectionHeader}>{firstLetter}</Text>
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
