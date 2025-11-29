export type RankKey = "OLYMPIAN" | "TITAN_III" | "TITAN_II" | "TITAN_I" | "CHAMPION_III" | "CHAMPION_II" | "CHAMPION_I" | "DIAMOND_III" | "DIAMOND_II" | "DIAMOND_I" | "PLATINUM_III" | "PLATINUM_II" | "PLATINUM_I" | "GOLD_III" | "GOLD_II" | "GOLD_I" | "SILVER_III" | "SILVER_II" | "SILVER_I" | "BRONZE_III" | "BRONZE_II" | "BRONZE_I" | "WOOD_III" | "WOOD_II" | "WOOD_I";
export type IconType = "diamond" | "gold" | "wood";
export interface RankDefinition {
    key: RankKey;
    label: string;
    color: string;
    iconType: IconType;
    minScore: number;
}
export declare const rankDefinitions: RankDefinition[];
export declare function getRankForScore(score: number): RankDefinition;
//# sourceMappingURL=rankConfig.d.ts.map