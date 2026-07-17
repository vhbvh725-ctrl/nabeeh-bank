import { useGetDashboard, useGetTransactions } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import { ArrowUpRight, ArrowDownRight, Target, Activity, CreditCard, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import { format } from 'date-fns';

export default function DashboardHome() {
  const { user, isLoading: isAuthLoading } = useRequireAuth();
  const { data: dashboard, isLoading: isDashboardLoading } = useGetDashboard();
  const { data: transactions, isLoading: isTxLoading } = useGetTransactions({ limit: 4 });

  if (isAuthLoading || isDashboardLoading || isTxLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-6 md:space-y-8"
      >
        <header className="flex justify-between items-end">
          <div>
            <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase mb-1">Welcome back</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{user?.fullName}</h1>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-muted-foreground text-sm">System Status</p>
            <div className="flex items-center gap-2 text-primary">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium tracking-widest uppercase">Optimal</span>
            </div>
          </div>
        </header>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          
          {/* Main Balance Card */}
          <motion.div variants={itemVariants} className="md:col-span-8">
            <div className="glass rounded-3xl p-6 md:p-8 h-full border border-border/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-150" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <p className="text-muted-foreground font-medium mb-2">Total Net Worth</p>
                  <h2 className="text-5xl md:text-7xl font-light tracking-tight text-white mb-4">
                    <span className="text-muted-foreground/50 mr-2">$</span>
                    {dashboard?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      (dashboard?.monthlyChange || 0) >= 0 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                      {(dashboard?.monthlyChange || 0) >= 0 ? '+' : ''}{dashboard?.monthlyChange}%
                    </span>
                    <span className="text-muted-foreground text-sm">vs last month</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm">Income</span>
                    </div>
                    <p className="text-xl font-medium text-white">${dashboard?.totalIncome.toLocaleString()}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <ArrowUpRight className="w-4 h-4 text-destructive" />
                      <span className="text-sm">Expenses</span>
                    </div>
                    <p className="text-xl font-medium text-white">${dashboard?.totalExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3D Tilt Card Component */}
          <motion.div variants={itemVariants} className="md:col-span-4 perspective-[1000px]">
            <div className="glass rounded-3xl p-6 h-full flex flex-col justify-between transform transition-transform duration-500 hover:rotate-y-12 hover:rotate-x-12 hover:scale-[1.02] border border-primary/20 shadow-[0_0_30px_rgba(212,175,55,0.05)] bg-gradient-to-br from-black/80 to-primary/5">
              <div className="flex justify-between items-start mb-8">
                <CreditCard className="w-8 h-8 text-primary" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Ultra Card</p>
                  <p className="font-medium text-white">•••• {dashboard?.cardNumber.slice(-4)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-muted-foreground text-sm mb-1">Available Limit</p>
                <p className="text-3xl font-medium text-white">${dashboard?.savingsBalance.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          {/* Health & Insights */}
          <motion.div variants={itemVariants} className="md:col-span-4">
            <div className="glass rounded-2xl p-6 h-full border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Financial Health
                </h3>
                <span className="text-2xl font-bold text-primary">{dashboard?.healthScore}</span>
              </div>
              
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full" 
                  style={{ width: `${dashboard?.healthScore}%` }} 
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-primary" /> Savings Goal
                </h3>
                <span className="text-sm text-muted-foreground">{dashboard?.savingsGoalPercent}%</span>
              </div>
              
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500/50 to-emerald-400 rounded-full" 
                  style={{ width: `${dashboard?.savingsGoalPercent}%` }} 
                />
              </div>
            </div>
          </motion.div>

          {/* Recent Transactions Mini */}
          <motion.div variants={itemVariants} className="md:col-span-8">
            <div className="glass rounded-2xl p-6 h-full border border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-white">Recent Activity</h3>
                <Link href="/dashboard/transactions" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {transactions?.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner">
                        {tx.icon}
                      </div>
                      <div>
                        <p className="font-medium text-white group-hover:text-primary transition-colors">{tx.title}</p>
                        <p className="text-xs text-muted-foreground">{tx.subtitle} • {format(new Date(tx.date), 'MMM d, h:mm a')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${tx.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                        {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{tx.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
