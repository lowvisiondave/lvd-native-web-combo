import Ionicons from "@expo/vector-icons/Ionicons";
import type { AppNavItem } from "@repo/app-config/app-routes";
import { designTokens } from "@repo/app-config/tokens";
import { Pressable, StyleSheet, Text, View } from "react-native";

const { color } = designTokens;

type TabBarProps = {
  currentPath: string;
  tabs: AppNavItem[];
  onSelect: (path: string) => void;
};

export function TabBar({ currentPath, tabs, onSelect }: TabBarProps) {
  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const active = currentPath === tab.path;
        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={tab.path}
            onPress={() => onSelect(tab.path)}
            style={styles.tab}
          >
            <Ionicons
              color={active ? color.brand : color.textMuted}
              name={active ? tab.icon : `${tab.icon}-outline`}
              size={22}
            />
            <Text
              numberOfLines={1}
              style={[styles.label, { color: active ? color.brand : color.textMuted }]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: color.background,
    borderTopColor: color.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: 52,
    paddingTop: 4
  },
  tab: {
    alignItems: "center",
    flex: 1,
    gap: 2,
    justifyContent: "center"
  },
  label: { fontSize: 10, fontWeight: "600" }
});
