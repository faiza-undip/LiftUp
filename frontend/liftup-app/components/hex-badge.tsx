import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";

interface Props {
  size?: number;
  color: string;
  label?: string;
  icon?: string; // "◆", "⬢", "⬣" or custom
  animate?: boolean;
}

export default function HexBadge({
  size = 120,
  color,
  label,
  icon = "◆",
  animate = true,
}: Props) {
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (animate) {
      scale.value = 0.4;
      opacity.value = 0;

      scale.value = withSpring(1, { damping: 10, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      scale.value = 1;
      opacity.value = 1;
    }
  }, [animate]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const hexPoints = `
    ${size * 0.5},0
    ${size},${size * 0.25}
    ${size},${size * 0.75}
    ${size * 0.5},${size}
    0,${size * 0.75}
    0,${size * 0.25}
  `;

  return (
    <Animated.View style={[styles.container, anim]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Polygon
          points={hexPoints}
          fill={color}
          stroke="#ffffff55"
          strokeWidth={3}
        />
      </Svg>

      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={[styles.icon, { fontSize: size * 0.35 }]}>{icon}</Text>
        {label && (
          <Text style={[styles.label, { fontSize: size * 0.17 }]}>{label}</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    color: "#050814",
    fontWeight: "900",
  },
  label: {
    color: "white",
    fontWeight: "600",
    marginTop: 6,
  },
});
