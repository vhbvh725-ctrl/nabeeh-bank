import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(dotsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  return (
    <LinearGradient
      colors={['#080d18', '#0d1830', '#080d18']}
      style={[
        styles.container,
        { paddingTop: Platform.OS === 'web' ? 67 : insets.top },
      ]}
    >
      {/* Ambient circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      {/* Logo */}
      <Animated.View
        style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        <LinearGradient
          colors={['#d4a843', '#8b6914', '#c9a84c']}
          style={styles.logoBox}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.logoLetter}>N</Text>
        </LinearGradient>
        {/* Glow ring */}
        <View style={styles.glowRing} />
      </Animated.View>

      <Animated.Text style={[styles.bankName, { opacity: textOpacity }]}>
        NABEEH BANK
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        The bank that understands your future.
      </Animated.Text>

      <Animated.View
        style={[
          styles.dotsRow,
          { opacity: dotsOpacity, marginBottom: Platform.OS === 'web' ? 34 : insets.bottom + 20 },
        ]}
      >
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle1: {
    position: 'absolute',
    top: '10%',
    left: '-25%',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(201,168,76,0.05)',
  },
  circle2: {
    position: 'absolute',
    bottom: '15%',
    right: '-30%',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(201,168,76,0.04)',
  },
  circle3: {
    position: 'absolute',
    top: '35%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(30,45,64,0.5)',
  },
  logoWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
  },
  logoLetter: {
    fontSize: 52,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  bankName: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#f1f5f9',
    letterSpacing: 4.5,
    marginBottom: 14,
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(201,168,76,0.82)',
    letterSpacing: 0.4,
    textAlign: 'center',
    paddingHorizontal: 48,
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 64,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(201,168,76,0.3)',
  },
  dotActive: {
    backgroundColor: '#c9a84c',
    width: 22,
    borderRadius: 3,
  },
});
