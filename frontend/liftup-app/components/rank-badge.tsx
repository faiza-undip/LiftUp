import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
} from "react-native-svg";

import RankIcon from "@/components/rank-icon";

interface RankBadgeProps {
  colors: string[];
  rankKey: string;
  size?: number;
}

export default function RankBadge({
  colors,
  rankKey,
  size = 90,
}: RankBadgeProps) {
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  // Calculate icon size as a proportion of the badge size
  // For size=140, icon should be ~40 (28.5% of badge size)
  // For size=50, icon should be ~14-15 (28.5% of badge size)
  const iconSizeRatio = rankKey.includes("WOOD") ? 0.25 : 0.285;
  const iconSize = Math.round(size * iconSizeRatio);

  return (
    <View style={[styles.badgeContainer, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={styles.hexagonBg}
      >
        <Defs>
          <SvgLinearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={colors[0]} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors[1]} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z"
          fill={`url(#${gradientId})`}
          stroke={colors[0]}
          strokeWidth="3"
        />
        {/* Inner hexagon for depth */}
        <Path
          d="M50 20 L75 35 L75 65 L50 80 L25 65 L25 35 Z"
          fill={colors[1]}
          opacity="0.3"
        />
      </Svg>

      {/* Overlay SVG Icon */}
      <View style={styles.iconOverlay}>
        <RankIcon rankKey={rankKey} size={iconSize} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  hexagonBg: {
    position: "absolute",
  },
  iconOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
