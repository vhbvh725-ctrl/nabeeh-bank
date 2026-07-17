import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useBank, Challenge } from '@/context/BankContext';

const DNA_TRAITS = [
  { label: 'Smart Saver', icon: 'trending-up', color: '#10b981', score: 92 },
  { label: 'Low Risk Investor', icon: 'shield', color: '#3b82f6', score: 78 },
  { label: 'Budget Master', icon: 'bar-chart-2', color: '#c9a84c', score: 88 },
  { label: 'Bill Payer', icon: 'check-circle', color: '#8b5cf6', score: 95 },
];

function DnaTrait({ label, icon, color, score }: { label: string; icon: string; color: string; score: number }) {
  const colors = useColors();
  return (
    <View style={[styles.dnaRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.dnaIcon, { backgroundColor: color + '20' }]}>
        <Feather name={icon as any} size={16} color={color} />
      </View>
      <Text style={[styles.dnaLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={styles.dnaRight}>
        <View style={[styles.dnaBarBg, { backgroundColor: colors.border }]}>
          <View style={[styles.dnaBarFill, { width: `${score}%` as any, backgroundColor: color }]} />
        </View>
        <Text style={[styles.dnaScore, { color }]}>{score}</Text>
      </View>
    </View>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const colors = useColors();
  const pct = Math.round((challenge.current / challenge.target) * 100);
  return (
    <View style={[styles.challengeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.challengeTop}>
        <View style={[styles.challengeIcon, { backgroundColor: '#c9a84c20' }]}>
          <Feather name="award" size={16} color={colors.primary} />
        </View>
        <View style={styles.challengeInfo}>
          <Text style={[styles.challengeTitle, { color: colors.foreground }]}>{challenge.title}</Text>
          <Text style={[styles.challengeReward, { color: colors.primary }]}>{challenge.reward}</Text>
        </View>
        <View style={[styles.daysLeft, { backgroundColor: colors.accent }]}>
          <Text style={[styles.daysLeftText, { color: colors.mutedForeground }]}>{challenge.daysLeft}d</Text>
        </View>
      </View>
      <View style={[styles.challengeBarBg, { backgroundColor: colors.border }]}>
        <LinearGradient
          colors={['#d4a843', '#8b6914']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.challengeBarFill, { width: `${pct}%` as any }]}
        />
      </View>
      <View style={styles.challengeBottom}>
        <Text style={[styles.challengeProgress, { color: colors.mutedForeground }]}>
          {challenge.current} / {challenge.target}
        </Text>
        <Text style={[styles.challengePct, { color: colors.primary }]}>{pct}%</Text>
      </View>
    </View>
  );
}

function SettingRow({ icon, label, color, onPress }: { icon: string; label: string; color?: string; onPress?: () => void }) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.settingIcon, { backgroundColor: (color ?? colors.mutedForeground) + '20' }]}>
        <Feather name={icon as any} size={16} color={color ?? colors.mutedForeground} />
      </View>
      <Text style={[styles.settingLabel, { color: color ?? colors.foreground }]}>{label}</Text>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const { user, logout } = useAuth();
  const { challenges, healthScore } = useBank();
  const insets = useSafeAreaInsets();

  async function handleLogout() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Nabeeh Bank?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  }

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
        {/* Profile header */}
        <LinearGradient
          colors={['#0f1a2e', '#162035']}
          style={styles.profileHeader}
        >
          <View style={styles.avatarWrap}>
            <LinearGradient colors={['#d4a843', '#8b6914']} style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                {user?.name?.charAt(0) ?? 'A'}
              </Text>
            </LinearGradient>
            <View style={[styles.avatarBadge, { backgroundColor: colors.success }]}>
              <Feather name="check" size={9} color="#fff" />
            </View>
          </View>
          <Text style={[styles.profileName, { color: colors.foreground }]}>{user?.name ?? 'Ahmed Al-Rashidi'}</Text>
          <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>{user?.email}</Text>
          <Text style={[styles.profilePhone, { color: colors.mutedForeground }]}>{user?.phone}</Text>

          <View style={styles.verifiedRow}>
            <View style={[styles.verifiedPill, { backgroundColor: '#10b98120', borderColor: '#10b98140' }]}>
              <Feather name="shield" size={12} color={colors.success} />
              <Text style={[styles.verifiedText, { color: colors.success }]}>KYC Verified</Text>
            </View>
            <View style={[styles.verifiedPill, { backgroundColor: '#c9a84c20', borderColor: '#c9a84c40' }]}>
              <Feather name="star" size={12} color={colors.primary} />
              <Text style={[styles.verifiedText, { color: colors.primary }]}>Premium Member</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Financial DNA */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Financial DNA</Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>Your money personality</Text>
            </View>
            <View style={[styles.scoreBadge, { backgroundColor: '#c9a84c20', borderColor: '#c9a84c40' }]}>
              <Text style={[styles.scoreBadgeText, { color: colors.primary }]}>{healthScore}%</Text>
            </View>
          </View>
          {DNA_TRAITS.map(trait => (
            <DnaTrait key={trait.label} {...trait} />
          ))}
          <View style={[styles.dnaTip, { backgroundColor: colors.accent }]}>
            <Feather name="zap" size={14} color={colors.primary} />
            <Text style={[styles.dnaTipText, { color: colors.mutedForeground }]}>
              Reduce restaurant spending by 15% to reach your car goal 3 weeks faster.
            </Text>
          </View>
        </View>

        {/* Investment suggestions */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Investment Radar</Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>AI-spotted opportunities</Text>
          <View style={styles.investList}>
            {[
              { name: 'Gold (XAU)', change: '-8.2%', note: 'Lower than 3-month avg — opportunity', color: '#f59e0b', icon: 'trending-down' },
              { name: 'Index Fund', change: '+9.4%', note: 'Consistent 5-year growth', color: '#10b981', icon: 'trending-up' },
              { name: 'Sukuk Bonds', change: '+3.8%', note: 'Low risk, Shariah-compliant', color: '#3b82f6', icon: 'shield' },
            ].map(inv => (
              <View key={inv.name} style={[styles.investRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.investIcon, { backgroundColor: inv.color + '20' }]}>
                  <Feather name={inv.icon as any} size={15} color={inv.color} />
                </View>
                <View style={styles.investInfo}>
                  <Text style={[styles.investName, { color: colors.foreground }]}>{inv.name}</Text>
                  <Text style={[styles.investNote, { color: colors.mutedForeground }]}>{inv.note}</Text>
                </View>
                <Text style={[styles.investChange, { color: inv.color }]}>{inv.change}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Challenges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Weekly Challenges</Text>
            <View style={[styles.gameBadge, { backgroundColor: '#c9a84c20', borderColor: '#c9a84c40' }]}>
              <Feather name="award" size={12} color={colors.primary} />
              <Text style={[styles.gameBadgeText, { color: colors.primary }]}>3 Active</Text>
            </View>
          </View>
          {challenges.map(ch => (
            <ChallengeCard key={ch.id} challenge={ch} />
          ))}
        </View>

        {/* Settings */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, marginBottom: 4 }]}>Account</Text>
          <SettingRow icon="file-text" label="Digital Contracts" onPress={() => router.push('/contracts')} />
          <SettingRow icon="bell" label="Notifications" />
          <SettingRow icon="shield" label="Security & Privacy" />
          <SettingRow icon="credit-card" label="Payment Methods" />
          <SettingRow icon="help-circle" label="Help & Support" />
          <SettingRow icon="log-out" label="Sign Out" color="#ef4444" onPress={handleLogout} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 18 },
  profileHeader: {
    borderRadius: 20, padding: 24, alignItems: 'center', gap: 6,
  },
  avatarWrap: { position: 'relative', marginBottom: 8 },
  avatar: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#fff' },
  avatarBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  profileName: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  profileEmail: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  profilePhone: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  verifiedRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  verifiedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1,
  },
  verifiedText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  card: { borderRadius: 18, borderWidth: 1, padding: 20, gap: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  cardSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  scoreBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },
  scoreBadgeText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  dnaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dnaIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dnaLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium' },
  dnaRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dnaBarBg: { width: 70, height: 6, borderRadius: 3, overflow: 'hidden' },
  dnaBarFill: { height: 6, borderRadius: 3 },
  dnaScore: { fontSize: 13, fontFamily: 'Inter_700Bold', width: 28, textAlign: 'right' },
  dnaTip: { flexDirection: 'row', gap: 10, borderRadius: 10, padding: 12, alignItems: 'flex-start' },
  dnaTipText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  investList: { gap: 0 },
  investRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  investIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  investInfo: { flex: 1 },
  investName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  investNote: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  investChange: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  gameBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  gameBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  challengeCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  challengeTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  challengeIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  challengeReward: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  daysLeft: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  daysLeftText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  challengeBarBg: { height: 7, borderRadius: 4, overflow: 'hidden' },
  challengeBarFill: { height: 7, borderRadius: 4 },
  challengeBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  challengeProgress: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  challengePct: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
});
