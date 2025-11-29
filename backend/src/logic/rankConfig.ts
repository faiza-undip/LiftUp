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
    color: "#CD9575",
    iconType: "wood" as IconType,
    minScore: 0,
  },
  {
    key: "WOOD_II" as RankKey,
    label: "Wood II",
    color: "#CD9575",
    iconType: "wood" as IconType,
    minScore: 10,
  },
  {
    key: "WOOD_III" as RankKey,
    label: "Wood III",
    color: "#CD9575",
    iconType: "wood" as IconType,
    minScore: 20,
  },
  {
    key: "BRONZE_I" as RankKey,
    label: "Bronze I",
    color: "#CD9575",
    iconType: "diamond" as IconType,
    minScore: 30,
  },
  {
    key: "BRONZE_II" as RankKey,
    label: "Bronze II",
    color: "#CD9575",
    iconType: "diamond" as IconType,
    minScore: 40,
  },
  {
    key: "BRONZE_III" as RankKey,
    label: "Bronze III",
    color: "#CD9575",
    iconType: "diamond" as IconType,
    minScore: 50,
  },
  {
    key: "SILVER_I" as RankKey,
    label: "Silver I",
    color: "#C0D6DF",
    iconType: "diamond" as IconType,
    minScore: 60,
  },
  {
    key: "SILVER_II" as RankKey,
    label: "Silver II",
    color: "#C0D6DF",
    iconType: "diamond" as IconType,
    minScore: 70,
  },
  {
    key: "SILVER_III" as RankKey,
    label: "Silver III",
    color: "#C0D6DF",
    iconType: "diamond" as IconType,
    minScore: 80,
  },
  {
    key: "GOLD_I" as RankKey,
    label: "Gold I",
    color: "#F4C430",
    iconType: "gold" as IconType,
    minScore: 90,
  },
  {
    key: "GOLD_II" as RankKey,
    label: "Gold II",
    color: "#F4C430",
    iconType: "gold" as IconType,
    minScore: 100,
  },
  {
    key: "GOLD_III" as RankKey,
    label: "Gold III",
    color: "#F4C430",
    iconType: "gold" as IconType,
    minScore: 110,
  },
  {
    key: "PLATINUM_I" as RankKey,
    label: "Platinum I",
    color: "#4ECDC4",
    iconType: "diamond" as IconType,
    minScore: 120,
  },
  {
    key: "PLATINUM_II" as RankKey,
    label: "Platinum II",
    color: "#4ECDC4",
    iconType: "diamond" as IconType,
    minScore: 130,
  },
  {
    key: "PLATINUM_III" as RankKey,
    label: "Platinum III",
    color: "#4ECDC4",
    iconType: "diamond" as IconType,
    minScore: 140,
  },
  {
    key: "DIAMOND_I" as RankKey,
    label: "Diamond I",
    color: "#7B9FE8",
    iconType: "diamond" as IconType,
    minScore: 150,
  },
  {
    key: "DIAMOND_II" as RankKey,
    label: "Diamond II",
    color: "#7B9FE8",
    iconType: "diamond" as IconType,
    minScore: 160,
  },
  {
    key: "DIAMOND_III" as RankKey,
    label: "Diamond III",
    color: "#7B9FE8",
    iconType: "diamond" as IconType,
    minScore: 170,
  },
  {
    key: "CHAMPION_I" as RankKey,
    label: "Champion I",
    color: "#C77DFF",
    iconType: "diamond" as IconType,
    minScore: 180,
  },
  {
    key: "CHAMPION_II" as RankKey,
    label: "Champion II",
    color: "#C77DFF",
    iconType: "diamond" as IconType,
    minScore: 190,
  },
  {
    key: "CHAMPION_III" as RankKey,
    label: "Champion III",
    color: "#C77DFF",
    iconType: "diamond" as IconType,
    minScore: 200,
  },
  {
    key: "TITAN_I" as RankKey,
    label: "Titan I",
    color: "#E63946",
    iconType: "diamond" as IconType,
    minScore: 210,
  },
  {
    key: "TITAN_II" as RankKey,
    label: "Titan II",
    color: "#E63946",
    iconType: "diamond" as IconType,
    minScore: 220,
  },
  {
    key: "TITAN_III" as RankKey,
    label: "Titan III",
    color: "#E63946",
    iconType: "diamond" as IconType,
    minScore: 230,
  },
  {
    key: "OLYMPIAN" as RankKey,
    label: "Olympian",
    color: "#5DD9E8",
    iconType: "diamond" as IconType,
    minScore: 250,
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
