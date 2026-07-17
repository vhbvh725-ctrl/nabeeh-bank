import { useState } from 'react';
import { useGetTransactions, TransactionType } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion } from 'framer-motion';
import { pageVariants, itemVariants, staggerContainer } from '../../lib/animations';
import { format } from 'date-fns';
import { Search, Filter, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Transactions() {
  useRequireAuth();
  const [filterType, setFilterType] = useState<TransactionType | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: transactions, isLoading } = useGetTransactions({ 
    type: filterType,
    limit: 50
  });

  const filteredTransactions = transactions?.filter(tx => 
    tx.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-6 max-w-4xl mx-auto"
      >
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Ledger</h1>
            <p className="text-muted-foreground text-sm">Comprehensive transaction history</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search ledger..." 
                className="pl-9 bg-black/40 border-border/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex bg-black/40 rounded-md p-1 border border-border/50">
              <button 
                onClick={() => setFilterType(undefined)}
                className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${!filterType ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterType('credit')}
                className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors flex items-center gap-1 ${filterType === 'credit' ? 'bg-emerald-500 text-black' : 'text-muted-foreground hover:text-white'}`}
              >
                <ArrowDownRight className="w-3 h-3" /> In
              </button>
              <button 
                onClick={() => setFilterType('debit')}
                className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors flex items-center gap-1 ${filterType === 'debit' ? 'bg-destructive text-white' : 'text-muted-foreground hover:text-white'}`}
              >
                <ArrowUpRight className="w-3 h-3" /> Out
              </button>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-border/50 overflow-hidden">
            {filteredTransactions?.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No transactions found matching your criteria.</p>
              </div>
            ) : (
              <motion.div variants={staggerContainer} className="divide-y divide-white/5">
                {filteredTransactions?.map((tx) => (
                  <motion.div key={tx.id} variants={itemVariants} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                        {tx.icon}
                      </div>
                      <div>
                        <p className="font-medium text-white group-hover:text-primary transition-colors text-lg">{tx.title}</p>
                        <p className="text-sm text-muted-foreground">{tx.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium text-lg ${tx.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                        {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize flex items-center justify-end gap-2">
                        {format(new Date(tx.date), 'MMM d, yyyy')} <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span> {tx.category}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
