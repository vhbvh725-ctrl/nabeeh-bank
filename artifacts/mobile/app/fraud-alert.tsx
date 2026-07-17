import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useBank } from '@/context/BankContext';

type Stage = 'alert' | 'confirm' | 'processing' | 'done';

const STEPS = [
  { id: 1, label: 'Freezing your card', done: 'Card frozen successfully', icon: 'lock' },
  { id: 2, label: 'Creating fraud report', done: 'Fraud report created', icon: 'file-text' },
  { id: 3, label: 'Notifying bank branch', done: 'Branch notified', icon: 'phone' },
  { id: 4, label: 'Requesting replacement card', done: 'Replacement card requested', icon: 'credit-card' },
];

function ProcessStep({
  step,
  status,
}: {
  step: (typeof STEPS)[number];
  status: 'pending' | 'active' | 'done';
}) {
  const colors = useColors();
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'active') {
      Animated.loop(
        Animated.timing(spin, { toValue: 1, duration: 900, useNativeDriver: true })
      ).start();
    } else {
      spin.setValue(0);
    }
  }, [status]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.step}>
      <View
        style={[
          styles.stepIcon,
          {
            backgroundColor:
              status === 'done'
                ? '#10b98120'
                : status === 'active'
                ? '#c9a84c20'
                : colors.accent,
            borderColor:
              status === 'done'
                ? '#10b981'
                : status === 'active'
                ? '#c9a84c'
                : colors.border,
          },
        ]}
      >
        {status === 'active' ? (
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Feather name="loader" size={18} color="#c9a84c" />
          </Animated.View>
        ) : (
          <Feather
            name={status === 'done' ? 'check' : (step.icon as any)}
            size={18}
            color={status === 'done' ? '#10b981' : colors.mutedForeground}
          />
        )}
      </View>
      <View style={styles.stepInfo}>
        <Text
          style={[
            styles.stepLabel,
            {
              color:
                status === 'done'
                  ? colors.success
                  : status === 'active'
                  ? colors.primary
                  : colors.mutedForeground,
            },
          ]}
        >
          {status === 'done' ? step.done : step.label}
        </Text>
      </View>
    </View>
  );
}

export default function FraudAlertScreen() {
  const colors = useColors();
  const { freezeCard } = useBank();
  const insets = useSafeAreaInsets();
  const [stage, setStage] = useState<Stage>('alert');
  const [activeStep, setActiveStep] = useState(-1);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  async function handleNo() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
    setStage('confirm');
  }

  async function handleConfirmFraud() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setStage('processing');
    freezeCard();

    for (let i = 0; i < STEPS.length; i++) {
      setActiveStep(i);
      await new Promise(r => setTimeout(r, 1600));
      setDoneSteps(prev => [...prev, i]);
      setActiveStep(-1);
      await new Promise(r => setTimeout(r, 300));
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStage('done');
  }

  const paddingTop = Platform.OS === 'web' ? 67 + 24 : insets.top + 24;
  const paddingBottom = Platform.OS === 'web' ? 34 + 24 : insets.bottom + 24;

  return (
    <LinearGradient
      colors={['#0d0a0a', '#1a0a0a', '#0d0a0a']}
      style={[styles.container, { paddingTop, paddingBottom }]}
    >
      {/* Close button */}
      {(stage === 'alert' || stage === 'done') && (
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Feather name="x" size={20} color="#fff" />
        </TouchableOpacity>
      )}

      {/* =============== ALERT =============== */}
      {stage === 'alert' && (
        <Animated.View
          style={[styles.content, { transform: [{ translateX: shakeAnim }] }]}
        >
          {/* Warning icon */}
          <Animated.View style={[styles.alertIconWrap, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.alertRing1} />
            <View style={styles.alertRing2} />
            <View style={styles.alertIconBox}>
              <Feather name="alert-triangle" size={36} color="#ef4444" />
            </View>
          </Animated.View>

          <Text style={styles.alertTitle}>Suspicious Activity</Text>
          <Text style={styles.alertSubtitle}>Detected on your account</Text>

          {/* Transaction details */}
          <View style={[styles.txDetail, { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }]}>
            <View style={styles.txDetailRow}>
              <Text style={styles.txDetailLabel}>Amount</Text>
              <Text style={styles.txDetailValue}>50,000 SAR</Text>
            </View>
            <View style={styles.txDetailRow}>
              <Text style={styles.txDetailLabel}>Type</Text>
              <Text style={styles.txDetailValue}>Withdrawal</Text>
            </View>
            <View style={styles.txDetailRow}>
              <Text style={styles.txDetailLabel}>Location</Text>
              <Text style={styles.txDetailValue}>Unknown Device</Text>
            </View>
            <View style={styles.txDetailRow}>
              <Text style={styles.txDetailLabel}>Time</Text>
              <Text style={styles.txDetailValue}>Just now</Text>
            </View>
          </View>

          <Text style={styles.alertQuestion}>
            Did you authorize this withdrawal?
          </Text>

          <View style={styles.alertBtns}>
            <TouchableOpacity
              style={[styles.alertBtn, styles.alertBtnYes]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.back();
              }}
              activeOpacity={0.85}
            >
              <Feather name="check" size={20} color="#fff" />
              <Text style={styles.alertBtnYesText}>Yes, That Was Me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.alertBtn, styles.alertBtnNo]}
              onPress={handleNo}
              activeOpacity={0.85}
            >
              <Feather name="x" size={20} color="#ef4444" />
              <Text style={styles.alertBtnNoText}>No, That Was Not Me</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* =============== CONFIRM =============== */}
      {stage === 'confirm' && (
        <View style={styles.content}>
          <View style={[styles.confirmIconBox, { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)' }]}>
            <Feather name="shield-off" size={40} color="#ef4444" />
          </View>

          <Text style={styles.alertTitle}>Are You Sure?</Text>
          <Text style={[styles.confirmDesc, { color: 'rgba(255,255,255,0.65)' }]}>
            Confirming fraud will immediately:{'\n'}
            • Freeze your card{'\n'}
            • Create a fraud report{'\n'}
            • Notify your nearest branch{'\n'}
            • Request a replacement card
          </Text>

          <View style={styles.alertBtns}>
            <TouchableOpacity
              style={[styles.alertBtn, { backgroundColor: '#ef4444' }]}
              onPress={handleConfirmFraud}
              activeOpacity={0.85}
            >
              <Feather name="shield" size={20} color="#fff" />
              <Text style={styles.alertBtnYesText}>Confirm Fraud</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.alertBtn, styles.alertBtnOutline, { borderColor: 'rgba(255,255,255,0.2)' }]}
              onPress={() => setStage('alert')}
              activeOpacity={0.8}
            >
              <Text style={[styles.alertBtnOutlineText, { color: '#fff' }]}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* =============== PROCESSING =============== */}
      {stage === 'processing' && (
        <View style={styles.content}>
          <View style={[styles.processingIconBox, { backgroundColor: 'rgba(201,168,76,0.15)', borderColor: 'rgba(201,168,76,0.4)' }]}>
            <Feather name="shield" size={36} color="#c9a84c" />
          </View>
          <Text style={styles.alertTitle}>Securing Your Account</Text>
          <Text style={[styles.confirmDesc, { color: 'rgba(255,255,255,0.55)' }]}>
            Nabeh AI is taking action to protect you
          </Text>

          <View style={styles.stepsList}>
            {STEPS.map((step, i) => (
              <ProcessStep
                key={step.id}
                step={step}
                status={
                  doneSteps.includes(i)
                    ? 'done'
                    : activeStep === i
                    ? 'active'
                    : 'pending'
                }
              />
            ))}
          </View>
        </View>
      )}

      {/* =============== DONE =============== */}
      {stage === 'done' && (
        <View style={styles.content}>
          <View style={[styles.doneIconBox, { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)' }]}>
            <Feather name="shield" size={40} color="#10b981" />
          </View>

          <Text style={[styles.alertTitle, { color: '#10b981' }]}>Account Secured</Text>
          <Text style={[styles.confirmDesc, { color: 'rgba(255,255,255,0.6)' }]}>
            All protective measures have been taken. Your account is now safe.
          </Text>

          <View style={styles.doneMessages}>
            {[
              'Your card has been temporarily frozen.',
              'Fraud report created successfully.',
              'Your replacement card request has been submitted.',
            ].map(msg => (
              <View key={msg} style={[styles.doneMsg, { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }]}>
                <Feather name="check-circle" size={15} color="#10b981" />
                <Text style={[styles.doneMsgText, { color: 'rgba(255,255,255,0.8)' }]}>{msg}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: '#10b981' }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  closeBtn: {
    position: 'absolute', top: 0, right: 24, zIndex: 10,
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginTop: Platform.OS === 'web' ? 67 + 24 : 0,
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  alertIconWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  alertRing1: {
    position: 'absolute',
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.3)',
  },
  alertRing2: {
    position: 'absolute',
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)',
  },
  alertIconBox: {
    width: 76, height: 76, borderRadius: 24,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 2, borderColor: 'rgba(239,68,68,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 26, fontFamily: 'Inter_700Bold', color: '#f1f5f9',
    textAlign: 'center',
  },
  alertSubtitle: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.5)', marginTop: -16, textAlign: 'center',
  },
  txDetail: {
    width: '100%', borderRadius: 16, borderWidth: 1, padding: 20, gap: 12,
  },
  txDetailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  txDetailLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.5)' },
  txDetailValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#f1f5f9' },
  alertQuestion: {
    fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#f1f5f9',
    textAlign: 'center',
  },
  alertBtns: { width: '100%', gap: 12 },
  alertBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 16, paddingVertical: 16,
  },
  alertBtnYes: { backgroundColor: 'rgba(255,255,255,0.12)' },
  alertBtnYesText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' },
  alertBtnNo: {
    borderWidth: 2, borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  alertBtnNoText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#ef4444' },
  alertBtnOutline: { borderWidth: 1.5 },
  alertBtnOutlineText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  confirmIconBox: {
    width: 80, height: 80, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  confirmDesc: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    lineHeight: 22, textAlign: 'center',
  },
  processingIconBox: {
    width: 76, height: 76, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  stepsList: { width: '100%', gap: 16 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
  },
  stepInfo: { flex: 1 },
  stepLabel: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  doneIconBox: {
    width: 82, height: 82, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  doneMessages: { width: '100%', gap: 10 },
  doneMsg: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, borderWidth: 1, padding: 14,
  },
  doneMsgText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  doneBtn: { width: '100%', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  doneBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' },
});
