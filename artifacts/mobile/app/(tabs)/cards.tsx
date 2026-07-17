import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useBank, Transaction } from '@/context/BankContext';
import { BankCard3D } from '@/components/BankCard3D';
import { SpendingChart } from '@/components/SpendingChart';

type Filter = 'all' | 'debit' | 'credit';

function TxItem({ tx }: { tx: Transaction }) {
  const colors = useColors();
  const isCredit = tx.type === 'credit';
  return (
    <View style={[styles.txItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.txIconBox, { backgroundColor: colors.accent }]}>
        <Feather name={tx.icon as any} size={16} color={colors.mutedForeground} />
      </View>
      <View style={styles.txInfo}>
        <Text style={[styles.txTitle, { color: colors.foreground }]}>{tx.title}</Text>
        <Text style={[styles.txSub, { color: colors.mutedForeground }]}>
          {tx.subtitle} · {tx.date}
        </Text>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color: isCredit ? colors.success : colors.foreground }]}>
          {isCredit ? '+' : '-'}{tx.amount.toLocaleString()} SAR
        </Text>
        <View
          style={[
            styles.txBadge,
            { backgroundColor: isCredit ? '#10b98120' : '#1a2744' },
          ]}
        >
          <Text
            style={[
              styles.txBadgeText,
              { color: isCredit ? colors.success : colors.mutedForeground },
            ]}
          >
            {tx.category}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function CardsScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { cardNumber, transactions, spendingCategories, isCardFrozen, freezeCard, unfreezeCard } = useBank();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('all');
  const [activeTab, setActiveTab] = useState<'transactions' | 'spending'>('transactions');

  const filtered = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const totalSpend = spendingCategories.reduce((a, c) => a + c.amount, 0);

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: colors.foreground }]}>My Card</Text>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="plus" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Bank card */}
        <BankCard3D
          cardNumber={cardNumber}
          holderName={user?.name ?? 'Ahmed Al-Rashidi'}
          isFrozen={isCardFrozen}
        />

        {/* Card actions */}
        <View style={styles.cardActions}>
          {[
            { icon: 'lock', label: isCardFrozen ? 'Unfreeze' : 'Freeze', color: isCardFrozen ? colors.success : '#ef4444' },
            { icon: 'sliders', label: 'Limits', color: colors.mutedForeground },
            { icon: 'copy', label: 'Virtual', color: colors.mutedForeground },
            { icon: 'shield', label: 'Security', color: colors.mutedForeground },
          ].map(action => (
            <TouchableOpacity
              key={action.label}
              style={[styles.cardAction, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                if (action.label === 'Freeze' || action.label === 'Unfreeze') {
                  isCardFrozen ? unfreezeCard() : freezeCard();
                }
                if (action.label === 'Security') router.push('/fraud-alert');
              }}
              activeOpacity={0.8}
            >
              <Feather name={action.icon as any} size={18} color={action.color} />
              <Text style={[styles.cardActionLabel, { color: colors.mutedForeground }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spending summary row */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Monthly Spend</Text>
            <Text style={[styles.summaryValue, { color: '#ef4444' }]}>{totalSpend.toLocaleString()} SAR</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Monthly Income</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>15,200 SAR</Text>
          </View>
        </View>

        {/* Tab switcher */}
        <View style={[styles.tabRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(['transactions', 'spending'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab(tab);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {tab === 'transactions' ? 'Transactions' : 'Spending'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'transactions' ? (
          <>
            {/* Filter pills */}
            <View style={styles.filterRow}>
              {(['all', 'debit', 'credit'] as Filter[]).map(f => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: filter === f ? colors.primary : colors.card,
                      borderColor: filter === f ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setFilter(f);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: filter === f ? colors.primaryForeground : colors.mutedForeground },
                    ]}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Transaction list */}
            <View style={[styles.txList, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {filtered.map(tx => (
                <TxItem key={tx.id} tx={tx} />
              ))}
            </View>
          </>
        ) : (
          <View style={[styles.spendSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.spendHeader}>
              <Text style={[styles.spendTitle, { color: colors.foreground }]}>
                Total: {totalSpend.toLocaleString()} SAR
              </Text>
              <Text style={[styles.spendPeriod, { color: colors.mutedForeground }]}>July 2026</Text>
            </View>
            <SpendingChart categories={spendingCategories} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  screenTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  headerBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cardActions: { flexDirection: 'row', gap: 10 },
  cardAction: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    paddingVertical: 12, alignItems: 'center', gap: 6,
  },
  cardActionLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 16, gap: 4 },
  summaryLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  summaryValue: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  tabRow: {
    flexDirection: 'row', borderRadius: 14, borderWidth: 1,
    padding: 4, gap: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterPill: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 7 },
  filterText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  txList: { borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  txItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    gap: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  txSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  txBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  txBadgeText: { fontSize: 10, fontFamily: 'Inter_500Medium', textTransform: 'capitalize' },
  spendSection: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 20 },
  spendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  spendTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  spendPeriod: { fontSize: 13, fontFamily: 'Inter_400Regular' },
});
