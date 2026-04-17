import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useMovieContext } from "@/context/MovieContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { history, clearHistory } = useMovieContext();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          signOut();
        },
      },
    ]);
  };

  const handleClearHistory = () => {
    Alert.alert("Clear History", "This will delete all identified movies.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          clearHistory();
        },
      },
    ]);
  };

  const SettingRow = ({
    icon,
    label,
    sublabel,
    onPress,
    destructive,
    chevron = true,
  }: {
    icon: string;
    label: string;
    sublabel?: string;
    onPress?: () => void;
    destructive?: boolean;
    chevron?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.settingIcon,
          {
            backgroundColor: destructive
              ? colors.destructive + "20"
              : colors.secondary,
          },
        ]}
      >
        <Feather
          name={icon as never}
          size={18}
          color={destructive ? colors.destructive : colors.primary}
        />
      </View>
      <View style={styles.settingInfo}>
        <Text
          style={[
            styles.settingLabel,
            { color: destructive ? colors.destructive : colors.foreground },
          ]}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text style={[styles.settingSubLabel, { color: colors.mutedForeground }]}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      {chevron && (
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      )}
    </Pressable>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>

      {/* Profile */}
      {user && (
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {user.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View
              style={[styles.avatar, { backgroundColor: colors.secondary }]}
            >
              <Feather name="user" size={24} color={colors.primary} />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>
              {user.name}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
              {user.email}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              Google
            </Text>
          </View>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {history.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Movies Identified
          </Text>
        </View>
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statNumber, { color: colors.success }]}>
            {history.filter((m) => m.confidence === "high").length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            High Confidence
          </Text>
        </View>
      </View>

      {/* How to Use */}
      <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>
        HOW TO USE
      </Text>
      <View
        style={[
          styles.howToCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {[
          { icon: "copy", step: "1", text: "Copy the TikTok video link" },
          { icon: "smartphone", step: "2", text: "Open CineID — it detects the link automatically" },
          { icon: "film", step: "3", text: "Get the movie name instantly" },
        ].map(({ icon, step, text }) => (
          <View key={step} style={styles.howToRow}>
            <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.stepNum, { color: colors.primaryForeground }]}>
                {step}
              </Text>
            </View>
            <Feather name={icon as never} size={16} color={colors.mutedForeground} />
            <Text style={[styles.howToText, { color: colors.foreground }]}>
              {text}
            </Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>
        DATA
      </Text>
      <View style={styles.settingsGroup}>
        <SettingRow
          icon="trash-2"
          label="Clear History"
          sublabel={`${history.length} movies stored locally`}
          onPress={handleClearHistory}
          destructive
        />
      </View>

      <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>
        ACCOUNT
      </Text>
      <View style={styles.settingsGroup}>
        <SettingRow
          icon="log-out"
          label="Sign Out"
          onPress={handleSignOut}
          destructive
          chevron={false}
        />
      </View>

      <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
        CineID v1.0.0 · Powered by GPT-4o
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: 4,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: 16, fontWeight: "700" },
  profileEmail: { fontSize: 13 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 4,
    alignItems: "center",
  },
  statNumber: { fontSize: 28, fontWeight: "800" },
  statLabel: { fontSize: 12, fontWeight: "500", textAlign: "center" },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: -4,
  },
  howToCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  howToRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { fontSize: 12, fontWeight: "800" },
  howToText: { flex: 1, fontSize: 14, lineHeight: 20 },
  settingsGroup: { gap: 8 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  settingInfo: { flex: 1, gap: 2 },
  settingLabel: { fontSize: 15, fontWeight: "600" },
  settingSubLabel: { fontSize: 12 },
  versionText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 8,
  },
});
