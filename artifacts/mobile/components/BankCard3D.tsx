import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

interface Props {
  cardNumber: string;
  holderName: string;
  isFrozen?: boolean;
}

export function BankCard3D({ cardNumber, holderName, isFrozen = false }: Props) {
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
      },
      onPanResponderMove: (_, gesture) => {
        rotateX.setValue(-(gesture.dy / 150) * 10);
        rotateY.setValue((gesture.dx / 300) * 10);
      },
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(rotateX, { toValue: 0, useNativeDriver: true }),
          Animated.spring(rotateY, { toValue: 0, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        ]).start();
      },
    })
  ).current;

  const animStyle =
    Platform.OS !== 'web'
      ? {
          transform: [
            { perspective: 900 },
            {
              rotateX: rotateX.interpolate({
                inputRange: [-20, 20],
                outputRange: ['-20deg', '20deg'],
              }),
            },
            {
              rotateY: rotateY.interpolate({
                inputRange: [-20, 20],
                outputRange: ['-20deg', '20deg'],
              }),
            },
            { scale },
          ],
        }
      : { transform: [{ scale }] };

  const gradColors = isFrozen
    ? (['#1e2d40', '#0f1629', '#1a2332'] as const)
    : (['#d4a843', '#8b6914', '#c9a84c'] as const);

  return (
    <Animated.View {...panResponder.panHandlers} style={[styles.container, animStyle]}>
      <LinearGradient
        colors={gradColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decorative circles */}
        <View style={styles.circleSmall} />
        <View style={styles.circleLarge} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.bankName}>NABEEH BANK</Text>
          {isFrozen ? (
            <View style={styles.frozenBadge}>
              <Feather name="lock" size={10} color="#fff" />
              <Text style={styles.frozenText}>FROZEN</Text>
            </View>
          ) : (
            <Text style={styles.networkLabel}>VISA</Text>
          )}
        </View>

        {/* Chip + NFC */}
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <View style={styles.chipInner} />
            <View style={[styles.chipInner, { marginTop: 3 }]} />
          </View>
          <Feather
            name="wifi"
            size={20}
            color="rgba(255,255,255,0.45)"
            style={{ transform: [{ rotate: '90deg' }] }}
          />
        </View>

        {/* Card number */}
        <Text style={styles.cardNumber}>{cardNumber}</Text>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.label}>CARD HOLDER</Text>
            <Text style={styles.value}>{holderName}</Text>
          </View>
          <View>
            <Text style={styles.label}>EXPIRES</Text>
            <Text style={styles.value}>12/28</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    shadowColor: '#c9a84c',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  card: {
    width: '100%',
    height: 200,
    borderRadius: 22,
    padding: 24,
    overflow: 'hidden',
  },
  circleSmall: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  circleLarge: {
    position: 'absolute',
    right: -70,
    bottom: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankName: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2.5,
  },
  networkLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  frozenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  frozenText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  chip: {
    width: 40,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: 6,
    justifyContent: 'center',
  },
  chipInner: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 1,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 3,
    marginTop: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 1.2,
  },
  value: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 3,
  },
});
