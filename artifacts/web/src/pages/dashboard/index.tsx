import React, { useEffect, useRef, useState } from 'react';
import { useGetDashboard, useGetTransactions, useGetSpending, useGetInsights } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import { 
  ArrowUpRight, ArrowDownRight, Target, Activity, CreditCard, 
  ChevronRight, Lock, TrendingUp, ShieldAlert, Sparkles, Bell
} from 'lucide-react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

function AnimatedNumber({ value }: { value: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 80 });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = latest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    });
  }, [springValue]);

  return <span ref={nodeRef}>0.00</span>;
}

function Card3D({ cardNumber, name, expiry }: { cardNumber: string, name: string, expiry: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-150, 150], [10, -10]);
  const rotateY = useTransform(x, [-150, 150], [-10, 10]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="perspective-[1000px] h-full">
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouse}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full relative"
      >
        <div className="glass rounded-3xl p-6 h-full flex flex-col justify-between border border-primary/20 shadow-[0_0_30px_rgba(212,175,55,0.05)] bg-gradient-to-br from-black/80 to-primary/5 transition-colors overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ transform: 'translateZ(1px)' }}></div>
          <div className="flex justify-between items-start mb-8 relative z-10" style={{ transform: 'translateZ(30px)' }}>
            <div className="w-12 h-8 rounded bg-white/10 border border-white/20 flex items-center justify-center">
              <div className="w-8 h-6 rounded-sm bg-gradient-to-br from-yellow-200/50 to-yellow-600/50 border border-yellow-500/50"></div>
            </div>
            <div className="text-right">
              <p className="font-bold tracking-widest text-lg text-white/80 italic">VISA</p>
            </div>
          </div>
          
          <div className="relative z-10" style={{ transform: 'translateZ(40px)' }}>
            <p className="font-mono text-xl md:text-2xl tracking-[0.15em] text-white mb-4">
              {cardNumber.slice(0, 4)} •••• •••• {cardNumber.slice(-4)}
            </p>
            <div className="flex justify-between items-end text-sm text-white/70 uppercase tracking-wider">
              <div>
                <p className="text-[10px] text-white/50 mb-1">Card Holder</p>
                <p className="font-medium text-xs">{name}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 mb-1">Valid Thru</p>
                <p className="font-medium text-xs">{expiry}</p>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4 rotate-90 text-[10px] tracking-widest text-white/20 font-bold" style={{ transform: 'translateZ(10px) rotate(90deg)' }}>
            NABEEH ULTRA
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const mockCashFlowData = [
  { month: 'Jan', income: 14000, expenses: 3200 },
  { month: 'Feb', income: 15200, expenses: 3100 },
  { month: 'Mar', income: 14800, expenses: 4000 },
  { month: 'Apr', income: 15500, expenses: 2900 },
  { month: 'May', income: 15000, expenses: 3500 },
  { month: 'Jun', income: 16000, expenses: 3100 },
];

export default function DashboardHome() {
  const { user, isLoading: isAuthLoading } = useRequireAuth();
  const { data: dashboard, isLoading: isDashboardLoading } = useGetDashboard();
  const { data: transactions, isLoading: isTxLoading } = useGetTransactions({ limit: 4 });
  const { data: spending, isLoading: isSpendingLoading } = useGetSpending();
  const { data: insights, isLoading: isInsightsLoading } = useGetInsights();

  if (isAuthLoading || isDashboardLoading || isTxLoading || isSpendingLoading || isInsightsLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  const getInsightIcon = (type: string) => {
    switch(type) {
      case 'saving': return <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500"><TrendingUp className="w-4 h-4" /></div>;
      case 'prediction': return <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500"><Activity className="w-4 h-4" /></div>;
      case 'subscription': return <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500"><Bell className="w-4 h-4" /></div>;
      case 'fraud': return <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500"><ShieldAlert className="w-4 h-4" /></div>;
      default: return <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"><Sparkles className="w-4 h-4" /></div>;
    }
  };

  const getInsightBorder = (type: string) => {
    switch(type) {
      case 'saving': return 'border-l-emerald-500';
      case 'prediction': return 'border-l-blue-500';
      case 'subscription': return 'border-l-amber-500';
      case 'fraud': return 'border-l-red-500';
      default: return 'border-l-primary';
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-8"
      >
        {/* Section 1: Header Row */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Good morning, {user?.fullName?.split(' ')[0]}</h1>
            <p className="text-primary tracking-wide text-sm font-medium">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <div className="flex items-center gap-4 bg-black/40 p-3 rounded-2xl border border-white/5 shadow-inner">
            <div className="text-right">
              <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium mb-1">Financial Health</p>
              <p className="text-xl font-bold text-white leading-none">{dashboard?.healthScore}<span className="text-sm text-muted-foreground font-normal">/100</span></p>
            </div>
            <div className="relative w-12 h-12">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                <motion.circle 
                  cx="50" cy="50" r="40" 
                  stroke="currentColor" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 40}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - (dashboard?.healthScore || 0) / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                  className="text-primary" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </header>

        {/* Section 2: Hero Row */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="md:col-span-2 glass rounded-3xl p-8 border border-border/50 relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform duration-700 group-hover:scale-110 pointer-events-none" />
            
            <div className="relative z-10">
              <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase mb-4">Total Balance</p>
              <div className="mb-6">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-mono tracking-tight text-white mb-4">
                  <AnimatedNumber value={dashboard?.balance || 0} />
                  <span className="text-2xl text-muted-foreground ml-3 font-sans">SAR</span>
                </h2>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    (dashboard?.monthlyChange || 0) >= 0 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-destructive/10 text-destructive border border-destructive/20'
                  }`}>
                    {(dashboard?.monthlyChange || 0) >= 0 ? '+' : ''}{dashboard?.monthlyChange}%
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">{dashboard?.daysToSalary} days until salary</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 text-white px-4 py-2 rounded-full border border-white/10">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Savings <span className="font-mono">{dashboard?.savingsBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> SAR</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-1 h-64 md:h-auto">
            <Card3D 
              cardNumber={dashboard?.cardNumber || "4532 0000 0000 8821"} 
              name={user?.fullName || "Valued Member"} 
              expiry="12/28" 
            />
          </motion.div>
        </motion.div>

        {/* Section 3: Quick Stats */}
        <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div variants={itemVariants} className="glass p-5 rounded-2xl border border-white/5">
            <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Total Income</p>
            <p className="text-2xl font-mono text-white mb-2">{dashboard?.totalIncome.toLocaleString()} <span className="text-sm text-muted-foreground font-sans">SAR</span></p>
            <div className="flex items-center gap-1 text-emerald-400 text-sm">
              <ArrowUpRight className="w-4 h-4" /> <span>+4.2%</span>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="glass p-5 rounded-2xl border border-white/5">
            <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Total Expenses</p>
            <p className="text-2xl font-mono text-white mb-2">{dashboard?.totalExpenses.toLocaleString()} <span className="text-sm text-muted-foreground font-sans">SAR</span></p>
            <div className="flex items-center gap-1 text-destructive text-sm">
              <ArrowDownRight className="w-4 h-4" /> <span>-1.1%</span>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="glass p-5 rounded-2xl border border-white/5">
            <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Savings Goal</p>
            <p className="text-2xl font-mono text-white mb-3">{dashboard?.savingsGoalPercent}%</p>
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${dashboard?.savingsGoalPercent}%` }} 
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-primary" 
              />
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="glass p-5 rounded-2xl border border-white/5">
            <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Health Status</p>
            <p className="text-2xl font-mono text-white mb-3">{dashboard?.healthScore}/100</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-500 font-medium uppercase tracking-widest">Excellent</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Section 4: Charts */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border border-border/50">
            <h3 className="font-semibold text-white mb-6">Cash Flow Analysis</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockCashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border border-border/50">
            <h3 className="font-semibold text-white mb-2">Monthly Spending</h3>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spending || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="amount"
                    stroke="none"
                  >
                    {spending?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} SAR`, 'Amount']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-white text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <p className="text-muted-foreground text-xs uppercase tracking-widest">Total</p>
                <p className="text-white font-mono text-xl">{dashboard?.totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Section 5: AI Insights */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-white">Nabeh Intelligence</h3>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x custom-scrollbar">
            {insights?.map((insight) => (
              <div key={insight.id} className={`snap-start shrink-0 w-[280px] h-[180px] glass rounded-2xl p-5 flex flex-col justify-between border-l-4 ${getInsightBorder(insight.type)} border-t border-r border-b border-border/50 relative overflow-hidden`}>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {getInsightIcon(insight.type)}
                    <h4 className="font-medium text-white text-sm line-clamp-1">{insight.title}</h4>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">{insight.message}</p>
                </div>
                {insight.actionLabel && (
                  <button className="w-full py-2 px-4 rounded-xl border border-primary/30 text-primary text-xs font-medium hover:bg-primary/10 transition-colors mt-4">
                    {insight.actionLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section 6: Goals + Progress */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border border-border/50 flex flex-col items-center justify-center text-center">
            <h3 className="font-semibold text-white mb-8 self-start w-full text-left">Savings Master Goal</h3>
            <div className="relative w-48 h-48 mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <motion.circle 
                  cx="50" cy="50" r="45" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 45}
                  initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - (dashboard?.savingsGoalPercent || 0) / 100) }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="text-primary" 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-mono text-white">{dashboard?.savingsGoalPercent}%</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Target: <span className="text-white font-mono">18,000 SAR</span> / Current: <span className="text-white font-mono">{dashboard?.savingsBalance.toLocaleString()} SAR</span></p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border border-border/50">
            <h3 className="font-semibold text-white mb-6">Financial Goals</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-white">Emergency Fund</span>
                  <span className="text-xs font-mono text-emerald-400">85%</span>
                </div>
                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1 }} className="h-full bg-emerald-400 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-white">New Car Fund</span>
                  <span className="text-xs font-mono text-blue-400">42%</span>
                </div>
                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '42%' }} transition={{ duration: 1 }} className="h-full bg-blue-400 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-white">Vacation</span>
                  <span className="text-xs font-mono text-amber-400">23%</span>
                </div>
                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '23%' }} transition={{ duration: 1 }} className="h-full bg-amber-400 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Section 7: Investment Teaser */}
        <motion.div variants={itemVariants} className="glass p-8 rounded-3xl border border-primary/30 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 blur-[80px] pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="z-10 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-2">Investments</h3>
            <p className="text-primary font-medium mb-4">Your portfolio is growing at 7.2% annually</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-4 py-2 rounded-full glass border border-white/10 text-xs text-white">Sukuk <span className="text-emerald-400 ml-1">+5.1%</span></span>
              <span className="px-4 py-2 rounded-full glass border border-white/10 text-xs text-white">Real Estate <span className="text-emerald-400 ml-1">+8.4%</span></span>
              <span className="px-4 py-2 rounded-full glass border border-white/10 text-xs text-white">Gold Funds <span className="text-emerald-400 ml-1">+12.0%</span></span>
            </div>
          </div>
          <button className="z-10 bg-primary text-black font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(212,175,55,0.3)] whitespace-nowrap">
            Explore Investments
          </button>
        </motion.div>

        {/* Section 8: Recent Transactions */}
        <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Recent Activity</h3>
            <Link href="/dashboard/transactions" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {transactions?.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:border-primary/30 transition-colors">
                    {tx.icon}
                  </div>
                  <div>
                    <p className="font-medium text-white group-hover:text-primary transition-colors">{tx.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{tx.subtitle} • {format(new Date(tx.date), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-lg ${tx.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs font-sans">SAR</span>
                  </p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">{tx.category}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}
