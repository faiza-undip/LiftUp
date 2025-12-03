export type RankKey =
  | "OLYMPIAN"
  | "TITAN_III"
  | "TITAN_II"
  | "TITAN_I"
  | "CHAMPION_III"
  | "CHAMPION_II"
  | "CHAMPION_I"
  | "DIAMOND_III"
  | "DIAMOND_II"
  | "DIAMOND_I"
  | "PLATINUM_III"
  | "PLATINUM_II"
  | "PLATINUM_I"
  | "GOLD_III"
  | "GOLD_II"
  | "GOLD_I"
  | "SILVER_III"
  | "SILVER_II"
  | "SILVER_I"
  | "BRONZE_III"
  | "BRONZE_II"
  | "BRONZE_I"
  | "WOOD_III"
  | "WOOD_II"
  | "WOOD_I";

export type IconType = "diamond" | "gold" | "wood";

export interface RankDefinition {
  key: RankKey;
  label: string;
  color: string;
  iconType: IconType;
  minScore: number; // lower boundary of “score”
}

export const rankDefinitions: RankDefinition[] = [
  {
    key: "WOOD_I" as RankKey,
    label: "Wood I",
    color: "#8B4513",
    iconType: "wood" as IconType,
    minScore: 0,
  },
  {
    key: "WOOD_II" as RankKey,
    label: "Wood II",
    color: "#8B4513",
    iconType: "wood" as IconType,
    minScore: 1,
  },
  {
    key: "WOOD_III" as RankKey,
    label: "Wood III",
    color: "#8B4513",
    iconType: "wood" as IconType,
    minScore: 2,
  },
  {
    key: "BRONZE_I" as RankKey,
    label: "Bronze I",
    color: "#CD9575",
    iconType: "diamond" as IconType,
    minScore: 3,
  },
  {
    key: "BRONZE_II" as RankKey,
    label: "Bronze II",
    color: "#CD9575",
    iconType: "diamond" as IconType,
    minScore: 4,
  },
  {
    key: "BRONZE_III" as RankKey,
    label: "Bronze III",
    color: "#CD9575",
    iconType: "diamond" as IconType,
    minScore: 5,
  },
  {
    key: "SILVER_I" as RankKey,
    label: "Silver I",
    color: "#C0D6DF",
    iconType: "diamond" as IconType,
    minScore: 6,
  },
  {
    key: "SILVER_II" as RankKey,
    label: "Silver II",
    color: "#C0D6DF",
    iconType: "diamond" as IconType,
    minScore: 7,
  },
  {
    key: "SILVER_III" as RankKey,
    label: "Silver III",
    color: "#C0D6DF",
    iconType: "diamond" as IconType,
    minScore: 8,
  },
  {
    key: "GOLD_I" as RankKey,
    label: "Gold I",
    color: "#F4C430",
    iconType: "gold" as IconType,
    minScore: 9,
  },
  {
    key: "GOLD_II" as RankKey,
    label: "Gold II",
    color: "#F4C430",
    iconType: "gold" as IconType,
    minScore: 10,
  },
  {
    key: "GOLD_III" as RankKey,
    label: "Gold III",
    color: "#F4C430",
    iconType: "gold" as IconType,
    minScore: 11,
  },
  {
    key: "PLATINUM_I" as RankKey,
    label: "Platinum I",
    color: "#4ECDC4",
    iconType: "diamond" as IconType,
    minScore: 12,
  },
  {
    key: "PLATINUM_II" as RankKey,
    label: "Platinum II",
    color: "#4ECDC4",
    iconType: "diamond" as IconType,
    minScore: 13,
  },
  {
    key: "PLATINUM_III" as RankKey,
    label: "Platinum III",
    color: "#4ECDC4",
    iconType: "diamond" as IconType,
    minScore: 14,
  },
  {
    key: "DIAMOND_I" as RankKey,
    label: "Diamond I",
    color: "#7B9FE8",
    iconType: "diamond" as IconType,
    minScore: 15,
  },
  {
    key: "DIAMOND_II" as RankKey,
    label: "Diamond II",
    color: "#7B9FE8",
    iconType: "diamond" as IconType,
    minScore: 16,
  },
  {
    key: "DIAMOND_III" as RankKey,
    label: "Diamond III",
    color: "#7B9FE8",
    iconType: "diamond" as IconType,
    minScore: 17,
  },
  {
    key: "CHAMPION_I" as RankKey,
    label: "Champion I",
    color: "#C77DFF",
    iconType: "diamond" as IconType,
    minScore: 18,
  },
  {
    key: "CHAMPION_II" as RankKey,
    label: "Champion II",
    color: "#C77DFF",
    iconType: "diamond" as IconType,
    minScore: 19,
  },
  {
    key: "CHAMPION_III" as RankKey,
    label: "Champion III",
    color: "#C77DFF",
    iconType: "diamond" as IconType,
    minScore: 20,
  },
  {
    key: "TITAN_I" as RankKey,
    label: "Titan I",
    color: "#E63946",
    iconType: "diamond" as IconType,
    minScore: 21,
  },
  {
    key: "TITAN_II" as RankKey,
    label: "Titan II",
    color: "#E63946",
    iconType: "diamond" as IconType,
    minScore: 22,
  },
  {
    key: "TITAN_III" as RankKey,
    label: "Titan III",
    color: "#E63946",
    iconType: "diamond" as IconType,
    minScore: 23,
  },
  {
    key: "OLYMPIAN" as RankKey,
    label: "Olympian",
    color: "#5DD9E8",
    iconType: "diamond" as IconType,
    minScore: 25,
  },
].sort((a, b) => a.minScore - b.minScore);

export function getRankForScore(score: number): RankDefinition {
  let current = rankDefinitions[0];
  for (const rank of rankDefinitions) {
    if (score >= rank.minScore) current = rank;
    else break;
  }
  return current as RankDefinition;
}
