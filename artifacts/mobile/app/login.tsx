import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Platform, Animated, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';

export default function LoginScreen() {
  const colors = useColors();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('ahmed@nabeeh.sa');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const btnScale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  async function handleLogin() {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email address.');
      return;
    }
    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await login(email, password);
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#080d18', '#0d1830', '#080d18']} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: Platform.OS === 'web' ? 67 + 20 : insets.top + 20,
            paddingBottom: Platform.OS === 'web' ? 34 + 20 : insets.bottom + 20,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo row */}
        <View style={styles.logoRow}>
          <LinearGradient colors={['#d4a843', '#8b6914']} style={styles.logoBox}>
            <Text style={styles.logoLetter}>N</Text>
          </LinearGradient>
          <View>
            <Text style={styles.bankName}>NABEEH BANK</Text>
            <Text style={[styles.bankTagline, { color: colors.mutedForeground }]}>
              Intelligent Banking
            </Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Welcome Back</Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>
          Sign in to your account
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <View style={[styles.field, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="mail" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Email address"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={[styles.field, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="lock" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(s => !s)}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Remember + Forgot */}
          <View style={styles.rememberRow}>
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => setRememberMe(r => !r)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: colors.primary,
                    backgroundColor: rememberMe ? colors.primary : 'transparent',
                  },
                ]}
              >
                {rememberMe && <Feather name="check" size={11} color="#080d18" />}
              </View>
              <Text style={[styles.rememberText, { color: colors.mutedForeground }]}>
                Remember me
              </Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login btn */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              onPressIn={pressIn}
              onPressOut={pressOut}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={1}
            >
              <LinearGradient
                colors={['#d4a843', '#8b6914']}
                style={styles.loginBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginBtnText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.orText, { color: colors.mutedForeground }]}>or</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          {/* Biometric */}
          <TouchableOpacity
            style={[styles.biometricBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            activeOpacity={0.8}
          >
            <Feather name="shield" size={20} color={colors.primary} />
            <Text style={[styles.biometricText, { color: colors.foreground }]}>
              Use Face ID / Biometrics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={[styles.noAccText, { color: colors.mutedForeground }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 52 },
  logoBox: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff' },
  bankName: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#f1f5f9', letterSpacing: 2.5 },
  bankTagline: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  title: { fontSize: 30, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  desc: { fontSize: 15, fontFamily: 'Inter_400Regular', marginBottom: 36 },
  form: { gap: 14 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 12,
  },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  rememberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  forgotText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  loginBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  loginBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: 0.5 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  divider: { flex: 1, height: 1 },
  orText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 15,
  },
  biometricText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 36 },
  noAccText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  registerLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
