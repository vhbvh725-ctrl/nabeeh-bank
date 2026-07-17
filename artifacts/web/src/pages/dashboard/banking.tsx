import { useState, useRef } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import {
  Send, QrCode, Calendar, Download, ArrowDownLeft, Plus,
  ChevronRight, CheckCircle2, X, Landmark, Clock, Sparkles,
  TrendingUp, Shield, PiggyBank, AlertTriangle, BrainCircuit,
  Scan, FileText, CreditCard, User, ArrowUpRight, ArrowDownRight,
  Zap, Star, RefreshCw
} from 'lucide-react';
import { motion as m } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useGetDashboard } from '@workspace/api-client-react';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
type TransferStep = 'idle' | 'form' | 'review' | 'sending' | 'success';

// ─── Mock data ────────────────────────────────────────────────────────────────
const CONTACTS = [
  { id: '1', name: 'Ahmed Al-Rashid', iban: 'SA29 0000 0001 2345', avatar: 'AR', color: '#D4AF37' },
  { id: '2', name: 'Sara Mohammed',   iban: 'SA02 0000 0009 8765', avatar: 'SM', color: '#3b82f6' },
  { id: '3', name: 'Omar Abdullah',   iban: 'SA44 0000 0004 5678', avatar: 'OA', color: '#10b981' },
  { id: '4', name: 'Nora Hassan',     iban: 'SA15 0000 0007 8901', avatar: 'NH', color: '#a855f7' },
];

const SCHEDULED = [
  { id: '1', to: 'Sara Mohammed',  amount: 500,  date: 'Every 1st',    next: 'Aug 1, 2026',  category: 'Family'     },
  { id: '2', to: 'STC Bill',       amount: 199,  date: 'Monthly',      next: 'Jul 18, 2026', category: 'Bills'      },
  { id: '3', to: 'Savings Account',amount: 1200, date: 'Every salary', next: 'Jul 29, 2026', category: 'Savings'    },
];

const STATEMENTS = [
  { month: 'June 2026',     income: 16400, expenses: 4200, transactions: 38, size: '1.2 MB' },
  { month: 'May 2026',      income: 15800, expenses: 3900, transactions: 42, size: '1.4 MB' },
  { month: 'April 2026',    income: 15500, expenses: 4800, transactions: 35, size: '1.1 MB' },
  { month: 'March 2026',    income: 14900, expenses: 3600, transactions: 40, size: '1.3 MB' },
  { month: 'February 2026', income: 14800, expenses: 4100, transactions: 37, size: '1.2 MB' },
  { month: 'January 2026',  income: 15200, expenses: 3800, transactions: 41, size: '1.5 MB' },
];

const INVESTMENT_DATA = [
  { month: 'Jan', value: 12000 }, { month: 'Feb', value: 12400 }, { month: 'Mar', value: 11900 },
  { month: 'Apr', value: 13100 }, { month: 'May', value: 13800 }, { month: 'Jun', value: 14600 },
];

const ttStyle = { backgroundColor: 'rgba(8,7,5,0.96)', borderColor: 'rgba(255,255,255,0.07)', borderRadius: '12px', fontSize: '11px' };

// ─── QR Code (CSS art) ───────────────────────────────────────────────────────
function QRCode({ value }: { value: number }) {
  // Simulate QR pattern with deterministic pseudo-random
  const grid = Array.from({ length: 11 }, (_, r) =>
    Array.from({ length: 11 }, (_, c) => {
      if (r < 3 && c < 3) return true;
      if (r < 3 && c > 7) return true;
      if (r > 7 && c < 3) return true;
      const seed = (r * 11 + c + value) % 7;
      return seed < 3;
    })
  );
  return (
    <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(11, 1fr)', width: 132 }}>
      {grid.map((row, r) => row.map((on, c) => (
        <div key={`${r}-${c}`} className={`w-3 h-3 rounded-sm ${on ? 'bg-white' : 'bg-transparent'}`} />
      )))}
    </div>
  );
}

// ─── QR Modal ────────────────────────────────────────────────────────────────
function QRModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [timeLeft, setTimeLeft] = useState(120);
  useState(() => {
    if (!isOpen) return;
    const iv = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)' }}
          onClick={onClose}>
          <motion.div initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 16 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="glass-float rounded-3xl p-7 border border-white/10 text-center max-w-xs w-full"
            style={{ background: 'rgba(12,11,8,0.97)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-primary" />
                <p className="text-white font-bold text-sm">QR Payment</p>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-muted-foreground/70 text-xs mb-5">Scan to pay this account</p>
            <div className="flex justify-center mb-5">
              <div className="p-4 rounded-2xl bg-white">
                <QRCode value={4821} />
              </div>
            </div>
            <p className="text-white font-mono font-bold text-lg mb-0.5">SAR –––</p>
            <p className="text-muted-foreground/70 text-xs mb-4">Nabeeh Bank · •••• 8821</p>
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${timeLeft > 30 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={timeLeft > 30 ? 'text-emerald-400' : 'text-amber-400'}>
                Expires in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Replace Card Modal ───────────────────────────────────────────────────────
function ReplaceCardModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const REASONS = ['Card damaged', 'Card lost', 'Card stolen', 'Suspicious activity', 'Card expired early'];
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    setStep(3);
    setTimeout(() => {}, 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)' }}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 16 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="glass-float rounded-3xl border border-white/10 overflow-hidden max-w-sm w-full"
            style={{ background: 'rgba(12,11,8,0.97)' }}>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="r1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-white font-bold text-lg">Replace Card</h2>
                      <button onClick={onClose} className="text-muted-foreground hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    <p className="text-muted-foreground/70 text-sm">Select a reason for replacement:</p>
                    <div className="space-y-2">
                      {REASONS.map(r => (
                        <button key={r} onClick={() => setReason(r)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${reason === r ? 'border-primary/40 bg-primary/8 text-white' : 'border-white/6 text-white/70 hover:text-white hover:border-white/12'}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => reason && setStep(2)} disabled={!reason}
                      className="w-full py-3 rounded-xl bg-primary text-black font-bold text-sm disabled:opacity-40 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                      Continue →
                    </motion.button>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div key="r2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto">
                      <CreditCard className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg mb-1">Confirm Replacement</h2>
                      <p className="text-muted-foreground/70 text-sm leading-relaxed">
                        Your current card ending in <span className="text-white font-mono">8821</span> will be deactivated. A new card will arrive in 3–5 business days.
                      </p>
                    </div>
                    <div className="bg-black/40 rounded-xl p-3 border border-white/5 text-xs text-left space-y-1.5">
                      <div className="flex justify-between"><span className="text-muted-foreground/60">Reason</span><span className="text-white">{reason}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground/60">Delivery</span><span className="text-white">3–5 business days</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground/60">Delivery fee</span><span className="text-emerald-400 font-semibold">Free</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setStep(1)} className="py-3 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:text-white transition-colors">Back</button>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm}
                        className="py-3 rounded-xl bg-primary text-black font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.2)]">Confirm</motion.button>
                    </div>
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div key="r3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5 py-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </motion.div>
                    <div>
                      <p className="text-white font-bold text-xl mb-1">Replacement Requested</p>
                      <p className="text-emerald-400 text-sm font-medium">Case ID: NB-CARD-7731</p>
                    </div>
                    <p className="text-muted-foreground/70 text-sm leading-relaxed">Your new card will be delivered by <span className="text-white font-semibold">July 24, 2026</span>. Track delivery in Documents.</p>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
                      className="w-full py-3 rounded-xl border border-primary/40 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors">
                      Done
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Banking() {
  const { user } = useRequireAuth();
  const { data: dashboard } = useGetDashboard();
  const [step, setStep] = useState<TransferStep>('idle');
  const [selectedContact, setSelectedContact] = useState<typeof CONTACTS[0] | null>(null);
  const [amount, setAmount]       = useState('');
  const [note, setNote]           = useState('');
  const [showQR, setShowQR]       = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [savedSAR, setSavedSAR]   = useState(0);

  const balance = dashboard?.balance ?? 15000;
  const afterTransfer = balance - Number(amount || 0);
  const isLarge = Number(amount) > 5000;
  const isRisky = afterTransfer < 3000;

  const handleSend = () => {
    if (!selectedContact || !amount) return;
    setStep('sending');
    setTimeout(() => setStep('success'), 2200);
  };

  const handleReset = () => {
    setStep('idle'); setSelectedContact(null); setAmount(''); setNote('');
  };

  return (
    <DashboardLayout>
      <QRModal isOpen={showQR} onClose={() => setShowQR(false)} />
      <ReplaceCardModal isOpen={showReplace} onClose={() => setShowReplace(false)} />

      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-5 pb-4 max-w-4xl">

        {/* ── Header ── */}
        <header className="pt-1">
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-white">Banking</h1>
          </div>
          <p className="text-muted-foreground/70 text-sm">All your financial tools in one place</p>
        </header>

        {/* ── Quick Actions ── */}
        <motion.div variants={staggerContainer} className="grid grid-cols-4 gap-3">
          {[
            { icon: Send,         label: 'Send',     color: 'primary', action: () => setStep('form') },
            { icon: ArrowDownLeft,label: 'Receive',  color: 'emerald', action: () => toast.info('Share your IBAN: SA29 0000 0001 2345') },
            { icon: QrCode,       label: 'QR Pay',   color: 'blue',    action: () => setShowQR(true) },
            { icon: Calendar,     label: 'Schedule', color: 'purple',  action: () => document.getElementById('scheduled')?.scrollIntoView({ behavior: 'smooth' }) },
          ].map(q => (
            <motion.button key={q.label} variants={itemVariants} whileHover={{ y: -2 }} whileTap={{ scale: 0.93 }}
              onClick={q.action}
              className="glass-float rounded-2xl p-4 border border-white/7 card-premium flex flex-col items-center gap-2.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                q.color === 'primary' ? 'bg-primary/15 border border-primary/20' :
                q.color === 'emerald' ? 'bg-emerald-500/15 border border-emerald-500/20' :
                q.color === 'blue'    ? 'bg-blue-500/15 border border-blue-500/20' :
                                        'bg-purple-500/15 border border-purple-500/20'
              }`}>
                <q.icon className={`w-4.5 h-4.5 ${
                  q.color === 'primary' ? 'text-primary' :
                  q.color === 'emerald' ? 'text-emerald-400' :
                  q.color === 'blue'    ? 'text-blue-400' :
                                          'text-purple-400'
                }`} style={{ width: 18, height: 18 }} />
              </div>
              <span className="text-white/80 text-xs font-semibold">{q.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* ── Money Transfer ── */}
        <AnimatePresence mode="wait">
          {step === 'idle' && (
            <motion.div key="cta" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="glass-float rounded-3xl p-5 border border-primary/15 card-premium cursor-pointer"
              style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.05),rgba(10,9,7,0.9))' }}
              onClick={() => setStep('form')}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                  <Send className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold">Send Money</p>
                  <p className="text-muted-foreground/70 text-xs">Transfer to anyone, instantly</p>
                </div>
                <ChevronRight className="w-5 h-5 text-primary/50" />
              </div>
            </motion.div>
          )}

          {(step === 'form' || step === 'review') && (
            <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="glass-float rounded-3xl border border-white/8 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  <h2 className="text-white font-bold text-sm">Send Money</h2>
                </div>
                <button onClick={handleReset} className="text-muted-foreground hover:text-white transition-colors"><X className="w-4 h-4" /></button>
              </div>

              <div className="p-5 space-y-5">
                {/* Recipients */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2.5">Recent Contacts</p>
                  <div className="grid grid-cols-4 gap-2">
                    {CONTACTS.map(c => (
                      <motion.button key={c.id} whileTap={{ scale: 0.9 }} onClick={() => setSelectedContact(c)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all ${
                          selectedContact?.id === c.id ? 'border-primary/40 bg-primary/8' : 'border-white/5 hover:border-white/15'}`}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white"
                          style={{ background: `${c.color}25`, border: `1px solid ${c.color}40` }}>
                          {c.avatar}
                        </div>
                        <span className="text-[9px] text-white/70 truncate w-full text-center leading-tight">{c.name.split(' ')[0]}</span>
                      </motion.button>
                    ))}
                  </div>
                  {selectedContact && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 px-3 py-2 rounded-xl bg-primary/6 border border-primary/15 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                        style={{ background: `${selectedContact.color}35` }}>{selectedContact.avatar}</div>
                      <p className="text-white/80 text-xs flex-1">{selectedContact.name}</p>
                      <p className="text-muted-foreground/60 text-[10px] font-mono">{selectedContact.iban.slice(-8)}</p>
                    </motion.div>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">Amount (SAR)</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-mono text-sm">SAR</span>
                    <Input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} type="text" inputMode="decimal"
                      placeholder="0.00"
                      className="pl-16 h-14 text-2xl font-mono font-bold bg-black/40 border-white/8 focus:border-primary/40 rounded-2xl text-white" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[500, 1000, 2000, 5000].map(v => (
                      <button key={v} onClick={() => setAmount(String(v))}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-xs text-muted-foreground hover:text-white hover:border-white/15 transition-all font-mono">
                        {v.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">Note (optional)</p>
                  <Input value={note} onChange={e => setNote(e.target.value)} placeholder="What's this for?"
                    className="h-11 bg-black/40 border-white/8 focus:border-primary/40 rounded-xl text-sm" />
                </div>

                {/* AI Review Panel */}
                {amount && Number(amount) > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className={`rounded-2xl p-4 border ${isRisky ? 'border-amber-500/25 bg-amber-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <BrainCircuit className="w-4 h-4 text-primary" />
                      <p className="text-primary text-xs font-bold uppercase tracking-wider">Before You Pay · Nabeh AI</p>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground/70">Balance after transfer</span>
                        <span className={`font-mono font-bold ${isRisky ? 'text-amber-400' : 'text-white'}`}>
                          SAR {Math.max(0, afterTransfer).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {isLarge && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground/70">Transfer size</span>
                          <span className="text-amber-400 font-semibold">Above average</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-white/[0.05]">
                        <p className={`text-xs leading-relaxed ${isRisky ? 'text-amber-400/90' : 'text-emerald-400/90'}`}>
                          {isRisky
                            ? '⚠ This leaves you with less than SAR 3,000. Consider splitting into installments.'
                            : '✓ This transfer looks safe. Your balance remains healthy after the transaction.'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={handleSend}
                  disabled={!selectedContact || !amount || Number(amount) <= 0}
                  className="w-full py-4 rounded-2xl bg-primary text-black font-bold text-sm disabled:opacity-40 shadow-[0_0_25px_rgba(212,175,55,0.2)] hover:shadow-[0_0_35px_rgba(212,175,55,0.3)] transition-shadow flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Confirm & Send
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'sending' && (
            <motion.div key="sending" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-float rounded-3xl p-10 border border-white/8 text-center">
              <div className="relative w-20 h-20 mx-auto mb-5">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary border-b-2 border-b-transparent border-l-2 border-l-transparent" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-3 rounded-full border-t-2 border-primary/40 border-r-2 border-r-transparent border-b-2 border-b-transparent border-l-2 border-l-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Send className="w-7 h-7 text-primary" />
                </div>
              </div>
              <p className="text-white font-bold text-lg mb-1">Sending SAR {Number(amount).toLocaleString()}</p>
              <p className="text-muted-foreground/70 text-sm">Processing via Nabeeh Instant Transfer…</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="glass-float rounded-3xl p-8 border border-emerald-500/20 text-center"
              style={{ background: 'rgba(16,185,129,0.04)' }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)', boxShadow: '0 0 40px rgba(16,185,129,0.2)' }}>
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </motion.div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-bold mb-2">Transfer Complete</p>
              <p className="text-white font-bold text-2xl mb-1">SAR {Number(amount).toLocaleString()}</p>
              <p className="text-muted-foreground/70 text-sm mb-4">Sent to {selectedContact?.name}</p>
              <div className="bg-black/30 rounded-2xl p-3 border border-white/5 text-xs text-left space-y-1.5 mb-5">
                <div className="flex justify-between"><span className="text-muted-foreground/60">Reference</span><span className="text-white font-mono">NB-{Date.now().toString().slice(-8)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground/60">Time</span><span className="text-white">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground/60">Note</span><span className="text-white">{note || '—'}</span></div>
              </div>
              <button onClick={handleReset} className="w-full py-3 rounded-xl border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-colors">Done</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Savings + Emergency + Investments ── */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Savings */}
          <motion.div variants={itemVariants} whileHover={{ y: -2 }}
            className="glass-float rounded-3xl p-5 border border-emerald-500/15 card-premium"
            style={{ background: 'rgba(16,185,129,0.04)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-emerald-400 text-[10px] font-bold">3.2% APY</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Savings Account</p>
            <p className="text-2xl font-mono font-bold text-white mb-0.5">{((dashboard?.savingsBalance ?? 0)).toLocaleString()}</p>
            <p className="text-muted-foreground/60 text-xs mb-4">SAR</p>
            <div className="grid grid-cols-2 gap-2">
              <motion.button whileTap={{ scale: 0.94 }} onClick={() => { setSavedSAR(p => p + 500); toast.success('SAR 500 deposited to Savings'); }}
                className="py-2 rounded-xl bg-emerald-500/12 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/18 transition-colors">
                Deposit
              </motion.button>
              <motion.button whileTap={{ scale: 0.94 }} onClick={() => toast.info('Withdrawal initiated')}
                className="py-2 rounded-xl bg-white/5 border border-white/8 text-white text-xs font-medium hover:bg-white/8 transition-colors">
                Withdraw
              </motion.button>
            </div>
          </motion.div>

          {/* Emergency Fund */}
          <motion.div variants={itemVariants} whileHover={{ y: -2 }}
            className="glass-float rounded-3xl p-5 border border-cyan-500/15 card-premium"
            style={{ background: 'rgba(6,182,212,0.04)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">85%</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Emergency Fund</p>
            <p className="text-2xl font-mono font-bold text-white mb-0.5">17,000</p>
            <p className="text-muted-foreground/60 text-xs mb-3">of SAR 20,000 target</p>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
              <motion.div className="h-full bg-cyan-400 rounded-full" initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.2 }} />
            </div>
            <motion.button whileTap={{ scale: 0.94 }} onClick={() => toast.success('SAR 500 added to Emergency Fund')}
              className="w-full py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500/15 transition-colors">
              Add SAR 500 →
            </motion.button>
          </motion.div>

          {/* Investments */}
          <motion.div variants={itemVariants} whileHover={{ y: -2 }}
            className="glass-float rounded-3xl p-5 border border-primary/15 card-premium"
            style={{ background: 'rgba(212,175,55,0.04)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-emerald-400 text-[10px] font-bold">+7.2% p.a.</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Investments</p>
            <p className="text-2xl font-mono font-bold text-white mb-1">14,600</p>
            <div className="h-10 -mx-1 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={INVESTMENT_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs><linearGradient id="iG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} /><stop offset="95%" stopColor="#D4AF37" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="value" stroke="#D4AF37" fill="url(#iG)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <motion.button whileTap={{ scale: 0.94 }} onClick={() => toast.info('Opening investment portfolio')}
              className="w-full py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/15 transition-colors">
              View Portfolio →
            </motion.button>
          </motion.div>
        </motion.div>

        {/* ── Card Management ── */}
        <motion.div variants={itemVariants} className="glass-float rounded-3xl border border-white/7 card-premium overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05]">
            <h3 className="text-white font-bold text-sm">Card Management</h3>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {[
              { label: 'Freeze Card',   desc: 'Temporarily lock your card',    icon: Zap,      color: 'blue',   action: () => toast.success('Card frozen securely') },
              { label: 'Replace Card',  desc: 'Request a new physical card',    icon: RefreshCw,color: 'amber',  action: () => setShowReplace(true) },
              { label: 'Card Limits',   desc: 'Set daily spending limits',      icon: Shield,   color: 'emerald',action: () => toast.info('Opening limit settings') },
              { label: 'Virtual Card',  desc: 'Create a disposable card',       icon: CreditCard,color:'purple', action: () => toast.success('Virtual card created: SAR 500 limit') },
            ].map(item => (
              <motion.button key={item.label} whileHover={{ backgroundColor: 'rgba(255,255,255,0.025)' }} whileTap={{ scale: 0.99 }}
                onClick={item.action}
                className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.color === 'blue'    ? 'bg-blue-500/12 border border-blue-500/20' :
                  item.color === 'amber'   ? 'bg-amber-500/12 border border-amber-500/20' :
                  item.color === 'emerald' ? 'bg-emerald-500/12 border border-emerald-500/20' :
                                             'bg-purple-500/12 border border-purple-500/20'
                }`}>
                  <item.icon className={`w-4 h-4 ${
                    item.color === 'blue'    ? 'text-blue-400' :
                    item.color === 'amber'   ? 'text-amber-400' :
                    item.color === 'emerald' ? 'text-emerald-400' :
                                               'text-purple-400'
                  }`} />
                </div>
                <div className="flex-1"><p className="text-white text-sm font-medium group-hover:text-primary/90 transition-colors">{item.label}</p><p className="text-muted-foreground/55 text-xs">{item.desc}</p></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Scheduled Transfers ── */}
        <motion.div variants={itemVariants} id="scheduled" className="glass-float rounded-3xl border border-white/7 card-premium overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
            <h3 className="text-white font-bold text-sm">Scheduled Transfers</h3>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => toast.info('Add scheduled transfer')}
              className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {SCHEDULED.map(s => (
              <motion.div key={s.id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                className="flex items-center gap-4 px-5 py-4 cursor-pointer group">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-muted-foreground/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{s.to}</p>
                  <p className="text-muted-foreground/55 text-xs">{s.date} · Next: {s.next}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-mono font-semibold text-sm">SAR {s.amount.toLocaleString()}</p>
                  <p className="text-muted-foreground/50 text-[10px]">{s.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Bank Statements ── */}
        <motion.div variants={itemVariants} className="glass-float rounded-3xl border border-white/7 card-premium overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
            <h3 className="text-white font-bold text-sm">Bank Statements</h3>
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">PDF · Excel</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {STATEMENTS.map(s => (
              <motion.div key={s.month} whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }} whileTap={{ scale: 0.998 }}
                className="flex items-center gap-4 px-5 py-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-muted-foreground/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{s.month}</p>
                  <p className="text-muted-foreground/55 text-xs">{s.transactions} transactions · {s.size}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-emerald-400 font-mono text-xs font-semibold">+{s.income.toLocaleString()}</p>
                    <p className="text-red-400/80 font-mono text-xs">−{s.expenses.toLocaleString()}</p>
                  </div>
                  <motion.button whileTap={{ scale: 0.85 }}
                    onClick={() => toast.success(`Downloading ${s.month} statement`)}
                    className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/15 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}
