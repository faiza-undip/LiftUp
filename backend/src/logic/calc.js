export function estimate1RM(weightKg, reps) {
    // Epley formula
    return Math.round(weightKg * (1 + reps / 30));
}
//# sourceMappingURL=calc.js.map