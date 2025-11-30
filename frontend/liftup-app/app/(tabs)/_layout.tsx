import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

// Custom hexagon button component
interface HexagonButtonProps {
  focused?: boolean;
  onPress?: () => void;
}

function HexagonButton({ focused, onPress }: HexagonButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.hexagonContainer}
      activeOpacity={0.8}
    >
      <View style={styles.hexagonWrapper}>
        <Svg
          width="70"
          height="70"
          viewBox="0 0 70 70"
          style={styles.hexagonSvg}
        >
          <Path
            d="M35 5 L60 20 L60 50 L35 65 L10 50 L10 20 Z"
            fill={focused ? "#3B82F6" : "#007bff"}
            stroke={focused ? "#60A5FA" : "#007bff"}
            strokeWidth="2"
          />
        </Svg>
        <View style={styles.hexagonIconContainer}>
          <Ionicons name="add" size={32} color="white" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Custom tab bar icon component
interface TabBarIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  label: string;
}

function TabBarIcon({ name, focused, label }: TabBarIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      <Ionicons name={name} size={24} color={focused ? "#007bff" : "#6B7280"} />
      <Text
        style={[styles.tabLabel, focused && styles.tabLabelFocused]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="home" focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="people" focused={focused} label="Friends" />
          ),
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: "Calculator",
          tabBarIcon: ({ focused }) => (
            <View style={styles.hexagonPlaceholder} />
          ),
          tabBarButton: (props) => (
            <HexagonButton
              focused={props.accessibilityState?.selected}
              onPress={props.onPress as (() => void) | undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ranks"
        options={{
          title: "Ranks",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="star" focused={focused} label="Ranks" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="person" focused={focused} label="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0A0F1E",
    borderTopWidth: 1,
    borderTopColor: "#1A2332",
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
    minWidth: 60,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: "Quicksand_500Medium",
    color: "#6B7280",
    marginTop: 4,
  },
  tabLabelFocused: {
    color: "#007bff",
  },
  hexagonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    top: -25,
  },
  hexagonWrapper: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  hexagonSvg: {
    position: "absolute",
  },
  hexagonIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  hexagonPlaceholder: {
    width: 70,
    height: 70,
  },
});
