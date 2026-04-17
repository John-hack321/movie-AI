import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import type { MovieResult } from "@/types/movie";

interface Props {
  movie: MovieResult;
  onDismiss: () => void;
}

export function MovieResultCard({ movie, onDismiss }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: -200,
        tension: 100,
        friction: 15,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(onDismiss);
  };

  const topOffset =
    Platform.OS === "web" ? 67 + insets.top : insets.top + 8;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { top: topOffset, transform: [{ translateY }], opacity },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.primary,
          },
        ]}
      >
        <View style={styles.iconRow}>
          <View
            style={[styles.iconBadge, { backgroundColor: colors.primary }]}
          >
            <Feather name="film" size={18} color={colors.primaryForeground} />
          </View>
          <Text
            style={[styles.foundLabel, { color: colors.primary }]}
            numberOfLines={1}
          >
            Movie Identified
          </Text>
          <Pressable onPress={dismiss} style={styles.closeBtn} hitSlop={12}>
            <Feather name="x" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Text
          style={[styles.title, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {movie.title}
        </Text>

        {movie.year ? (
          <Text style={[styles.year, { color: colors.mutedForeground }]}>
            {movie.year}
            {movie.genre ? ` · ${movie.genre}` : ""}
          </Text>
        ) : null}

        {movie.description ? (
          <Text
            style={[styles.description, { color: colors.mutedForeground }]}
            numberOfLines={3}
          >
            {movie.description}
          </Text>
        ) : null}

        <View style={styles.confidence}>
          <View
            style={[
              styles.confidenceDot,
              {
                backgroundColor:
                  movie.confidence === "high"
                    ? colors.success
                    : movie.confidence === "medium"
                      ? colors.primary
                      : colors.destructive,
              },
            ]}
          />
          <Text style={[styles.confidenceText, { color: colors.mutedForeground }]}>
            {movie.confidence === "high"
              ? "High confidence"
              : movie.confidence === "medium"
                ? "Medium confidence"
                : "Low confidence"} match
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 999,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
    gap: 6,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  foundLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    flex: 1,
  },
  closeBtn: {
    padding: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  year: {
    fontSize: 13,
    fontWeight: "500",
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  confidence: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  confidenceDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
