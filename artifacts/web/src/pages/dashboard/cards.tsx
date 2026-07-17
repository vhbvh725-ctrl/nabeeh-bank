import { useState } from 'react';
import { useGetCards, useToggleCardFreeze } from '@workspace/api-client-react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useRequireAuth } from '../../hooks/use-require-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, staggerContainer, itemVariants } from '../../lib/animations';
import {
  CreditCard, Snowflake, Eye, EyeOff, ShieldCheck, ArrowRightLeft,
  ShieldAlert, CheckCircle2, MapPin, Clock, Smartphone, Lock,
  AlertOctagon, FileWarning, Building2, CreditCard as CardIcon2, Sparkles
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ─── Fraud Modal ───────────────────────────────────────────────────────────────
export function FraudModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stepsDone, setStepsDone] = useState<boolean[]>([false, false, false, false]);
  const CASE_NUM = 'NB-2026-49283';
  const ARRIVAL  = 'July 22, 2026';

  if (!isOpen) return null;

  const handleConfirmFraud = () => {
    setStep(3);
    const delays = [600, 1400, 2300, 3300];
    delays.forEach((d, i) => setTimeout(() => setStepsDone(prev => { const n=[...prev]; n[i]=true; return n; }), d));
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep(1); setStepsDone([false,false,false,false]); }, 500);
  };

  const SECURITY_STEPS = [
    { icon: Lock,       label: 'Card Frozen',             desc: 'Last 4 digits ••8821 deactivated instantly',  color: '#ef4444' },
    { icon: FileWarning,label: 'Fraud Report Created',    desc: `Case number ${CASE_NUM} filed`,               color: '#f59e0b' },
    { icon: Building2,  label: 'Bank Branch Notified',    desc: 'Al-Nakheel Branch · Manager alerted',         color: '#3b82f6' },
    { icon: CardIcon2,  label: 'Replacement Requested',   desc: `New card arriving by ${ARRIVAL}`,             color: '#10b981' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{background:'rgba(0,0,0,0.92)',backdropFilter:'blur(16px)'}}>

          <motion.div
            initial={{opacity:0,scale:0.88,y:24}}
            animate={{opacity:1,scale:1,y:0}}
            exit={{opacity:0,scale:0.9,y:16}}
            transition={{type:'spring',stiffness:280,damping:28}}
            className="w-full max-w-sm rounded-3xl overflow-hidden border"
            style={{
              background:'linear-gradient(160deg,rgba(30,5,5,0.98) 0%,rgba(10,5,5,0.97) 100%)',
              borderColor:'rgba(239,68,68,0.35)',
              boxShadow:'0 0 80px rgba(239,68,68,0.18), 0 0 0 1px rgba(239,68,68,0.08) inset',
            }}>

            {/* Red glint top bar */}
            <div className="h-0.5 w-full" style={{background:'linear-gradient(90deg,transparent 0%,rgba(239,68,68,0.8) 50%,transparent 100%)'}} />

            <div className="p-7">
              <AnimatePresence mode="wait">

                {/* ── Step 1: Security Alert ── */}
                {step === 1 && (
                  <motion.div key="s1" initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-24}} className="text-center">
                    {/* Pulsing rings */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <motion.div className="absolute inset-0 rounded-full bg-red-500/10" animate={{scale:[1,1.5,1],opacity:[0.8,0,0.8]}} transition={{duration:2,repeat:Infinity}} />
                      <motion.div className="absolute inset-4 rounded-full bg-red-500/15" animate={{scale:[1,1.3,1],opacity:[0.6,0,0.6]}} transition={{duration:2,repeat:Infinity,delay:0.3}} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-red-500/15 border-2 border-red-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                          <ShieldAlert className="w-8 h-8 text-red-400" />
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] uppercase tracking-[0.25em] text-red-400/90 font-bold mb-3">⚠ Security Alert</p>
                    <h2 className="text-2xl font-bold text-white mb-4">Suspicious Withdrawal</h2>

                    {/* Transaction detail card */}
                    <div className="rounded-2xl border border-red-500/20 p-4 mb-6 text-left space-y-2.5" style={{background:'rgba(239,68,68,0.05)'}}>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground/70 text-xs">Amount</span>
                        <span className="text-red-400 font-mono font-bold text-2xl">SAR 50,000</span>
                      </div>
                      <div className="h-px bg-white/[0.05]" />
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div className="flex items-center gap-1.5 text-muted-foreground/70"><MapPin className="w-3 h-3" /><span>Riyadh, SA</span></div>
                        <div className="flex items-center gap-1.5 text-muted-foreground/70"><Clock className="w-3 h-3" /><span>2:47 AM</span></div>
                        <div className="flex items-center gap-1.5 text-muted-foreground/70"><Smartphone className="w-3 h-3" /><span>Unknown device</span></div>
                      </div>
                      <div className="pt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[10px] text-red-400/80 font-semibold">Unusual location · Unusual hour · Unusually large</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-white font-bold text-lg mb-5">Was this you?</p>

                    <div className="space-y-3">
                      <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                        onClick={() => { toast.success('Transaction verified. All clear.'); handleClose(); }}
                        className="w-full py-3.5 rounded-xl border border-white/12 text-white bg-white/[0.05] hover:bg-white/[0.08] transition-colors font-semibold text-sm tracking-wide">
                        YES — That was me
                      </motion.button>
                      <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                        onClick={() => setStep(2)}
                        className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide"
                        style={{background:'rgba(239,68,68,0.18)',border:'1px solid rgba(239,68,68,0.55)',color:'#f87171',boxShadow:'0 0 24px rgba(239,68,68,0.18)'}}>
                        NO — This is unauthorized
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2: Confirm Fraud ── */}
                {step === 2 && (
                  <motion.div key="s2" initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-24}} className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <motion.div className="absolute inset-0 rounded-full" animate={{rotate:360}} transition={{duration:4,repeat:Infinity,ease:'linear'}}
                        style={{background:'conic-gradient(from 0deg, rgba(239,68,68,0.6) 0%, transparent 60%)',borderRadius:'50%'}} />
                      <div className="absolute inset-1.5 rounded-full bg-red-950/80 border border-red-500/30 flex items-center justify-center">
                        <AlertOctagon className="w-8 h-8 text-red-400" />
                      </div>
                    </div>

                    <p className="text-[10px] uppercase tracking-[0.2em] text-red-400/80 font-bold mb-3">Confirm Action</p>
                    <h2 className="text-xl font-bold text-white mb-3">Report Unauthorized Transaction</h2>
                    <p className="text-muted-foreground/70 text-sm leading-relaxed mb-2">
                      By confirming, Nabeeh Security will immediately:
                    </p>
                    <div className="text-left space-y-1.5 mb-6">
                      {['Freeze your card instantly','File a formal fraud report','Alert your branch manager','Request a replacement card'].map(item=>(
                        <div key={item} className="flex items-center gap-2.5 text-xs text-white/70">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400/70 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                        onClick={handleConfirmFraud}
                        className="w-full py-3.5 rounded-xl font-bold text-sm text-white"
                        style={{background:'linear-gradient(135deg,#dc2626,#b91c1c)',boxShadow:'0 0 30px rgba(220,38,38,0.35)'}}>
                        Confirm Fraud
                      </motion.button>
                      <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                        onClick={() => setStep(1)}
                        className="w-full py-3 rounded-xl border border-white/8 text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors font-medium text-sm">
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3: Cinematic Response ── */}
                {step === 3 && (
                  <motion.div key="s3" initial={{opacity:0,scale:0.92}} animate={{opacity:1,scale:1}} className="text-center">
                    {/* Spinning security badge */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <motion.div animate={{rotate:360}} transition={{duration:4,repeat:Infinity,ease:'linear'}}
                        className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary border-b-2 border-b-transparent border-l-2 border-l-transparent" />
                      <motion.div animate={{rotate:-360}} transition={{duration:6,repeat:Infinity,ease:'linear'}}
                        className="absolute inset-2.5 rounded-full border-t-2 border-l-2 border-red-500/50 border-r-2 border-r-transparent border-b-2 border-b-transparent" />
                      <motion.div animate={{rotate:360}} transition={{duration:8,repeat:Infinity,ease:'linear'}}
                        className="absolute inset-5 rounded-full border-t-2 border-primary/30 border-r-2 border-r-transparent border-b-2 border-b-transparent border-l-2 border-l-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldCheck className="w-9 h-9 text-primary" />
                      </div>
                    </div>

                    <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-1">Nabeeh Security</p>
                    <h2 className="text-xl font-bold text-white mb-6">Securing Your Account</h2>

                    {/* Sequential steps */}
                    <div className="space-y-3.5 text-left mb-7">
                      {SECURITY_STEPS.map((s, i) => (
                        <motion.div key={s.label}
                          initial={{opacity:0.15}}
                          animate={stepsDone[i] ? {opacity:1} : {opacity:0.15}}
                          className="flex items-center gap-3">
                          <motion.div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-700"
                            style={stepsDone[i]
                              ? {background:s.color,borderColor:s.color,boxShadow:`0 0 12px ${s.color}60`}
                              : {background:'rgba(255,255,255,0.05)',borderColor:'rgba(255,255,255,0.1)'}}>
                            {stepsDone[i]
                              ? <CheckCircle2 className="w-4 h-4 text-white" />
                              : <s.icon className="w-3.5 h-3.5 text-white/25" />}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold transition-colors duration-500 ${stepsDone[i]?'text-white':'text-white/25'}`}>{s.label}</p>
                            <AnimatePresence>
                              {stepsDone[i] && (
                                <motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
                                  {s.desc}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                          <AnimatePresence>
                            {stepsDone[i] && (
                              <motion.span initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}} transition={{type:'spring',stiffness:400,damping:20}}
                                className="text-xs font-bold flex-shrink-0" style={{color:s.color}}>✓</motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>

                    {/* Final success card */}
                    <AnimatePresence>
                      {stepsDone[3] && (
                        <motion.div initial={{opacity:0,y:16,scale:0.95}} animate={{opacity:1,y:0,scale:1}} transition={{type:'spring',stiffness:260,damping:22}}>
                          {/* Gold shimmer divider */}
                          <motion.div className="h-px mb-5 rounded-full"
                            style={{background:'linear-gradient(90deg,transparent,#D4AF37,transparent)'}}
                            initial={{scaleX:0}} animate={{scaleX:1}} transition={{duration:0.7}} />

                          {/* Case info */}
                          <div className="rounded-2xl border border-primary/25 p-4 mb-5 text-left space-y-3" style={{background:'rgba(212,175,55,0.06)'}}>
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-primary" />
                              <p className="text-primary font-bold text-sm">Account Fully Secured</p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground/70">Fraud Case Number</span>
                                <span className="text-white font-mono font-bold">{CASE_NUM}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground/70">Card Replacement Arrives</span>
                                <span className="text-white font-medium">{ARRIVAL}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground/70">Frozen Card</span>
                                <span className="text-white font-mono">••8821 — Deactivated</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-muted-foreground/60 text-xs mb-5 leading-relaxed">
                            Our fraud team will contact you within 24 hours. Your SAR 50,000 claim is being processed.
                          </p>

                          <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                            onClick={handleClose}
                            className="w-full py-3.5 rounded-xl font-bold text-black text-sm"
                            style={{background:'linear-gradient(135deg,#D4AF37,#f59e0b)',boxShadow:'0 0 25px rgba(212,175,55,0.3)'}}>
                            Done · Close Security Modal
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
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

// ─── Transfer Warning Modal ───────────────────────────────────────────────────
function BeforeYouPayModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
        className="w-full max-w-md glass rounded-3xl border border-white/8 overflow-hidden shadow-2xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" /> Before You Pay
          </h2>
          <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 mb-4 text-center">
            <p className="text-muted-foreground/60 text-xs mb-1">Transfer Amount</p>
            <p className="text-3xl font-mono font-bold text-white">5,000 <span className="text-sm font-sans font-normal text-muted-foreground">SAR</span></p>
          </div>
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4 mb-6">
            <p className="text-amber-400 font-semibold text-sm mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Low Balance Warning</p>
            <p className="text-white/75 text-sm leading-relaxed">After this, you'll have <span className="font-mono text-white font-bold">SAR 820</span> remaining until salary in <span className="font-bold text-white">9 days</span>.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={onClose} className="py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors font-medium text-sm">Cancel</button>
            <button onClick={() => { toast.success('Transfer initiated securely'); onClose(); }} className="py-3 rounded-xl bg-primary text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] transition-shadow text-sm">Continue</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Cards() {
  const { user } = useRequireAuth();
  const queryClient = useQueryClient();
  const { data: cards, isLoading } = useGetCards();
  const toggleFreezeMutation = useToggleCardFreeze();
  const [showNumbers, setShowNumbers] = useState<Record<string, boolean>>({});
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [fraudModalOpen, setFraudModalOpen] = useState(false);

  const handleToggleFreeze = async (id: string, frozen: boolean) => {
    try {
      await toggleFreezeMutation.mutateAsync({ id, data: { frozen: !frozen } });
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      toast.success(frozen ? 'Card unfrozen successfully' : 'Card frozen securely');
    } catch { toast.error('Failed to update card status'); }
  };

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex h-full items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <BeforeYouPayModal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} />
      <FraudModal isOpen={fraudModalOpen} onClose={() => setFraudModalOpen(false)} />

      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-white mb-0.5">Cards</h1>
          <p className="text-muted-foreground/70 text-sm">Manage your physical and virtual cards</p>
        </header>

        {/* Fraud Protection Banner */}
        <motion.div variants={itemVariants}
          className="glass-float rounded-2xl p-4 border border-red-500/15 flex items-center justify-between gap-4 card-premium"
          style={{background:'rgba(239,68,68,0.04)'}}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <motion.span animate={{opacity:[1,0.3,1]}} transition={{duration:2,repeat:Infinity}} className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-background" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">AI Fraud Protection Active</p>
              <p className="text-muted-foreground/60 text-xs">847 transactions monitored · 0 threats found</p>
            </div>
          </div>
          <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.96}}
            onClick={() => setFraudModalOpen(true)}
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold hover:bg-red-500/16 transition-colors">
            Demo Alert
          </motion.button>
        </motion.div>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cards?.map((card) => {
            const isVisible = showNumbers[card.id];
            return (
              <motion.div key={card.id} variants={itemVariants} className="space-y-4">
                {/* Card Graphic */}
                <div className={`relative h-56 rounded-3xl p-6 flex flex-col justify-between overflow-hidden border transition-all duration-500 ${
                  card.isFrozen
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/60 opacity-75'
                    : card.type === 'mastercard'
                      ? 'bg-gradient-to-br from-zinc-900 to-black border-primary/30 shadow-[0_0_40px_rgba(212,175,55,0.08)]'
                      : 'bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.08)]'
                }`}>
                  {card.isFrozen && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[3px] z-10 flex items-center justify-center">
                      <div className="bg-black/70 px-5 py-2.5 rounded-full flex items-center gap-2 border border-slate-600">
                        <Snowflake className="w-4 h-4 text-blue-400 animate-spin" style={{animationDuration:'3s'}} />
                        <span className="text-sm font-bold text-blue-200 uppercase tracking-widest">Frozen</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 opacity-[0.025]" style={{backgroundImage:'repeating-linear-gradient(45deg,white 0,white 1px,transparent 0,transparent 50%)',backgroundSize:'10px 10px'}} />
                  <div className="flex justify-between items-start z-0">
                    <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-yellow-200/50 to-yellow-600/50 border border-yellow-500/40 shadow-inner" />
                    <span className="font-bold tracking-widest text-xl text-white/75 uppercase italic">{card.type}</span>
                  </div>
                  <div className="z-0 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-xl tracking-[0.2em] text-white/90">
                        {isVisible ? card.number : `•••• •••• •••• ${card.number.slice(-4)}`}
                      </p>
                      <button onClick={() => setShowNumbers(p=>({...p,[card.id]:!p[card.id]}))}
                        className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex justify-between items-end text-sm text-white/70 uppercase tracking-wider">
                      <div><p className="text-[10px] text-white/40 mb-1">Card Holder</p><p className="font-medium text-xs">{card.holderName}</p></div>
                      <div><p className="text-[10px] text-white/40 mb-1">Valid Thru</p><p className="font-medium text-xs">{card.expiryDate}</p></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPayModalOpen(true)}
                    className="glass-float py-3 rounded-xl border border-primary/20 text-primary hover:bg-primary/10 transition-colors font-medium text-sm flex items-center justify-center gap-2 card-premium">
                    <ArrowRightLeft className="w-4 h-4" /> Simulate Transfer
                  </button>
                  <div className="glass-float rounded-xl px-4 flex items-center justify-between border border-white/7 card-premium">
                    <Label htmlFor={`freeze-${card.id}`} className="text-white text-sm font-medium cursor-pointer">Freeze Card</Label>
                    <Switch id={`freeze-${card.id}`} checked={card.isFrozen} disabled={toggleFreezeMutation.isPending}
                      onCheckedChange={() => handleToggleFreeze(card.id, card.isFrozen)} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
