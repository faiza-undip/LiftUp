export function estimate1RM(weightKg: number, reps: number): number {
  // Epley formula
  return Math.round(weightKg * (1 + reps / 30));
}
