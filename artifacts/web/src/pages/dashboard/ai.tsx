import { useState, useRef, useEffect } from 'react';
import { useGetSpending } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import {
  Sparkles, Send, User, BrainCircuit, TrendingUp, Activity, Bell,
  ShieldCheck, Target, Zap, ChevronRight, ArrowRight, RefreshCw,
  CreditCard, Wallet, Home, Car, Sunset, BarChart2, AlertTriangle,
  Utensils, ShoppingBag, Bus, Film, Receipt, PiggyBank,
  Brain, Star, Shield, Award, Dna, Clock, Lock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FraudModal } from './cards';
import {
  AreaChart, Area, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
type WidgetType = 'expense-analysis' | 'prediction' | 'unused-money' | 'bills' | 'financial-dna' | 'investment';

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  widget?: WidgetType;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const EXPENSE_CATS = [
  { label: 'Food & Dining',  icon: Utensils,    amount: 1240, pct: 31,   color: '#D4AF37', bg: 'rgba(212,175,55,0.12)'  },
  { label: 'Shopping',       icon: ShoppingBag, amount: 780,  pct: 19.5, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  { label: 'Transport',      icon: Bus,         amount: 450,  pct: 11.25,color: '#a855f7', bg: 'rgba(168,85,247,0.12)'  },
  { label: 'Entertainment',  icon: Film,        amount: 320,  pct: 8,    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  { label: 'Bills',          icon: Receipt,     amount: 840,  pct: 21,   color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  { label: 'Savings',        icon: PiggyBank,   amount: 370,  pct: 9.25, color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
];
const SPENDING_PIE = EXPENSE_CATS.map(c => ({ name: c.label, amount: c.amount }));
const MONTHLY_TREND = [
  { month: 'Apr', total: 4200 }, { month: 'May', total: 3600 },
  { month: 'Jun', total: 4800 }, { month: 'Jul', total: 4000 },
];
const PRED_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  balance: 15000 - i * 140 + (i % 5 === 0 ? 400 : 0),
}));
const DNA_TRAITS = [
  { label: 'Discipline', value: 95 }, { label: 'Savings', value: 92 },
  { label: 'Investment', value: 68 }, { label: 'Risk Mgmt', value: 78 },
  { label: 'Planning', value: 87 },  { label: 'Spending', value: 81 },
];

const ttStyle = { backgroundColor: 'rgba(8,7,5,0.96)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '12px', fontSize: '11px' };

// ─── Animated Ring ────────────────────────────────────────────────────────────
function Ring({ pct, size = 52, stroke = 7, color = '#D4AF37', label }: {
  pct: number; size?: number; stroke?: number; color?: string; label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} fill="none" />
        <motion.circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold font-mono text-white" style={{ fontSize: size > 60 ? 15 : 11 }}>{label}</span>
        </div>
      )}
    </div>
  );
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [d, setD] = useState('');
  useEffect(() => {
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => { if (i < text.length) setD(text.slice(0, ++i)); else clearInterval(iv); }, 22);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);
  return <span>{d}</span>;
}

// ─── Widget: Expense Analysis ─────────────────────────────────────────────────
function ExpenseAnalysisWidget() {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="mt-4 space-y-4">
      {/* Category grid */}
      <div className="grid grid-cols-3 gap-2">
        {EXPENSE_CATS.map((cat, i) => (
          <motion.div key={cat.label}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.09, type: 'spring', stiffness: 280, damping: 22 }}
            className="rounded-2xl p-3 border border-white/6 flex flex-col items-center text-center"
            style={{ background: cat.bg }}>
            <cat.icon className="w-4 h-4 mb-1.5" style={{ color: cat.color }} />
            <p className="text-white font-mono font-bold text-sm">{cat.amount.toLocaleString()}</p>
            <p className="text-muted-foreground/70 text-[9px] mt-0.5 leading-tight">{cat.label}</p>
            <span className="text-[9px] font-semibold mt-1" style={{ color: cat.color }}>{cat.pct}%</span>
          </motion.div>
        ))}
      </div>

      {/* Donut chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="bg-black/40 rounded-2xl p-3 border border-white/5">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Spending Breakdown</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={SPENDING_PIE} cx="50%" cy="46%" innerRadius={42} outerRadius={62} paddingAngle={4} dataKey="amount" stroke="none">
                {SPENDING_PIE.map((_, i) => <Cell key={i} fill={EXPENSE_CATS[i].color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`SAR ${v.toLocaleString()}`]} contentStyle={ttStyle} />
              <Legend iconType="circle" iconSize={6} formatter={v => <span className="text-white/60 text-[9px]">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Monthly bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="bg-black/40 rounded-2xl p-3 border border-white/5">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Monthly Trend</p>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_TREND} margin={{ left: -24, right: 8 }}>
              <XAxis dataKey="month" stroke="#555" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" fontSize={9} tickLine={false} axisLine={false} tickFormatter={v => `${v/1000}k`} />
              <Tooltip contentStyle={ttStyle} formatter={(v: number) => [`SAR ${v.toLocaleString()}`]} />
              <Bar dataKey="total" radius={[5,5,0,0]} maxBarSize={32}>
                {MONTHLY_TREND.map((_, i) => <Cell key={i} fill={i === MONTHLY_TREND.length-1 ? '#D4AF37' : 'rgba(212,175,55,0.35)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
        className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/15">
        <span className="text-muted-foreground/70 text-xs">Total spent this month</span>
        <span className="font-mono font-bold text-primary">SAR 4,000</span>
      </motion.div>
    </motion.div>
  );
}

// ─── Widget: Balance Prediction ───────────────────────────────────────────────
function PredictionWidget() {
  const [days] = useState(12);
  const daysTotal = 30;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
      {/* Projection card */}
      <div className="bg-black/40 rounded-2xl p-4 border border-blue-500/15">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Month-End Projection</p>
            <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
              className="text-3xl font-mono font-bold text-white">SAR 3,280</motion.p>
          </div>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="px-2.5 py-1 rounded-full bg-blue-500/12 border border-blue-500/25 text-blue-400 text-[10px] font-bold">
            96% Confidence
          </motion.span>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PRED_DATA} margin={{ left: -24, right: 4 }}>
              <defs>
                <linearGradient id="pG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#444" fontSize={9} tickLine={false} axisLine={false} tickFormatter={v => `D${v}`} interval={4} />
              <YAxis stroke="#444" fontSize={9} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={ttStyle} formatter={(v: number) => [`SAR ${v.toFixed(0)}`]} />
              <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="url(#pG)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Salary countdown */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
        className="bg-black/40 rounded-2xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-white text-sm font-semibold">Days Until Salary</p>
          </div>
          <p className="text-primary font-mono font-bold text-xl">{days} days</p>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #D4AF37 0%, #f59e0b 100%)' }}
            initial={{ width: 0 }}
            animate={{ width: `${((daysTotal - days) / daysTotal) * 100}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-1.5">
          <span>Salary date</span>
          <span>July 29</span>
        </div>
      </motion.div>

      {/* Three insight chips */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="grid grid-cols-3 gap-2">
        {[['Next salary', 'SAR 16,400', '#D4AF37'], ['Bills pending', 'SAR 1,038', '#ef4444'], ['Safe to spend', 'SAR 2,242', '#10b981']].map(([l, v, c]) => (
          <div key={l} className="bg-black/40 rounded-xl p-2.5 border border-white/5 text-center">
            <p className="text-[9px] text-muted-foreground/60 mb-1">{l}</p>
            <p className="font-mono font-bold text-xs" style={{ color: c }}>{v}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Widget: Unused Money ─────────────────────────────────────────────────────
function UnusedMoneyWidget() {
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<string | null>(null);

  const simulate = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setSimResult('SAR 524 · after 1 year at 3.2% return');
    }, 1800);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
      {/* Alert card */}
      <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-emerald-400 font-bold text-sm">SAR 500 idle for 6+ months</p>
            <p className="text-muted-foreground/70 text-xs">This money is not working for you.</p>
          </div>
        </div>
        <p className="text-white/75 text-xs leading-relaxed">Moving this to a high-yield account could earn you up to <span className="text-emerald-400 font-semibold">SAR 16/yr</span> at 3.2% annual return.</p>
      </div>

      {/* 4 Options */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Move to Savings', icon: PiggyBank,  color: '#10b981', desc: '+3.2% per year'    },
          { label: 'Emergency Fund',  icon: Shield,      color: '#3b82f6', desc: 'Build safety net'  },
          { label: 'Gold Investment', icon: Star,        color: '#D4AF37', desc: '+12% opportunity'  },
          { label: 'Sukuk Fund',      icon: TrendingUp,  color: '#a855f7', desc: '+5.1% Halal'       },
        ].map(opt => (
          <motion.button key={opt.label} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.96 }}
            onClick={() => toast.success(`${opt.label} initiated — SAR 500 transferred`)}
            className="p-3 rounded-2xl border border-white/7 flex flex-col items-start gap-2 transition-all hover:border-white/20 text-left"
            style={{ background: `${opt.color}08` }}>
            <opt.icon className="w-4 h-4" style={{ color: opt.color }} />
            <div>
              <p className="text-white text-xs font-semibold leading-tight">{opt.label}</p>
              <p className="text-muted-foreground/60 text-[10px]">{opt.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Investment simulation */}
      <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white text-sm font-semibold">Investment Simulation</p>
          <span className="text-[10px] text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">SAR 500 input</span>
        </div>
        {simResult ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex items-center justify-between mb-2">
              <div className="grid grid-cols-3 gap-2 flex-1 mr-3">
                {[['1 year', 'SAR 516', '#10b981'], ['5 years', 'SAR 589', '#3b82f6'], ['10 years', 'SAR 694', '#D4AF37']].map(([t, v, c]) => (
                  <div key={t} className="text-center bg-black/40 rounded-xl p-2 border border-white/5">
                    <p className="text-[9px] text-muted-foreground/60">{t}</p>
                    <p className="font-mono font-bold text-xs" style={{ color: c }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-emerald-400 text-xs text-center">Based on 3.2% annual return model</p>
          </motion.div>
        ) : (
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
            onClick={simulate} disabled={simulating}
            className="w-full py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/15 transition-colors disabled:opacity-60">
            {simulating ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <RefreshCw className="w-3 h-3" />
              </motion.div> Simulating…</>
            ) : '→ Run Growth Simulation'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Widget: Bills ────────────────────────────────────────────────────────────
function BillsWidget() {
  const [paid, setPaid] = useState(false);
  const [reminded, setReminded] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
      {/* Bill card */}
      <div className="rounded-2xl border border-amber-500/25 overflow-hidden" style={{ background: 'rgba(245,158,11,0.05)' }}>
        <div className="px-4 py-3 border-b border-amber-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            <span className="text-white font-semibold text-sm">Internet Bill</span>
          </div>
          <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[10px] font-bold text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/12 border border-amber-500/25">
            Due Tomorrow
          </motion.span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[['Provider', 'STC'], ['Amount', 'SAR 199'], ['Account', '05X-XXX-42']].map(([l, v]) => (
              <div key={l}>
                <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mb-0.5">{l}</p>
                <p className="text-white font-medium text-xs">{v}</p>
              </div>
            ))}
          </div>
          {paid ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-sm">Payment Successful</span>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                onClick={() => { setPaid(true); toast.success('SAR 199 paid to STC'); }}
                className="py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/35 text-amber-400 text-xs font-bold hover:bg-amber-500/28 transition-colors">
                Pay Now · SAR 199
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                onClick={() => { setReminded(true); toast.info('Reminder set for 9:00 AM'); }}
                className={`py-2.5 rounded-xl border text-xs font-medium transition-colors ${reminded ? 'border-primary/30 text-primary bg-primary/8' : 'border-white/10 text-white/70 hover:bg-white/5'}`}>
                {reminded ? '✓ Reminder Set' : 'Remind Me'}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Other upcoming */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-1">Also upcoming</p>
        {[
          { name: 'Netflix',          amount: 'SAR 45',  due: 'In 5 days',  color: '#ef4444' },
          { name: 'Adobe Creative',   amount: 'SAR 79',  due: 'In 12 days', color: '#3b82f6' },
          { name: 'Car Insurance',    amount: 'SAR 285', due: 'In 18 days', color: '#10b981' },
        ].map(b => (
          <div key={b.name} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-black/30 border border-white/5">
            <p className="text-white/80 text-xs">{b.name}</p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground/60">{b.due}</span>
              <span className="font-mono font-bold text-xs" style={{ color: b.color }}>{b.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Widget: Financial DNA ────────────────────────────────────────────────────
function FinancialDNAWidget() {
  const TRAITS = [
    { label: 'Smart Saver',         icon: Brain,        score: 92, color: '#D4AF37', desc: 'You consistently save before spending.' },
    { label: 'Low Risk Thinker',    icon: Shield,       score: 78, color: '#3b82f6', desc: 'You prefer security over high-risk gains.' },
    { label: 'Budget Disciplined',  icon: Award,        score: 95, color: '#10b981', desc: 'You track and control every expense.'     },
  ];
  const RECS = [
    'Increase emergency fund by SAR 200/month to reach target by August.',
    'Your low-risk profile makes Sukuk an ideal primary investment vehicle.',
    'You\'ve maintained a positive savings streak for 8 consecutive months — exceptional.',
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-3 rounded-2xl" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
        <Dna className="w-5 h-5 text-primary" />
        <div>
          <p className="text-primary text-xs font-bold uppercase tracking-wider">Your Financial DNA</p>
          <p className="text-muted-foreground/70 text-[10px]">Analyzed from 847 transactions · Profile confidence 94%</p>
        </div>
      </div>

      {/* 3 personality cards */}
      <div className="space-y-2.5">
        {TRAITS.map((t, i) => (
          <motion.div key={t.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/6" style={{ background: `${t.color}07` }}>
            <Ring pct={t.score} size={52} stroke={6} color={t.color} label={`${t.score}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <t.icon className="w-3.5 h-3.5" style={{ color: t.color }} />
                <p className="text-white font-semibold text-sm">{t.label}</p>
              </div>
              <p className="text-muted-foreground/65 text-xs leading-relaxed">{t.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Radar chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="bg-black/40 rounded-2xl p-3 border border-white/5">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Financial Profile Radar</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={DNA_TRAITS} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} />
              <Radar name="Profile" dataKey="value" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-1">AI Recommendations</p>
        {RECS.map((rec, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.12 }}
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/12">
            <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-white/80 text-xs leading-relaxed">{rec}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Chat widget dispatcher ───────────────────────────────────────────────────
function renderWidget(widget?: WidgetType, spending?: any[]) {
  if (!widget) return null;
  switch (widget) {
    case 'expense-analysis': return <ExpenseAnalysisWidget />;
    case 'prediction':       return <PredictionWidget />;
    case 'unused-money':     return <UnusedMoneyWidget />;
    case 'bills':            return <BillsWidget />;
    case 'financial-dna':    return <FinancialDNAWidget />;
    case 'investment': return (
      <div className="mt-3 space-y-2">
        {[{ name: 'Sukuk Fund', ret: '+5.1%', risk: 'Low', col: '#10b981' }, { name: 'Gold Investment', ret: '+12.0%', risk: 'Medium', col: '#D4AF37' }, { name: 'Real Estate Fund', ret: '+8.4%', risk: 'Medium', col: '#3b82f6' }].map(inv => (
          <div key={inv.name} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-primary/20 transition-colors cursor-pointer group">
            <div><p className="text-white text-sm font-semibold">{inv.name}</p><p className="text-muted-foreground/60 text-xs">{inv.risk} Risk · Shariah</p></div>
            <div className="flex items-center gap-2"><p className="font-mono font-bold text-sm" style={{ color: inv.col }}>{inv.ret}</p><ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" /></div>
          </div>
        ))}
      </div>
    );
    default: return null;
  }
}

// ─── AI Card Icon ─────────────────────────────────────────────────────────────
function CardIcon({ icon: Icon, color }: { icon: any; color: string }) {
  const bg: Record<string,string> = { gold:'bg-primary/15', emerald:'bg-emerald-500/15', blue:'bg-blue-500/15', amber:'bg-amber-500/15', indigo:'bg-indigo-500/15', purple:'bg-purple-500/15', cyan:'bg-cyan-500/15' };
  const tx: Record<string,string> = { gold:'text-primary', emerald:'text-emerald-400', blue:'text-blue-400', amber:'text-amber-400', indigo:'text-indigo-400', purple:'text-purple-400', cyan:'text-cyan-400' };
  return <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg[color]}`}><Icon className={`w-4 h-4 ${tx[color]}`} /></div>;
}
function AICard({ children, color, className='' }: { children: React.ReactNode; color: string; className?: string }) {
  const bd: Record<string,string> = { gold:'border-primary/20', emerald:'border-emerald-500/20', blue:'border-blue-500/20', amber:'border-amber-500/20', indigo:'border-indigo-500/20', purple:'border-purple-500/20', cyan:'border-cyan-500/20' };
  const bg: Record<string,string> = { gold:'rgba(212,175,55,0.04)', emerald:'rgba(16,185,129,0.04)', blue:'rgba(59,130,246,0.04)', amber:'rgba(245,158,11,0.04)', indigo:'rgba(99,102,241,0.04)', purple:'rgba(168,85,247,0.04)', cyan:'rgba(6,182,212,0.04)' };
  return (
    <motion.div variants={itemVariants} whileHover={{ y:-3, transition:{duration:0.18} }}
      className={`glass-float rounded-2xl p-5 border card-premium ${bd[color]??'border-white/10'} ${className}`}
      style={{ background: bg[color]??'transparent' }}>
      {children}
    </motion.div>
  );
}

// ─── Chat responses ───────────────────────────────────────────────────────────
const RESPONSES: Record<string, { content: string; widget?: WidgetType }> = {
  'show spending':    { content: "Here's a full breakdown of your spending this month — all 6 categories, trends, and month-over-month comparison.", widget: 'expense-analysis' },
  'spending':         { content: "Here's a full breakdown of your spending this month — all 6 categories, trends, and month-over-month comparison.", widget: 'expense-analysis' },
  'predict':          { content: "Based on your income schedule and expense patterns, here's your complete 30-day balance forecast. Confidence level: 96%.", widget: 'prediction' },
  'unused':           { content: "I detected SAR 500 sitting idle in your account for over 6 months. Here's exactly what I recommend you do with it.", widget: 'unused-money' },
  'savings':          { content: "I detected SAR 500 sitting idle in your account for over 6 months. Here's exactly what I recommend you do with it.", widget: 'unused-money' },
  'bills':            { content: "You have an internet bill due tomorrow and 3 other upcoming payments this month. Here's the full picture.", widget: 'bills' },
  'dna':              { content: "I've analyzed 847 transactions to build your financial personality profile. Your DNA is exceptionally strong.", widget: 'financial-dna' },
  'financial health': { content: "I've analyzed 847 transactions to build your financial personality profile. Your DNA is exceptionally strong.", widget: 'financial-dna' },
  'investment':       { content: "Your risk profile supports moderate growth instruments. Here are three Shariah-compliant opportunities.", widget: 'investment' },
  'car plan':         { content: "Your Car Goal is at 68%. At SAR 1,200/month you'll reach SAR 80,000 by February 2027. I recommend adding SAR 200/month to arrive 6 weeks earlier." },
  'house':            { content: "Based on your savings trajectory, you could qualify for home financing of up to SAR 650,000 by Q3 2028. I'll monitor your eligibility automatically." },
  'retirement':       { content: "Investing SAR 1,500/month in diversified Sukuk could generate an estimated SAR 2.3M by retirement at 60 — using a conservative 6.5% annual return model." },
};

const QUICK_ACTIONS = [
  { icon: BarChart2,  label: 'Show Spending',     key: 'show spending'    },
  { icon: TrendingUp, label: 'Predict Balance',   key: 'predict balance'  },
  { icon: Wallet,     label: 'Unused Money',      key: 'unused money'     },
  { icon: Receipt,    label: 'Bills Due',         key: 'bills'            },
  { icon: Dna,        label: 'Financial DNA',     key: 'financial dna'    },
  { icon: Sparkles,   label: 'Investment Ideas',  key: 'investment ideas' },
  { icon: Car,        label: 'Car Plan',          key: 'car plan'         },
  { icon: Home,       label: 'House Plan',        key: 'house plan'       },
  { icon: Sunset,     label: 'Retirement',        key: 'retirement'       },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AIFinancialCenter() {
  const { user } = useRequireAuth();
  const { data: spending } = useGetSpending();
  const [input, setInput]       = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isFraudOpen, setFraudOpen] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const firstName = user?.fullName?.split(' ')[0] ?? 'Ahmed';

  const handleSend = (e?: React.FormEvent, preset?: string) => {
    e?.preventDefault();
    const text = preset || input;
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
    if (!preset) setInput('');
    setIsTyping(true);
    const key = text.toLowerCase();
    const match = Object.keys(RESPONSES).find(k => key.includes(k));
    setTimeout(() => {
      setIsTyping(false);
      const response = match ? RESPONSES[match] : { content: "I've analyzed your data. Ask about spending, predictions, savings, bills, or your financial DNA." };
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'ai', ...response }]);
    }, 1400);
  };

  return (
    <DashboardLayout>
      <FraudModal isOpen={isFraudOpen} onClose={() => setFraudOpen(false)} />

      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 pb-4">

        {/* ── Hero Header ── */}
        <header className="relative overflow-hidden glass-float rounded-3xl p-6 border border-primary/15 card-premium"
          style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(10,9,7,0.85) 60%, rgba(8,7,5,0.9) 100%)' }}>
          <div className="absolute top-0 right-0 w-56 h-56 bg-primary/8 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    <BrainCircuit className="w-5 h-5 text-primary" />
                  </div>
                  <motion.span animate={{ scale: [1,1.3,1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Nabeh Intelligence · Active</p>
                  <p className="text-muted-foreground/60 text-xs">Real-time analysis · Updated just now</p>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.88 }} onClick={() => { setRefreshing(true); setTimeout(() => { setRefreshing(false); toast.success('Analysis refreshed'); }, 1800); }}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                <motion.div animate={isRefreshing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </motion.div>
              </motion.button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Good morning, {firstName} 👋</h1>
            <p className="text-muted-foreground/80 text-sm leading-relaxed">
              <TypewriterText text="I've analyzed your financial activity overnight. Here's what I found." delay={300} />
            </p>
            <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-white/[0.06]">
              {[['Health Score','91/100','text-emerald-400'], ['Month Forecast','SAR 3,280','text-blue-400'], ['Alerts Found','2 items','text-amber-400'], ['Opportunities','4 found','text-primary']].map(([l,v,c]) => (
                <div key={l} className="flex flex-col">
                  <span className={`font-mono font-bold text-sm ${c}`}>{v}</span>
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ── 9 Smart Proactive Cards ── */}
        <div>
          <div className="flex items-center gap-2 px-1 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-white">Proactive Insights</h2>
            <span className="ml-auto text-[10px] text-muted-foreground/60 uppercase tracking-widest">9 analyses</span>
          </div>
          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* 1. Financial Health */}
            <AICard color="gold">
              <div className="flex items-start justify-between mb-3"><CardIcon icon={Activity} color="gold" /><span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">Live</span></div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Financial Health</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-mono font-bold text-white leading-none">91<span className="text-lg text-muted-foreground font-normal ml-0.5">/100</span></p>
                <Ring pct={91} size={52} stroke={7} color="#D4AF37" label="91" />
              </div>
              <p className="text-emerald-400 text-xs font-medium mt-2">Excellent · Top 12% of users</p>
              <div className="mt-3 space-y-1.5">
                {[['Savings Rate',85,'#10b981'],['Bill Timeliness',100,'#D4AF37'],['Debt Control',100,'#3b82f6']].map(([l,v,c])=>(
                  <div key={l as string} className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden"><motion.div className="h-full rounded-full" style={{backgroundColor:c as string}} initial={{width:0}} animate={{width:`${v}%`}} transition={{duration:1}} /></div>
                    <span className="text-[10px] text-muted-foreground/60 w-8 text-right">{v}%</span>
                  </div>
                ))}
              </div>
            </AICard>

            {/* 2. Prediction */}
            <AICard color="blue">
              <div className="flex items-start justify-between mb-3"><CardIcon icon={TrendingUp} color="blue" /><span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-semibold">96% confidence</span></div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Balance Prediction</p>
              <p className="text-2xl font-mono font-bold text-white mb-1">SAR 3,280</p>
              <div className="h-14 mt-2 opacity-70">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PRED_DATA.slice(0,15)}>
                    <defs><linearGradient id="mG2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                    <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="url(#mG2)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </AICard>

            {/* 3. Unused Money */}
            <AICard color="emerald">
              <div className="flex items-start justify-between mb-3"><CardIcon icon={Zap} color="emerald" /><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-semibold">Action needed</span></div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Unused Money</p>
              <p className="text-white/85 text-sm leading-relaxed mb-3">You have <span className="text-emerald-400 font-mono font-bold">SAR 500</span> idle for 6+ months.</p>
              <div className="space-y-2">
                {['Move to Savings → +SAR 16/yr','Emergency Fund','Sukuk · +5.1% Halal'].map(a=>(
                  <motion.button key={a} whileTap={{scale:0.97}} onClick={()=>toast.success('Action initiated')}
                    className="w-full py-1.5 text-[11px] rounded-xl bg-white/5 border border-white/8 text-white hover:bg-emerald-500/10 hover:border-emerald-500/25 hover:text-emerald-400 transition-all font-medium text-left px-3">{a}</motion.button>
                ))}
              </div>
            </AICard>

            {/* 4. Bills */}
            <AICard color="amber">
              <div className="flex items-start justify-between mb-3"><CardIcon icon={Bell} color="amber" /><motion.span animate={{opacity:[1,0.4,1]}} transition={{duration:1.5,repeat:Infinity}} className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-semibold">Due Tomorrow</motion.span></div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Upcoming Bills</p>
              <div className="space-y-2 mb-4">
                {[{name:'Internet (STC)',amount:'SAR 199',urgent:true},{name:'Netflix',amount:'SAR 45',urgent:false}].map(b=>(
                  <div key={b.name} className={`flex items-center justify-between p-2.5 rounded-xl border ${b.urgent?'border-amber-500/20 bg-amber-500/5':'border-white/5'}`}>
                    <div><p className="text-white text-xs font-medium">{b.name}</p></div>
                    <p className={`font-mono text-sm font-bold ${b.urgent?'text-amber-400':'text-white/80'}`}>{b.amount}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <motion.button whileTap={{scale:0.96}} onClick={()=>toast.success('Payment initiated · SAR 199')} className="py-2 text-[11px] rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 font-semibold hover:bg-amber-500/22 transition-colors">Pay SAR 199</motion.button>
                <motion.button whileTap={{scale:0.96}} onClick={()=>toast.info('Reminder set')} className="py-2 text-[11px] rounded-xl bg-white/5 border border-white/8 text-white font-medium hover:bg-white/8 transition-colors">Remind Me</motion.button>
              </div>
            </AICard>

            {/* 5. Goal Progress */}
            <AICard color="indigo">
              <div className="flex items-start justify-between mb-3"><CardIcon icon={Target} color="indigo" /></div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Goal Progress</p>
              <div className="flex items-center justify-between mb-3">
                <div><p className="text-white font-semibold">Car Goal</p><p className="text-muted-foreground/60 text-xs">SAR 54,400 of SAR 80,000</p></div>
                <Ring pct={68} size={52} stroke={6} color="#6366f1" label="68%" />
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                <motion.div className="h-full bg-indigo-400 rounded-full" initial={{width:0}} animate={{width:'68%'}} transition={{duration:1.2}} />
              </div>
              <p className="text-indigo-400 text-xs font-medium">On track · February 2027</p>
            </AICard>

            {/* 6. Fraud Status */}
            <AICard color="emerald">
              <div className="flex items-start justify-between mb-3">
                <CardIcon icon={ShieldCheck} color="emerald" />
                <div className="flex items-center gap-1.5"><motion.span animate={{opacity:[1,0.3,1]}} transition={{duration:2,repeat:Infinity}} className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Protected</span></div>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Fraud Protection</p>
              <p className="text-white/85 text-sm leading-relaxed mb-3">No suspicious activity. All 847 transactions clean.</p>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                <motion.div className="h-full bg-emerald-400 rounded-full" initial={{width:0}} animate={{width:'100%'}} transition={{duration:1.8}} />
              </div>
              <button onClick={() => setFraudOpen(true)} className="w-full text-[11px] py-2 rounded-xl bg-red-500/5 border border-red-500/18 text-red-400/80 hover:bg-red-500/10 transition-colors">
                Demo: Simulate Fraud Alert
              </button>
            </AICard>

            {/* 7. Investment */}
            <AICard color="gold">
              <div className="flex items-start justify-between mb-3"><CardIcon icon={TrendingUp} color="gold" /><span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-semibold">3 opportunities</span></div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Investment Opportunities</p>
              <div className="space-y-2.5">
                {[{name:'Sukuk Fund',ret:'+5.1%',col:'#10b981'},{name:'Gold Investment',ret:'+12.0%',col:'#D4AF37'},{name:'Real Estate Fund',ret:'+8.4%',col:'#3b82f6'}].map(inv=>(
                  <motion.div key={inv.name} whileHover={{x:2}} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/6 hover:border-primary/20 transition-all cursor-pointer group">
                    <p className="text-white text-xs font-semibold">{inv.name}</p>
                    <div className="flex items-center gap-2"><span className="font-mono font-bold text-sm" style={{color:inv.col}}>{inv.ret}</span><ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" /></div>
                  </motion.div>
                ))}
              </div>
            </AICard>

            {/* 8. Subscription Analysis */}
            <AICard color="purple">
              <div className="flex items-start justify-between mb-3"><CardIcon icon={CreditCard} color="purple" /><span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-semibold">Save SAR 540/yr</span></div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Subscriptions</p>
              <div className="space-y-2 mb-3">
                {[{name:'Spotify',amount:'SAR 28/mo',badge:'Used Daily',bc:'emerald'},{name:'Shahid VIP',amount:'SAR 45/mo',badge:'3mo unused',bc:'amber'},{name:'Adobe',amount:'SAR 79/mo',badge:'Active',bc:'blue'}].map(s=>(
                  <div key={s.name} className={`flex items-center justify-between p-2.5 rounded-xl border ${s.bc==='amber'?'border-amber-500/20 bg-amber-500/4':'border-white/5'}`}>
                    <div><p className="text-white text-xs font-medium">{s.name}</p><p className="text-muted-foreground/60 text-[10px]">{s.amount}</p></div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${s.bc==='emerald'?'bg-emerald-500/10 border-emerald-500/20 text-emerald-400':s.bc==='amber'?'bg-amber-500/10 border-amber-500/20 text-amber-400':'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>{s.badge}</span>
                  </div>
                ))}
              </div>
              <motion.button whileTap={{scale:0.97}} onClick={()=>toast.success('Cancelling Shahid · Saving SAR 540/yr')} className="w-full py-2 text-[11px] rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold hover:bg-purple-500/15 transition-colors">Cancel Shahid · Save SAR 540/yr</motion.button>
            </AICard>

            {/* 9. Emergency Fund */}
            <AICard color="cyan">
              <div className="flex items-start justify-between mb-3"><CardIcon icon={AlertTriangle} color="cyan" /><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-semibold">On Track</span></div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Emergency Fund</p>
              <div className="flex items-center justify-between mb-3">
                <div><p className="text-2xl font-mono font-bold text-white leading-none">85%</p><p className="text-muted-foreground/60 text-xs mt-0.5">SAR 17,000 of SAR 20,000</p></div>
                <Ring pct={85} size={52} stroke={7} color="#06b6d4" />
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                <motion.div className="h-full bg-cyan-400 rounded-full" initial={{width:0}} animate={{width:'85%'}} transition={{duration:1.4}} />
              </div>
              <motion.button whileTap={{scale:0.97}} onClick={()=>toast.success('SAR 500 moved to Emergency Fund')} className="w-full py-2 text-[11px] rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold hover:bg-cyan-500/15 transition-colors">Add SAR 500 Now →</motion.button>
            </AICard>

          </motion.div>
        </div>

        {/* ── Chat ── */}
        <motion.div variants={itemVariants} className="glass-float rounded-3xl border border-white/7 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <div><h3 className="text-white font-semibold text-sm">Ask Nabeh Anything</h3><p className="text-muted-foreground/60 text-[10px]">5 premium AI scenarios available</p></div>
            <span className="ml-auto px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">Online</span>
          </div>

          {/* Quick Actions */}
          <div className="px-4 pt-3.5 pb-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2.5">Quick Scenarios</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map(chip => (
                <motion.button key={chip.key} whileHover={{scale:1.04}} whileTap={{scale:0.93}}
                  onClick={() => handleSend(undefined, chip.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/8 text-xs text-muted-foreground hover:text-white hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <chip.icon className="w-3 h-3" />{chip.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="max-h-[600px] overflow-y-auto p-4 space-y-4 custom-scrollbar" style={{background:'rgba(0,0,0,0.2)'}}>
            {messages.length === 0 && (
              <div className="text-center py-10">
                <BrainCircuit className="w-10 h-10 text-primary/25 mx-auto mb-2.5" />
                <p className="text-muted-foreground/60 text-sm">Try a quick scenario above or ask anything</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={`flex gap-3 ${msg.role==='user'?'flex-row-reverse':''}`}>
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role==='ai'?'bg-black border border-primary/40 shadow-[0_0_8px_rgba(212,175,55,0.15)]':'bg-white/10'}`}>
                    {msg.role==='ai'?<Sparkles className="w-3.5 h-3.5 text-primary"/>:<User className="w-3.5 h-3.5 text-muted-foreground"/>}
                  </div>
                  <div className={`max-w-[90%] rounded-2xl p-3.5 text-sm leading-relaxed ${msg.role==='user'?'bg-white/8 text-white rounded-tr-sm':'bg-black/50 border border-white/6 text-white rounded-tl-sm'}`}>
                    {msg.content}
                    {renderWidget(msg.widget, spending)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-black border border-primary/40 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-primary"/></div>
                <div className="bg-black/50 border border-white/6 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  {[0,150,300].map(d=><motion.div key={d} animate={{y:[0,-4,0]}} transition={{duration:0.6,repeat:Infinity,delay:d/1000}} className="w-1.5 h-1.5 rounded-full bg-primary/60"/>)}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div className="p-4 pt-2 border-t border-white/[0.05]">
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <Input value={input} onChange={e=>setInput(e.target.value)}
                placeholder="Show my spending, predict balance, financial DNA…"
                className="flex-1 h-11 bg-black/50 border-white/8 focus:border-primary/40 rounded-xl text-sm placeholder:text-muted-foreground/40"/>
              <motion.button type="submit" whileHover={{scale:1.05}} whileTap={{scale:0.92}}
                disabled={!input.trim()||isTyping}
                className="w-11 h-11 rounded-xl bg-primary text-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <Send className="w-4 h-4"/>
              </motion.button>
            </form>
          </div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}
