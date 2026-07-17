import React, { useEffect, useRef, useState } from 'react';
import { useGetDashboard, useGetTransactions, useGetSpending, useGetInsights } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import {
  ArrowUpRight, ArrowDownRight, ChevronRight, ChevronLeft,
  Lock, TrendingUp, ShieldAlert, Sparkles, Bell, Target,
  Activity, Zap, DollarSign, BarChart2, Clock
} from 'lucide-react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar, CartesianGrid, ReferenceLine
} from 'recharts';

// ─── Animated Number ──────────────────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);
  const sp = useSpring(mv, { damping: 26, stiffness: 65 });
  useEffect(() => { mv.set(value); }, [value, mv]);
  useEffect(() => sp.on('change', (v) => {
    if (nodeRef.current)
      nodeRef.current.textContent = v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }), [sp, decimals]);
  return <span ref={nodeRef}>0.00</span>;
}

// ─── Animated Ring ────────────────────────────────────────────────────────────
function AnimatedRing({ pct, size = 56, stroke = 8, color = 'hsl(var(--primary))', label }: {
  pct: number; size?: number; stroke?: number; color?: string; label?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <motion.circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
          transition={{ duration: 1.6, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold font-mono text-white" style={{ fontSize: size > 80 ? 22 : 13 }}>{label}</span>
        </div>
      )}
    </div>
  );
}

// ─── 3D Card ──────────────────────────────────────────────────────────────────
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
  return (
    <div className="[perspective:1000px] h-full w-full select-none">
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} onMouseMove={handleMouse} onMouseLeave={() => { x.set(0); y.set(0); }} className="w-full h-full relative">
        <div className="relative w-full h-full rounded-3xl overflow-hidden border border-primary/25"
          style={{ background: 'linear-gradient(135deg,rgba(18,15,10,.96) 0%,rgba(32,24,6,.9) 50%,rgba(12,10,6,.96) 100%)', boxShadow: '0 20px 40px rgba(0,0,0,.6),inset 0 0 0 .5px rgba(212,175,55,.08),inset 0 1px 0 rgba(212,175,55,.15)' }}>
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-primary/18 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg,#D4AF37 0,#D4AF37 1px,transparent 0,transparent 50%)', backgroundSize: '10px 10px' }} />
          <div className="relative z-10 p-5 h-full flex flex-col justify-between" style={{ transform: 'translateZ(20px)' }}>
            <div className="flex justify-between items-start">
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300/60 to-yellow-600/50 border border-yellow-500/40 shadow-inner" />
              <div className="flex flex-col items-end">
                <p className="font-bold text-base tracking-[0.2em] text-white/65 italic">VISA</p>
                <div className="flex mt-1">
                  <div className="w-4 h-4 rounded-full bg-red-500/70" />
                  <div className="w-4 h-4 rounded-full bg-amber-500/70 -ml-2" />
                </div>
              </div>
            </div>
            <div>
              <p className="font-mono text-base tracking-[0.16em] text-white/88 mb-3">{cardNumber.slice(0,4)} •••• •••• {cardNumber.slice(-4)}</p>
              <div className="flex justify-between items-end">
                <div><p className="text-[8px] text-white/35 uppercase tracking-widest mb-0.5">Card Holder</p><p className="text-[11px] font-semibold text-white/78 uppercase tracking-wider">{name}</p></div>
                <div className="text-right"><p className="text-[8px] text-white/35 uppercase tracking-widest mb-0.5">Valid Thru</p><p className="text-[11px] font-semibold text-white/78">{expiry}</p></div>
              </div>
            </div>
          </div>
          <p className="absolute bottom-2.5 right-4 text-[7px] tracking-[0.25em] text-white/12 font-bold z-10">NABEEH ULTRA</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Smart Insight Carousel ───────────────────────────────────────────────────
const SMART_INSIGHTS = [
  { id: 0, emoji: '🏆', color: 'emerald', title: 'You saved 18% more than last month', detail: 'SAR 2,340 saved this month vs SAR 1,983 last month. Your discipline is exceptional.', metric: '+18%', metricSub: 'vs last month', action: 'View Breakdown' },
  { id: 1, emoji: '⚡', color: 'amber',   title: 'Internet bill is due tomorrow', detail: 'STC Broadband · SAR 199 · Auto-pay is currently OFF. Pay now to avoid a late fee.', metric: 'SAR 199', metricSub: 'due tomorrow', action: 'Pay Now' },
  { id: 2, emoji: '💰', color: 'blue',    title: 'SAR 500 sitting idle for 6+ months', detail: 'Moving this to a savings account could earn you SAR 16/yr at 3.2% annual return.', metric: 'SAR 500', metricSub: 'unused cash', action: 'Optimize' },
  { id: 3, emoji: '📈', color: 'gold',    title: 'Gold prices are currently attractive', detail: 'Gold is up 3.2% this week. Your risk profile supports a 5% allocation per Nabeh AI.', metric: '+3.2%', metricSub: 'this week', action: 'Explore Gold' },
  { id: 4, emoji: '🎯', color: 'indigo',  title: 'Car goal is 68% complete', detail: 'At SAR 1,200/month you\'ll reach your SAR 80,000 target by February 2027. Well done.', metric: '68%', metricSub: 'of SAR 80,000', action: 'View Goal' },
];
const INSIGHT_COLORS: Record<string, { border: string; bg: string; text: string; progress: string }> = {
  emerald: { border: 'border-emerald-500/25', bg: 'rgba(16,185,129,0.06)', text: 'text-emerald-400', progress: '#10b981' },
  amber:   { border: 'border-amber-500/25',   bg: 'rgba(245,158,11,0.06)',  text: 'text-amber-400',   progress: '#f59e0b' },
  blue:    { border: 'border-blue-500/25',     bg: 'rgba(59,130,246,0.06)', text: 'text-blue-400',    progress: '#3b82f6' },
  gold:    { border: 'border-primary/25',      bg: 'rgba(212,175,55,0.06)', text: 'text-primary',     progress: '#D4AF37' },
  indigo:  { border: 'border-indigo-500/25',   bg: 'rgba(99,102,241,0.06)', text: 'text-indigo-400',  progress: '#6366f1' },
};

function SmartInsightCarousel() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    let p = 0;
    progressRef.current = setInterval(() => {
      p += 100 / 50;
      setProgress(Math.min(p, 100));
    }, 100);
    timerRef.current = setInterval(() => {
      setDir(1);
      setIdx(i => (i + 1) % SMART_INSIGHTS.length);
    }, 5000);
  };

  useEffect(() => { startTimers(); return () => { if (timerRef.current) clearInterval(timerRef.current); if (progressRef.current) clearInterval(progressRef.current); }; }, []);
  useEffect(() => { startTimers(); }, [idx]);

  const goTo = (i: number) => { setDir(i > idx ? 1 : -1); setIdx(i); };
  const prev = () => { setDir(-1); setIdx(i => (i - 1 + SMART_INSIGHTS.length) % SMART_INSIGHTS.length); };
  const next = () => { setDir(1);  setIdx(i => (i + 1) % SMART_INSIGHTS.length); };

  const ins = SMART_INSIGHTS[idx];
  const col = INSIGHT_COLORS[ins.color];

  return (
    <div className="glass-float rounded-3xl border overflow-hidden card-premium" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
      {/* Progress bar */}
      <div className="h-0.5 w-full bg-white/5">
        <motion.div className="h-full rounded-full" style={{ background: col.progress }} animate={{ width: `${progress}%` }} transition={{ duration: 0.08, ease: 'linear' }} />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-semibold">Nabeh AI Insight</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/50">{idx + 1} / {SMART_INSIGHTS.length}</span>
            <button onClick={prev} className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:border-white/20 transition-colors">
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button onClick={next} className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:border-white/20 transition-colors">
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={idx}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            {/* Icon + text */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl border ${col.border} flex-shrink-0`} style={{ background: col.bg }}>
                  {ins.emoji}
                </div>
                <h3 className="font-semibold text-white text-sm leading-snug">{ins.title}</h3>
              </div>
              <p className="text-muted-foreground/80 text-xs leading-relaxed pl-[52px]">{ins.detail}</p>
            </div>

            {/* Metric + action */}
            <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 pl-[52px] sm:pl-0 sm:flex-shrink-0">
              <div className="text-right">
                <p className={`font-mono font-bold text-lg leading-none ${col.text}`}>{ins.metric}</p>
                <p className="text-muted-foreground/60 text-[10px] mt-0.5">{ins.metricSub}</p>
              </div>
              <motion.button whileTap={{ scale: 0.95 }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border ${col.border} ${col.text} transition-colors whitespace-nowrap`}
                style={{ background: col.bg }}>
                {ins.action}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex items-center gap-1.5 mt-4 justify-center">
          {SMART_INSIGHTS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-white/20'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chart data ───────────────────────────────────────────────────────────────
const cashFlowData = [
  { month: 'Feb', income: 15200, expenses: 3100 },
  { month: 'Mar', income: 14800, expenses: 4000 },
  { month: 'Apr', income: 15500, expenses: 2900 },
  { month: 'May', income: 15000, expenses: 3500 },
  { month: 'Jun', income: 16000, expenses: 3100 },
  { month: 'Jul', income: 16400, expenses: 2800 },
];

const monthlyCompData = [
  { month: 'Feb', income: 15200, expenses: 3100 },
  { month: 'Mar', income: 14800, expenses: 4000 },
  { month: 'Apr', income: 15500, expenses: 2900 },
  { month: 'May', income: 15000, expenses: 3500 },
  { month: 'Jun', income: 16000, expenses: 3100 },
  { month: 'Jul', income: 16400, expenses: 2800 },
];

const forecastData = [
  ...Array.from({ length: 10 }, (_, i) => ({ day: i + 1, actual: 15000 - i * 120 + (i % 3 === 0 ? 200 : 0), forecast: null as number | null })),
  ...Array.from({ length: 21 }, (_, i) => ({ day: i + 11, actual: null as number | null, forecast: 13800 - i * 110 + (i % 4 === 0 ? 350 : 0) })),
];

const SPENDING_COLORS = ['#D4AF37', '#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#06b6d4'];

const tooltipStyle = { backgroundColor: 'rgba(8,7,5,0.95)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '11px' };

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="h-14 skeleton w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="md:col-span-2 h-52 skeleton" /><div className="h-44 md:h-52 skeleton" /></div>
        <div className="h-28 skeleton" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array.from({length:4}).map((_,i)=><div key={i} className="h-24 skeleton"/>)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><div className="lg:col-span-2 h-64 skeleton"/><div className="h-64 skeleton"/></div>
        <div className="h-56 skeleton" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><div className="h-64 skeleton"/><div className="h-64 skeleton"/></div>
      </div>
    </DashboardLayout>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-float rounded-xl p-3 border border-white/8 text-xs">
      <p className="text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-mono font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value?.toLocaleString()} SAR
        </p>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const { user, isLoading: isAuthLoading } = useRequireAuth();
  const { data: dashboard, isLoading: isDashboardLoading } = useGetDashboard();
  const { data: transactions, isLoading: isTxLoading } = useGetTransactions({ limit: 4 });
  const { data: spending, isLoading: isSpendingLoading } = useGetSpending();
  const { data: insights, isLoading: isInsightsLoading } = useGetInsights();

  if (isAuthLoading || isDashboardLoading || isTxLoading || isSpendingLoading || isInsightsLoading) return <LoadingSkeleton />;

  const firstName = user?.fullName?.split(' ')[0] ?? 'Ahmed';
  const health = dashboard?.healthScore ?? 91;

  return (
    <DashboardLayout>
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-5 md:space-y-6">

        {/* ── 1. Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <p className="text-primary/80 text-[10px] font-bold tracking-[0.25em] uppercase mb-1">{format(new Date(), 'EEEE, MMMM d · yyyy')}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">Good morning, {firstName} 👋</h1>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Health Score pill */}
            <div className="flex items-center gap-3 glass-float rounded-2xl px-4 py-2.5 border border-white/7">
              <AnimatedRing pct={health} size={44} stroke={7} label={`${health}`} />
              <div>
                <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest">Health Score</p>
                <p className="text-white font-bold text-sm leading-none mt-0.5">{health}/100 <span className="text-emerald-400 text-xs font-normal">Excellent</span></p>
              </div>
            </div>
          </div>
        </header>

        {/* ── 2. Balance Hero + 3D Card ── */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div variants={itemVariants}
            className="md:col-span-2 glass-float rounded-3xl p-6 md:p-7 border border-white/7 card-premium relative overflow-hidden flex flex-col justify-between min-h-[190px]">
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-[80px] -mr-36 -mt-36 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-muted-foreground/70 text-[10px] font-bold tracking-[0.25em] uppercase mb-2.5">Current Balance</p>
              <h2 className="text-4xl md:text-5xl font-mono tracking-tight text-white leading-none mb-3">
                <AnimatedNumber value={dashboard?.balance ?? 0} />
                <span className="text-xl md:text-2xl text-muted-foreground/60 ml-2 font-sans font-normal">SAR</span>
              </h2>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${(dashboard?.monthlyChange ?? 0) >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {(dashboard?.monthlyChange ?? 0) >= 0 ? '+' : ''}{dashboard?.monthlyChange}% this month
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/5 border border-white/8 text-muted-foreground/80">
                  Savings: {(dashboard?.savingsBalance ?? 0).toLocaleString()} SAR
                </span>
              </div>
            </div>
            <div className="relative z-10 flex flex-wrap gap-2 pt-4 border-t border-white/[0.05] mt-4">
              <div className="flex items-center gap-2 bg-primary/8 text-primary px-3 py-1.5 rounded-full border border-primary/20 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />{dashboard?.daysToSalary} days until salary
              </div>
              <div className="flex items-center gap-2 bg-white/5 text-white/70 px-3 py-1.5 rounded-full border border-white/8 text-xs font-medium">
                <Lock className="w-3 h-3 text-muted-foreground" />Locked savings earning 3.2%
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="h-48 md:h-auto min-h-[180px]">
            <Card3D cardNumber={dashboard?.cardNumber ?? '4532000000008821'} name={user?.fullName ?? 'Valued Member'} expiry="12/28" />
          </motion.div>
        </motion.div>

        {/* ── 3. Smart AI Insight Carousel ── */}
        <SmartInsightCarousel />

        {/* ── 4. Quick Stats ── */}
        <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Income',       icon: ArrowUpRight,   value: dashboard?.totalIncome ?? 0,    suffix: 'SAR', change: '+4.2%',    up: true,  color: 'text-emerald-400' },
            { label: 'Expenses',     icon: ArrowDownRight, value: dashboard?.totalExpenses ?? 0,  suffix: 'SAR', change: '-1.1%',    up: false, color: 'text-red-400'     },
            { label: 'Savings Rate', icon: Target,          value: 18,                             suffix: '%',   change: 'Top 10%',  up: true,  color: 'text-blue-400'    },
            { label: 'Investments',  icon: TrendingUp,      value: 7.2,                            suffix: '% p.a', change: 'Active', up: true,  color: 'text-primary'     },
          ].map((s) => (
            <motion.div key={s.label} variants={itemVariants} whileHover={{ y: -2 }}
              className="glass-float rounded-2xl p-4 border border-white/6 card-premium">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-muted-foreground/70 text-[10px] uppercase tracking-widest font-semibold">{s.label}</p>
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <div className="flex items-baseline gap-1 mb-1.5">
                <p className="text-xl md:text-2xl font-mono text-white font-bold">
                  {typeof s.value === 'number' && s.value > 100 ? s.value.toLocaleString() : s.value}
                </p>
                <span className="text-[10px] text-muted-foreground/50">{s.suffix}</span>
              </div>
              <span className={`text-[11px] font-semibold ${s.color}`}>{s.change}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── 5. Cash Flow + Spending Pie ── */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div variants={itemVariants} className="lg:col-span-2 glass-float rounded-3xl p-5 border border-white/7 card-premium">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white text-sm">Cash Flow</h3>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded-full bg-primary inline-block" /> Income</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded-full bg-red-400 inline-block" /> Expenses</span>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v/1000}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="income"   name="Income"   stroke="#D4AF37" fill="url(#gInc)" strokeWidth={2.5} dot={false} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#gExp)" strokeWidth={2}   dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-float rounded-3xl p-5 border border-white/7 card-premium">
            <h3 className="font-semibold text-white text-sm mb-2">Spending Breakdown</h3>
            <div className="h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={spending ?? []} cx="50%" cy="44%" innerRadius={52} outerRadius={74} paddingAngle={4} dataKey="amount" stroke="none">
                    {spending?.map((_, i) => <Cell key={i} fill={SPENDING_COLORS[i % SPENDING_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} SAR`]} contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={28} iconType="circle" iconSize={7} formatter={v => <span className="text-white/65 text-[10px]">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none" style={{ top: '10%', left: '50%', transform: 'translate(-50%,0)' }}>
                <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest">Total</p>
                <p className="text-white font-mono text-base font-bold">{(dashboard?.totalExpenses ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── 6. Monthly Comparison ── */}
        <motion.div variants={itemVariants} className="glass-float rounded-3xl p-5 border border-white/7 card-premium">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-white text-sm">Monthly Comparison</h3>
              <p className="text-muted-foreground/60 text-xs mt-0.5">Income vs Expenses · 6-month view</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70">
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-primary/70 inline-block" />Income</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-red-400/70 inline-block" />Expenses</span>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCompData} margin={{ top: 0, right: 4, left: -24, bottom: 0 }} barSize={18} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v/1000}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="income"   name="Income"   fill="#D4AF37" opacity={0.85} radius={[5,5,0,0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" opacity={0.75} radius={[5,5,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── 7. 30-Day Forecast + Health Breakdown ── */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Forecast */}
          <motion.div variants={itemVariants} className="glass-float rounded-3xl p-5 border border-white/7 card-premium">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white text-sm">30-Day Forecast</h3>
                <p className="text-muted-foreground/60 text-xs mt-0.5">Balance trajectory · 96% confidence</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">Month-end</p>
                <p className="text-white font-mono font-bold">SAR 3,280</p>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `D${v}`} interval={4} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n) => [`SAR ${v?.toFixed(0)}`, n === 'actual' ? 'Actual' : 'Forecast']} />
                  <ReferenceLine x={10} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" label={{ value: 'Today', fontSize: 9, fill: 'rgba(255,255,255,0.4)', position: 'insideTopRight' }} />
                  <Area type="monotone" dataKey="actual"   stroke="#D4AF37"  fill="url(#gActual)"   strokeWidth={2.5} dot={false} connectNulls={false} />
                  <Area type="monotone" dataKey="forecast" stroke="#3b82f6"  fill="url(#gForecast)" strokeWidth={2}   dot={false} strokeDasharray="5 4" connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Financial Health Breakdown */}
          <motion.div variants={itemVariants} className="glass-float rounded-3xl p-5 border border-white/7 card-premium">
            <div className="flex items-center gap-4 mb-5">
              <AnimatedRing pct={health} size={72} stroke={8} label={`${health}`} />
              <div>
                <h3 className="font-semibold text-white">Financial Health</h3>
                <p className="text-emerald-400 text-xs font-medium mt-0.5">Excellent · Top 12% of users</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Based on 8 financial indicators</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Savings Rate',    val: 85, color: '#10b981' },
                { label: 'Expense Control', val: 92, color: '#3b82f6' },
                { label: 'Debt Ratio',      val: 100, color: '#10b981' },
                { label: 'Bill Timeliness', val: 100, color: '#D4AF37' },
              ].map(b => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/70">{b.label}</span>
                    <span className="text-white font-mono font-semibold">{b.val}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: b.color }}
                      initial={{ width: 0 }} animate={{ width: `${b.val}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── 8. Savings + Goals ── */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Savings Ring */}
          <motion.div variants={itemVariants} className="glass-float rounded-3xl p-5 border border-white/7 card-premium">
            <h3 className="font-semibold text-white text-sm mb-5">Savings Progress</h3>
            <div className="flex items-center gap-6">
              <AnimatedRing pct={dashboard?.savingsGoalPercent ?? 0} size={100} stroke={10} label={`${dashboard?.savingsGoalPercent}%`} />
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/70">Emergency Fund</span><span className="text-emerald-400 font-mono">85%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full bg-emerald-400" initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.2 }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/70">Annual Goal</span><span className="text-primary font-mono">{dashboard?.savingsGoalPercent}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${dashboard?.savingsGoalPercent ?? 0}%` }} transition={{ duration: 1.2, delay: 0.2 }} />
                  </div>
                </div>
                <p className="text-muted-foreground/60 text-xs">
                  {(dashboard?.savingsBalance ?? 0).toLocaleString()} SAR / 18,000 SAR target
                </p>
              </div>
            </div>
          </motion.div>

          {/* Goals */}
          <motion.div variants={itemVariants} className="glass-float rounded-3xl p-5 border border-white/7 card-premium">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-white text-sm">Financial Goals</h3>
            </div>
            <div className="space-y-3.5">
              {[
                { name: 'Emergency Fund', pct: 85, target: '20,000', color: '#10b981', eta: 'Aug 2026' },
                { name: 'New Car',        pct: 68, target: '80,000', color: '#6366f1', eta: 'Feb 2027' },
                { name: 'Vacation',       pct: 23, target: '15,000', color: '#f59e0b', eta: 'Dec 2027' },
                { name: 'Home Purchase',  pct: 8,  target: '650,000',color: '#3b82f6', eta: 'Q3 2028'  },
              ].map(g => (
                <div key={g.name} className="flex items-center gap-3">
                  <AnimatedRing pct={g.pct} size={34} stroke={5} color={g.color} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-white/90 text-xs font-medium truncate">{g.name}</p>
                      <span className="text-[10px] text-muted-foreground/60 ml-2 flex-shrink-0">{g.eta}</span>
                    </div>
                    <p className="text-muted-foreground/55 text-[10px]">{g.pct}% of SAR {g.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── 9. Investment ── */}
        <motion.div variants={itemVariants}
          className="glass-float rounded-3xl p-5 md:p-6 border border-primary/18 card-premium relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(10,9,7,0.8) 100%)' }}>
          <div className="absolute right-0 top-0 w-48 h-48 bg-primary/12 blur-[70px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-primary text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Investments</p>
              <h3 className="text-xl font-bold text-white mb-3">Portfolio growing at 7.2% p.a.</h3>
              <div className="flex flex-wrap gap-2">
                {[['Sukuk', '+5.1%', '#10b981'], ['Real Estate', '+8.4%', '#3b82f6'], ['Gold Funds', '+12.0%', '#D4AF37']].map(([n, p, c]) => (
                  <span key={n} className="px-3 py-1.5 rounded-full glass border border-white/8 text-xs text-white/80 flex items-center gap-1.5">
                    {n} <span className="font-semibold font-mono" style={{ color: c }}>{p}</span>
                  </span>
                ))}
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex-shrink-0 bg-primary text-black font-bold px-5 py-2.5 rounded-xl text-sm shadow-[0_0_20px_rgba(212,175,55,0.25)]">
              Explore →
            </motion.button>
          </div>
        </motion.div>

        {/* ── 10. Recent Transactions ── */}
        <motion.div variants={itemVariants} className="glass-float rounded-3xl border border-white/6 card-premium overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
            <h3 className="font-semibold text-white text-sm">Recent Activity</h3>
            <Link href="/dashboard/transactions">
              <motion.span whileTap={{ scale: 0.94 }} className="text-xs text-primary font-semibold flex items-center gap-1 cursor-pointer hover:text-primary/80 transition-colors">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </motion.span>
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {transactions?.map((tx) => (
              <motion.div key={tx.id}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.022)' }}
                whileTap={{ scale: 0.997 }}
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer group"
              >
                <motion.div whileHover={{ scale: 1.08 }}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-xl flex-shrink-0 group-hover:border-primary/20 transition-colors">
                  {tx.icon}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate group-hover:text-primary/90 transition-colors">{tx.title}</p>
                  <p className="text-xs text-muted-foreground/55 truncate">{tx.subtitle} · {format(new Date(tx.date), 'MMM d, h:mm a')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-mono text-sm font-semibold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-white/88'}`}>
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
