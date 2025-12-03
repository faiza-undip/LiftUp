export function estimate1RM(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  // Epley formula
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

// ============================================
// EXERCISE-SPECIFIC STRENGTH STANDARDS
// ============================================
// Each exercise has benchmarks for what constitutes elite/advanced/intermediate performance
// as a ratio of bodyweight (or absolute weight for some exercises)

interface StrengthStandard {
  // Ratio of 1RM to bodyweight that represents "elite" level
  eliteRatio: {
    male: number;
    female: number;
  };
  // Type of calculation
  type: "bodyweight_ratio" | "absolute" | "bodyweight_plus_load";
  // Base score at elite level (we'll scale from this)
  eliteScore: number;
}

const strengthStandards: Record<string, StrengthStandard> = {
  // ============================================
  // COMPOUND LIFTS (Weighted)
  // ============================================
  "Bench Press": {
    eliteRatio: { male: 1.5, female: 1.0 },
    type: "bodyweight_ratio",
    eliteScore: 250,
  },
  Squat: {
    eliteRatio: { male: 2.5, female: 2.0 },
    type: "bodyweight_ratio",
    eliteScore: 250,
  },
  Deadlift: {
    eliteRatio: { male: 2.75, female: 2.25 },
    type: "bodyweight_ratio",
    eliteScore: 250,
  },
  "Overhead Press": {
    eliteRatio: { male: 1.0, female: 0.65 },
    type: "bodyweight_ratio",
    eliteScore: 240,
  },
  "Incline Bench Press": {
    eliteRatio: { male: 1.3, female: 0.85 },
    type: "bodyweight_ratio",
    eliteScore: 230,
  },
  "Decline Bench Press": {
    eliteRatio: { male: 1.6, female: 1.1 },
    type: "bodyweight_ratio",
    eliteScore: 230,
  },
  "Dumbbell Bench Press": {
    eliteRatio: { male: 1.4, female: 0.9 },
    type: "bodyweight_ratio",
    eliteScore: 230,
  },
  "Barbell Rows": {
    eliteRatio: { male: 1.5, female: 1.0 },
    type: "bodyweight_ratio",
    eliteScore: 240,
  },
  "Dumbbell Rows": {
    eliteRatio: { male: 1.3, female: 0.85 },
    type: "bodyweight_ratio",
    eliteScore: 230,
  },
  "Lat Pulldown": {
    eliteRatio: { male: 1.4, female: 0.9 },
    type: "bodyweight_ratio",
    eliteScore: 220,
  },
  "Cable Rows": {
    eliteRatio: { male: 1.4, female: 0.9 },
    type: "bodyweight_ratio",
    eliteScore: 220,
  },
  "Front Squat": {
    eliteRatio: { male: 2.0, female: 1.5 },
    type: "bodyweight_ratio",
    eliteScore: 240,
  },
  "Goblet Squat": {
    eliteRatio: { male: 1.2, female: 0.8 },
    type: "bodyweight_ratio",
    eliteScore: 210,
  },
  "Romanian Deadlift": {
    eliteRatio: { male: 2.0, female: 1.5 },
    type: "bodyweight_ratio",
    eliteScore: 230,
  },
  "Sumo Deadlift": {
    eliteRatio: { male: 2.5, female: 2.0 },
    type: "bodyweight_ratio",
    eliteScore: 240,
  },
  "Hip Thrusts": {
    eliteRatio: { male: 2.5, female: 2.5 },
    type: "bodyweight_ratio",
    eliteScore: 230,
  },
  "Leg Press": {
    eliteRatio: { male: 3.5, female: 3.0 },
    type: "bodyweight_ratio",
    eliteScore: 220,
  },

  // ============================================
  // BODYWEIGHT COMPOUND EXERCISES
  // ============================================
  "Pull Ups": {
    eliteRatio: { male: 1.5, female: 1.3 }, // bodyweight + additional load
    type: "bodyweight_plus_load",
    eliteScore: 250,
  },
  "Chin Ups": {
    eliteRatio: { male: 1.6, female: 1.4 },
    type: "bodyweight_plus_load",
    eliteScore: 245,
  },
  "Neutral Grip Pull Ups": {
    eliteRatio: { male: 1.55, female: 1.35 },
    type: "bodyweight_plus_load",
    eliteScore: 245,
  },
  "Push Ups": {
    eliteRatio: { male: 1.4, female: 1.2 },
    type: "bodyweight_plus_load",
    eliteScore: 200,
  },
  "Diamond Push Ups": {
    eliteRatio: { male: 1.3, female: 1.1 },
    type: "bodyweight_plus_load",
    eliteScore: 210,
  },
  "Wide Push Ups": {
    eliteRatio: { male: 1.35, female: 1.15 },
    type: "bodyweight_plus_load",
    eliteScore: 205,
  },
  "Decline Push Ups": {
    eliteRatio: { male: 1.3, female: 1.1 },
    type: "bodyweight_plus_load",
    eliteScore: 215,
  },
  "Pike Push Ups": {
    eliteRatio: { male: 1.2, female: 1.0 },
    type: "bodyweight_plus_load",
    eliteScore: 220,
  },
  "Handstand Push Ups": {
    eliteRatio: { male: 1.1, female: 0.9 },
    type: "bodyweight_plus_load",
    eliteScore: 250,
  },
  "Dips (Bodyweight)": {
    eliteRatio: { male: 1.8, female: 1.5 },
    type: "bodyweight_plus_load",
    eliteScore: 240,
  },
  "Bodyweight Squats": {
    eliteRatio: { male: 1.0, female: 1.0 },
    type: "bodyweight_plus_load",
    eliteScore: 150,
  },
  "Walking Lunges": {
    eliteRatio: { male: 1.3, female: 1.2 },
    type: "bodyweight_plus_load",
    eliteScore: 180,
  },
  "Bulgarian Split Squats (BW)": {
    eliteRatio: { male: 1.4, female: 1.3 },
    type: "bodyweight_plus_load",
    eliteScore: 200,
  },
  "Glute Bridge": {
    eliteRatio: { male: 1.5, female: 1.5 },
    type: "bodyweight_plus_load",
    eliteScore: 170,
  },
  "Single-Leg Glute Bridge": {
    eliteRatio: { male: 1.2, female: 1.2 },
    type: "bodyweight_plus_load",
    eliteScore: 190,
  },
  "Bear Crawl": {
    eliteRatio: { male: 1.0, female: 1.0 },
    type: "bodyweight_plus_load",
    eliteScore: 160,
  },

  // ============================================
  // ISOLATION EXERCISES (Weighted)
  // ============================================
  "Bicep Curl": {
    eliteRatio: { male: 0.5, female: 0.35 },
    type: "bodyweight_ratio",
    eliteScore: 200,
  },
  "Hammer Curl": {
    eliteRatio: { male: 0.55, female: 0.38 },
    type: "bodyweight_ratio",
    eliteScore: 195,
  },
  "Preacher Curl": {
    eliteRatio: { male: 0.45, female: 0.32 },
    type: "bodyweight_ratio",
    eliteScore: 195,
  },
  "Triceps Pushdown": {
    eliteRatio: { male: 0.8, female: 0.55 },
    type: "bodyweight_ratio",
    eliteScore: 195,
  },
  Skullcrushers: {
    eliteRatio: { male: 0.65, female: 0.45 },
    type: "bodyweight_ratio",
    eliteScore: 200,
  },
  "Overhead Triceps Extension": {
    eliteRatio: { male: 0.6, female: 0.42 },
    type: "bodyweight_ratio",
    eliteScore: 190,
  },
  "Dumbbell Lateral Raise": {
    eliteRatio: { male: 0.35, female: 0.22 },
    type: "bodyweight_ratio",
    eliteScore: 190,
  },
  "Rear Delt Fly": {
    eliteRatio: { male: 0.3, female: 0.2 },
    type: "bodyweight_ratio",
    eliteScore: 185,
  },
  "Front Raise": {
    eliteRatio: { male: 0.4, female: 0.28 },
    type: "bodyweight_ratio",
    eliteScore: 185,
  },
  "Chest Fly": {
    eliteRatio: { male: 0.7, female: 0.5 },
    type: "bodyweight_ratio",
    eliteScore: 190,
  },
  "Face Pulls": {
    eliteRatio: { male: 0.6, female: 0.42 },
    type: "bodyweight_ratio",
    eliteScore: 180,
  },
  "Leg Curl": {
    eliteRatio: { male: 1.0, female: 0.8 },
    type: "bodyweight_ratio",
    eliteScore: 190,
  },
  "Leg Extension": {
    eliteRatio: { male: 1.2, female: 0.95 },
    type: "bodyweight_ratio",
    eliteScore: 185,
  },
  "Standing Calf Raises": {
    eliteRatio: { male: 1.5, female: 1.2 },
    type: "bodyweight_ratio",
    eliteScore: 180,
  },
  "Seated Calf Raises": {
    eliteRatio: { male: 1.2, female: 0.95 },
    type: "bodyweight_ratio",
    eliteScore: 175,
  },
  "Calf Raises (BW)": {
    eliteRatio: { male: 1.0, female: 1.0 },
    type: "bodyweight_plus_load",
    eliteScore: 140,
  },

  // ============================================
  // CORE EXERCISES
  // ============================================
  "Hanging Leg Raises": {
    eliteRatio: { male: 1.0, female: 1.0 },
    type: "bodyweight_plus_load",
    eliteScore: 200,
  },
  "Lying Leg Raises": {
    eliteRatio: { male: 1.0, female: 1.0 },
    type: "bodyweight_plus_load",
    eliteScore: 170,
  },
  "Weighted Sit Ups": {
    eliteRatio: { male: 0.5, female: 0.4 },
    type: "bodyweight_ratio",
    eliteScore: 180,
  },
  "Cable Crunches": {
    eliteRatio: { male: 1.0, female: 0.75 },
    type: "bodyweight_ratio",
    eliteScore: 175,
  },
  "Russian Twists (Weighted)": {
    eliteRatio: { male: 0.4, female: 0.3 },
    type: "bodyweight_ratio",
    eliteScore: 170,
  },
  Plank: {
    eliteRatio: { male: 1.0, female: 1.0 },
    type: "bodyweight_plus_load",
    eliteScore: 160,
  },
  "Side Plank": {
    eliteRatio: { male: 1.0, female: 1.0 },
    type: "bodyweight_plus_load",
    eliteScore: 165,
  },

  // ============================================
  // POWER & PLYOMETRIC
  // ============================================
  "Kettlebell Swings": {
    eliteRatio: { male: 1.0, female: 0.75 },
    type: "bodyweight_ratio",
    eliteScore: 220,
  },
  "Jump Squats": {
    eliteRatio: { male: 1.2, female: 1.1 },
    type: "bodyweight_plus_load",
    eliteScore: 210,
  },
  "Box Jumps": {
    eliteRatio: { male: 1.0, female: 1.0 },
    type: "bodyweight_plus_load",
    eliteScore: 200,
  },
  Burpees: {
    eliteRatio: { male: 1.0, female: 1.0 },
    type: "bodyweight_plus_load",
    eliteScore: 190,
  },
  "Tire Flips": {
    eliteRatio: { male: 2.0, female: 1.5 },
    type: "bodyweight_ratio",
    eliteScore: 230,
  },

  // ============================================
  // FUNCTIONAL & CONDITIONING
  // ============================================
  "Farmer's Carry": {
    eliteRatio: { male: 2.0, female: 1.5 },
    type: "bodyweight_ratio",
    eliteScore: 210,
  },
  "Sled Push": {
    eliteRatio: { male: 2.5, female: 2.0 },
    type: "bodyweight_ratio",
    eliteScore: 215,
  },
  "Sled Pull": {
    eliteRatio: { male: 2.0, female: 1.5 },
    type: "bodyweight_ratio",
    eliteScore: 210,
  },
  "Battle Ropes": {
    eliteRatio: { male: 1.0, female: 1.0 },
    type: "bodyweight_plus_load",
    eliteScore: 170,
  },
  "Mountain Climbers": {
    eliteRatio: { male: 1.0, female: 1.0 },
    type: "bodyweight_plus_load",
    eliteScore: 160,
  },

  // ============================================
  // ISOMETRIC
  // ============================================
  "Wall Sit": {
    eliteRatio: { male: 1.0, female: 1.0 },
    type: "bodyweight_plus_load",
    eliteScore: 155,
  },
};

// ============================================
// MAIN SCORING FUNCTION
// ============================================
export function calculateExerciseScore(
  exerciseName: string,
  raw1RM: number,
  bodyweightKg: number,
  gender: "Male" | "Female",
  isBodyweight: boolean,
  extraLoadKg: number = 0 // for bodyweight exercises
): number {
  const standard = strengthStandards[exerciseName];

  if (!standard) {
    // Fallback for unknown exercises
    console.warn(`No standard found for exercise: ${exerciseName}`);
    return calculateFallbackScore(raw1RM, bodyweightKg, gender, isBodyweight);
  }

  const genderKey = gender.toLowerCase() as "male" | "female";
  const eliteRatio = standard.eliteRatio[genderKey];

  let actualRatio: number;

  if (standard.type === "bodyweight_plus_load") {
    // For bodyweight exercises: ratio = total_weight / bodyweight
    actualRatio = raw1RM / bodyweightKg;
  } else {
    // For weighted exercises: ratio = weight / bodyweight
    actualRatio = raw1RM / bodyweightKg;
  }

  // Score scales linearly with performance relative to elite
  // At elite ratio = eliteScore (250)
  // At 0 ratio = 0
  // Beyond elite ratio = can exceed 250 (Olympian tier)
  const performancePercentage = actualRatio / eliteRatio;
  const score = performancePercentage * standard.eliteScore;

  return Math.round(score * 10) / 10;
}

// Fallback for exercises without specific standards
function calculateFallbackScore(
  raw1RM: number,
  bodyweightKg: number,
  gender: "Male" | "Female",
  isBodyweight: boolean
): number {
  const ratio = raw1RM / bodyweightKg;
  const baseMultiplier = isBodyweight ? 150 : 100;
  const genderMultiplier = gender === "Male" ? 1.0 : 1.15;

  return ratio * baseMultiplier * genderMultiplier;
}
