import React, { useEffect, useRef, useState } from 'react';
import { useGetDashboard, useGetTransactions, useGetSpending, useGetInsights } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import {
  ArrowUpRight, ArrowDownRight, Target, Activity, CreditCard,
  ChevronRight, Lock, TrendingUp, ShieldAlert, Sparkles, Bell
} from 'lucide-react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// ─── Animated Number ───────────────────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);
  const sp = useSpring(mv, { damping: 28, stiffness: 70 });
  useEffect(() => { mv.set(value); }, [value, mv]);
  useEffect(() => sp.on('change', (v) => {
    if (nodeRef.current)
      nodeRef.current.textContent = v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }), [sp]);
  return <span ref={nodeRef}>0.00</span>;
}

// ─── 3D Card ───────────────────────────────────────────────────────────────────
function Card3D({ cardNumber, name, expiry }: { cardNumber: string; name: string; expiry: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-120, 120], [9, -9]);
  const rotateY = useTransform(x, [-120, 120], [-9, 9]);

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - (r.left + r.width / 2));
    y.set(e.clientY - (r.top + r.height / 2));
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <div className="[perspective:1000px] h-full w-full select-none">
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouse}
        onMouseLeave={handleLeave}
        className="w-full h-full relative"
      >
        <div className="relative w-full h-full rounded-3xl overflow-hidden border border-primary/25"
          style={{
            background: 'linear-gradient(135deg, rgba(18,15,10,0.95) 0%, rgba(30,22,5,0.9) 50%, rgba(12,10,6,0.95) 100%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(212,175,55,0.08) inset, 0 1px 0 rgba(212,175,55,0.15) inset',
          }}>

          {/* Background glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

          {/* Diagonal lines decoration */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, #D4AF37 0, #D4AF37 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />

          <div className="relative z-10 p-5 h-full flex flex-col justify-between" style={{ transform: 'translateZ(20px)' }}>
            <div className="flex justify-between items-start">
              {/* Chip */}
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300/60 to-yellow-600/50 border border-yellow-500/40 shadow-inner" />
              <div className="flex flex-col items-end">
                <p className="font-bold text-base tracking-[0.2em] text-white/70 italic">VISA</p>
                <div className="flex gap-1 mt-1">
                  <div className="w-5 h-5 rounded-full bg-red-500/70" />
                  <div className="w-5 h-5 rounded-full bg-amber-500/70 -ml-2.5" />
                </div>
              </div>
            </div>
            <div>
              <p className="font-mono text-lg tracking-[0.18em] text-white/90 mb-3" style={{ transform: 'translateZ(10px)' }}>
                {cardNumber.slice(0, 4)} •••• •••• {cardNumber.slice(-4)}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mb-0.5">Card Holder</p>
                  <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">{name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mb-0.5">Valid Thru</p>
                  <p className="text-xs font-semibold text-white/80">{expiry}</p>
                </div>
              </div>
            </div>
          </div>
          <p className="absolute bottom-3 right-4 text-[8px] tracking-[0.25em] text-white/15 font-bold z-10">NABEEH ULTRA</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Rotating AI Banner ────────────────────────────────────────────────────────
const ROTATING_INSIGHTS = [
  { icon: '🎉', text: 'Great job! You spent 18% less on restaurants this month.', color: 'emerald' },
  { icon: '⚡', text: 'Your internet bill is due tomorrow. Tap to pay now.',       color: 'amber'   },
  { icon: '💰', text: 'You can safely save SAR 500 today without affecting your balance.', color: 'primary' },
  { icon: '📈', text: 'Your savings grew by 12% this quarter. Excellent discipline.', color: 'blue' },
  { icon: '🔒', text: 'No suspicious activity detected. Account fully protected.', color: 'emerald' },
];
const bannerColors: Record<string, string> = {
  emerald: 'border-emerald-500/25 text-emerald-400',
  amber:   'border-amber-500/25 text-amber-400',
  primary: 'border-primary/25 text-primary',
  blue:    'border-blue-500/25 text-blue-400',
};
const bannerBg: Record<string, string> = {
  emerald: 'rgba(16,185,129,0.05)',
  amber:   'rgba(245,158,11,0.05)',
  primary: 'rgba(212,175,55,0.05)',
  blue:    'rgba(59,130,246,0.05)',
};

function RotatingInsightBanner() {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => { setIdx(i => (i + 1) % ROTATING_INSIGHTS.length); setShow(true); }, 320);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const ins = ROTATING_INSIGHTS[idx];
  return (
    <motion.div
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 4 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border glass-float ${bannerColors[ins.color]}`}
      style={{ background: bannerBg[ins.color] }}
    >
      <span className="text-lg flex-shrink-0">{ins.icon}</span>
      <p className="text-sm font-medium flex-1 leading-snug">{ins.text}</p>
      <div className="flex gap-1 flex-shrink-0">
        {ROTATING_INSIGHTS.map((_, i) => (
          <button key={i} onClick={() => { setIdx(i); setShow(true); }}
            className={`h-1.5 rounded-full transition-all duration-300 bg-current ${i === idx ? 'w-4 opacity-100' : 'w-1.5 opacity-25'}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Insight helpers ───────────────────────────────────────────────────────────
const mockCashFlowData = [
  { month: 'Feb', income: 15200, expenses: 3100 },
  { month: 'Mar', income: 14800, expenses: 4000 },
  { month: 'Apr', income: 15500, expenses: 2900 },
  { month: 'May', income: 15000, expenses: 3500 },
  { month: 'Jun', income: 16000, expenses: 3100 },
  { month: 'Jul', income: 16400, expenses: 2800 },
];

const insightIconMap: Record<string, React.ReactNode> = {
  saving:       <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><TrendingUp className="w-4 h-4" /></div>,
  prediction:   <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400"><Activity className="w-4 h-4" /></div>,
  subscription: <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400"><Bell className="w-4 h-4" /></div>,
  fraud:        <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400"><ShieldAlert className="w-4 h-4" /></div>,
};
const insightBorderMap: Record<string, string> = {
  saving: 'border-l-emerald-500', prediction: 'border-l-blue-500',
  subscription: 'border-l-amber-500', fraud: 'border-l-red-500',
};

// ─── Skeleton loader ───────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-full animate-in fade-in duration-300">
        <div className="h-12 skeleton w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 h-52 skeleton" />
          <div className="h-44 md:h-52 skeleton" />
        </div>
        <div className="h-14 skeleton" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 skeleton" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 skeleton" />
          <div className="h-64 skeleton" />
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const { user, isLoading: isAuthLoading } = useRequireAuth();
  const { data: dashboard, isLoading: isDashboardLoading } = useGetDashboard();
  const { data: transactions, isLoading: isTxLoading } = useGetTransactions({ limit: 4 });
  const { data: spending, isLoading: isSpendingLoading } = useGetSpending();
  const { data: insights, isLoading: isInsightsLoading } = useGetInsights();

  if (isAuthLoading || isDashboardLoading || isTxLoading || isSpendingLoading || isInsightsLoading) {
    return <LoadingSkeleton />;
  }

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  return (
    <DashboardLayout>
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-5 md:space-y-7">

        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-1">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">
              Good morning, {firstName} 👋
            </h1>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto glass-float rounded-2xl px-4 py-2.5 border border-white/6">
            <div className="text-right">
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium">Health Score</p>
              <p className="text-white font-bold text-lg leading-none mt-0.5">
                {dashboard?.healthScore}<span className="text-muted-foreground text-xs font-normal">/100</span>
              </p>
            </div>
            <div className="relative w-11 h-11 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="14" fill="none" className="text-white/8" />
                <motion.circle
                  cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="14" fill="none"
                  strokeDasharray={2 * Math.PI * 40}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - (dashboard?.healthScore ?? 0) / 100) }}
                  transition={{ duration: 1.6, ease: 'easeOut', delay: 0.3 }}
                  className="text-primary" strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </header>

        {/* ── Hero: Balance + Card ── */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Balance */}
          <motion.div variants={itemVariants}
            className="md:col-span-2 glass-float rounded-3xl p-6 md:p-8 border border-white/7 card-premium relative overflow-hidden flex flex-col justify-between min-h-[180px]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[90px] -mr-40 -mt-40 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-muted-foreground/80 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">Total Balance</p>
              <h2 className="text-4xl md:text-6xl font-mono tracking-tight text-white leading-none mb-3">
                <AnimatedNumber value={dashboard?.balance ?? 0} />
                <span className="text-lg md:text-2xl text-muted-foreground/70 ml-2 font-sans font-normal">SAR</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  (dashboard?.monthlyChange ?? 0) >= 0
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {(dashboard?.monthlyChange ?? 0) >= 0 ? '+' : ''}{dashboard?.monthlyChange}% this month
                </span>
              </div>
            </div>
            <div className="relative z-10 flex flex-wrap gap-2 pt-4 border-t border-white/[0.06] mt-4">
              <div className="flex items-center gap-2 bg-primary/8 text-primary px-3 py-1.5 rounded-full border border-primary/20 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {dashboard?.daysToSalary} days until salary
              </div>
              <div className="flex items-center gap-2 bg-white/5 text-white/70 px-3 py-1.5 rounded-full border border-white/8 text-xs font-medium">
                <Lock className="w-3 h-3 text-muted-foreground" />
                Savings: {dashboard?.savingsBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} SAR
              </div>
            </div>
          </motion.div>

          {/* 3D Card */}
          <motion.div variants={itemVariants} className="h-48 md:h-auto min-h-[180px]">
            <Card3D
              cardNumber={dashboard?.cardNumber ?? '4532000000008821'}
              name={user?.fullName ?? 'Valued Member'}
              expiry="12/28"
            />
          </motion.div>
        </motion.div>

        {/* ── AI Insight Banner ── */}
        <RotatingInsightBanner />

        {/* ── Quick Stats ── */}
        <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Income',    value: `${(dashboard?.totalIncome ?? 0).toLocaleString()}`, unit: 'SAR', change: '+4.2%', up: true },
            { label: 'Expenses',  value: `${(dashboard?.totalExpenses ?? 0).toLocaleString()}`, unit: 'SAR', change: '-1.1%', up: false },
            { label: 'Savings',   value: `${dashboard?.savingsGoalPercent ?? 0}%`, unit: 'of goal', change: 'On track', up: true, isBar: true, pct: dashboard?.savingsGoalPercent ?? 0 },
            { label: 'Health',    value: `${dashboard?.healthScore ?? 0}`, unit: '/100', change: 'Excellent', up: true, dot: true },
          ].map((s) => (
            <motion.div key={s.label} variants={itemVariants}
              whileHover={{ y: -2 }}
              className="glass-float rounded-2xl p-4 border border-white/6 card-premium">
              <p className="text-muted-foreground/70 text-[10px] uppercase tracking-widest font-semibold mb-2">{s.label}</p>
              <div className="flex items-baseline gap-1 mb-2">
                <p className="text-xl md:text-2xl font-mono text-white font-bold">{s.value}</p>
                <span className="text-[10px] text-muted-foreground/60">{s.unit}</span>
              </div>
              {s.isBar ? (
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 1, delay: 0.4 }}
                    className="h-full bg-primary rounded-full" />
                </div>
              ) : s.dot ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 text-[11px] font-semibold">{s.change}</span>
                </div>
              ) : (
                <div className={`flex items-center gap-1 text-[11px] font-semibold ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {s.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {s.change}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* ── Charts ── */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div variants={itemVariants} className="glass-float rounded-3xl p-5 border border-white/6 card-premium">
            <h3 className="font-semibold text-white text-sm mb-5">Cash Flow Analysis</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockCashFlowData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(10,9,7,0.95)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '14px', fontSize: '12px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="income"   stroke="hsl(var(--primary))" fill="url(#gIncome)"  strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444"               fill="url(#gExpense)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-float rounded-3xl p-5 border border-white/6 card-premium">
            <h3 className="font-semibold text-white text-sm mb-2">Monthly Spending</h3>
            <div className="h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={spending ?? []} cx="50%" cy="45%" innerRadius={60} outerRadius={82} paddingAngle={4} dataKey="amount" stroke="none">
                    {spending?.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v} SAR`, 'Amount']}
                    contentStyle={{ backgroundColor: 'rgba(10,9,7,0.95)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '14px', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={32} iconType="circle"
                    formatter={(v) => <span className="text-white/70 text-[11px]">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-10%' }}>
                <p className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">Total</p>
                <p className="text-white font-mono text-lg font-bold">{(dashboard?.totalExpenses ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Nabeh Intelligence Feed ── */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-white text-sm">Nabeh Intelligence</h3>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-2 snap-x custom-scrollbar -mx-4 px-4">
            {insights?.map((insight) => (
              <motion.div key={insight.id} whileHover={{ y: -3 }}
                className={`snap-start shrink-0 w-[260px] glass-float rounded-2xl p-4 border-l-4 ${insightBorderMap[insight.type] ?? 'border-l-primary'} border-t border-r border-b border-white/6 flex flex-col justify-between card-premium`}
                style={{ minHeight: 160 }}>
                <div>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    {insightIconMap[insight.type] ?? <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"><Sparkles className="w-4 h-4" /></div>}
                    <h4 className="font-semibold text-white text-xs leading-snug line-clamp-2 flex-1">{insight.title}</h4>
                  </div>
                  <p className="text-muted-foreground/80 text-xs leading-relaxed line-clamp-3">{insight.message}</p>
                </div>
                {insight.actionLabel && (
                  <motion.button whileTap={{ scale: 0.96 }}
                    className="w-full py-1.5 px-3 rounded-xl border border-primary/25 text-primary text-[11px] font-semibold hover:bg-primary/8 transition-colors mt-3">
                    {insight.actionLabel}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Goals ── */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Savings ring */}
          <motion.div variants={itemVariants} className="glass-float rounded-3xl p-6 border border-white/6 card-premium flex flex-col items-center">
            <h3 className="font-semibold text-white text-sm self-start mb-6">Savings Master Goal</h3>
            <div className="relative w-40 h-40 mb-5">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="7" fill="none" className="text-white/5" />
                <motion.circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="7" fill="none"
                  strokeDasharray={2 * Math.PI * 45}
                  initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - (dashboard?.savingsGoalPercent ?? 0) / 100) }}
                  transition={{ duration: 2, ease: 'easeOut', delay: 0.2 }}
                  className="text-primary" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-mono text-white font-bold">{dashboard?.savingsGoalPercent}%</span>
                <span className="text-muted-foreground/60 text-[10px] uppercase tracking-widest">of goal</span>
              </div>
            </div>
            <div className="text-center text-xs text-muted-foreground/70">
              Target: <span className="text-white font-mono">18,000 SAR</span> · Saved: <span className="text-white font-mono">{(dashboard?.savingsBalance ?? 0).toLocaleString()} SAR</span>
            </div>
          </motion.div>

          {/* Financial goals */}
          <motion.div variants={itemVariants} className="glass-float rounded-3xl p-6 border border-white/6 card-premium">
            <h3 className="font-semibold text-white text-sm mb-5">Financial Goals</h3>
            <div className="space-y-5">
              {[
                { label: 'Emergency Fund', pct: 85, color: 'bg-emerald-400', tcolor: 'text-emerald-400' },
                { label: 'New Car Fund',   pct: 42, color: 'bg-blue-400',    tcolor: 'text-blue-400'    },
                { label: 'Vacation',       pct: 23, color: 'bg-amber-400',   tcolor: 'text-amber-400'   },
              ].map((g) => (
                <div key={g.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-white font-medium">{g.label}</span>
                    <span className={`text-xs font-mono font-semibold ${g.tcolor}`}>{g.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${g.pct}%` }} transition={{ duration: 1, delay: 0.3 }}
                      className={`h-full rounded-full ${g.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Investment Teaser ── */}
        <motion.div variants={itemVariants}
          className="glass-float rounded-3xl p-6 border border-primary/20 card-premium relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(10,9,7,0.8) 100%)' }}>
          <div className="absolute right-0 top-0 w-56 h-56 bg-primary/10 blur-[70px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-primary text-[10px] uppercase tracking-[0.2em] font-semibold mb-1">Investments</p>
              <h3 className="text-xl font-bold text-white mb-1">Your portfolio grows at 7.2% p.a.</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {[['Sukuk', '+5.1%'], ['Real Estate', '+8.4%'], ['Gold Funds', '+12.0%']].map(([name, pct]) => (
                  <span key={name} className="px-3 py-1 rounded-full glass border border-white/8 text-xs text-white/80 flex items-center gap-1.5">
                    {name} <span className="text-emerald-400 font-semibold">{pct}</span>
                  </span>
                ))}
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex-shrink-0 bg-primary text-black font-bold px-5 py-2.5 rounded-xl text-sm shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_30px_rgba(212,175,55,0.35)] transition-shadow">
              Explore
            </motion.button>
          </div>
        </motion.div>

        {/* ── Recent Transactions ── */}
        <motion.div variants={itemVariants} className="glass-float rounded-3xl border border-white/6 card-premium overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
            <h3 className="font-semibold text-white text-sm">Recent Activity</h3>
            <Link href="/dashboard/transactions">
              <motion.span whileTap={{ scale: 0.95 }} className="text-xs text-primary font-semibold flex items-center gap-1 cursor-pointer hover:text-primary/80 transition-colors">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </motion.span>
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {transactions?.map((tx) => (
              <motion.div key={tx.id}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
                whileTap={{ scale: 0.995 }}
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer group"
              >
                <motion.div whileHover={{ scale: 1.08 }}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-xl flex-shrink-0 group-hover:border-primary/20 transition-colors">
                  {tx.icon}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate group-hover:text-primary/90 transition-colors">{tx.title}</p>
                  <p className="text-xs text-muted-foreground/60 truncate">{tx.subtitle} · {format(new Date(tx.date), 'MMM d, h:mm a')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-mono text-sm font-semibold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-white/90'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 capitalize mt-0.5">{tx.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}
