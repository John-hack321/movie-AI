import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { MovieResult } from "@/types/movie";

interface Props {
  movie: MovieResult;
  onPress: () => void;
}

export function HistoryItem({ movie, onPress }: Props) {
  const colors = useColors();

  const confidenceColor =
    movie.confidence === "high"
      ? colors.success
      : movie.confidence === "medium"
        ? colors.primary
        : colors.destructive;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        style={[styles.iconWrap, { backgroundColor: colors.secondary }]}
      >
        <Feather name="film" size={20} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text
          style={[styles.title, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {movie.title}
        </Text>
        <Text
          style={[styles.meta, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {movie.year ? `${movie.year} · ` : ""}
          {movie.genre ?? "Movie"}
        </Text>
      </View>
      <View style={[styles.dot, { backgroundColor: confidenceColor }]} />
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    marginBottom: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  meta: {
    fontSize: 12,
    fontWeight: "500",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
