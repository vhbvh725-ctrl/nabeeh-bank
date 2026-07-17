import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColors } from '@/hooks/useColors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  noPadding?: boolean;
}

export function GlassCard({ children, style, intensity = 18, noPadding = false }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.wrapper,
        { borderRadius: colors.radius, borderColor: colors.border },
        !noPadding && styles.padding,
        style,
      ]}
    >
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.overlay, { borderRadius: colors.radius }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  padding: {
    padding: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 22, 41, 0.72)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
