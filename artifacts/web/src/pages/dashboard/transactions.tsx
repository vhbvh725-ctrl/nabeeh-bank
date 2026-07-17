import { useState } from 'react';
import { useGetTransactions, TransactionType } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, itemVariants, staggerContainer } from '../../lib/animations';
import { format } from 'date-fns';
import { Search, ArrowDownRight, ArrowUpRight, BarChart3, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';

const FILTER_OPTIONS: { label: string; value: TransactionType | undefined; color: string }[] = [
  { label: 'All',    value: undefined,  color: '' },
  { label: 'Income', value: 'credit',   color: 'emerald' },
  { label: 'Out',    value: 'debit',    color: 'red' },
];

export default function Transactions() {
  useRequireAuth();
  const [filterType, setFilterType] = useState<TransactionType | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: transactions, isLoading } = useGetTransactions({ type: filterType, limit: 50 });

  const filteredTransactions = transactions?.filter(tx =>
    tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIn  = transactions?.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0) ?? 0;
  const totalOut = transactions?.filter(t => t.type === 'debit').reduce((s, t) => s + Math.abs(t.amount), 0) ?? 0;

  // Group by date
  const grouped = filteredTransactions?.reduce<Record<string, typeof filteredTransactions>>((acc, tx) => {
    const key = format(new Date(tx.date), 'MMMM d, yyyy');
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-5 max-w-2xl mx-auto">

        {/* Header */}
        <header className="pt-2">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
          </div>
          <p className="text-muted-foreground text-sm">Full transaction history &amp; insights</p>
        </header>

        {/* Summary cards */}
        <motion.div variants={staggerContainer} className="grid grid-cols-3 gap-3">
          <motion.div variants={itemVariants}
            className="glass-float rounded-2xl p-4 border border-white/5 card-premium flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-widest font-semibold">Income</span>
            </div>
            <p className="font-mono text-white text-sm font-bold leading-none">{totalIn.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] text-muted-foreground">SAR</p>
          </motion.div>
          <motion.div variants={itemVariants}
            className="glass-float rounded-2xl p-4 border border-white/5 card-premium flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-red-400 mb-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-widest font-semibold">Spent</span>
            </div>
            <p className="font-mono text-white text-sm font-bold leading-none">{totalOut.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] text-muted-foreground">SAR</p>
          </motion.div>
          <motion.div variants={itemVariants}
            className="glass-float rounded-2xl p-4 border border-white/5 card-premium flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-primary mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-widest font-semibold">Txns</span>
            </div>
            <p className="font-mono text-white text-sm font-bold leading-none">{transactions?.length ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </motion.div>
        </motion.div>

        {/* Search + filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input
              placeholder="Search transactions..."
              className="pl-9 h-11 bg-black/40 border-white/8 rounded-xl text-sm focus:border-primary/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-1 p-1 rounded-xl border border-white/8" style={{ background: 'rgba(0,0,0,0.4)' }}>
            {FILTER_OPTIONS.map((opt) => (
              <motion.button
                key={opt.label}
                whileTap={{ scale: 0.9 }}
                onClick={() => setFilterType(opt.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                  filterType === opt.value
                    ? opt.color === 'emerald'
                      ? 'bg-emerald-500 text-black'
                      : opt.color === 'red'
                        ? 'bg-red-500 text-white'
                        : 'bg-primary text-black'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Transaction list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl skeleton" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!grouped || Object.keys(grouped).length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-12 text-center border border-white/5"
              >
                <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No transactions match your search.</p>
              </motion.div>
            ) : (
              <motion.div
                key={filterType ?? 'all'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                {Object.entries(grouped).map(([date, txs]) => (
                  <div key={date}>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-semibold px-1 mb-2">{date}</p>
                    <div className="glass-float rounded-2xl border border-white/5 overflow-hidden card-premium divide-y divide-white/[0.04]">
                      {txs.map((tx, i) => (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.2 }}
                        >
                          <motion.div
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
                            whileTap={{ scale: 0.99 }}
                            className="flex items-center justify-between px-4 py-3.5 cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <motion.div
                                whileHover={{ scale: 1.08 }}
                                className="w-10 h-10 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-xl flex-shrink-0 group-hover:border-primary/20 transition-colors"
                              >
                                {tx.icon}
                              </motion.div>
                              <div className="min-w-0">
                                <p className="font-medium text-white text-sm truncate group-hover:text-primary/90 transition-colors">{tx.title}</p>
                                <p className="text-xs text-muted-foreground/70 truncate capitalize">{tx.subtitle}</p>
                              </div>
                            </div>
                            <div className="text-right ml-3 flex-shrink-0">
                              <p className={`font-mono text-sm font-semibold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-white/90'}`}>
                                {tx.type === 'credit' ? '+' : '-'}{Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-[10px] text-muted-foreground/60 mt-0.5 capitalize">{tx.category}</p>
                            </div>
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
