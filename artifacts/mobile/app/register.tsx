import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';

type Step = 'info' | 'signature';

export default function RegisterScreen() {
  const colors = useColors();
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('info');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);

  async function handleNext() {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please fill in all fields to continue.');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep('signature');
  }

  async function handleCreate() {
    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await register(fullName, email, phone, password);
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Could not create account. Please try again.');
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
            paddingTop: Platform.OS === 'web' ? 67 + 16 : insets.top + 16,
            paddingBottom: Platform.OS === 'web' ? 34 + 20 : insets.bottom + 20,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => (step === 'signature' ? setStep('info') : router.back())}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={22} color="#f1f5f9" />
          </TouchableOpacity>
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, { backgroundColor: '#c9a84c' }]} />
            <View style={[styles.stepLine, { backgroundColor: step === 'signature' ? '#c9a84c' : colors.border }]} />
            <View style={[styles.stepDot, { backgroundColor: step === 'signature' ? '#c9a84c' : colors.border }]} />
          </View>
        </View>

        {step === 'info' ? (
          <>
            <Text style={[styles.title, { color: colors.foreground }]}>Create Account</Text>
            <Text style={[styles.desc, { color: colors.mutedForeground }]}>
              Join Nabeeh Bank — your intelligent financial companion.
            </Text>

            <View style={styles.form}>
              {[
                { icon: 'user', placeholder: 'Full Name', value: fullName, setter: setFullName, cap: 'words' as const },
                { icon: 'mail', placeholder: 'Email address', value: email, setter: setEmail, cap: 'none' as const, keyboard: 'email-address' as const },
                { icon: 'phone', placeholder: 'Phone number', value: phone, setter: setPhone, keyboard: 'phone-pad' as const },
              ].map(f => (
                <View key={f.placeholder} style={[styles.field, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Feather name={f.icon as any} size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.mutedForeground}
                    value={f.value}
                    onChangeText={f.setter}
                    autoCapitalize={f.cap ?? 'none'}
                    keyboardType={f.keyboard ?? 'default'}
                    autoCorrect={false}
                  />
                </View>
              ))}

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

              <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
                <LinearGradient colors={['#d4a843', '#8b6914']} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.btnText}>Continue</Text>
                  <Feather name="arrow-right" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: colors.foreground }]}>Digital Signature</Text>
            <Text style={[styles.desc, { color: colors.mutedForeground }]}>
              Set up your secure digital signature for electronic contracts and documents.
            </Text>

            {/* Signature box */}
            <TouchableOpacity
              style={[
                styles.sigBox,
                {
                  backgroundColor: colors.card,
                  borderColor: signatureSaved ? '#c9a84c' : colors.border,
                },
              ]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSignatureSaved(true);
              }}
              activeOpacity={0.85}
            >
              {signatureSaved ? (
                <View style={styles.sigSuccess}>
                  <View style={styles.sigSuccessIcon}>
                    <Feather name="check" size={28} color="#c9a84c" />
                  </View>
                  <Text style={[styles.sigSuccessTitle, { color: colors.foreground }]}>
                    Signature Saved
                  </Text>
                  <Text style={[styles.sigSuccessDesc, { color: colors.mutedForeground }]}>
                    Your digital signature has been uploaded successfully.{'\n'}
                    It will be used for secure electronic contracts.
                  </Text>
                </View>
              ) : (
                <View style={styles.sigPlaceholder}>
                  <Feather name="edit-3" size={36} color={colors.mutedForeground} />
                  <Text style={[styles.sigPlaceholderText, { color: colors.mutedForeground }]}>
                    Tap to draw signature
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCreate} disabled={loading} activeOpacity={0.85} style={{ marginTop: 8 }}>
              <LinearGradient colors={['#d4a843', '#8b6914']} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>
                    {signatureSaved ? 'Create Account' : 'Skip for Now'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.loginRow}>
          <Text style={[styles.noAccText, { color: colors.mutedForeground }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.7}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 },
  backBtn: { padding: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 10, height: 10, borderRadius: 5 },
  stepLine: { width: 44, height: 2, marginHorizontal: 4 },
  title: { fontSize: 30, fontFamily: 'Inter_700Bold', marginBottom: 10 },
  desc: { fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 32, lineHeight: 22 },
  form: { gap: 14 },
  field: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 15, gap: 12,
  },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  btnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: 0.5 },
  sigBox: {
    borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed',
    height: 190, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  sigPlaceholder: { alignItems: 'center', gap: 12 },
  sigPlaceholderText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  sigSuccess: { alignItems: 'center', gap: 12, paddingHorizontal: 28 },
  sigSuccessIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(201,168,76,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#c9a84c',
  },
  sigSuccessTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  sigSuccessDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 36 },
  noAccText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  loginLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
