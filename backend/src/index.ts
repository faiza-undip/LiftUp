import express from "express";
import cors from "cors";
import "dotenv/config";
import { z } from "zod";

import { supabaseAdmin } from "./supabase/supabaseClient.js";
import { calculateExerciseScore, estimate1RM } from "./logic/calc.js";
import { getRankForScore } from "./logic/rankConfig.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

/**
 * Middleware: validate Supabase JWT (from frontend)
 * Frontend sends Authorization: Bearer <access_token>
 */
app.use(async (req, res, next) => {
  if (req.path.startsWith("/public")) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "Missing Authorization header" });

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  // attach user id
  (req as any).userId = data.user.id;
  next();
});

/**
 * POST /calculate-and-save
 * body: { exerciseId, weightKg, reps }
 */
const calcSchema = z.object({
  exerciseId: z.number(),
  weightKg: z.number().min(0),
  reps: z.number().int().min(1),
});

app.post("/calculate-and-save", async (req, res) => {
  const parse = calcSchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({ error: parse.error.flatten() });

  const { exerciseId, weightKg, reps } = parse.data;
  const userId = (req as any).userId as string;

  // 1) Get exercise meta
  const { data: exercise, error: exError } = await supabaseAdmin
    .from("exercises")
    .select("id, name, category, is_bodyweight")
    .eq("id", exerciseId)
    .single();

  if (exError || !exercise) {
    return res.status(400).json({ error: "Invalid exerciseId" });
  }

  // 2) Get user profile (weight + gender)
  const { data: profile, error: profError } = await supabaseAdmin
    .from("profiles")
    .select("weight_kg, gender")
    .eq("id", userId)
    .single();

  if (profError || !profile) {
    return res.status(400).json({ error: "User profile not found" });
  }

  const userWeightKg = Number(profile.weight_kg) || 0;
  const userGender = profile.gender as "Male" | "Female";

  // 3) Calculate effective weight and 1RM
  const effectiveWeight = exercise.is_bodyweight
    ? userWeightKg + weightKg // weightKg is extra load
    : weightKg;

  const raw1RM = estimate1RM(effectiveWeight, reps);

  // 4) Calculate raw score (0-300+ range)
  const rawScore = calculateExerciseScore(
    exercise.name,
    raw1RM,
    userWeightKg,
    userGender,
    exercise.is_bodyweight,
    weightKg
  );

  // 5) NEW: Normalize score to 0-25 range for ranking
  // Elite score is 250, Olympian (beyond elite) starts at 25
  // Linear mapping: score 0 -> rank 0, score 250 -> rank 25
  const normalizedScore = Math.min((rawScore / 250) * 25, 30); // Cap at 30 for super-olympians

  // 6) Determine rank based on normalized score
  const rank = getRankForScore(normalizedScore);

  // 7) Store (keep rawScore as normalized_score for consistency)
  const { data, error } = await supabaseAdmin
    .from("exercise_rankings")
    .insert({
      user_id: userId,
      exercise_id: exerciseId,
      rank_key: rank.key,
      weight_kg: weightKg,
      reps,
      estimated_1rm: raw1RM,
      normalized_score: normalizedScore, // Store the 0-25 score
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ 
    ranking: data, 
    rank,
    debug: { rawScore, normalizedScore } // Helpful for debugging
  });
});
/**
 * GET /placements
 * Returns latest 10 placements of a user
 */
app.get("/placements", async (req, res) => {
  const userId = (req as any).userId as string;

  const { data, error } = await supabaseAdmin
    .from("exercise_rankings")
    .select(
      "id, created_at, weight_kg, reps, estimated_1rm, rank_key, exercises(name)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ placements: data });
});

/**
 * GET /history?exerciseId=
 */
app.get("/history", async (req, res) => {
  const userId = (req as any).userId as string;
  const exerciseId = Number(req.query.exerciseId);

  const { data, error } = await supabaseAdmin
    .from("exercise_rankings")
    .select("*")
    .eq("user_id", userId)
    .eq("exercise_id", exerciseId)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ history: data });
});

app.listen(PORT, () => {
  console.log(`LiftUp backend running on port ${PORT}`);
});
