import { useState, useRef, useEffect } from 'react';
import { useGetInsights, useGetSpending } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import { Sparkles, Send, User, BrainCircuit, TrendingUp, Activity, Bell, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { FraudModal } from './cards';

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  isInsight?: boolean;
  widget?: 'spending' | 'prediction' | 'saving';
}

const mockPredictionData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  balance: 15000 - (i * 150) + (Math.random() * 500)
}));

export default function AIChat() {
  const { user } = useRequireAuth();
  const { data: insights } = useGetInsights();
  const { data: spending } = useGetSpending();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isFraudModalOpen, setIsFraudModalOpen] = useState(false);

  useEffect(() => {
    if (insights && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'ai',
          content: `Welcome, ${user?.fullName?.split(' ')[0] || 'User'}. I am Nabeh, your financial intelligence. I'm actively monitoring your accounts and finding optimization opportunities.`
        }
      ]);
    }
  }, [insights, user, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent, presetInput?: string) => {
    e?.preventDefault();
    const textToSend = presetInput || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!presetInput) setInput('');
    setIsTyping(true);

    const lowerInput = textToSend.toLowerCase();

    setTimeout(() => {
      setIsTyping(false);
      
      let aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "I've analyzed that request. Your financial position remains strong."
      };

      if (lowerInput.includes('spending')) {
        aiMsg.content = "Here is a breakdown of your spending this month.";
        aiMsg.widget = 'spending';
      } else if (lowerInput.includes('predict') || lowerInput.includes('forecast')) {
        aiMsg.content = "Based on your recurring expenses and daily average, here is your 30-day balance forecast.";
        aiMsg.widget = 'prediction';
      } else if (lowerInput.includes('saving')) {
        aiMsg.content = "I found an opportunity to optimize your idle cash.";
        aiMsg.widget = 'saving';
      }

      setMessages(prev => [...prev, aiMsg]);
    }, 1500);
  };

  const renderWidget = (widget?: string) => {
    if (widget === 'spending') {
      return (
        <div className="h-48 w-full mt-4 bg-black/40 rounded-xl p-4 border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={spending || []} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="amount" stroke="none">
                {spending?.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0a0a08', borderColor: '#c9a84c', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }
    if (widget === 'prediction') {
      return (
        <div className="h-48 w-full mt-4 bg-black/40 rounded-xl p-4 border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockPredictionData}>
              <defs>
                <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="balance" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBlue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    }
    if (widget === 'saving') {
      return (
        <div className="mt-4 glass p-4 rounded-xl border-l-4 border-l-emerald-500">
          <p className="text-white font-medium text-sm mb-2">Saving Opportunity</p>
          <p className="text-xs text-muted-foreground mb-4">You have 500 SAR idle for 6 months. Move to savings for 3.2% annual return.</p>
          <button className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/30 w-full font-medium" onClick={() => toast.success("Funds moved to savings")}>
            Move to Savings
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6"
      >
        <FraudModal isOpen={isFraudModalOpen} onClose={() => setIsFraudModalOpen(false)} />

        {/* Left Panel: Proactive Insights */}
        <div className="hidden md:flex w-[40%] flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Nabeh Intelligence</h1>
              <p className="text-muted-foreground text-xs uppercase tracking-widest">System Active</p>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border-l-4 border-l-primary">
            <h3 className="font-semibold text-white mb-2 text-lg">Good morning, {user?.fullName?.split(' ')[0]}</h3>
            <p className="text-sm text-muted-foreground mb-3">I noticed your savings increased by 18% this month. Excellent discipline.</p>
            <p className="text-xs text-primary font-mono">{format(new Date(), 'MMM d, yyyy HH:mm')}</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Smart Alerts</h4>
            
            {/* Saving Opportunity */}
            <div className="glass p-4 rounded-xl border-l-4 border-l-emerald-500 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium text-sm">Saving Opportunity</span>
              </div>
              <p className="text-xs text-white/80">You have 500 SAR idle for 6 months. Move to savings for 3.2% annual return.</p>
              <div className="flex gap-2">
                <button onClick={() => toast.success("Funds moved")} className="flex-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-1.5 rounded-md hover:bg-emerald-500/20 transition-colors">Move to Savings</button>
                <button onClick={() => toast.success("Fund created")} className="flex-1 text-[10px] bg-white/5 text-white py-1.5 rounded-md hover:bg-white/10 transition-colors">Create Fund</button>
              </div>
            </div>

            {/* Prediction */}
            <div className="glass p-4 rounded-xl border-l-4 border-l-blue-500">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Activity className="w-4 h-4" />
                <span className="font-medium text-sm">Month-End Forecast</span>
              </div>
              <p className="text-xs text-white/80 mb-3">Based on spending patterns, projected balance: <span className="font-mono text-white">3,200 SAR</span>.</p>
              <div className="h-16 w-full opacity-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockPredictionData}>
                    <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subscription */}
            <div className="glass p-4 rounded-xl border-l-4 border-l-amber-500">
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <Bell className="w-4 h-4" />
                <span className="font-medium text-sm">Unused Subscription</span>
              </div>
              <p className="text-xs text-white/80 mb-3">Shahid (45 SAR/mo) unused for 3 months. Potential saving: 540 SAR/yr.</p>
              <button onClick={() => toast.success("Subscription canceled")} className="w-full text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 py-2 rounded-lg hover:bg-amber-500/20 transition-colors font-medium">Cancel Subscription</button>
            </div>

            {/* Fraud Alert */}
            <div className="glass p-4 rounded-xl border-l-4 border-l-red-500">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span className="font-medium text-sm">Security Alert</span>
              </div>
              <p className="text-xs text-white/80 mb-3">Suspicious withdrawal of 50,000 SAR detected from unknown device.</p>
              <button onClick={() => setIsFraudModalOpen(true)} className="w-full text-xs bg-red-500/10 text-red-500 border border-red-500/30 py-2 rounded-lg hover:bg-red-500/20 transition-colors font-medium">Review Now</button>
            </div>
          </div>

          <div className="glass p-4 rounded-xl mt-2">
             <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Spending This Month</h4>
             <div className="space-y-3">
               {spending?.slice(0, 3).map(cat => (
                 <div key={cat.name}>
                   <div className="flex justify-between text-xs mb-1">
                     <span className="text-white capitalize flex items-center gap-1"><span className="text-base">{cat.icon}</span> {cat.name}</span>
                     <span className="font-mono text-muted-foreground">{cat.amount} SAR</span>
                   </div>
                   <div className="w-full h-1 bg-white/5 rounded-full">
                     <div className="h-full rounded-full" style={{ width: `${Math.min(100, (cat.amount/5000)*100)}%`, backgroundColor: cat.color }} />
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Panel: Conversation */}
        <div className="flex-1 flex flex-col glass rounded-3xl border border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar z-10">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'ai' 
                      ? 'bg-black border border-primary/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]' 
                      : 'bg-white/10'
                  }`}>
                    {msg.role === 'ai' ? <Sparkles className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  
                  <div className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-white/10 text-white rounded-tr-sm' 
                      : 'bg-black/60 border border-border text-white rounded-tl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.widget && renderWidget(msg.widget)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-black border border-primary/50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-black/60 border border-border rounded-2xl rounded-tl-sm p-4 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 bg-black/40 border-t border-border z-10 backdrop-blur-md">
            <div className="flex flex-wrap gap-2 mb-3">
              {['Show my spending', 'Predict my balance', 'Find savings', 'Analyze subscriptions'].map(chip => (
                <button 
                  key={chip}
                  onClick={() => handleSend(undefined, chip)}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground hover:text-white hover:border-primary/50 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
            <form onSubmit={handleSend} className="relative flex items-center">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Nabeh for financial analysis..."
                className="pr-12 h-14 bg-black/60 border-primary/20 focus:border-primary/50 rounded-xl text-sm"
              />
              <Button 
                type="submit" 
                size="icon"
                variant="ghost"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 text-primary hover:bg-primary/20 hover:text-primary rounded-lg"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
