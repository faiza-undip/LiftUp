import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

import { RANKS } from "../constants/ranks";

export default function RankLadderScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={RANKS}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.badge, { borderColor: item.color }]}>
              <Text style={{ color: item.color }}>◆</Text>
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050814", padding: 16 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  label: { color: "white", fontSize: 16 },
});
