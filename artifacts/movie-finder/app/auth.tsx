import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, isLoading, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (user) router.replace("/(tabs)");
  }, [user]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <LinearGradient
      colors={["#0C0C0F", "#141420", "#0C0C0F"]}
      style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad + 24 }]}
    >
      {/* Decorative rings */}
      <View style={styles.ringsContainer} pointerEvents="none">
        <View style={[styles.ring, styles.ring1, { borderColor: colors.primary + "25" }]} />
        <View style={[styles.ring, styles.ring2, { borderColor: colors.primary + "15" }]} />
        <View style={[styles.ring, styles.ring3, { borderColor: colors.primary + "08" }]} />
      </View>

      <View style={styles.header}>
        <View style={[styles.logoWrap, { backgroundColor: colors.primary }]}>
          <Feather name="film" size={36} color={colors.primaryForeground} />
        </View>
        <Text style={[styles.appName, { color: colors.foreground }]}>CineID</Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          Shazam for Movies
        </Text>
      </View>

      <View style={styles.featureList}>
        {[
          { icon: "share-2", text: "Share a TikTok and identify any movie instantly" },
          { icon: "zap", text: "AI-powered recognition in seconds" },
          { icon: "clock", text: "Full history synced across your devices" },
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: colors.secondary }]}>
              <Feather name={f.icon as never} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.featureText, { color: colors.foreground }]}>
              {f.text}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={signInWithGoogle}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.googleBtn,
            {
              backgroundColor: colors.foreground,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <>
              <Feather name="user" size={20} color={colors.background} />
              <Text style={[styles.googleBtnText, { color: colors.background }]}>
                Continue with Google
              </Text>
            </>
          )}
        </Pressable>
        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          By continuing you agree to our terms of service
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  ringsContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderRadius: 1000,
    borderWidth: 1,
  },
  ring1: { width: 280, height: 280 },
  ring2: { width: 420, height: 420 },
  ring3: { width: 560, height: 560 },
  header: {
    alignItems: "center",
    gap: 12,
    paddingTop: 32,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: -2,
  },
  tagline: {
    fontSize: 17,
    fontWeight: "500",
  },
  featureList: {
    gap: 16,
    paddingVertical: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    gap: 14,
    alignItems: "center",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
    height: 56,
    borderRadius: 16,
  },
  googleBtnText: {
    fontSize: 17,
    fontWeight: "700",
  },
  disclaimer: {
    fontSize: 12,
    textAlign: "center",
  },
});
