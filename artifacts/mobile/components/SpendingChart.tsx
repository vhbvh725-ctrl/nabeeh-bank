import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SpendingCategory } from '@/context/BankContext';
import { useColors } from '@/hooks/useColors';

interface Props {
  categories: SpendingCategory[];
}

export function SpendingChart({ categories }: Props) {
  const max = Math.max(...categories.map(c => c.amount));
  const total = categories.reduce((acc, c) => acc + c.amount, 0);
  return (
    <View style={styles.container}>
      {categories.map(cat => (
        <CategoryBar key={cat.name} category={cat} max={max} total={total} />
      ))}
    </View>
  );
}

function CategoryBar({
  category,
  max,
  total,
}: {
  category: SpendingCategory;
  max: number;
  total: number;
}) {
  const colors = useColors();
  const pct = category.amount / max;
  const share = Math.round((category.amount / total) * 100);

  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: category.color + '22' }]}>
        <Feather name={category.icon as any} size={14} color={category.color} />
      </View>
      <View style={styles.barArea}>
        <View style={styles.labelRow}>
          <Text style={[styles.catName, { color: colors.foreground }]}>{category.name}</Text>
          <Text style={[styles.amount, { color: colors.foreground }]}>
            {category.amount.toLocaleString()} SAR
          </Text>
        </View>
        <View style={[styles.barBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.barFill,
              { width: `${pct * 100}%` as any, backgroundColor: category.color },
            ]}
          />
        </View>
      </View>
      <Text style={[styles.pct, { color: colors.mutedForeground }]}>{share}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barArea: { flex: 1, gap: 5 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  catName: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  amount: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  barBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  pct: { fontSize: 11, fontFamily: 'Inter_500Medium', width: 30, textAlign: 'right' },
});
