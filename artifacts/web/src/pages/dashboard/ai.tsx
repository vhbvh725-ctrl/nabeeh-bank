import { useState, useRef, useEffect } from 'react';
import { useGetInsights, useGetSpending } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import {
  Sparkles, Send, User, BrainCircuit, TrendingUp, Activity, Bell,
  ShieldAlert, ShieldCheck, Target, Zap, ArrowRight, CheckCircle2,
  BarChart3, ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';
import { toast } from 'sonner';
import { FraudModal } from './cards';

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  widget?: 'spending' | 'prediction' | 'saving' | 'health' | 'investment';
}

const mockPredictionData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  balance: 15000 - i * 140 + (i % 5 === 0 ? 400 : 0),
}));

const mockMonthlyData = [
  { month: 'Apr', amount: 3800 },
  { month: 'May', amount: 3200 },
  { month: 'Jun', amount: 4100 },
  { month: 'Jul', amount: 3100 },
];

const SPENDING_COLORS = ['#f97316', '#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#06b6d4'];

const CHIP_SUGGESTIONS = [
  'Show my spending',
  'Predict my balance',
  'Analyze subscriptions',
  'Investment ideas',
  'Savings advice',
  'Emergency fund',
  'Financial health',
  'Car plan',
  'Home purchase',
  'Retirement planning',
];

const AI_RESPONSES: Record<string, { content: string; widget?: Message['widget'] }> = {
  'show my spending': {
    content: "Here's a full breakdown of your spending this month — across categories, over time, and compared to last month.",
    widget: 'spending',
  },
  'predict my balance': {
    content: "Based on your income rhythm and expense patterns, here's your 30-day balance forecast. Confidence: 96%.",
    widget: 'prediction',
  },
  'savings advice': {
    content: "I found an optimization opportunity. You have SAR 500 sitting idle for more than 6 months — it could be working for you.",
    widget: 'saving',
  },
  'emergency fund': {
    content: "I found an optimization opportunity. You have SAR 500 sitting idle for more than 6 months — it could be working for you.",
    widget: 'saving',
  },
  'investment ideas': {
    content: "Your risk profile supports moderate growth instruments. Here are options aligned with Islamic finance principles.",
    widget: 'investment',
  },
  'financial health': {
    content: "Your financial health score is 91/100 — placing you in the top 12% of Nabeeh users. Here's the full diagnostic.",
    widget: 'health',
  },
  'analyze subscriptions': {
    content: "I detected 3 active subscriptions. Shahid (SAR 45/mo) has not been used in 3 months — potential annual saving of SAR 540.",
  },
  'car plan': {
    content: "Your Car Goal is at 68%. At your current savings rate of SAR 1,200/month, you'll reach SAR 80,000 by February 2027. I recommend increasing monthly contributions by SAR 200 to reach it 6 weeks earlier.",
  },
  'home purchase': {
    content: "Based on your current savings trajectory and income level, you could qualify for a home financing of up to SAR 650,000 by Q3 2028. I'll monitor your eligibility automatically.",
  },
  'retirement planning': {
    content: "Starting at your current age, investing SAR 1,500/month in a diversified Sukuk portfolio could generate an estimated SAR 2.3M by retirement at 60 — using a conservative 6.5% annual return model.",
  },
};

export default function AIFinancialCenter() {
  const { user } = useRequireAuth();
  const { data: spending } = useGetSpending();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isFraudModalOpen, setIsFraudModalOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent, preset?: string) => {
    e?.preventDefault();
    const text = preset || input;
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    if (!preset) setInput('');
    setIsTyping(true);

    const key = text.toLowerCase();
    const match = Object.keys(AI_RESPONSES).find(k => key.includes(k));

    setTimeout(() => {
      setIsTyping(false);
      const response = match
        ? AI_RESPONSES[match]
        : { content: "I've analyzed your financial data. Your position remains strong. Ask me anything specific — spending, predictions, savings, or investment opportunities." };
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', ...response }]);
    }, 1400);
  };

  const renderWidget = (widget?: Message['widget']) => {
    switch (widget) {
      case 'spending':
        return (
          <div className="mt-4 space-y-4">
            <div className="h-52 w-full bg-black/40 rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 pl-1">Category Breakdown</p>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie data={spending || []} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={4} dataKey="amount" stroke="none">
                    {spending?.map((_, i) => <Cell key={i} fill={SPENDING_COLORS[i % SPENDING_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} SAR`]} contentStyle={{ backgroundColor: '#050505', borderColor: '#c9a84c40', borderRadius: '10px', fontSize: '12px' }} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-white/70 text-[10px]">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-40 w-full bg-black/40 rounded-2xl p-3 border border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 pl-1">Monthly Comparison</p>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={mockMonthlyData} margin={{ left: -20, right: 10 }}>
                  <XAxis dataKey="month" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#050505', borderColor: '#c9a84c40', borderRadius: '10px', fontSize: '12px' }} />
                  <Bar dataKey="amount" fill="#c9a84c" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'prediction':
        return (
          <div className="mt-4 bg-black/40 rounded-2xl p-3 border border-white/5">
            <div className="flex justify-between items-start mb-3 px-1">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Month-End Projection</p>
                <p className="text-white font-mono text-xl font-bold">SAR 3,280</p>
              </div>
              <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-medium">96% Confidence</span>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPredictionData}>
                  <defs>
                    <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="url(#predGrad)" strokeWidth={2} dot={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#050505', borderColor: '#3b82f640', borderRadius: '10px', fontSize: '12px' }} formatter={(v: number) => [`SAR ${v.toFixed(0)}`]} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'saving':
        return (
          <div className="mt-4 bg-black/40 rounded-2xl p-4 border border-emerald-500/20">
            <p className="text-emerald-400 font-medium text-sm mb-1">Detected: SAR 500 idle for 6+ months</p>
            <p className="text-white/60 text-xs mb-4">Moving this to a savings account could earn you an estimated SAR 16/yr at 3.2% annual return.</p>
            <div className="grid grid-cols-2 gap-2">
              {['Move to Savings', 'Create Emergency Fund', 'Explore Gold Investment', 'Explore Sukuk'].map(action => (
                <button key={action} onClick={() => toast.success(`${action} initiated`)} className="text-[11px] py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all text-left">
                  {action}
                </button>
              ))}
            </div>
            <button onClick={() => toast.info('Opening growth simulator...')} className="w-full mt-2 text-[11px] py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors font-medium">
              Simulate Future Growth →
            </button>
          </div>
        );

      case 'investment':
        return (
          <div className="mt-4 space-y-2">
            {[
              { name: 'Sukuk Fund', return: '+5.1%', risk: 'Low', color: 'emerald' },
              { name: 'Gold Investment', return: '+12.0%', risk: 'Medium', color: 'amber' },
              { name: 'Real Estate Fund', return: '+8.4%', risk: 'Medium', color: 'blue' },
            ].map(inv => (
              <div key={inv.name} className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/5 hover:border-primary/20 transition-colors cursor-pointer group">
                <div>
                  <p className="text-white text-sm font-medium">{inv.name}</p>
                  <p className="text-muted-foreground text-xs">{inv.risk} Risk · Shariah Compliant</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-mono font-bold text-sm">{inv.return}</p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'health':
        return (
          <div className="mt-4 bg-black/40 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                  <circle cx="50" cy="50" r="40" stroke="#c9a84c" strokeWidth="12" fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40 * 0.91} ${2 * Math.PI * 40 * 0.09}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">91</span>
                </div>
              </div>
              <div>
                <p className="text-white font-semibold">Excellent</p>
                <p className="text-muted-foreground text-xs">Top 12% of Nabeeh users</p>
              </div>
            </div>
            {[['Savings Rate', '85%', 'emerald'], ['Expense Control', '92%', 'blue'], ['Debt Ratio', '0%', 'emerald'], ['Bill Timeliness', '100%', 'primary']].map(([label, val, col]) => (
              <div key={label} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">{label}</span>
                  <span className="text-white font-mono">{val}</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full">
                  <div className="h-full rounded-full" style={{ width: val, backgroundColor: col === 'primary' ? '#c9a84c' : col === 'emerald' ? '#10b981' : '#3b82f6' }} />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const firstName = user?.fullName?.split(' ')[0] || 'Ahmed';

  return (
    <DashboardLayout>
      <FraudModal isOpen={isFraudModalOpen} onClose={() => setIsFraudModalOpen(false)} />

      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8 pb-8">

        {/* ── Header ── */}
        <header className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-primary" />
              </div>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">Nabeh Intelligence · System Active</p>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white pt-1">Good morning, {firstName} 👋</h1>
          <p className="text-muted-foreground">I've analyzed your financial activity overnight.</p>
        </header>

        {/* ── Smart AI Cards Grid ── */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Card 1: Financial Health */}
          <motion.div variants={itemVariants} whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="glass rounded-2xl p-5 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent group cursor-default">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Live</span>
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Financial Health</p>
            <p className="text-4xl font-mono font-bold text-white mb-1">91 <span className="text-xl text-muted-foreground font-normal">/ 100</span></p>
            <p className="text-emerald-400 text-xs font-medium">Excellent financial stability.</p>
          </motion.div>

          {/* Card 2: Prediction */}
          <motion.div variants={itemVariants} whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="glass rounded-2xl p-5 border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent cursor-default">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium">96% Confidence</span>
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Prediction</p>
            <p className="text-[10px] text-muted-foreground mb-1">Expected balance at month end</p>
            <p className="text-2xl font-mono font-bold text-white mb-1">SAR 3,280</p>
            <div className="h-12 mt-2 opacity-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPredictionData.slice(0, 15)}>
                  <defs>
                    <linearGradient id="miniGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="url(#miniGrad)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Card 3: Savings Opportunity */}
          <motion.div variants={itemVariants} whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="glass rounded-2xl p-5 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Savings Opportunity</p>
            <p className="text-white/90 text-sm leading-relaxed mb-4">You have <span className="text-emerald-400 font-mono font-bold">SAR 500</span> sitting unused for more than six months.</p>
            <div className="space-y-2">
              {['Move to Savings', 'Emergency Fund', 'Investment Ideas'].map(action => (
                <motion.button key={action} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => toast.success(`${action} initiated`)}
                  className="w-full py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all font-medium">
                  {action}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Card 4: Bills */}
          <motion.div variants={itemVariants} whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="glass rounded-2xl p-5 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-400" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium animate-pulse">Due Tomorrow</span>
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Bills</p>
            <p className="text-white font-semibold text-lg mb-1">Internet Bill</p>
            <p className="text-muted-foreground text-xs mb-4">SAR 199 · Due tomorrow</p>
            <div className="grid grid-cols-2 gap-2">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => toast.success('Payment initiated')}
                className="py-2 text-xs rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-colors font-medium">
                Pay Now
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => toast.info('Reminder set for tomorrow 9:00 AM')}
                className="py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors font-medium">
                Remind Later
              </motion.button>
            </div>
          </motion.div>

          {/* Card 5: Fraud Protection */}
          <motion.div variants={itemVariants} whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="glass rounded-2xl p-5 border border-emerald-600/20 bg-gradient-to-br from-emerald-900/10 to-transparent">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/15 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 text-[10px] font-semibold uppercase tracking-widest">Protected</span>
              </div>
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Fraud Protection</p>
            <p className="text-white/90 text-sm leading-relaxed mb-4">No suspicious activity detected.</p>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full bg-emerald-500 rounded-full" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, ease: 'easeOut' }} />
            </div>
            <p className="text-muted-foreground text-[10px] mt-2">Last scan: Just now · 0 threats found</p>
            <button onClick={() => setIsFraudModalOpen(true)} className="mt-3 w-full text-[11px] py-2 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
              Demo: Simulate Fraud Alert
            </button>
          </motion.div>

          {/* Card 6: Goal Progress */}
          <motion.div variants={itemVariants} whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="glass rounded-2xl p-5 border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent cursor-default">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <Target className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Goal Progress</p>
            <p className="text-white font-semibold mb-1">Car Goal</p>
            <div className="flex items-end justify-between mb-3">
              <p className="text-4xl font-mono font-bold text-white">68<span className="text-xl text-muted-foreground">%</span></p>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Expected completion</p>
                <p className="text-white text-sm font-medium">February 2027</p>
              </div>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full bg-indigo-400 rounded-full" initial={{ width: 0 }} animate={{ width: '68%' }} transition={{ duration: 1.2, ease: 'easeOut' }} />
            </div>
            <p className="text-muted-foreground text-[10px] mt-2">SAR 13,600 of SAR 20,000 target</p>
          </motion.div>
        </motion.div>

        {/* ── Chat Interface (Secondary) ── */}
        <motion.div variants={itemVariants} className="glass rounded-3xl border border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-white font-medium text-sm">Ask Nabeh AI</h3>
            <span className="text-muted-foreground text-xs ml-auto">Secondary · Always available</span>
          </div>

          {/* Messages */}
          <div className="max-h-[500px] overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <BrainCircuit className="w-10 h-10 text-primary/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Ask me anything about your finances</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'ai' ? 'bg-black border border-primary/40 shadow-[0_0_8px_rgba(212,175,55,0.2)]' : 'bg-white/10'}`}>
                    {msg.role === 'ai' ? <Sparkles className="w-3.5 h-3.5 text-primary" /> : <User className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-white/10 text-white rounded-tr-sm' : 'bg-black/60 border border-border text-white rounded-tl-sm'}`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    {msg.widget && renderWidget(msg.widget)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-black border border-primary/40 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-black/60 border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  {[0, 150, 300].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Chips */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex flex-wrap gap-2">
              {CHIP_SUGGESTIONS.map(chip => (
                <motion.button key={chip} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => handleSend(undefined, chip)}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground hover:text-white hover:border-primary/40 hover:bg-primary/5 transition-all">
                  {chip}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 pt-2">
            <form onSubmit={handleSend} className="relative flex items-center">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Nabeh for financial analysis..."
                className="pr-12 h-12 bg-black/60 border-primary/20 focus:border-primary/50 rounded-xl text-sm"
              />
              <Button type="submit" size="icon" variant="ghost" disabled={!input.trim() || isTyping}
                className="absolute right-1 text-primary hover:bg-primary/20 rounded-lg h-10 w-10">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
