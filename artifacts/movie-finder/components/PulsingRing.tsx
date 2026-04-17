import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  size?: number;
  color?: string;
  active?: boolean;
}

export function PulsingRing({ size = 200, active = true }: Props) {
  const colors = useColors();
  const color = colors.primary;

  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  const animate = (anim: Animated.Value, delay: number) => {
    return Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
  };

  useEffect(() => {
    if (!active) return;
    const a1 = animate(ring1, 0);
    const a2 = animate(ring2, 600);
    const a3 = animate(ring3, 1200);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
      ring1.setValue(0);
      ring2.setValue(0);
      ring3.setValue(0);
    };
  }, [active]);

  const ringStyle = (anim: Animated.Value) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 2,
    borderColor: color,
    position: "absolute" as const,
    opacity: anim.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0.8, 0.4, 0],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1.4],
        }),
      },
    ],
  });

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
      ]}
    >
      <Animated.View style={ringStyle(ring1)} />
      <Animated.View style={ringStyle(ring2)} />
      <Animated.View style={ringStyle(ring3)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
