export const baseMultipliers = {
    compound: 1.0,
    bodyweight: 0.85,
    isolation: 0.6,
    core: 0.5,
    cardio: 0.4,
    functional: 1.0,
    power: 1.0,
    plyometric: 0.85,
    conditioning: 0.4,
    isometric: 0.5,
};
export function getMultiplier(category, isBodyweight) {
    if (isBodyweight && !baseMultipliers[category])
        return 0.85;
    return baseMultipliers[category] ?? 1.0; // default to 1.0 if unknown
}
//# sourceMappingURL=multiplierConfig.js.map