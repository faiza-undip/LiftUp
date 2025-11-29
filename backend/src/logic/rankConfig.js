export const rankDefinitions = [
    {
        key: "WOOD_I",
        label: "Wood I",
        color: "#CD9575",
        iconType: "wood",
        minScore: 0,
    },
    {
        key: "WOOD_II",
        label: "Wood II",
        color: "#CD9575",
        iconType: "wood",
        minScore: 10,
    },
    {
        key: "WOOD_III",
        label: "Wood III",
        color: "#CD9575",
        iconType: "wood",
        minScore: 20,
    },
    {
        key: "BRONZE_I",
        label: "Bronze I",
        color: "#CD9575",
        iconType: "diamond",
        minScore: 30,
    },
    {
        key: "BRONZE_II",
        label: "Bronze II",
        color: "#CD9575",
        iconType: "diamond",
        minScore: 40,
    },
    {
        key: "BRONZE_III",
        label: "Bronze III",
        color: "#CD9575",
        iconType: "diamond",
        minScore: 50,
    },
    {
        key: "SILVER_I",
        label: "Silver I",
        color: "#C0D6DF",
        iconType: "diamond",
        minScore: 60,
    },
    {
        key: "SILVER_II",
        label: "Silver II",
        color: "#C0D6DF",
        iconType: "diamond",
        minScore: 70,
    },
    {
        key: "SILVER_III",
        label: "Silver III",
        color: "#C0D6DF",
        iconType: "diamond",
        minScore: 80,
    },
    {
        key: "GOLD_I",
        label: "Gold I",
        color: "#F4C430",
        iconType: "gold",
        minScore: 90,
    },
    {
        key: "GOLD_II",
        label: "Gold II",
        color: "#F4C430",
        iconType: "gold",
        minScore: 100,
    },
    {
        key: "GOLD_III",
        label: "Gold III",
        color: "#F4C430",
        iconType: "gold",
        minScore: 110,
    },
    {
        key: "PLATINUM_I",
        label: "Platinum I",
        color: "#4ECDC4",
        iconType: "diamond",
        minScore: 120,
    },
    {
        key: "PLATINUM_II",
        label: "Platinum II",
        color: "#4ECDC4",
        iconType: "diamond",
        minScore: 130,
    },
    {
        key: "PLATINUM_III",
        label: "Platinum III",
        color: "#4ECDC4",
        iconType: "diamond",
        minScore: 140,
    },
    {
        key: "DIAMOND_I",
        label: "Diamond I",
        color: "#7B9FE8",
        iconType: "diamond",
        minScore: 150,
    },
    {
        key: "DIAMOND_II",
        label: "Diamond II",
        color: "#7B9FE8",
        iconType: "diamond",
        minScore: 160,
    },
    {
        key: "DIAMOND_III",
        label: "Diamond III",
        color: "#7B9FE8",
        iconType: "diamond",
        minScore: 170,
    },
    {
        key: "CHAMPION_I",
        label: "Champion I",
        color: "#C77DFF",
        iconType: "diamond",
        minScore: 180,
    },
    {
        key: "CHAMPION_II",
        label: "Champion II",
        color: "#C77DFF",
        iconType: "diamond",
        minScore: 190,
    },
    {
        key: "CHAMPION_III",
        label: "Champion III",
        color: "#C77DFF",
        iconType: "diamond",
        minScore: 200,
    },
    {
        key: "TITAN_I",
        label: "Titan I",
        color: "#E63946",
        iconType: "diamond",
        minScore: 210,
    },
    {
        key: "TITAN_II",
        label: "Titan II",
        color: "#E63946",
        iconType: "diamond",
        minScore: 220,
    },
    {
        key: "TITAN_III",
        label: "Titan III",
        color: "#E63946",
        iconType: "diamond",
        minScore: 230,
    },
    {
        key: "OLYMPIAN",
        label: "Olympian",
        color: "#5DD9E8",
        iconType: "diamond",
        minScore: 250,
    },
].sort((a, b) => a.minScore - b.minScore);
export function getRankForScore(score) {
    let current = rankDefinitions[0];
    for (const rank of rankDefinitions) {
        if (score >= rank.minScore)
            current = rank;
        else
            break;
    }
    return current;
}
//# sourceMappingURL=rankConfig.js.map