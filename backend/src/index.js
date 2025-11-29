import express from "express";
import cors from "cors";
import "dotenv/config";
import { z } from "zod";
import { supabaseAdmin } from "./supabase/supabaseClient.js";
import { estimate1RM } from "./logic/calc.js";
import { getRankForScore } from "./logic/rankConfig.js";
import { getMultiplier } from "./logic/multiplierConfig.js";
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 4000;
/**
 * Middleware: validate Supabase JWT (from frontend)
 * Frontend sends Authorization: Bearer <access_token>
 */
app.use(async (req, res, next) => {
    if (req.path.startsWith("/public"))
        return next();
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ error: "Missing Authorization header" });
    const token = authHeader.replace("Bearer ", "");
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
        return res.status(401).json({ error: "Invalid token" });
    }
    // attach user id
    req.userId = data.user.id;
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
    const userId = req.userId;
    // 1) Get exercise meta
    const { data: exercise, error: exError } = await supabaseAdmin
        .from("exercises")
        .select("id, name, category, is_bodyweight")
        .eq("id", exerciseId)
        .single();
    if (exError || !exercise) {
        return res.status(400).json({ error: "Invalid exerciseId" });
    }
    // 2) Get user weight if bodyweight exercise
    let userWeightKg = 0;
    if (exercise.is_bodyweight) {
        const { data: profile, error: profError } = await supabaseAdmin
            .from("profiles")
            .select("weight_kg")
            .eq("id", userId)
            .single();
        if (profError || !profile) {
            return res.status(400).json({ error: "User profile / weight not found" });
        }
        userWeightKg = Number(profile.weight_kg) || 0;
    }
    // 3) Effective load
    const effectiveWeight = exercise.is_bodyweight
        ? userWeightKg + weightKg // weightKg here is “extra load”, can be 0
        : weightKg;
    // 4) Raw 1RM
    const raw1RM = estimate1RM(effectiveWeight, reps);
    // 5) Category multiplier & final score
    const multiplier = getMultiplier(exercise.category, exercise.is_bodyweight);
    const score = raw1RM * multiplier;
    // 6) Rank from score
    const rank = getRankForScore(score);
    // 7) Store
    const { data, error } = await supabaseAdmin
        .from("exercise_rankings")
        .insert({
        user_id: userId,
        exercise_id: exerciseId,
        rank_key: rank.key,
        weight_kg: weightKg, // what user actually logged
        reps,
        estimated_1rm: raw1RM, // keep the true 1RM
        normalized_score: score, // see next section
    })
        .select()
        .single();
    if (error)
        return res.status(500).json({ error: error.message });
    return res.json({ ranking: data, rank });
});
/**
 * GET /placements
 * Returns latest 10 placements of a user
 */
app.get("/placements", async (req, res) => {
    const userId = req.userId;
    const { data, error } = await supabaseAdmin
        .from("exercise_rankings")
        .select("id, created_at, weight_kg, reps, estimated_1rm, rank_key, exercises(name)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
    if (error)
        return res.status(500).json({ error: error.message });
    res.json({ placements: data });
});
/**
 * GET /history?exerciseId=
 */
app.get("/history", async (req, res) => {
    const userId = req.userId;
    const exerciseId = Number(req.query.exerciseId);
    const { data, error } = await supabaseAdmin
        .from("exercise_rankings")
        .select("*")
        .eq("user_id", userId)
        .eq("exercise_id", exerciseId)
        .order("created_at", { ascending: true });
    if (error)
        return res.status(500).json({ error: error.message });
    res.json({ history: data });
});
app.listen(PORT, () => {
    console.log(`LiftUp backend running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map