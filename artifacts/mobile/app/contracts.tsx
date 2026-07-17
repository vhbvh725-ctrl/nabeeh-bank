import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';

interface Contract {
  id: string;
  title: string;
  type: string;
  date: string;
  status: 'signed' | 'pending' | 'expired';
  amount?: string;
  party?: string;
}

const CONTRACTS: Contract[] = [
  { id: '1', title: 'Home Loan Agreement', type: 'Loan Contract', date: 'Jan 15, 2026', status: 'signed', amount: '450,000 SAR', party: 'Nabeeh Bank' },
  { id: '2', title: 'Credit Card Terms', type: 'Card Agreement', date: 'Mar 2, 2026', status: 'signed', amount: '25,000 SAR', party: 'Nabeeh Bank' },
  { id: '3', title: 'Investment Portfolio', type: 'Investment Contract', date: 'May 10, 2026', status: 'signed', amount: '8,000 SAR', party: 'Nabeeh Invest' },
  { id: '4', title: 'Insurance Policy Renewal', type: 'Insurance', date: 'Jul 20, 2026', status: 'pending', party: 'Nabeeh Protect' },
  { id: '5', title: 'Savings Account Terms', type: 'Account Agreement', date: 'Dec 1, 2025', status: 'expired', amount: '5,000 SAR', party: 'Nabeeh Bank' },
];

const STATUS_COLORS = {
  signed: '#10b981',
  pending: '#f59e0b',
  expired: '#6b7280',
};

const STATUS_LABELS = {
  signed: 'Signed',
  pending: 'Pending Signature',
  expired: 'Expired',
};

const STATUS_ICONS = {
  signed: 'check-circle',
  pending: 'clock',
  expired: 'x-circle',
};

function ContractCard({ contract }: { contract: Contract }) {
  const colors = useColors();
  const { user } = useAuth();
  const color = STATUS_COLORS[contract.status];

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (contract.status === 'pending') {
      Alert.alert(
        'Sign Contract',
        `Sign "${contract.title}" with your digital signature?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Now',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Signed', 'Contract signed successfully with your digital signature.');
            },
          },
        ]
      );
    } else {
      Alert.alert('View Contract', `Opening "${contract.title}" for review...`);
    }
  }

  return (
    <TouchableOpacity
      style={[styles.contractCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={handlePress}
      activeOpacity={0.82}
    >
      <View style={styles.contractTop}>
        <View style={[styles.contractIcon, { backgroundColor: color + '18' }]}>
          <Feather name="file-text" size={18} color={color} />
        </View>
        <View style={styles.contractInfo}>
          <Text style={[styles.contractTitle, { color: colors.foreground }]} numberOfLines={1}>
            {contract.title}
          </Text>
          <Text style={[styles.contractType, { color: colors.mutedForeground }]}>
            {contract.type}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: color + '18', borderColor: color + '45' }]}>
          <Feather name={STATUS_ICONS[contract.status] as any} size={11} color={color} />
          <Text style={[styles.statusText, { color }]}>{STATUS_LABELS[contract.status]}</Text>
        </View>
      </View>

      <View style={[styles.contractMeta, { borderTopColor: colors.border }]}>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{contract.date}</Text>
        </View>
        {contract.party && (
          <View style={styles.metaItem}>
            <Feather name="users" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{contract.party}</Text>
          </View>
        )}
        {contract.amount && (
          <View style={styles.metaItem}>
            <Feather name="dollar-sign" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{contract.amount}</Text>
          </View>
        )}
      </View>

      {contract.status === 'pending' && (
        <LinearGradient
          colors={['#d4a843', '#8b6914']}
          style={styles.signBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Feather name="edit-3" size={14} color="#fff" />
          <Text style={styles.signBtnText}>Sign Now</Text>
        </LinearGradient>
      )}

      {contract.status === 'signed' && (
        <View style={styles.sigRow}>
          <View style={[styles.sigBox, { backgroundColor: '#10b98112', borderColor: '#10b98130' }]}>
            <Feather name="pen-tool" size={12} color="#10b981" />
            <Text style={[styles.sigBoxText, { color: '#10b981' }]}>
              {user?.name ?? 'Ahmed Al-Rashidi'}
            </Text>
          </View>
          <Text style={[styles.sigDate, { color: colors.mutedForeground }]}>Signed · {contract.date}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ContractsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | 'signed' | 'pending' | 'expired'>('all');

  const filtered = CONTRACTS.filter(c => filter === 'all' || c.status === filter);
  const counts = {
    signed: CONTRACTS.filter(c => c.status === 'signed').length,
    pending: CONTRACTS.filter(c => c.status === 'pending').length,
    expired: CONTRACTS.filter(c => c.status === 'expired').length,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: Platform.OS === 'web' ? 67 + 16 : insets.top + 16,
            paddingBottom: Platform.OS === 'web' ? 34 + 24 : insets.bottom + 24,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>Digital Contracts</Text>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Signed', count: counts.signed, color: '#10b981' },
            { label: 'Pending', count: counts.pending, color: '#f59e0b' },
            { label: 'Expired', count: counts.expired, color: '#6b7280' },
          ].map(s => (
            <TouchableOpacity
              key={s.label}
              style={[
                styles.summaryCard,
                {
                  backgroundColor: filter === s.label.toLowerCase()
                    ? s.color + '20'
                    : colors.card,
                  borderColor: filter === s.label.toLowerCase()
                    ? s.color + '50'
                    : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setFilter(filter === (s.label.toLowerCase() as any) ? 'all' : s.label.toLowerCase() as any);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.summaryCount, { color: s.color }]}>{s.count}</Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info banner */}
        <View style={[styles.banner, { backgroundColor: '#c9a84c18', borderColor: '#c9a84c35' }]}>
          <Feather name="shield" size={16} color="#c9a84c" />
          <Text style={[styles.bannerText, { color: colors.mutedForeground }]}>
            All contracts are digitally signed and legally binding under Saudi e-Commerce Law.
          </Text>
        </View>

        {/* Contracts list */}
        {filtered.map(contract => (
          <ContractCard key={contract.id} contract={contract} />
        ))}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Feather name="file" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No {filter} contracts
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  screenTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    padding: 14, alignItems: 'center', gap: 4,
  },
  summaryCount: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  summaryLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  banner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 12, borderWidth: 1, padding: 14,
  },
  bannerText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  contractCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden', gap: 0 },
  contractTop: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  contractIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  contractInfo: { flex: 1 },
  contractTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  contractType: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4,
  },
  statusText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  contractMeta: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 12,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  signBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginHorizontal: 16, marginBottom: 16, borderRadius: 12, paddingVertical: 12,
  },
  signBtnText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#fff' },
  sigRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 16,
  },
  sigBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6,
  },
  sigBoxText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  sigDate: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 48 },
  emptyText: { fontSize: 16, fontFamily: 'Inter_500Medium' },
});
