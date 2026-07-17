import { useState, useRef, useEffect } from 'react';
import { useGetInsights, useGetSpending } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import {
  Sparkles, Send, User, BrainCircuit, TrendingUp, Activity, Bell,
  ShieldCheck, Target, Zap, ChevronRight, CheckCircle2,
  CreditCard, BarChart2, AlertTriangle, Wallet, Home, Car, Sunset,
  ArrowRight, RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FraudModal } from './cards';
import {
  AreaChart, Area, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  widget?: 'spending' | 'prediction' | 'saving' | 'health' | 'investment';
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const predData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  balance: 15000 - i * 140 + (i % 5 === 0 ? 400 : 0),
}));
const monthlyData = [
  { month: 'Apr', amount: 3800 },
  { month: 'May', amount: 3200 },
  { month: 'Jun', amount: 4100 },
  { month: 'Jul', amount: 3100 },
];
const SPENDING_COLORS = ['#D4AF37', '#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#06b6d4'];
const ttStyle = { backgroundColor: 'rgba(8,7,5,0.95)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '10px', fontSize: '11px' };

// ─── Animated Ring ────────────────────────────────────────────────────────────
function Ring({ pct, size = 60, stroke = 8, color = '#D4AF37', label }: { pct: number; size?: number; stroke?: number; color?: string; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} fill="none" />
        <motion.circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      {label && <div className="absolute inset-0 flex items-center justify-center"><span className="font-bold font-mono text-white" style={{ fontSize: size > 60 ? 16 : 12 }}>{label}</span></div>}
    </div>
  );
}

// ─── Typewriter text ──────────────────────────────────────────────────────────
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        if (i < text.length) { setDisplayed(text.slice(0, ++i)); } else clearInterval(iv);
      }, 22);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);
  return <span>{displayed}</span>;
}

// ─── AI Card wrapper ──────────────────────────────────────────────────────────
function AICard({ children, color, className = '' }: { children: React.ReactNode; color: string; className?: string }) {
  const borderMap: Record<string, string> = {
    gold: 'border-primary/20', emerald: 'border-emerald-500/20', blue: 'border-blue-500/20',
    amber: 'border-amber-500/20', red: 'border-red-500/20', indigo: 'border-indigo-500/20',
    purple: 'border-purple-500/20', cyan: 'border-cyan-500/20',
  };
  const bgMap: Record<string, string> = {
    gold: 'rgba(212,175,55,0.04)', emerald: 'rgba(16,185,129,0.04)', blue: 'rgba(59,130,246,0.04)',
    amber: 'rgba(245,158,11,0.04)', red: 'rgba(239,68,68,0.04)', indigo: 'rgba(99,102,241,0.04)',
    purple: 'rgba(168,85,247,0.04)', cyan: 'rgba(6,182,212,0.04)',
  };
  return (
    <motion.div variants={itemVariants} whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className={`glass-float rounded-2xl p-5 border card-premium ${borderMap[color] ?? 'border-white/10'} ${className}`}
      style={{ background: bgMap[color] ?? 'transparent' }}>
      {children}
    </motion.div>
  );
}

function CardIcon({ icon: Icon, color }: { icon: any; color: string }) {
  const bgMap: Record<string, string> = {
    gold: 'bg-primary/15', emerald: 'bg-emerald-500/15', blue: 'bg-blue-500/15',
    amber: 'bg-amber-500/15', red: 'bg-red-500/15', indigo: 'bg-indigo-500/15',
    purple: 'bg-purple-500/15', cyan: 'bg-cyan-500/15',
  };
  const textMap: Record<string, string> = {
    gold: 'text-primary', emerald: 'text-emerald-400', blue: 'text-blue-400',
    amber: 'text-amber-400', red: 'text-red-400', indigo: 'text-indigo-400',
    purple: 'text-purple-400', cyan: 'text-cyan-400',
  };
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bgMap[color]}`}>
      <Icon className={`w-4 h-4 ${textMap[color]}`} />
    </div>
  );
}

// ─── Chat widget renderers ─────────────────────────────────────────────────────
function renderWidget(widget?: Message['widget'], spending?: any[]) {
  if (!widget) return null;
  switch (widget) {
    case 'spending': return (
      <div className="mt-3 space-y-3">
        <div className="h-48 bg-black/40 rounded-2xl p-3 border border-white/5">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Category Breakdown</p>
          <ResponsiveContainer width="100%" height="88%">
            <PieChart><Pie data={spending ?? []} cx="50%" cy="50%" innerRadius={36} outerRadius={58} paddingAngle={4} dataKey="amount" stroke="none">
              {spending?.map((_, i) => <Cell key={i} fill={SPENDING_COLORS[i % SPENDING_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => [`${v} SAR`]} contentStyle={ttStyle} />
            <Legend iconType="circle" iconSize={7} formatter={v => <span className="text-white/60 text-[9px]">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="h-36 bg-black/40 rounded-2xl p-3 border border-white/5">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2">Monthly Trend</p>
          <ResponsiveContainer width="100%" height="82%">
            <BarChart data={monthlyData} margin={{ left: -20, right: 8 }}>
              <XAxis dataKey="month" stroke="#666" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={ttStyle} />
              <Bar dataKey="amount" fill="#D4AF37" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
    case 'prediction': return (
      <div className="mt-3 bg-black/40 rounded-2xl p-3 border border-white/5">
        <div className="flex justify-between items-start mb-2 px-1">
          <div><p className="text-[9px] uppercase tracking-widest text-muted-foreground">Month-End Projection</p><p className="text-white font-mono font-bold text-lg">SAR 3,280</p></div>
          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[9px] font-medium">96% Confidence</span>
        </div>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={predData}><defs><linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
            <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="url(#pGrad)" strokeWidth={2} dot={false} />
            <Tooltip contentStyle={ttStyle} formatter={(v: number) => [`SAR ${v.toFixed(0)}`]} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
    case 'saving': return (
      <div className="mt-3 bg-black/40 rounded-2xl p-4 border border-emerald-500/20">
        <p className="text-emerald-400 font-semibold text-sm mb-1">SAR 500 idle for 6+ months</p>
        <p className="text-white/60 text-xs mb-3 leading-relaxed">Moving this to savings earns you SAR 16/yr at 3.2% annual return.</p>
        <div className="grid grid-cols-2 gap-2">
          {['Move to Savings', 'Emergency Fund', 'Explore Gold', 'Explore Sukuk'].map(a => (
            <button key={a} onClick={() => toast.success(`${a} initiated`)} className="text-[11px] py-2 px-3 rounded-xl bg-white/5 border border-white/8 text-white hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all text-left">{a}</button>
          ))}
        </div>
      </div>
    );
    case 'investment': return (
      <div className="mt-3 space-y-2">
        {[{ name: 'Sukuk Fund', ret: '+5.1%', risk: 'Low', color: '#10b981' }, { name: 'Gold Investment', ret: '+12.0%', risk: 'Medium', color: '#D4AF37' }, { name: 'Real Estate Fund', ret: '+8.4%', risk: 'Medium', color: '#3b82f6' }].map(inv => (
          <div key={inv.name} className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/5 hover:border-primary/20 transition-colors cursor-pointer group">
            <div><p className="text-white text-sm font-medium">{inv.name}</p><p className="text-muted-foreground text-xs">{inv.risk} Risk · Shariah Compliant</p></div>
            <div className="text-right"><p className="font-mono font-bold text-sm" style={{ color: inv.color }}>{inv.ret}</p><ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" /></div>
          </div>
        ))}
      </div>
    );
    case 'health': return (
      <div className="mt-3 bg-black/40 rounded-2xl p-4 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <Ring pct={91} size={52} stroke={7} label="91" />
          <div><p className="text-white font-semibold text-sm">Excellent</p><p className="text-muted-foreground text-xs">Top 12% of Nabeeh users</p></div>
        </div>
        {[['Savings Rate', 85, '#10b981'], ['Expense Control', 92, '#3b82f6'], ['Debt Ratio', 100, '#10b981'], ['Bill Timeliness', 100, '#D4AF37']].map(([l, v, c]) => (
          <div key={l as string} className="mb-2">
            <div className="flex justify-between text-xs mb-1"><span className="text-white/65">{l}</span><span className="text-white font-mono">{v}%</span></div>
            <div className="h-1 bg-white/5 rounded-full"><div className="h-full rounded-full" style={{ width: `${v}%`, backgroundColor: c as string }} /></div>
          </div>
        ))}
      </div>
    );
    default: return null;
  }
}

// ─── Chip responses ───────────────────────────────────────────────────────────
const RESPONSES: Record<string, { content: string; widget?: Message['widget'] }> = {
  'show spending':    { content: "Here's a full breakdown of your spending this month — categories, trend, and month-over-month comparison.", widget: 'spending' },
  'predict balance':  { content: "Based on your income rhythm and expense patterns, here's your 30-day balance forecast. The model accounts for your salary schedule and recurring bills.", widget: 'prediction' },
  'investment ideas': { content: "Your risk profile supports moderate growth instruments. Here are three Shariah-compliant opportunities aligned with your timeline.", widget: 'investment' },
  'savings plan':     { content: "I found a savings optimization. You have SAR 500 sitting idle for over 6 months — here's what I recommend.", widget: 'saving' },
  'financial health': { content: "Your financial health score is 91/100 — placing you in the top 12% of Nabeeh users. Here's the complete breakdown.", widget: 'health' },
  'car plan':         { content: "Your Car Goal is at 68%. At SAR 1,200/month, you'll reach SAR 80,000 by February 2027. I recommend increasing contributions by SAR 200 to arrive 6 weeks earlier." },
  'house plan':       { content: "Based on your savings trajectory and income level, you could qualify for home financing of up to SAR 650,000 by Q3 2028. I'll monitor your eligibility automatically." },
  'retirement':       { content: "Starting now, investing SAR 1,500/month in a diversified Sukuk portfolio could generate an estimated SAR 2.3M by retirement at 60 — using a conservative 6.5% annual return model." },
};

const QUICK_ACTIONS = [
  { icon: BarChart2,   label: 'Show Spending',    key: 'show spending'    },
  { icon: TrendingUp,  label: 'Predict Balance',  key: 'predict balance'  },
  { icon: Sparkles,    label: 'Investment Ideas', key: 'investment ideas' },
  { icon: Wallet,      label: 'Savings Plan',     key: 'savings plan'     },
  { icon: Car,         label: 'Car Plan',         key: 'car plan'         },
  { icon: Home,        label: 'House Plan',        key: 'house plan'       },
  { icon: Sunset,      label: 'Retirement',       key: 'retirement'       },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AIFinancialCenter() {
  const { user } = useRequireAuth();
  const { data: spending } = useGetSpending();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isFraudModalOpen, setIsFraudModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
      const response = match ? RESPONSES[match] : { content: "I've analyzed your financial data. Your position remains strong. Ask me anything — spending, predictions, savings, or investment opportunities." };
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'ai', ...response }]);
    }, 1500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => { setIsRefreshing(false); toast.success('Analysis refreshed'); }, 1800);
  };

  return (
    <DashboardLayout>
      <FraudModal isOpen={isFraudModalOpen} onClose={() => setIsFraudModalOpen(false)} />

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
                  <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Nabeh Intelligence · Active</p>
                  <p className="text-muted-foreground/60 text-xs">Real-time analysis · Updated just now</p>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleRefresh}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                <motion.div animate={isRefreshing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </motion.div>
              </motion.button>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Good morning, {firstName} 👋
            </h1>
            <p className="text-muted-foreground/80 text-sm leading-relaxed">
              <TypewriterText text="I've analyzed your financial activity overnight. Here's what I found." delay={300} />
            </p>

            {/* Summary metrics strip */}
            <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-white/[0.06]">
              {[
                { label: 'Health Score',   value: '91/100',   color: 'text-emerald-400' },
                { label: 'Month Forecast', value: 'SAR 3,280', color: 'text-blue-400'   },
                { label: 'Alerts Found',   value: '2 items',   color: 'text-amber-400'  },
                { label: 'Opportunities',  value: '4 found',   color: 'text-primary'    },
              ].map(s => (
                <div key={s.label} className="flex flex-col">
                  <span className={`font-mono font-bold text-sm ${s.color}`}>{s.value}</span>
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ── 9 Smart AI Cards ── */}
        <div>
          <div className="flex items-center gap-2 px-1 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-white">Proactive Insights</h2>
            <span className="ml-auto text-[10px] text-muted-foreground/60 uppercase tracking-widest">9 analyses</span>
          </div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* 1. Financial Health */}
            <AICard color="gold">
              <div className="flex items-start justify-between mb-3">
                <CardIcon icon={Activity} color="gold" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Live</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Financial Health</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-mono font-bold text-white leading-none">91<span className="text-lg text-muted-foreground font-normal ml-0.5">/100</span></p>
                <Ring pct={91} size={52} stroke={7} color="#D4AF37" label="91" />
              </div>
              <p className="text-emerald-400 text-xs font-medium mt-2">Excellent · Top 12% of users</p>
              <div className="mt-3 space-y-1.5">
                {[['Savings Rate', 85, '#10b981'], ['Bill Timeliness', 100, '#D4AF37'], ['Debt Control', 100, '#3b82f6']].map(([l, v, c]) => (
                  <div key={l as string} className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: c as string }} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 1 }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 w-8 text-right">{v}%</span>
                  </div>
                ))}
              </div>
            </AICard>

            {/* 2. Balance Prediction */}
            <AICard color="blue">
              <div className="flex items-start justify-between mb-3">
                <CardIcon icon={TrendingUp} color="blue" />
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-semibold">96% confidence</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Balance Prediction</p>
              <p className="text-[10px] text-muted-foreground/60 mb-0.5">Expected at month-end</p>
              <p className="text-2xl font-mono font-bold text-white mb-1">SAR 3,280</p>
              <div className="h-14 mt-2 opacity-70">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={predData.slice(0,15)}>
                    <defs><linearGradient id="miniG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                    <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="url(#miniG)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-muted-foreground/60 text-[10px] mt-1">Your current trajectory is on track</p>
            </AICard>

            {/* 3. Unused Money */}
            <AICard color="emerald">
              <div className="flex items-start justify-between mb-3">
                <CardIcon icon={Zap} color="emerald" />
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-semibold">Action needed</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Unused Money</p>
              <p className="text-white/85 text-sm leading-relaxed mb-3">
                You have <span className="text-emerald-400 font-mono font-bold">SAR 500</span> idle for 6+ months. Moving it could earn you SAR 16/yr.
              </p>
              <div className="space-y-2">
                {['Move to Savings → +SAR 16/yr', 'Create Emergency Fund', 'Explore Sukuk · 5.1%'].map(a => (
                  <motion.button key={a} whileTap={{ scale: 0.97 }} onClick={() => toast.success('Action initiated')}
                    className="w-full py-1.5 text-[11px] rounded-xl bg-white/5 border border-white/8 text-white hover:bg-emerald-500/10 hover:border-emerald-500/25 hover:text-emerald-400 transition-all font-medium text-left px-3">
                    {a}
                  </motion.button>
                ))}
              </div>
            </AICard>

            {/* 4. Bills */}
            <AICard color="amber">
              <div className="flex items-start justify-between mb-3">
                <CardIcon icon={Bell} color="amber" />
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-semibold">
                  Due Tomorrow
                </motion.span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Upcoming Bills</p>
              <div className="space-y-2 mb-4">
                {[
                  { name: 'Internet Bill (STC)', amount: 'SAR 199', when: 'Due Tomorrow', urgent: true },
                  { name: 'Netflix',             amount: 'SAR 45',  when: 'Due in 5 days', urgent: false },
                ].map(b => (
                  <div key={b.name} className={`flex items-center justify-between p-2.5 rounded-xl border ${b.urgent ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/5'}`}>
                    <div><p className="text-white text-xs font-medium">{b.name}</p><p className="text-muted-foreground/60 text-[10px]">{b.when}</p></div>
                    <p className={`font-mono text-sm font-bold ${b.urgent ? 'text-amber-400' : 'text-white/80'}`}>{b.amount}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => toast.success('Payment initiated · SAR 199')}
                  className="py-2 text-[11px] rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 font-semibold hover:bg-amber-500/25 transition-colors">
                  Pay SAR 199 Now
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => toast.info('Reminder set for 9:00 AM')}
                  className="py-2 text-[11px] rounded-xl bg-white/5 border border-white/8 text-white font-medium hover:bg-white/8 transition-colors">
                  Remind Me
                </motion.button>
              </div>
            </AICard>

            {/* 5. Goal Progress */}
            <AICard color="indigo">
              <div className="flex items-start justify-between mb-3">
                <CardIcon icon={Target} color="indigo" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Goal Progress</p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">Car Goal</p>
                  <p className="text-muted-foreground/60 text-xs">SAR 54,400 of SAR 80,000</p>
                </div>
                <Ring pct={68} size={52} stroke={6} color="#6366f1" label="68%" />
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                <motion.div className="h-full bg-indigo-400 rounded-full" initial={{ width: 0 }} animate={{ width: '68%' }} transition={{ duration: 1.2 }} />
              </div>
              <p className="text-indigo-400 text-xs font-medium">On track · February 2027</p>
              <div className="mt-3 space-y-1.5">
                {[['Emergency Fund', 85, '#10b981'], ['Vacation', 23, '#f59e0b']].map(([l, v, c]) => (
                  <div key={l as string} className="flex items-center gap-2">
                    <span className="text-[10px] text-white/60 w-28 truncate">{l}</span>
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: c as string }} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 1 }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground/60">{v}%</span>
                  </div>
                ))}
              </div>
            </AICard>

            {/* 6. Fraud Status */}
            <AICard color="emerald">
              <div className="flex items-start justify-between mb-3">
                <CardIcon icon={ShieldCheck} color="emerald" />
                <div className="flex items-center gap-1.5">
                  <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Protected</span>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Fraud Protection</p>
              <p className="text-white/85 text-sm leading-relaxed mb-3">No suspicious activity detected. All 847 transactions verified clean.</p>
              <div className="space-y-1.5 mb-3">
                {[['Transactions scanned', '847'], ['Threats detected', '0'], ['Last scan', 'Just now']].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-xs"><span className="text-muted-foreground/70">{l}</span><span className="text-white font-mono">{v}</span></div>
                ))}
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                <motion.div className="h-full bg-emerald-400 rounded-full" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.8 }} />
              </div>
              <button onClick={() => setIsFraudModalOpen(true)} className="w-full text-[11px] py-2 rounded-xl bg-red-500/5 border border-red-500/18 text-red-400/80 hover:bg-red-500/10 transition-colors">
                Demo: Simulate Fraud Alert
              </button>
            </AICard>

            {/* 7. Investment Opportunities */}
            <AICard color="gold">
              <div className="flex items-start justify-between mb-3">
                <CardIcon icon={TrendingUp} color="gold" />
                <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-semibold">3 opportunities</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Investment Opportunities</p>
              <div className="space-y-2.5">
                {[
                  { name: 'Sukuk Fund', ret: '+5.1%', risk: 'Low Risk', color: '#10b981' },
                  { name: 'Gold Investment', ret: '+12.0%', risk: 'Medium Risk', color: '#D4AF37' },
                  { name: 'Real Estate Fund', ret: '+8.4%', risk: 'Medium Risk', color: '#3b82f6' },
                ].map(inv => (
                  <motion.div key={inv.name} whileHover={{ x: 2 }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/6 hover:border-primary/20 transition-all cursor-pointer group">
                    <div>
                      <p className="text-white text-xs font-semibold">{inv.name}</p>
                      <p className="text-muted-foreground/60 text-[10px]">{inv.risk} · Shariah Compliant</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm" style={{ color: inv.color }}>{inv.ret}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </AICard>

            {/* 8. Subscription Analysis */}
            <AICard color="purple">
              <div className="flex items-start justify-between mb-3">
                <CardIcon icon={CreditCard} color="purple" />
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-semibold">Save SAR 540/yr</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Subscription Analysis</p>
              <div className="space-y-2.5 mb-3">
                {[
                  { name: 'Spotify Premium', amount: 'SAR 28/mo', status: 'active', badge: 'Used Daily', badgeColor: 'emerald' },
                  { name: 'Shahid VIP',      amount: 'SAR 45/mo', status: 'unused', badge: '3mo unused', badgeColor: 'amber' },
                  { name: 'Adobe Creative',  amount: 'SAR 79/mo', status: 'active', badge: 'Active',     badgeColor: 'blue'   },
                ].map(s => (
                  <div key={s.name} className={`flex items-center justify-between p-2.5 rounded-xl border ${s.status === 'unused' ? 'border-amber-500/20 bg-amber-500/4' : 'border-white/5'}`}>
                    <div><p className="text-white text-xs font-medium">{s.name}</p><p className="text-muted-foreground/60 text-[10px]">{s.amount}</p></div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      s.badgeColor === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      s.badgeColor === 'amber'   ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                   'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}>{s.badge}</span>
                  </div>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => toast.success('Cancelling Shahid VIP · Saving SAR 540/yr')}
                className="w-full py-2 text-[11px] rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold hover:bg-purple-500/15 transition-colors">
                Cancel Shahid · Save SAR 540/yr
              </motion.button>
            </AICard>

            {/* 9. Emergency Fund */}
            <AICard color="cyan">
              <div className="flex items-start justify-between mb-3">
                <CardIcon icon={AlertTriangle} color="cyan" />
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-semibold">On Track</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Emergency Fund</p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-2xl font-mono font-bold text-white leading-none">85%</p>
                  <p className="text-muted-foreground/60 text-xs mt-0.5">SAR 17,000 of SAR 20,000</p>
                </div>
                <Ring pct={85} size={52} stroke={7} color="#06b6d4" />
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                <motion.div className="h-full bg-cyan-400 rounded-full" initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.4 }} />
              </div>
              <p className="text-cyan-400/80 text-xs leading-relaxed mb-3">SAR 3,000 more needed. At your current savings rate, you'll complete this by August 2026.</p>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => toast.success('SAR 500 moved to Emergency Fund')}
                className="w-full py-2 text-[11px] rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold hover:bg-cyan-500/15 transition-colors">
                Add SAR 500 Now →
              </motion.button>
            </AICard>

          </motion.div>
        </div>

        {/* ── Chat (Bottom, Secondary) ── */}
        <motion.div variants={itemVariants} className="glass-float rounded-3xl border border-white/7 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Ask Nabeh Anything</h3>
              <p className="text-muted-foreground/60 text-[10px]">Deep analysis on demand</p>
            </div>
            <span className="ml-auto px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">Online</span>
          </div>

          {/* Quick Actions */}
          <div className="px-4 pt-3.5 pb-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2.5">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map(chip => (
                <motion.button key={chip.key} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.93 }}
                  onClick={() => handleSend(undefined, chip.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/8 text-xs text-muted-foreground hover:text-white hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <chip.icon className="w-3 h-3" />
                  {chip.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="max-h-96 overflow-y-auto p-4 space-y-4 custom-scrollbar" style={{ background: 'rgba(0,0,0,0.2)' }}>
            {messages.length === 0 && (
              <div className="text-center py-8">
                <BrainCircuit className="w-9 h-9 text-primary/30 mx-auto mb-2.5" />
                <p className="text-muted-foreground/60 text-sm">Use a quick action above or type any financial question</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'ai' ? 'bg-black border border-primary/40 shadow-[0_0_8px_rgba(212,175,55,0.15)]' : 'bg-white/10'}`}>
                    {msg.role === 'ai' ? <Sparkles className="w-3.5 h-3.5 text-primary" /> : <User className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-white/8 text-white rounded-tr-sm' : 'bg-black/50 border border-white/6 text-white rounded-tl-sm'}`}>
                    {msg.content}
                    {renderWidget(msg.widget, spending)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-black border border-primary/40 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-black/50 border border-white/6 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  {[0, 150, 300].map(d => <motion.div key={d} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d/1000 }} className="w-1.5 h-1.5 rounded-full bg-primary/60" />)}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 pt-2 border-t border-white/[0.05]">
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <Input value={input} onChange={e => setInput(e.target.value)}
                placeholder="Ask about spending, predictions, investments..."
                className="flex-1 h-11 bg-black/50 border-white/8 focus:border-primary/40 rounded-xl text-sm placeholder:text-muted-foreground/40" />
              <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                disabled={!input.trim() || isTyping}
                className="w-11 h-11 rounded-xl bg-primary text-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <Send className="w-4 h-4" />
              </motion.button>
            </form>
          </div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}
