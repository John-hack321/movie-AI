import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MovieResultCard } from "@/components/MovieResultCard";
import { PulsingRing } from "@/components/PulsingRing";
import { useAuth } from "@/context/AuthContext";
import { useMovieContext } from "@/context/MovieContext";
import { useColors } from "@/hooks/useColors";
import { identifyMovieFromText, identifyMovieFromUrl } from "@/services/identify";
import { saveMovieToHistory } from "@/services/appwrite";

const TIKTOK_REGEX = /https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)\/\S+/i;
const VIDEO_URL_REGEX = /https?:\/\/\S+\.(mp4|mov|avi|webm|m3u8)(\?[^\s]*)?/i;
const ANY_URL_REGEX = /https?:\/\/\S+/i;

export default function ScannerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { currentResult, setCurrentResult, addToHistory, isIdentifying, setIsIdentifying } =
    useMovieContext();

  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<"idle" | "scanning" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [clipboardHint, setClipboardHint] = useState<string | null>(null);

  const spinValue = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef<Animated.CompositeAnimation | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const startSpin = useCallback(() => {
    spinValue.setValue(0);
    spinAnim.current = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinAnim.current.start();
  }, [spinValue]);

  const stopSpin = useCallback(() => {
    spinAnim.current?.stop();
    spinValue.setValue(0);
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Check clipboard for TikTok URLs when app comes to foreground
  const checkClipboard = useCallback(async () => {
    if (Platform.OS === "web") return;
    try {
      const text = await Clipboard.getStringAsync();
      if (text && (TIKTOK_REGEX.test(text) || ANY_URL_REGEX.test(text))) {
        setClipboardHint(text.length > 60 ? text.slice(0, 57) + "..." : text);
      } else {
        setClipboardHint(null);
      }
    } catch {}
  }, []);

  useEffect(() => {
    checkClipboard();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") checkClipboard();
    });
    return () => sub.remove();
  }, [checkClipboard]);

  const handleIdentify = useCallback(
    async (input: string) => {
      const text = input.trim();
      if (!text) return;

      Keyboard.dismiss();
      setMode("scanning");
      setIsIdentifying(true);
      setCurrentResult(null);
      setErrorMsg("");
      startSpin();

      try {
        let result;
        if (TIKTOK_REGEX.test(text) || ANY_URL_REGEX.test(text)) {
          result = await identifyMovieFromUrl(text);
        } else {
          result = await identifyMovieFromText(text);
        }

        stopSpin();
        setMode("idle");
        setCurrentResult(result);
        addToHistory(result);
        if (user) {
          saveMovieToHistory(user.id, result);
        }
        setInputText("");
        setClipboardHint(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (err) {
        stopSpin();
        setMode("error");
        const msg = err instanceof Error ? err.message : "Identification failed";
        setErrorMsg(msg);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsIdentifying(false);
      }
    },
    [user, addToHistory, startSpin, stopSpin, setCurrentResult, setIsIdentifying]
  );

  const handlePasteClipboard = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (clipboardHint) {
      const text = await Clipboard.getStringAsync();
      handleIdentify(text);
    }
  };

  const isScanning = mode === "scanning";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {currentResult && (
        <MovieResultCard
          movie={currentResult}
          onDismiss={() => setCurrentResult(null)}
        />
      )}

      <LinearGradient
        colors={["#0C0C0F", "#141420", "#0C0C0F"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Center visualization */}
      <View style={styles.centerArea}>
        <View style={styles.ringWrapper}>
          <PulsingRing size={220} active={isScanning} />
          <Animated.View
            style={[
              styles.mainButton,
              {
                backgroundColor: isScanning ? colors.secondary : colors.primary,
                borderColor: isScanning ? colors.border : "transparent",
                transform: isScanning ? [{ rotate: spin }] : [],
              },
            ]}
          >
            {isScanning ? (
              <ActivityIndicator color={colors.primary} size="large" />
            ) : (
              <Feather
                name="film"
                size={44}
                color={colors.primaryForeground}
              />
            )}
          </Animated.View>
        </View>

        <Text
          style={[
            styles.stateLabel,
            { color: isScanning ? colors.primary : colors.foreground },
          ]}
        >
          {isScanning
            ? "Identifying..."
            : mode === "error"
              ? "Try Again"
              : "Identify a Movie"}
        </Text>

        {mode === "error" && errorMsg ? (
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            {errorMsg}
          </Text>
        ) : (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {isScanning
              ? "AI is analyzing your video"
              : "Paste a TikTok link or describe the movie scene below"}
          </Text>
        )}

        {/* Clipboard hint banner */}
        {clipboardHint && !isScanning && (
          <Pressable
            onPress={handlePasteClipboard}
            style={({ pressed }) => [
              styles.clipboardBanner,
              {
                backgroundColor: colors.secondary,
                borderColor: colors.primary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="link" size={14} color={colors.primary} />
            <Text
              style={[styles.clipboardText, { color: colors.foreground }]}
              numberOfLines={1}
            >
              Use copied link
            </Text>
            <Text
              style={[styles.clipboardUrl, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {clipboardHint}
            </Text>
            <Feather name="arrow-right" size={14} color={colors.primary} />
          </Pressable>
        )}
      </View>

      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={[styles.inputArea, { paddingBottom: bottomPad }]}
      >
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Paste TikTok link or describe the scene..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            multiline={false}
            returnKeyType="go"
            onSubmitEditing={() => handleIdentify(inputText)}
            editable={!isScanning}
          />
          {inputText.length > 0 && (
            <Pressable onPress={() => handleIdentify(inputText)} hitSlop={8}>
              <View
                style={[
                  styles.sendBtn,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Feather
                  name="arrow-right"
                  size={16}
                  color={colors.primaryForeground}
                />
              </View>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 16,
  },
  ringWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  mainButton: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E8A020",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  stateLabel: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  clipboardBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    width: "100%",
  },
  clipboardText: {
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 0,
  },
  clipboardUrl: {
    fontSize: 12,
    flex: 1,
  },
  inputArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
