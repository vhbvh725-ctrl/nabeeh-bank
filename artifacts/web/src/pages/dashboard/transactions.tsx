import { useState } from 'react';
import { useGetTransactions, useGetSpending } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import { format } from 'date-fns';
import {
  BarChart3, TrendingUp, TrendingDown, Target, Activity, Search,
  ArrowUpRight, ArrowDownRight, ChevronDown
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, LineChart, Line, ReferenceLine
} from 'recharts';

// ─── Data per period ──────────────────────────────────────────────────────────
const DATA: Record<string, {
  income: number; expenses: number; savings: number; netWorth: number;
  incomeChange: string; expensesChange: string; savingsChange: string; nwChange: string;
  cashFlow: { label: string; income: number; expenses: number }[];
  spendingCats: { name: string; amount: number; color: string }[];
  forecast: { day: number; actual: number | null; pred: number | null }[];
  investments: { month: string; value: number }[];
  creditUsed: number; creditLimit: number;
  health: { label: string; val: number; color: string }[];
}> = {
  month: {
    income: 16400, expenses: 2800, savings: 2340, netWorth: 89400,
    incomeChange: '+4.2%', expensesChange: '-5.1%', savingsChange: '+18.4%', nwChange: '+2.1%',
    cashFlow: [
      { label: 'W1', income: 4100, expenses: 700 },
      { label: 'W2', income: 4200, expenses: 900 },
      { label: 'W3', income: 3900, expenses: 800 },
      { label: 'W4', income: 4200, expenses: 400 },
    ],
    spendingCats: [
      { name: 'Food',          amount: 1240, color: '#D4AF37' },
      { name: 'Shopping',      amount: 780,  color: '#3b82f6' },
      { name: 'Transport',     amount: 450,  color: '#a855f7' },
      { name: 'Entertainment', amount: 320,  color: '#f59e0b' },
      { name: 'Bills',         amount: 840,  color: '#ef4444' },
    ],
    forecast: [
      ...Array.from({length:10},(_,i)=>({day:i+1,actual:15000-i*120+(i%3===0?200:0),pred:null})),
      ...Array.from({length:21},(_,i)=>({day:i+11,actual:null,pred:13800-i*90+(i%4===0?300:0)})),
    ],
    investments: [
      {month:'W1',value:14000},{month:'W2',value:14200},{month:'W3',value:13900},{month:'W4',value:14600},
    ],
    creditUsed: 3200, creditLimit: 15000,
    health: [{label:'Savings Rate',val:85,color:'#10b981'},{label:'Expense Control',val:92,color:'#3b82f6'},{label:'Debt Ratio',val:100,color:'#10b981'},{label:'Bill Timeliness',val:100,color:'#D4AF37'}],
  },
  quarter: {
    income: 48200, expenses: 12800, savings: 7800, netWorth: 89400,
    incomeChange: '+6.8%', expensesChange: '-2.3%', savingsChange: '+22.1%', nwChange: '+5.4%',
    cashFlow: [
      { label: 'Apr', income: 15500, expenses: 4800 },
      { label: 'May', income: 15000, expenses: 3500 },
      { label: 'Jun', income: 16000, expenses: 3100 },
      { label: 'Jul', income: 16400, expenses: 2800 },
    ],
    spendingCats: [
      { name: 'Food',          amount: 3800, color: '#D4AF37' },
      { name: 'Shopping',      amount: 2400, color: '#3b82f6' },
      { name: 'Transport',     amount: 1400, color: '#a855f7' },
      { name: 'Entertainment', amount: 980,  color: '#f59e0b' },
      { name: 'Bills',         amount: 2520, color: '#ef4444' },
    ],
    forecast: [
      ...Array.from({length:10},(_,i)=>({day:i+1,actual:62000-i*400,pred:null})),
      ...Array.from({length:21},(_,i)=>({day:i+11,actual:null,pred:58000-i*300})),
    ],
    investments: [
      {month:'Apr',value:12800},{month:'May',value:13200},{month:'Jun',value:13900},{month:'Jul',value:14600},
    ],
    creditUsed: 3200, creditLimit: 15000,
    health: [{label:'Savings Rate',val:82,color:'#10b981'},{label:'Expense Control',val:90,color:'#3b82f6'},{label:'Debt Ratio',val:100,color:'#10b981'},{label:'Bill Timeliness',val:100,color:'#D4AF37'}],
  },
  year: {
    income: 186000, expenses: 48000, savings: 29400, netWorth: 89400,
    incomeChange: '+11.2%', expensesChange: '-8.4%', savingsChange: '+35.2%', nwChange: '+18.1%',
    cashFlow: [
      {label:'Feb',income:14800,expenses:4000},{label:'Mar',income:14900,expenses:3600},{label:'Apr',income:15500,expenses:4800},
      {label:'May',income:15000,expenses:3500},{label:'Jun',income:16000,expenses:3100},{label:'Jul',income:16400,expenses:2800},
    ],
    spendingCats: [
      { name: 'Food',          amount: 14200, color: '#D4AF37' },
      { name: 'Shopping',      amount: 9600,  color: '#3b82f6' },
      { name: 'Transport',     amount: 5800,  color: '#a855f7' },
      { name: 'Entertainment', amount: 3900,  color: '#f59e0b' },
      { name: 'Bills',         amount: 10200, color: '#ef4444' },
    ],
    forecast: [
      ...Array.from({length:10},(_,i)=>({day:i+1,actual:220000-i*2000,pred:null})),
      ...Array.from({length:21},(_,i)=>({day:i+11,actual:null,pred:200000-i*1500})),
    ],
    investments: [
      {month:'Jan',value:11000},{month:'Feb',value:11400},{month:'Mar',value:11900},{month:'Apr',value:12800},
      {month:'May',value:13200},{month:'Jun',value:13900},{month:'Jul',value:14600},
    ],
    creditUsed: 3200, creditLimit: 15000,
    health: [{label:'Savings Rate',val:88,color:'#10b981'},{label:'Expense Control',val:94,color:'#3b82f6'},{label:'Debt Ratio',val:100,color:'#10b981'},{label:'Bill Timeliness',val:98,color:'#D4AF37'}],
  },
};

type Period = 'month' | 'quarter' | 'year';
const PERIODS: { key: Period; label: string }[] = [
  { key: 'month',   label: 'This Month'   },
  { key: 'quarter', label: 'Quarter'      },
  { key: 'year',    label: 'This Year'    },
];

const ttStyle = { backgroundColor: 'rgba(8,7,5,0.96)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '12px', fontSize: '11px' };

function AnimatedRing({ pct, size=80, stroke=9, color='#D4AF37', label }: { pct:number; size?:number; stroke?:number; color?:string; label?:string }) {
  const r=(size-stroke)/2, c=2*Math.PI*r;
  return (
    <div className="relative flex-shrink-0" style={{width:size,height:size}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none"/>
        <motion.circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{strokeDashoffset:c}} animate={{strokeDashoffset:c*(1-pct/100)}} transition={{duration:1.5,ease:'easeOut',delay:0.2}}/>
      </svg>
      {label&&<div className="absolute inset-0 flex items-center justify-center"><span className="font-mono font-bold text-white" style={{fontSize:size>70?18:13}}>{label}</span></div>}
    </div>
  );
}

function ChartTip({ active, payload, label }: any) {
  if (!active||!payload?.length) return null;
  return (
    <div className="glass-float rounded-xl p-3 border border-white/8 text-xs space-y-1">
      <p className="text-muted-foreground/70 uppercase tracking-wider mb-1">{label}</p>
      {payload.map((p:any)=>(
        <p key={p.name} className="font-mono font-semibold" style={{color:p.color??p.fill}}>
          {p.name}: {p.value?.toLocaleString()} SAR
        </p>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { user } = useRequireAuth();
  const { data: transactions, isLoading } = useGetTransactions({ limit: 20 });
  const [period, setPeriod] = useState<Period>('month');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const d = DATA[period];

  const grouped = (transactions ?? [])
    .filter(tx => {
      if (filter === 'credit' && tx.type !== 'credit') return false;
      if (filter === 'debit'  && tx.type !== 'debit')  return false;
      if (search && !tx.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .reduce<Record<string, typeof transactions>>((acc, tx) => {
      const key = format(new Date(tx.date), 'yyyy-MM-dd');
      if (!acc[key]) acc[key] = [];
      acc[key].push(tx);
      return acc;
    }, {});

  const creditUtil = Math.round((d.creditUsed / d.creditLimit) * 100);

  return (
    <DashboardLayout>
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-5 pb-4">

        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
          </div>
          <div className="flex items-center gap-1 glass-float rounded-xl p-1 border border-white/7 self-start sm:self-auto">
            {PERIODS.map(p => (
              <motion.button key={p.key} onClick={() => setPeriod(p.key)} whileTap={{ scale: 0.93 }}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${period === p.key ? 'text-black' : 'text-muted-foreground hover:text-white'}`}>
                {period === p.key && <motion.div layoutId="period-pill" className="absolute inset-0 rounded-lg bg-primary" transition={{ type: 'spring', stiffness: 500, damping: 42 }} />}
                <span className="relative z-10">{p.label}</span>
              </motion.button>
            ))}
          </div>
        </header>

        {/* ── Summary Cards ── */}
        <AnimatePresence mode="wait">
          <motion.div key={period} variants={staggerContainer} initial="initial" animate="animate"
            className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Income',    value: d.income,   change: d.incomeChange,   up: true,  color: 'emerald', icon: ArrowUpRight },
              { label: 'Expenses',  value: d.expenses, change: d.expensesChange, up: false, color: 'red',     icon: ArrowDownRight },
              { label: 'Savings',   value: d.savings,  change: d.savingsChange,  up: true,  color: 'blue',    icon: TrendingUp },
              { label: 'Net Worth', value: d.netWorth, change: d.nwChange,       up: true,  color: 'primary', icon: Activity },
            ].map(s => (
              <motion.div key={s.label} variants={itemVariants} whileHover={{ y: -2 }}
                className="glass-float rounded-2xl p-4 border border-white/6 card-premium">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[10px] text-muted-foreground/65 uppercase tracking-widest font-semibold">{s.label}</p>
                  <s.icon className={`w-3.5 h-3.5 ${s.color==='emerald'?'text-emerald-400':s.color==='red'?'text-red-400':s.color==='blue'?'text-blue-400':'text-primary'}`} />
                </div>
                <p className="font-mono font-bold text-xl text-white leading-none mb-1.5">
                  {s.value >= 1000 ? `${(s.value/1000).toFixed(1)}k` : s.value.toLocaleString()}
                </p>
                <span className={`text-[11px] font-bold ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>{s.change}</span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Cash Flow ── */}
        <motion.div variants={itemVariants} className="glass-float rounded-3xl p-5 border border-white/7 card-premium">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white text-sm">Cash Flow</h3>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded-full bg-primary inline-block"/>Income</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded-full bg-red-400 inline-block"/>Expenses</span>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={period} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.cashFlow} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/><stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v=>`${v/1000}k`}/>
                  <Tooltip content={<ChartTip/>}/>
                  <Area type="monotone" dataKey="income"   name="Income"   stroke="#D4AF37" fill="url(#gI)" strokeWidth={2.5} dot={false}/>
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#gE)" strokeWidth={2}   dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── Spending + Investment side by side ── */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Spending Categories */}
          <motion.div variants={itemVariants} className="glass-float rounded-3xl p-5 border border-white/7 card-premium">
            <h3 className="font-semibold text-white text-sm mb-4">Spending Breakdown</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={d.spendingCats} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="amount" stroke="none">
                    {d.spendingCats.map((c,i)=><Cell key={i} fill={c.color}/>)}
                  </Pie>
                  <Tooltip formatter={(v:number)=>[`SAR ${v.toLocaleString()}`]} contentStyle={ttStyle}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {d.spendingCats.map(c=>(
                <div key={c.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:c.color}}/>
                  <span className="text-white/70 text-xs flex-1">{c.name}</span>
                  <span className="font-mono text-xs text-white/80">{c.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Investment Performance */}
          <motion.div variants={itemVariants} className="glass-float rounded-3xl p-5 border border-white/7 card-premium">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm">Investment Performance</h3>
              <span className="text-emerald-400 text-xs font-semibold">+7.2% p.a.</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={d.investments} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.15}/>
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                  <Tooltip contentStyle={ttStyle} formatter={(v:number)=>[`SAR ${v.toLocaleString()}`, 'Portfolio Value']}/>
                  <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2.5} dot={{ fill: '#D4AF37', r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Credit Utilization + Health Score ── */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Credit Utilization */}
          <motion.div variants={itemVariants} className="glass-float rounded-3xl p-5 border border-white/7 card-premium">
            <h3 className="font-semibold text-white text-sm mb-5">Credit Utilization</h3>
            <div className="flex items-center gap-6">
              <AnimatedRing pct={creditUtil} size={90} stroke={9}
                color={creditUtil < 30 ? '#10b981' : creditUtil < 60 ? '#f59e0b' : '#ef4444'}
                label={`${creditUtil}%`} />
              <div className="flex-1 space-y-3">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground/70">Used</span><span className="text-white font-mono font-semibold">SAR {d.creditUsed.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground/70">Available</span><span className="text-white font-mono font-semibold">SAR {(d.creditLimit-d.creditUsed).toLocaleString()}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground/70">Limit</span><span className="text-white font-mono font-semibold">SAR {d.creditLimit.toLocaleString()}</span></div>
                <p className={`text-[11px] font-semibold ${creditUtil<30?'text-emerald-400':creditUtil<60?'text-amber-400':'text-red-400'}`}>
                  {creditUtil<30 ? '✓ Excellent utilization' : creditUtil<60 ? '⚠ Moderate — aim below 30%' : '⚠ High — pay down to improve score'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Financial Health */}
          <motion.div variants={itemVariants} className="glass-float rounded-3xl p-5 border border-white/7 card-premium">
            <div className="flex items-center gap-4 mb-5">
              <AnimatedRing pct={91} size={72} stroke={8} label="91" />
              <div>
                <h3 className="font-semibold text-white">Financial Health</h3>
                <p className="text-emerald-400 text-xs font-medium mt-0.5">Excellent · Top 12%</p>
                <p className="text-muted-foreground/60 text-xs mt-0.5">Based on {period === 'month' ? 'this month' : period === 'quarter' ? 'last quarter' : 'this year'}</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {d.health.map(b=>(
                <div key={b.label}>
                  <div className="flex justify-between text-xs mb-1"><span className="text-white/70">{b.label}</span><span className="text-white font-mono font-semibold">{b.val}%</span></div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{backgroundColor:b.color}} initial={{width:0}} animate={{width:`${b.val}%`}} transition={{duration:1,ease:'easeOut',delay:0.3}}/>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── 30-Day Forecast ── */}
        <motion.div variants={itemVariants} className="glass-float rounded-3xl p-5 border border-white/7 card-premium">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">Balance Forecast</h3>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">96% Confidence</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.forecast} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="fA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4AF37" stopOpacity={0.35}/><stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/></linearGradient>
                  <linearGradient id="fP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v=>`D${v}`} interval={4}/>
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                <Tooltip contentStyle={ttStyle} formatter={(v:number,n)=>[`SAR ${v?.toFixed(0)}`,n==='actual'?'Actual':'Forecast']}/>
                <ReferenceLine x={10} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 3" label={{value:'Today',fontSize:9,fill:'rgba(255,255,255,0.4)',position:'insideTopRight'}}/>
                <Area type="monotone" dataKey="actual"   stroke="#D4AF37" fill="url(#fA)" strokeWidth={2.5} dot={false} connectNulls={false}/>
                <Area type="monotone" dataKey="pred" name="forecast" stroke="#3b82f6" fill="url(#fP)" strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── Transaction History ── */}
        <motion.div variants={itemVariants} className="glass-float rounded-3xl border border-white/7 card-premium overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05] space-y-3">
            <h3 className="font-semibold text-white text-sm">Transaction History</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50"/>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full pl-9 pr-3 h-9 bg-black/40 border border-white/8 rounded-xl text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"/>
              </div>
              <div className="flex gap-1.5">
                {(['all','credit','debit'] as const).map(f=>(
                  <button key={f} onClick={()=>setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filter===f?'bg-primary text-black':'bg-white/5 text-muted-foreground hover:text-white border border-white/8'}`}>
                    {f==='all'?'All':f==='credit'?'Income':'Out'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="divide-y divide-white/[0.035]">
            {isLoading
              ? Array.from({length:5}).map((_,i)=><div key={i} className="flex items-center gap-4 px-5 py-4"><div className="w-10 h-10 skeleton rounded-full"/><div className="flex-1 space-y-2"><div className="h-3 skeleton w-32"/><div className="h-2.5 skeleton w-24"/></div><div className="h-4 skeleton w-20"/></div>)
              : Object.entries(grouped).map(([dateKey, txs])=>(
                <div key={dateKey}>
                  <div className="px-5 py-2.5 bg-white/[0.018] flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/55 font-semibold">
                      {format(new Date(dateKey),'EEEE, MMMM d')}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 font-mono">
                      {txs.reduce((s,t)=>s+(t.type==='credit'?t.amount:-t.amount),0)>0?'+':''}{txs.reduce((s,t)=>s+(t.type==='credit'?t.amount:-t.amount),0).toFixed(0)} SAR
                    </p>
                  </div>
                  {txs.map(tx=>(
                    <motion.div key={tx.id} whileHover={{backgroundColor:'rgba(255,255,255,0.022)'}}
                      className="flex items-center gap-4 px-5 py-3.5 cursor-pointer group transition-colors">
                      <motion.div whileHover={{scale:1.08}} className="w-10 h-10 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-xl flex-shrink-0 group-hover:border-primary/20 transition-colors">
                        {tx.icon}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{tx.title}</p>
                        <p className="text-xs text-muted-foreground/55">{tx.subtitle} · {format(new Date(tx.date),'h:mm a')}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-mono text-sm font-semibold ${tx.type==='credit'?'text-emerald-400':'text-white/88'}`}>
                          {tx.type==='credit'?'+':'−'}{Math.abs(tx.amount).toLocaleString('en-US',{minimumFractionDigits:2})}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 capitalize mt-0.5">{tx.category}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
          </div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}
