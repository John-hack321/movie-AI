import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HistoryItem } from "@/components/HistoryItem";
import { useMovieContext } from "@/context/MovieContext";
import { useColors } from "@/hooks/useColors";
import type { MovieResult } from "@/types/movie";

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { history, clearHistory } = useMovieContext();
  const [selected, setSelected] = useState<MovieResult | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const handleClear = () => {
    Alert.alert("Clear History", "Remove all identified movies?", [
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

  const formatDate = (ms: number) => {
    const d = new Date(ms);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 16,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          History
        </Text>
        {history.length > 0 && (
          <Pressable onPress={handleClear} hitSlop={12}>
            <Feather name="trash-2" size={20} color={colors.destructive} />
          </Pressable>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View
            style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}
          >
            <Feather name="clock" size={32} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No movies yet
          </Text>
          <Text
            style={[styles.emptySubtitle, { color: colors.mutedForeground }]}
          >
            Identified movies will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: bottomPad },
          ]}
          renderItem={({ item }) => (
            <HistoryItem movie={item} onPress={() => setSelected(item)} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Detail Modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelected(null)}
      >
        {selected && (
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <View
              style={[
                styles.modalHandle,
                { backgroundColor: colors.border },
              ]}
            />
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  styles.modalIcon,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Feather name="film" size={40} color={colors.primary} />
              </View>

              <Text
                style={[styles.modalTitle, { color: colors.foreground }]}
              >
                {selected.title}
              </Text>

              {selected.year || selected.genre ? (
                <Text
                  style={[styles.modalMeta, { color: colors.mutedForeground }]}
                >
                  {[selected.year, selected.genre].filter(Boolean).join(" · ")}
                </Text>
              ) : null}

              {selected.description ? (
                <Text
                  style={[
                    styles.modalDescription,
                    { color: colors.foreground },
                  ]}
                >
                  {selected.description}
                </Text>
              ) : null}

              <View
                style={[
                  styles.infoRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.infoItem}>
                  <Text
                    style={[styles.infoLabel, { color: colors.mutedForeground }]}
                  >
                    Confidence
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color:
                          selected.confidence === "high"
                            ? colors.success
                            : selected.confidence === "medium"
                              ? colors.primary
                              : colors.destructive,
                      },
                    ]}
                  >
                    {selected.confidence.charAt(0).toUpperCase() +
                      selected.confidence.slice(1)}
                  </Text>
                </View>
                <View
                  style={[styles.infoDivider, { backgroundColor: colors.border }]}
                />
                <View style={styles.infoItem}>
                  <Text
                    style={[styles.infoLabel, { color: colors.mutedForeground }]}
                  >
                    Identified
                  </Text>
                  <Text
                    style={[styles.infoValue, { color: colors.foreground }]}
                  >
                    {formatDate(selected.identifiedAt)}
                  </Text>
                </View>
              </View>

              {selected.sourceUrl ? (
                <View
                  style={[
                    styles.urlBox,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Feather name="link" size={14} color={colors.mutedForeground} />
                  <Text
                    style={[styles.urlText, { color: colors.mutedForeground }]}
                    numberOfLines={2}
                  >
                    {selected.sourceUrl}
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            <Pressable
              onPress={() => setSelected(null)}
              style={({ pressed }) => [
                styles.closeModalBtn,
                {
                  backgroundColor: colors.secondary,
                  opacity: pressed ? 0.7 : 1,
                  marginBottom: insets.bottom + 16,
                },
              ]}
            >
              <Text style={[styles.closeModalText, { color: colors.foreground }]}>
                Done
              </Text>
            </Pressable>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  list: {
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  modalContent: {
    padding: 24,
    alignItems: "center",
    gap: 14,
  },
  modalIcon: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  modalMeta: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    width: "100%",
  },
  infoItem: {
    flex: 1,
    padding: 14,
    gap: 4,
    alignItems: "center",
  },
  infoDivider: {
    width: StyleSheet.hairlineWidth,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  urlBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: "100%",
    alignItems: "flex-start",
  },
  urlText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  closeModalBtn: {
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  closeModalText: {
    fontSize: 17,
    fontWeight: "700",
  },
});
