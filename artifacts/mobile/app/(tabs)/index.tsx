import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useBank, AIInsight, Transaction } from '@/context/BankContext';
import { BankCard3D } from '@/components/BankCard3D';
import { GlassCard } from '@/components/GlassCard';

const INSIGHT_COLORS = {
  saving: '#10b981',
  prediction: '#3b82f6',
  subscription: '#f59e0b',
  fraud: '#ef4444',
} as const;

const INSIGHT_ICONS = {
  saving: 'trending-up',
  prediction: 'bar-chart-2',
  subscription: 'refresh-cw',
  fraud: 'alert-triangle',
} as const;

function InsightCard({ insight }: { insight: AIInsight }) {
  const colors = useColors();
  const color = INSIGHT_COLORS[insight.type];
  const icon = INSIGHT_ICONS[insight.type];

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (insight.type === 'fraud') router.push('/fraud-alert');
  }

  return (
    <TouchableOpacity
      style={[styles.insightCard, { backgroundColor: colors.card, borderColor: color + '40' }]}
      onPress={handlePress}
      activeOpacity={0.82}
    >
      <View style={[styles.insightIconBox, { backgroundColor: color + '20' }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <Text style={[styles.insightTitle, { color: colors.foreground }]}>{insight.title}</Text>
      <Text style={[styles.insightMsg, { color: colors.mutedForeground }]} numberOfLines={2}>
        {insight.message}
      </Text>
      {insight.actionLabel && (
        <View style={[styles.insightChip, { backgroundColor: color + '18', borderColor: color + '50' }]}>
          <Text style={[styles.insightChipText, { color }]}>{insight.actionLabel}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  const colors = useColors();
  const isCredit = tx.type === 'credit';
  return (
    <View style={[styles.txRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.txIconBox, { backgroundColor: colors.accent }]}>
        <Feather name={tx.icon as any} size={15} color={colors.mutedForeground} />
      </View>
      <View style={styles.txInfo}>
        <Text style={[styles.txTitle, { color: colors.foreground }]}>{tx.title}</Text>
        <Text style={[styles.txSub, { color: colors.mutedForeground }]}>
          {tx.subtitle} · {tx.date}
        </Text>
      </View>
      <Text style={[styles.txAmount, { color: isCredit ? colors.success : colors.foreground }]}>
        {isCredit ? '+' : '-'}{tx.amount.toLocaleString()} SAR
      </Text>
    </View>
  );
}

function QuickActionBtn({ icon, label }: { icon: string; label: string }) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={styles.qa}
      activeOpacity={0.75}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[styles.qaIcon, { backgroundColor: colors.accent }]}>
        <Feather name={icon as any} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.qaLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const {
    balance, cardNumber, savingsGoalPercent, healthScore,
    daysToSalary, transactions, insights, isCardFrozen,
  } = useBank();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const firstName = user?.name?.split(' ')[0] ?? 'Ahmed';
  const recentTxs = transactions.slice(0, 3);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: Platform.OS === 'web' ? 67 + 16 : insets.top + 16,
            paddingBottom: Platform.OS === 'web' ? 34 + 90 : insets.bottom + 90,
          },
        ]}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* === Header === */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good morning,</Text>
              <Text style={[styles.userName, { color: colors.foreground }]}>{firstName}</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.healthPill, { backgroundColor: '#10b98120', borderColor: '#10b98145' }]}>
                <View style={[styles.healthDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.healthScore, { color: colors.success }]}>{healthScore}%</Text>
                <Text style={[styles.healthLabel, { color: colors.success }]}>Health</Text>
              </View>
              <TouchableOpacity
                style={[styles.notifBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Feather name="bell" size={18} color={colors.foreground} />
                <View style={[styles.notifDot, { backgroundColor: colors.primary }]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* === Balance === */}
          <View style={styles.balanceSection}>
            <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>Total Balance</Text>
            <Text style={[styles.balanceAmount, { color: colors.foreground }]}>
              {balance.toLocaleString()}{' '}
              <Text style={[styles.balanceCurrency, { color: colors.mutedForeground }]}>SAR</Text>
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Feather name="target" size={13} color={colors.primary} />
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Goal</Text>
                <Text style={[styles.statVal, { color: colors.foreground }]}>{savingsGoalPercent}%</Text>
              </View>
              <View style={[styles.statSep, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Feather name="clock" size={13} color={colors.primary} />
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Salary in</Text>
                <Text style={[styles.statVal, { color: colors.foreground }]}>{daysToSalary}d</Text>
              </View>
              <View style={[styles.statSep, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Feather name="trending-up" size={13} color={colors.primary} />
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>This month</Text>
                <Text style={[styles.statVal, { color: colors.success }]}>+18%</Text>
              </View>
            </View>
          </View>

          {/* === 3D Bank Card === */}
          <BankCard3D
            cardNumber={cardNumber}
            holderName={user?.name ?? 'Ahmed Al-Rashidi'}
            isFrozen={isCardFrozen}
          />

          {/* === Quick Actions === */}
          <View style={[styles.qActions, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <QuickActionBtn icon="send" label="Send" />
            <QuickActionBtn icon="download" label="Receive" />
            <QuickActionBtn icon="credit-card" label="Pay" />
            <QuickActionBtn icon="trending-up" label="Invest" />
          </View>

          {/* === AI Insights === */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Nabeh AI Insights</Text>
              <View style={styles.aiBadge}>
                <Feather name="zap" size={12} color={colors.primary} />
                <Text style={[styles.aiBadgeText, { color: colors.primary }]}>Live</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.insightsScroll}
            >
              {insights.map(ins => (
                <InsightCard key={ins.id} insight={ins} />
              ))}
            </ScrollView>
          </View>

          {/* === Cash Flow Mini Chart === */}
          <GlassCard style={styles.cashFlowCard} noPadding>
            <View style={styles.cashFlowInner}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Cash Flow</Text>
                <Text style={[styles.cashFlowPeriod, { color: colors.mutedForeground }]}>July 2026</Text>
              </View>
              <View style={styles.bars}>
                {[
                  { week: 'W1', income: 12000, expense: 800 },
                  { week: 'W2', income: 0, expense: 1450 },
                  { week: 'W3', income: 3200, expense: 960 },
                  { week: 'W4', income: 0, expense: 512 },
                ].map(w => (
                  <View key={w.week} style={styles.barGroup}>
                    <View style={styles.barPair}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(6, (w.income / 12000) * 70),
                            backgroundColor: '#10b981',
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(6, (w.expense / 12000) * 70),
                            backgroundColor: '#ef4444',
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{w.week}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.barLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                  <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Income</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                  <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Expenses</Text>
                </View>
              </View>
            </View>
          </GlassCard>

          {/* === Recent Transactions === */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/cards')} activeOpacity={0.7}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.txContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {recentTxs.map(tx => (
                <TxRow key={tx.id} tx={tx} />
              ))}
            </View>
          </View>

          {/* === Savings Goal === */}
          <GlassCard>
            <View style={styles.goalTop}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Car Fund Goal</Text>
                <Text style={[styles.goalSub, { color: colors.mutedForeground }]}>
                  Target: 18,000 SAR
                </Text>
              </View>
              <Text style={[styles.goalPct, { color: colors.primary }]}>{savingsGoalPercent}%</Text>
            </View>
            <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
              <LinearGradient
                colors={['#d4a843', '#8b6914']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${savingsGoalPercent}%` as any }]}
              />
            </View>
            <Text style={[styles.goalAmount, { color: colors.mutedForeground }]}>
              12,240 SAR saved of 18,000 SAR
            </Text>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  userName: { fontSize: 23, fontFamily: 'Inter_700Bold', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  healthPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1,
  },
  healthDot: { width: 6, height: 6, borderRadius: 3 },
  healthScore: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  healthLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  notifBtn: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 7, height: 7, borderRadius: 3.5,
  },
  balanceSection: { gap: 6 },
  balanceLabel: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  balanceAmount: { fontSize: 38, fontFamily: 'Inter_700Bold', lineHeight: 46 },
  balanceCurrency: { fontSize: 18, fontFamily: 'Inter_400Regular' },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  statSep: { width: 1, height: 14, marginHorizontal: 8 },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  statVal: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  qActions: {
    flexDirection: 'row', justifyContent: 'space-around',
    borderRadius: 20, paddingVertical: 18, borderWidth: 1,
  },
  qa: { alignItems: 'center', gap: 8 },
  qaIcon: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  seeAll: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  insightsScroll: { gap: 12, paddingRight: 4 },
  insightCard: {
    width: 178, borderRadius: 16, padding: 16,
    gap: 8, borderWidth: 1,
  },
  insightIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  insightTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', lineHeight: 18 },
  insightMsg: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17, flex: 1 },
  insightChip: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, alignSelf: 'flex-start', marginTop: 2,
  },
  insightChipText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  cashFlowCard: {},
  cashFlowInner: { padding: 20, gap: 16 },
  cashFlowPeriod: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  bars: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 90 },
  barGroup: { alignItems: 'center', gap: 6 },
  barPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 14, borderRadius: 4 },
  barLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  barLegend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  txContainer: { borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  txRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    gap: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txIconBox: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  txSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  txAmount: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  goalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  goalSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 },
  goalPct: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  progressBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: 8, borderRadius: 4 },
  goalAmount: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
